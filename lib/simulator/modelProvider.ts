/**
 * Model Provider - Returns appropriate models based on simulator mode
 * Provides a unified interface for accessing User, Question, Answer, etc.
 */

// Determine if simulator mode is enabled
const USE_SIMULATOR = process.env.NEXT_PUBLIC_USE_SIMULATOR === 'true' || process.env.USE_SIMULATOR === 'true';

import UserReal from '@/db/models/user.model';
import QuestionReal from '@/db/models/question.model';
import AnswerReal from '@/db/models/answer.model';
import TagReal from '@/db/models/tag.model';
import InteractionReal from '@/db/models/interaction.model';
import ReplyReal from '@/db/models/reply.model';
import {
  SimulatorUserModel,
  SimulatorQuestionModel,
  SimulatorAnswerModel,
  SimulatorTagModel,
  SimulatorInteractionModel,
  SimulatorReplyModel,
} from './simulatorModels';

/**
 * Returns User model (real or simulator)
 */
export function getUser() {
  return USE_SIMULATOR ? SimulatorUserModel : UserReal;
}

/**
 * Returns Question model (real or simulator)
 */
export function getQuestion() {
  return USE_SIMULATOR ? SimulatorQuestionModel : QuestionReal;
}

/**
 * Returns Answer model (real or simulator)
 */
export function getAnswer() {
  return USE_SIMULATOR ? SimulatorAnswerModel : AnswerReal;
}

/**
 * Returns Tag model (real or simulator)
 */
export function getTag() {
  return USE_SIMULATOR ? SimulatorTagModel : TagReal;
}

/**
 * Returns Interaction model (real or simulator)
 */
export function getInteraction() {
  return USE_SIMULATOR ? SimulatorInteractionModel : InteractionReal;
}

/**
 * Returns Reply model (real or simulator)
 */
export function getReply() {
  return USE_SIMULATOR ? SimulatorReplyModel : ReplyReal;
}
