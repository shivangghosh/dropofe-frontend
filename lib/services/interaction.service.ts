import connectToDb from '@/db';
import { getInteraction, getQuestion } from '@/lib/simulator/modelProvider';

export const viewQuestion = async (params: { userId?: string; questionId: string }) => {
  try {
    await connectToDb();
    const { userId, questionId } = params;
    const Question = getQuestion();
    const Interaction = getInteraction();
    await Question.findByIdAndUpdate(questionId, { $inc: { views: 1 } });
    if (userId) {
      const existingInteraction = await Interaction.findOne({ user: userId, action: 'view', question: questionId });
      if (!existingInteraction) {
        await Interaction.create({ user: userId, action: 'view', question: questionId });
      } else {
        await Interaction.findByIdAndUpdate(existingInteraction._id, { updatedAt: new Date() });
      }
    }
  } catch (error) {
    console.error('viewQuestion service error', error);
    throw error;
  }
};

export default { viewQuestion };
