import connectToDb from '@/db';
import { getInteraction, getQuestion, getTag, getUser, getAnswer } from '@/lib/simulator/modelProvider';

type CreateQuestionPayload = {
  title: string;
  content: string;
  tags?: string[];
  author?: string;
  [key: string]: unknown;
};

type PaginationParams = { searchQuery?: string; filter?: string; page?: number; pageSize?: number };

type VoteParams = { questionId: string; userId: string; hasUpvoted?: boolean; hasDownvoted?: boolean };

type UpdateQuestionParams = { questionId: string; title?: string; content?: string };

type DeleteQuestionParams = { questionId: string };

export const createQuestion = async (payload: CreateQuestionPayload) => {
  const { tags, ...rest } = payload;
  try {
    await connectToDb();
    const Question = getQuestion();
    const Tag = getTag();
    const Interaction = getInteraction();
    const User = getUser();

    // Resolve author: allow passing either a Mongo _id or a Clerk id (clerkId)
    let authorId = rest.author;
    if (typeof rest.author === 'string') {
      const maybeUser = await User.findOne({ clerkId: rest.author });
      if (maybeUser) authorId = (maybeUser as any)._id;
    }

    const question = await Question.create({ ...rest, author: authorId });
    const tagDocuments: any[] = [];
    for (const tagName of tags || []) {
      const existingTag = await Tag.findOneAndUpdate(
        { name: { $regex: new RegExp(`^${tagName}$`, 'i') } },
        { $setOnInsert: { name: tagName }, $push: { questions: question._id } },
        { upsert: true, new: true },
      );
      tagDocuments.push((existingTag as any)._id);
    }

    if (tagDocuments.length > 0) {
      await Question.findByIdAndUpdate(question._id, { $push: { tags: { $each: tagDocuments } } });
    }

    // Create an interaction for the user's ask question action
    await Interaction.create({
      user: authorId,
      action: 'ask_question',
      question: question._id,
      tags: tagDocuments,
    });

    // Increment reputation by 5 points
    await User.findByIdAndUpdate(authorId, { $inc: { reputation: 5 } });

    // Return the created question populated minimally
    const created = await Question.findById(question._id);
    return created;
  } catch (err) {
    console.log('Failed to create question (service)', err);
    throw err;
  }
};

export const getAllQuestions = async (params: PaginationParams) => {
  try {
    await connectToDb();
    const { searchQuery, filter, page = 1, pageSize = 20 } = params;
    const query: Record<string, unknown> = {};
    const skip = (page - 1) * pageSize;

    if (searchQuery) {
      query.$or = [
        { title: { $regex: new RegExp(searchQuery, 'i') } },
        { content: { $regex: new RegExp(searchQuery, 'i') } },
      ];
    }
    let sortOptions: Record<string, number> = {};
    switch (filter) {
      case 'newest':
        sortOptions = { createdAt: -1 };
        break;
      case 'frequent':
        sortOptions = { views: -1 };
        break;
      case 'unanswered':
        query.answers = { $size: 0 };
        break;
      default:
        break;
    }

    const Question = getQuestion();
    let questions = await Question.find(query);
    if (Object.keys(sortOptions).length > 0) {
      const [key, order] = Object.entries(sortOptions)[0] as [string, number];
      questions.sort((a: any, b: any) => {
        const aVal = a[key];
        const bVal = b[key];
        if (order === -1) {
          return typeof bVal === 'number' ? (bVal as number) - (aVal as number) : new Date(bVal as string).getTime() - new Date(aVal as string).getTime();
        }
        return typeof aVal === 'number' ? (aVal as number) - (bVal as number) : new Date(aVal as string).getTime() - new Date(bVal as string).getTime();
      });
    }

    const paginatedQuestions = questions.slice(skip, skip + pageSize);
    const isNext = questions.length > skip + paginatedQuestions.length;
    return { questions: paginatedQuestions, isNext };
  } catch (err) {
    console.error('getAllQuestions service error', err);
    throw err;
  }
};

export const getQuestionById = async (id: string) => {
  try {
    await connectToDb();
    const Question = getQuestion();
    const question = await Question.findById(id);
    return question;
  } catch (error) {
    console.error('getQuestionById service error', error);
    throw error;
  }
};

