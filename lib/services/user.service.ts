import connectToDb from '@/db';
import { getUser, getQuestion, getAnswer, getTag } from '@/lib/simulator/modelProvider';
import assignBadge from '@/utils/assignBadge';
import { IUser } from '@/db/models/user.model';

type CreateUserPayload = Partial<IUser> & { clerkId?: string; name?: string; username?: string; email?: string; picture?: string };
type UsersPaginationParams = { searchQuery?: string; filter?: string; page?: number; pageSize?: number };

export const createUser = async (payload: CreateUserPayload) => {
  try {
    await connectToDb();
    const User = getUser();
    const user = await User.create(payload);
    return user;
  } catch (err) {
    console.error('createUser service error', err);
    throw err;
  }
};

export const getAllUsers = async (params: UsersPaginationParams) => {
  try {
    await connectToDb();
    const { searchQuery, filter, page = 1, pageSize = 20 } = params;
    const query: Record<string, unknown> = {};
    const skip = (page - 1) * pageSize;

    if (searchQuery) {
      query.$or = [
        { name: { $regex: new RegExp(searchQuery, 'i') } },
        { username: { $regex: new RegExp(searchQuery, 'i') } },
      ];
    }

    let sortOptions: Record<string, number> = {};
    switch (filter) {
      case 'new_users':
        sortOptions = { createdAt: -1 };
        break;
      case 'old_users':
        sortOptions = { createdAt: 1 };
        break;
      case 'top_contributors':
        sortOptions = { reputation: -1 };
        break;
      default:
        break;
    }

    const User = getUser();
    const users = await User.find(query);

    if (Object.keys(sortOptions).length > 0) {
      const [key, order] = Object.entries(sortOptions)[0] as [string, number];
      users.sort((a: any, b: any) => {
        if (order === -1) return new Date(b[key]).getTime() - new Date(a[key]).getTime();
        return new Date(a[key]).getTime() - new Date(b[key]).getTime();
      });
    }

    const paginatedUsers = users.slice(skip, skip + pageSize);
    const isNext = users.length > skip + paginatedUsers.length;
    return { users: paginatedUsers, isNext };
  } catch (err) {
    console.error('getAllUsers service error', err);
    throw err;
  }
};

export const getUserCount = async () => {
  try {
    await connectToDb();
    const User = getUser();
    const totalUsers = await User.countDocuments({});
    return totalUsers;
  } catch (err) {
    console.error('getUserCount service error', err);
    throw err;
  }
};

export const getUserById = async (clerkId: string) => {
  try {
    await connectToDb();
    const User = getUser();
    const user = await User.findOne({ clerkId: clerkId });
    return user;
  } catch (err) {
    console.error('getUserById service error', err);
    throw err;
  }
};

export const updateUser = async (clerkId: string, payload: Partial<IUser>) => {
  try {
    await connectToDb();
    const User = getUser();
    const existingUser = await User.findOne({ clerkId });
    if (!existingUser) throw new Error('User not found');
    const user = await User.findOneAndUpdate({ clerkId }, payload, { new: true });
    return user;
  } catch (err) {
    console.error('updateUser service error', err);
    throw err;
  }
};

export const deleteUser = async (clerkId: string) => {
  try {
    await connectToDb();
    const User = getUser();
    const Question = getQuestion();
    const Answer = getAnswer();
    const user = await User.findOne({ clerkId });
    if (!user) throw new Error('User not found');
    const userQuestions = await Question.find({ author: (user as any)._id });
    for (const q of userQuestions) {
      await Question.findByIdAndDelete({ _id: (q as any)._id });
    }
    const userAnswers = await Answer.find({ author: (user as any)._id });
    for (const a of userAnswers) {
      await Answer.findByIdAndDelete({ _id: (a as any)._id });
    }
    await User.findOneAndUpdate({ clerkId }, { _id: null }, { new: true });
    return user;
  } catch (err) {
    console.error('deleteUser service error', err);
    throw err;
  }
};

export const toggleSaveQuestion = async (params: { questionId: string; userId: string }) => {
  try {
    await connectToDb();
    const { questionId, userId } = params;
    const User = getUser();
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');
    const userAny = user as any;
    const isQuestionSaved = (userAny.savedQuestions || []).includes(questionId);
    if (isQuestionSaved) {
      await userAny.updateOne({ $pull: { savedQuestions: questionId } });
    } else {
      await userAny.updateOne({ $push: { savedQuestions: questionId } });
    }
  } catch (err) {
    console.error('toggleSaveQuestion service error', err);
    throw err;
  }
};

