import connectToDb from '@/db';
import { getAnswer, getQuestion, getUser, getInteraction } from '@/lib/simulator/modelProvider';

type CreateAnswerParams = { content: string; question: string; author: string };
type AnswersPaginationParams = { questionId: string; sortBy?: string; page?: number; pageSize?: number };
type VoteParams = { answerId: string; userId: string; hasUpvoted?: boolean; hasDownvoted?: boolean };

export const createAnswer = async (params: CreateAnswerParams) => {
  try {
    await connectToDb();
    const { content, question, author } = params;
    const Answer = getAnswer();
    const Question = getQuestion();
    const User = getUser();
    const Interaction = getInteraction();

    const answer = await Answer.create({ content, question, author });
    await Question.findByIdAndUpdate(question, { $push: { answers: answer._id } });
    await Interaction.create({
      user: author,
      action: 'answer',
      question,
      answer: answer._id,
      tags: (await Question.findById(question))?.tags,
    });
    await User.findByIdAndUpdate(author, { $inc: { reputation: 10 } });
    return answer;
  } catch (error) {
    console.error('createAnswer service error', error);
    throw error;
  }
};

export const getAllAnswers = async (params: AnswersPaginationParams) => {
  try {
    await connectToDb();
    const { questionId, sortBy, page = 1, pageSize = 10 } = params;
    const skip = (page - 1) * pageSize;

    let sortOptions: Record<string, number> = {};
    switch (sortBy) {
      case 'highestUpvotes':
        sortOptions = { upvotes: -1 };
        break;
      case 'lowestUpvotes':
        sortOptions = { upvotes: 1 };
        break;
      case 'recent':
        sortOptions = { createdAt: -1 };
        break;
      case 'old':
        sortOptions = { createdAt: 1 };
        break;
      default:
        break;
    }

    const Answer = getAnswer();
    let answers = await Answer.find({ question: questionId });

    if (Object.keys(sortOptions).length > 0) {
      const [key, order] = Object.entries(sortOptions)[0] as [string, number];
      answers.sort((a: any, b: any) => {
        const aVal = key === 'upvotes' ? (a[key]?.length || 0) : a[key];
        const bVal = key === 'upvotes' ? (b[key]?.length || 0) : b[key];
        if (order === -1) {
          return typeof bVal === 'number' ? (bVal as number) - (aVal as number) : new Date(bVal as string).getTime() - new Date(aVal as string).getTime();
        }
        return typeof aVal === 'number' ? (aVal as number) - (bVal as number) : new Date(aVal as string).getTime() - new Date(bVal as string).getTime();
      });
    }

    const paginatedAnswers = answers.slice(skip, skip + pageSize);
    const isNext = answers.length > skip + paginatedAnswers.length;
    return { answers: paginatedAnswers, isNext };
  } catch (error) {
    console.error('getAllAnswers service error', error);
    throw error;
  }
};

export const upvoteAnswer = async (params: VoteParams) => {
  try {
    await connectToDb();
    const { answerId, userId, hasUpvoted, hasDownvoted } = params;
    const Answer = getAnswer();
    const User = getUser();

    let updateQuery: Record<string, unknown> = {};
    if (hasUpvoted) {
      updateQuery = { $pull: { upvotes: userId } };
    } else if (hasDownvoted) {
      updateQuery = { $pull: { downvotes: userId }, $push: { upvotes: userId } };
    } else {
      updateQuery = { $addToSet: { upvotes: userId } };
    }
    const answer = await Answer.findByIdAndUpdate(answerId, updateQuery, { new: true });
    if (!answer) throw new Error('Answer not found');
    await User.findByIdAndUpdate(userId, { $inc: { reputation: hasUpvoted ? -2 : 2 } });
    await User.findByIdAndUpdate((answer as any).author, { $inc: { reputation: hasUpvoted ? -10 : 10 } });
    return answer;
  } catch (error) {
    console.error('upvoteAnswer service error', error);
    throw error;
  }
};

export const downvoteAnswer = async (params: VoteParams) => {
  try {
    await connectToDb();
    const { answerId, userId, hasUpvoted, hasDownvoted } = params;
    const Answer = getAnswer();
    const User = getUser();

    let updateQuery: Record<string, unknown> = {};
    if (hasDownvoted) {
      updateQuery = { $pull: { downvotes: userId } };
    } else if (hasUpvoted) {
      updateQuery = { $pull: { upvotes: userId }, $push: { downvotes: userId } };
    } else {
      updateQuery = { $addToSet: { downvotes: userId } };
    }
    const answer = await Answer.findByIdAndUpdate(answerId, updateQuery, { new: true });
    if (!answer) throw new Error('Answer not found');
    await User.findByIdAndUpdate(userId, { $inc: { reputation: hasDownvoted ? -2 : 2 } });
    await User.findByIdAndUpdate((answer as any).author, { $inc: { reputation: hasDownvoted ? -10 : 10 } });
    return answer;
  } catch (error) {
    console.error('downvoteAnswer service error', error);
    throw error;
  }
};

export const deleteAnswer = async (params: { answerId: string }) => {
  try {
    await connectToDb();
    const { answerId } = params;
    const Answer = getAnswer();
    const Question = getQuestion();
    const Interaction = getInteraction();

    const answer = await Answer.findByIdAndDelete({ _id: answerId });
    if (!answer) throw new Error('Answer not found');
    await Question.updateMany({ _id: (answer as any).question }, { $pull: { answers: answerId } });
    await Interaction.deleteMany({ answer: answerId });
    return answer;
  } catch (error) {
    console.error('deleteAnswer service error', error);
    throw error;
  }
};

export default {
  createAnswer,
  getAllAnswers,
  upvoteAnswer,
  downvoteAnswer,
  deleteAnswer,
};
