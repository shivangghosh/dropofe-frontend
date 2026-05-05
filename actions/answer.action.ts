import type {
  AnswerVoteParams,
  CreateAnswerParams,
  DeleteAnswerParams,
  GetAllAnswersParams,
} from '@/types/action';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const createAnswer = async (params: CreateAnswerParams) => {
  const res = await fetch(`${API_BASE}/answers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error('Failed to create answer');
  const data = await res.json();
  return data.answer ?? data;
};

export const getAllAnswers = async (params: GetAllAnswersParams) => {
  const { questionId, sortBy, page = 1, pageSize = 10 } = params;
  const qs = new URLSearchParams();
  if (questionId) qs.set('questionId', questionId);
  qs.set('page', String(page));
  qs.set('pageSize', String(pageSize));
  if (sortBy) qs.set('sortBy', sortBy);
  const res = await fetch(`${API_BASE}/answers?${qs.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch answers');
  return res.json();
};

export const upvoteAnswer = async (params: AnswerVoteParams) => {
  const res = await fetch(`${API_BASE}/answers`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'upvote', ...params }),
  });
  if (!res.ok) throw new Error('Failed to upvote answer');
  return res.json();
};

export const downvoteAnswer = async (params: AnswerVoteParams) => {
  const res = await fetch(`${API_BASE}/answers`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'downvote', ...params }),
  });
  if (!res.ok) throw new Error('Failed to downvote answer');
  return res.json();
};

export const deleteAnswer = async (params: DeleteAnswerParams) => {
  const { answerId } = params;
  const res = await fetch(`${API_BASE}/answers`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ answerId }),
  });
  if (!res.ok) throw new Error('Failed to delete answer');
  return res.json();
};

export default { createAnswer, getAllAnswers, upvoteAnswer, downvoteAnswer, deleteAnswer };
