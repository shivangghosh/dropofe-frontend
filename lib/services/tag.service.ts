import connectToDb from '@/db';
import { getTag, getQuestion, getUser } from '@/lib/simulator/modelProvider';

type TagsPaginationParams = { searchQuery?: string; filter?: string; page?: number; pageSize?: number };

export const getAllTags = async (params: TagsPaginationParams) => {
  try {
    await connectToDb();
    const { searchQuery, filter, page = 1, pageSize = 20 } = params;
    const query: Record<string, unknown> = {};
    if (searchQuery) query.$or = [{ name: { $regex: new RegExp(searchQuery, 'i') } }];
    const skip = (page - 1) * pageSize;

    let sortOptions: any = {};
    switch (filter) {
      case 'popular':
        sortOptions = { questions: -1 };
        break;
      case 'recent':
        sortOptions = { createdAt: -1 };
        break;
      case 'old':
        sortOptions = { createdAt: 1 };
        break;
      case 'name':
        sortOptions = { name: 1 };
        break;
      default:
        break;
    }

    const Tag = getTag();
    let tags = await Tag.find(query);

    if (Object.keys(sortOptions).length > 0) {
      const [key, order] = Object.entries(sortOptions)[0] as [string, number];
      tags.sort((a: any, b: any) => {
        const aVal = key === 'questions' ? a[key]?.length || 0 : a[key];
        const bVal = key === 'questions' ? b[key]?.length || 0 : b[key];
        if (typeof aVal === 'number' || typeof bVal === 'number') {
          const aNum = typeof aVal === 'number' ? aVal : 0;
          const bNum = typeof bVal === 'number' ? bVal : 0;
          return order === -1 ? bNum - aNum : aNum - bNum;
        }
        const aStr = String(aVal || '');
        const bStr = String(bVal || '');
        return order === -1 ? bStr.localeCompare(aStr) : aStr.localeCompare(bStr);
      });
    }

    const paginatedTags = tags.slice(skip, skip + pageSize);
    const isNext = tags.length > skip + paginatedTags.length;
    return { tags: paginatedTags, isNext };
  } catch (error) {
    console.error('getAllTags service error', error);
    throw error;
  }
};

export const getTopInteractedTags = async (params: { userId?: string; limit?: number }) => {
  try {
    await connectToDb();
    const { userId, limit = 3 } = params;
    const User = getUser();
    const Tag = getTag();
    let tags = await Tag.find({});
    tags.sort((a: any, b: any) => (b.questions?.length || 0) - (a.questions?.length || 0));
    tags = tags.slice(0, limit);
    if (userId) {
      const user = await User.findById(userId);
      if (!user) throw new Error('User not found');
    }
    return tags.map((tag: any) => ({ id: tag._id, name: tag.name }));
  } catch (error) {
    console.error('getTopInteractedTags service error', error);
    throw error;
  }
};

export const getTagCount = async () => {
  try {
    await connectToDb();
    const Tag = getTag();
    return await Tag.countDocuments();
  } catch (error) {
    console.error('getTagCount service error', error);
    throw error;
  }
};

export const getQuestionsByTagId = async (params: { tagId: string; searchQuery?: string; page?: number; pageSize?: number }) => {
  try {
    await connectToDb();
    const { tagId, searchQuery, page = 1, pageSize = 10 } = params;
    const skip = (page - 1) * pageSize;
    const Tag = getTag();
    const Question = getQuestion();
    const tag = await Tag.findOne({ _id: tagId });
    if (!tag) throw new Error('Tag not found');
    let questions = await Question.find({ _id: { $in: (tag as any).questions }, ...(searchQuery && { title: { $regex: new RegExp(searchQuery, 'i') } }) });
    questions.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const totalQuestions = questions.length;
    const paginatedQuestions = questions.slice(skip, skip + pageSize);
    const isNext = totalQuestions > skip + paginatedQuestions.length;
    return {
      companyWeb: (tag as any).Companywebsite,
      tagName: (tag as any).name,
      companyName: (tag as any).Developedby,
      description: (tag as any).description,
      questions: paginatedQuestions,
      isNext,
    };
  } catch (error) {
    console.error('getQuestionsByTagId service error', error);
    throw error;
  }
};

export const getPopularTags = async () => {
  try {
    await connectToDb();
    const Tag = getTag();
    let tags = await Tag.find({});
    tags.sort((a: any, b: any) => (b.questions?.length || 0) - (a.questions?.length || 0));
    return tags.slice(0, 5).map((tag: any) => ({ _id: tag._id, name: tag.name, numberOfQuestions: (tag as any).questions?.length || 0 }));
  } catch (error) {
    console.error('getPopularTags service error', error);
    throw error;
  }
};

export const createTag = async (payload: { name: string; description: string; Developedby: string; Companywebsite: string }) => {
  try {
    await connectToDb();
    const { name, description, Developedby, Companywebsite } = payload;
    if (!name || !description || !Developedby || !Companywebsite) throw new Error('Invalid input');
    const Tag = getTag();
    const existingTag = await Tag.findOne({ name: name.trim() });
    if (existingTag) throw new Error('Tag already exists');
    const newTag = await Tag.create({ name: name.trim(), description: description.trim(), Developedby: Developedby.trim(), Companywebsite: Companywebsite.trim(), questions: [], followers: [] });
    return newTag;
  } catch (error) {
    console.error('createTag service error', error);
    throw error;
  }
};

export default {
  getAllTags,
  getTopInteractedTags,
  getTagCount,
  getQuestionsByTagId,
  getPopularTags,
  createTag,
};