export const upvoteQuestion = async (params: VoteParams) => {
  try {
    await connectToDb();
    const { questionId, userId, hasUpvoted, hasDownvoted } = params;
    const Question = getQuestion();
    const User = getUser();
    let updateQuery: Record<string, unknown> = {};
    if (hasUpvoted) {
      updateQuery = { $pull: { upvotes: userId } };
    } else if (hasDownvoted) {
      updateQuery = { $pull: { downvotes: userId }, $push: { upvotes: userId } };
    } else {
      updateQuery = { $addToSet: { upvotes: userId } };
    }
    const question = await Question.findByIdAndUpdate(questionId, updateQuery, { new: true });
    if (!question) throw new Error('Question not found');
    await User.findByIdAndUpdate(userId, { $inc: { reputation: hasUpvoted ? -1 : 1 } });
    await User.findByIdAndUpdate((question as any).author, { $inc: { reputation: hasUpvoted ? -10 : 10 } });
    return question;
  } catch (error) {
    console.error('upvoteQuestion service error', error);
    throw error;
  }
};

export const downvoteQuestion = async (params: VoteParams) => {
  try {
    await connectToDb();
    const { questionId, userId, hasUpvoted, hasDownvoted } = params;
    const Question = getQuestion();
    const User = getUser();
    let updateQuery: Record<string, unknown> = {};
    if (hasDownvoted) {
      updateQuery = { $pull: { downvotes: userId } };
    } else if (hasUpvoted) {
      updateQuery = { $pull: { upvotes: userId }, $push: { downvotes: userId } };
    } else {
      updateQuery = { $addToSet: { downvotes: userId } };
    }
    const question = await Question.findByIdAndUpdate(questionId, updateQuery, { new: true });
    if (!question) throw new Error('Question not found');
    await User.findByIdAndUpdate(userId, { $inc: { reputation: hasDownvoted ? -1 : 1 } });
    await User.findByIdAndUpdate((question as any).author, { $inc: { reputation: hasDownvoted ? -10 : 10 } });
    return question;
  } catch (error) {
    console.error('downvoteQuestion service error', error);
    throw error;
  }
};

export const updateQuestion = async (params: UpdateQuestionParams) => {
  try {
    await connectToDb();
    const { questionId, title, content } = params;
    const Question = getQuestion();
    const question = await Question.findByIdAndUpdate(questionId, { title, content }, { new: true });
    if (!question) throw new Error('Question not found');
    return question;
  } catch (error) {
    console.error('updateQuestion service error', error);
    throw error;
  }
};

export const deleteQuestion = async (params: DeleteQuestionParams) => {
  try {
    await connectToDb();
    const { questionId } = params;
    const Question = getQuestion();
    const Answer = getAnswer();
    const Tag = getTag();
    const Interaction = getInteraction();
    const question = await Question.findByIdAndDelete({ _id: questionId });
    if (!question) throw new Error('Question not found');
    await Answer.deleteMany({ question: questionId });
    await Tag.updateMany({ questions: questionId }, { $pull: { questions: questionId } });
    await Interaction.deleteMany({ question: questionId });
    return question;
  } catch (error) {
    console.error('deleteQuestion service error', error);
    throw error;
  }
};

export const getTopQuestions = async () => {
  try {
    await connectToDb();
    const Question = getQuestion();
    let questions = await Question.find({});
    questions.sort((a: any, b: any) => {
      if (b.views !== a.views) return b.views - a.views;
      return (b.upvotes?.length || 0) - (a.upvotes?.length || 0);
    });
    return questions.slice(0, 5);
  } catch (error) {
    console.error('getTopQuestions service error', error);
    throw error;
  }
};

export const getQuestionCount = async () => {
  try {
    await connectToDb();
    const Question = getQuestion();
    return await Question.countDocuments({});
  } catch (error) {
    console.error('getQuestionCount service error', error);
    throw error;
  }
};

export default {
  createQuestion,
  getAllQuestions,
  getQuestionById,
  upvoteQuestion,
  downvoteQuestion,
  updateQuestion,
  deleteQuestion,
  getTopQuestions,
  getQuestionCount,
};
