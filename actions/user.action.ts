import type {
  GetAllUsersParams,
  GetSavedQuestionsParams,
  GetUserStatsParams,
  ToggleSaveQuestionParams,
} from '@/types/action';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const createUser = async (payload: any) => {
  const res = await fetch(`${API_BASE}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to create user');
  return res.json();
};

export const getAllUsers = async (params: GetAllUsersParams) => {
  const { searchQuery, filter, page = 1, pageSize = 20 } = params || {};
  const qs = new URLSearchParams();
  if (searchQuery) qs.set('searchQuery', String(searchQuery));
  if (filter) qs.set('filter', String(filter));
  qs.set('page', String(page));
  qs.set('pageSize', String(pageSize));
  const res = await fetch(`${API_BASE}/users?${qs.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch users');
  return res.json();
};

export const getUserCount = async () => {
  const res = await fetch(`${API_BASE}/stats`);
  if (!res.ok) throw new Error('Failed to fetch stats');
  const data = await res.json();
  return data.users ?? 0;
};

export const getUserById = async (clerkId: string) => {
  const res = await fetch(`${API_BASE}/users?clerkId=${encodeURIComponent(clerkId)}`);
  if (!res.ok) throw new Error('Failed to fetch user');
  return res.json();
};

export const updateUser = async (clerkId: string, payload: any) => {
  const res = await fetch(`${API_BASE}/users`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ clerkId, payload }),
  });
  if (!res.ok) throw new Error('Failed to update user');
  return res.json();
};

export const deleteUser = async (clerkId: string) => {
  const res = await fetch(`${API_BASE}/users`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ clerkId }),
  });
  if (!res.ok) throw new Error('Failed to delete user');
  return res.json();
};

export const toggleSaveQuestion = async (params: ToggleSaveQuestionParams) => {
  const { questionId, userId } = params;
  const res = await fetch(`${API_BASE}/users`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'toggleSave', questionId, userId }),
  });
  if (!res.ok) throw new Error('Failed to toggle save question');
  return res.json();
};

export const getSavedQuestions = async (params: GetSavedQuestionsParams) => {
  const { clerkId, searchQuery, filter, page = 1, pageSize = 20 } = params || {};
  if (!clerkId) throw new Error('Missing clerkId');

  const qs = new URLSearchParams();
  qs.set('clerkId', clerkId);
  if (searchQuery) qs.set('searchQuery', String(searchQuery));
  if (filter) qs.set('filter', String(filter));
  qs.set('page', String(page));
  qs.set('pageSize', String(pageSize));

  const res = await fetch(`${API_BASE}/users/saved-questions?${qs.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch saved questions');
  return res.json();
};

export const getUserInfo = async (username: string) => {
  // Best-effort client-side implementation: search users by name and return first match
  const res = await fetch(`${API_BASE}/users?searchQuery=${encodeURIComponent(username)}`);
  if (!res.ok) throw new Error('Failed to fetch user info');
  const data = await res.json();
  // data may be { users, isNext } or a single user object
  if (Array.isArray(data?.users) && data.users.length > 0) return { user: data.users[0] };
  if (data?.user) return { user: data.user };
  return null;
};

export const getUserQuestions = async (params: GetUserStatsParams) => {
  const { userId, page = 1, pageSize = 10 } = params || {};
  const res = await fetch(`${API_BASE}/questions?page=1&pageSize=1000`);
  if (!res.ok) throw new Error('Failed to fetch questions');
  const data = await res.json();
  const allQuestions = data.questions || [];
  const userQuestions = allQuestions.filter((q: any) => {
    const authorId = q?.author?._id || q?.author;
    return String(authorId) === String(userId);
  });
  const totalQuestions = userQuestions.length;
  const skip = (page - 1) * pageSize;
  const paginated = userQuestions.slice(skip, skip + pageSize);
  return { totalQuestions, userQuestions: paginated, isNext: totalQuestions > skip + paginated.length };
};

export const getUserAnswers = async (params: GetUserStatsParams) => {
  const { userId, page = 1, pageSize = 10 } = params || {};
  const res = await fetch(`${API_BASE}/answers?page=1&pageSize=1000`);
  if (!res.ok) throw new Error('Failed to fetch answers');
  const data = await res.json();
  const allAnswers = data.answers || [];
  const userAnswers = allAnswers.filter((a: any) => String(a.author) === String(userId));
  const totalAnswers = userAnswers.length;
  const skip = (page - 1) * pageSize;
  const paginated = userAnswers.slice(skip, skip + pageSize);
  return { totalAnswers, userAnswers: paginated, isNext: totalAnswers > skip + paginated.length };
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