export const getSavedQuestions = async (params: { clerkId: string; searchQuery?: string; filter?: string; page?: number; pageSize?: number }) => {
  try {
    await connectToDb();
    const { clerkId, searchQuery, filter, page = 1, pageSize = 20 } = params;
    const User = getUser();
    const Question = getQuestion();
    const Tag = getTag();
    const skip = (page - 1) * pageSize;

    const user = await User.findOne({ clerkId });
    if (!user) throw new Error('User not found');
    const savedQuestionIds = (user as any).savedQuestions || [];
    let savedQuestions: any[] = [];
    for (const qId of savedQuestionIds) {
      const q = await Question.findById(qId);
      if (q) savedQuestions.push(q);
    }
    if (searchQuery) {
      const regex = new RegExp(searchQuery, 'i');
      savedQuestions = savedQuestions.filter((q) => regex.test(q.title));
    }
    switch (filter) {
      case 'most_recent':
        savedQuestions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'oldest':
        savedQuestions.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case 'most_voted':
        savedQuestions.sort((a, b) => (b.upvotes?.length || 0) - (a.upvotes?.length || 0));
        break;
      case 'most_viewed':
        savedQuestions.sort((a, b) => (b.views || 0) - (a.views || 0));
        break;
      case 'most_answered':
        savedQuestions.sort((a, b) => (b.answers?.length || 0) - (a.answers?.length || 0));
        break;
      default:
        break;
    }
    const isNext = savedQuestions.length > skip + pageSize;
    const paginatedQuestions = savedQuestions.slice(skip, skip + pageSize);
    const populatedQuestions = await Promise.all(
      paginatedQuestions.map(async (q) => {
        const tags = (q.tags || []).length > 0
          ? await Promise.all(
              (q.tags || []).map(async (tagId: string) => {
                const tag = await Tag.findById(tagId);
                return { _id: tag?._id, name: tag?.name };
              })
            )
          : [];

        const author = q.author ? await User.findById(q.author) : null;

        return {
          ...q,
          tags,
          author: author
            ? {
                _id: author._id,
                clerkId: (author as any).clerkId,
                name: (author as any).name,
                username: (author as any).username,
                picture: (author as any).picture,
              }
            : null,
        };
      })
    );

    return { savedQuestions: populatedQuestions, isNext };
  } catch (err) {
    console.error('getSavedQuestions service error', err);
    throw err;
  }
};

export const getUserInfo = async (username: string) => {
  try {
    await connectToDb();
    const User = getUser();
    const Question = getQuestion();
    const Answer = getAnswer();
    const user = await User.findOne({ username });
    if (!user) throw new Error('User not found');
    const totalQuestions = await Question.countDocuments({ author: user._id });
    const totalAnswers = await Answer.countDocuments({ author: user._id });

    const userQuestions = await Question.find({ author: user._id });
    const questionUpvotesCount = userQuestions.reduce((sum: number, q: any) => sum + (q.upvotes?.length || 0), 0);
    const questionViewsCount = userQuestions.reduce((sum: number, q: any) => sum + (q.views || 0), 0);

    const userAnswers = await Answer.find({ author: user._id });
    const answerUpvotesCount = userAnswers.reduce((sum: number, a: any) => sum + (a.upvotes?.length || 0), 0);

    const badgeCounts = assignBadge({
      totalQuestions,
      totalAnswers,
      questionUpvotes: questionUpvotesCount,
      answerUpvotes: answerUpvotesCount,
      totalViews: questionViewsCount,
    });

    return { user, totalQuestions, totalAnswers, badgeCounts };
  } catch (err) {
    console.error('getUserInfo service error', err);
    throw err;
  }
};

export const getUserQuestions = async (params: any) => {
  try {
    await connectToDb();
    const { userId, page = 1, pageSize = 10 } = params;
    const skip = (page - 1) * pageSize;
    const Question = getQuestion();
    const User = getUser();
    const Tag = getTag();
    const totalQuestions = await Question.countDocuments({ author: userId });

    let questions = await Question.find({ author: userId });
    questions.sort((a: any, b: any) => {
      const dateCompare = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (dateCompare !== 0) return dateCompare;
      const viewsCompare = (b.views || 0) - (a.views || 0);
      if (viewsCompare !== 0) return viewsCompare;
      return (b.upvotes?.length || 0) - (a.upvotes?.length || 0);
    });

    const isNext = totalQuestions > skip + pageSize;
    const paginatedQuestions = questions.slice(skip, skip + pageSize);

    const userQuestions = await Promise.all(
      paginatedQuestions.map(async (q: any) => {
        const tags = (q.tags || []).length > 0
          ? await Promise.all(
              (q.tags || []).map(async (tagId: string) => {
                const tag = await Tag.findById(tagId);
                return { _id: tag?._id, name: tag?.name };
              }),
            )
          : [];

        const author = q.author ? await User.findById(q.author) : null;

        return {
          ...q,
          tags,
          author: author
            ? {
                _id: author._id,
                clerkId: (author as any).clerkId,
                name: (author as any).name,
                username: (author as any).username,
                picture: (author as any).picture,
              }
            : null,
        };
      }),
    );

    return { totalQuestions, userQuestions, isNext };
  } catch (err) {
    console.error('getUserQuestions service error', err);
    throw err;
  }
};

export const getUserAnswers = async (params: any) => {
  try {
    await connectToDb();
    const { userId, page = 1, pageSize = 10 } = params;
    const skip = (page - 1) * pageSize;
    const Answer = getAnswer();
    const User = getUser();
    const Question = getQuestion();
    const totalAnswers = await Answer.countDocuments({ author: userId });

    let answers = await Answer.find({ author: userId });
    answers.sort((a: any, b: any) => (b.upvotes?.length || 0) - (a.upvotes?.length || 0));

    const isNext = totalAnswers > skip + pageSize;
    const paginatedAnswers = answers.slice(skip, skip + pageSize);

    const userAnswers = await Promise.all(
      paginatedAnswers.map(async (ans: any) => {
        const question = ans.question ? await Question.findById(ans.question) : null;
        const author = ans.author ? await User.findById(ans.author) : null;
        return {
          ...ans,
          question: question ? { _id: question._id, title: question.title } : null,
          author: author
            ? {
                _id: author._id,
                clerkId: (author as any).clerkId,
                name: (author as any).name,
                username: (author as any).username,
                picture: (author as any).picture,
              }
            : null,
        };
      }),
    );

    return { totalAnswers, userAnswers, isNext };
  } catch (err) {
    console.error('getUserAnswers service error', err);
    throw err;
  }
};
export default {
  createUser,
  getAllUsers,
  getUserCount,
  getUserById,
  updateUser,
  deleteUser,
  toggleSaveQuestion,
  getSavedQuestions,
  getUserInfo,
  getUserQuestions,
  getUserAnswers,
};
