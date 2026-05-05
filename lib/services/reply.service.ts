import connectToDb from '@/db';
import { getReply, getAnswer } from '@/lib/simulator/modelProvider';

export const createReply = async (params: { content: string; answerId: string; author: string; path?: string }) => {
  const { content, answerId, author } = params;
  if (!content || !answerId || !author) throw new Error('Missing required fields');
  try {
    await connectToDb();
    const Reply = getReply();
    const Answer = getAnswer();
    const reply = await Reply.create({ content, answer: answerId, author });
    await Answer.findByIdAndUpdate(answerId, { $push: { replies: reply._id } });
    return reply;
  } catch (error) {
    console.error('createReply service error', error);
    throw error;
  }
};

export const getRepliesByAnswerId = async (answerId: string) => {
  try {
    await connectToDb();
    const Reply = getReply();
    const replies = await Reply.find({ answer: answerId });
    return replies.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    console.error('getRepliesByAnswerId service error', error);
    throw error;
  }
};

export const updateReply = async (replyId: string, content: string) => {
  if (!replyId || !content) throw new Error('Missing required fields');
  try {
    await connectToDb();
    const Reply = getReply();
    const updatedReply = await Reply.findByIdAndUpdate(replyId, { content }, { new: true });
    return updatedReply;
  } catch (error) {
    console.error('updateReply service error', error);
    throw error;
  }
};

export default { createReply, getRepliesByAnswerId, updateReply };
