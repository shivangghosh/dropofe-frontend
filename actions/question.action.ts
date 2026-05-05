import type {
  DeleteQuestionParams,
  EditQuestionParams,
  GetAllQuestionsParams,
  QuestionVoteParams,
} from '@/types/action';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const createQuestion = async (payload: any) => {
  const res = await fetch(`${API_BASE}/questions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to create question');
  const data = await res.json();
  return data.question ?? data;
};

export const getAllQuestions = async (params: GetAllQuestionsParams) => {
  const { searchQuery, filter, page = 1, pageSize = 20 } = params || {};
  const qs = new URLSearchParams();
  if (searchQuery) qs.set('searchQuery', String(searchQuery));
  if (filter) qs.set('filter', String(filter));
  qs.set('page', String(page));
  qs.set('pageSize', String(pageSize));
  const res = await fetch(`${API_BASE}/questions?${qs.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch questions');
  return res.json();
};

export const getQuestionCount = async () => {
  const res = await fetch(`${API_BASE}/stats`);
  if (!res.ok) throw new Error('Failed to fetch stats');
  const data = await res.json();
  return data.questions ?? 0;
};

export const getQuestionById = async (id: string) => {
  const res = await fetch(`${API_BASE}/questions?id=${encodeURIComponent(id)}`);
  if (!res.ok) throw new Error('Failed to fetch question');
  const data = await res.json();
  return data.question ?? null;
};

export const upvoteQuestion = async (params: QuestionVoteParams) => {
  const res = await fetch(`${API_BASE}/questions`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'upvote', ...params }),
  });
  if (!res.ok) throw new Error('Failed to upvote question');
  return res.json();
};

export const downvoteQuestion = async (params: QuestionVoteParams) => {
  const res = await fetch(`${API_BASE}/questions`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'downvote', ...params }),
  });
  if (!res.ok) throw new Error('Failed to downvote question');
  return res.json();
};

export const updateQuestion = async (params: EditQuestionParams) => {
  const res = await fetch(`${API_BASE}/questions`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'update', ...params }),
  });
  if (!res.ok) throw new Error('Failed to update question');
  return res.json();
};

export const deleteQuestion = async (params: DeleteQuestionParams) => {
  const { questionId } = params;
  const res = await fetch(`${API_BASE}/questions`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ questionId }),
  });
  if (!res.ok) throw new Error('Failed to delete question');
  return res.json();
};

export const getTopQuestions = async () => {
  // Use questions endpoint with filter to approximate top questions
  const res = await fetch(`${API_BASE}/questions?filter=frequent&page=1&pageSize=5`);
  if (!res.ok) throw new Error('Failed to fetch top questions');
  const data = await res.json();
  return data.questions ?? [];
};

export default {
  createQuestion,
  getAllQuestions,
  getQuestionCount,
  getQuestionById,
  upvoteQuestion,
  downvoteQuestion,
  updateQuestion,
  deleteQuestion,
  getTopQuestions,
};
