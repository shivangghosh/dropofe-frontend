import type { GetAllTagsParams, GetQuestionsByTagIdParams, GetTopInteractedTagsParams } from '@/types/action';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const getAllTags = async (params: GetAllTagsParams) => {
  const { searchQuery, filter, page = 1, pageSize = 20 } = params || {};
  const qs = new URLSearchParams();
  if (searchQuery) qs.set('searchQuery', String(searchQuery));
  if (filter) qs.set('filter', String(filter));
  qs.set('page', String(page));
  qs.set('pageSize', String(pageSize));
  const res = await fetch(`${API_BASE}/tags?${qs.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch tags');
  return res.json();
};

export const getTopInteractedTags = async (params: GetTopInteractedTagsParams) => {
  const { userId, limit = 3 } = params || {};
  const qs = new URLSearchParams();
  if (userId) qs.set('userId', String(userId));
  qs.set('limit', String(limit));
  const res = await fetch(`${API_BASE}/tags/top?${qs.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch top tags');
  return res.json();
};

export const getTagCount = async () => {
  const res = await fetch(`${API_BASE}/stats`);
  if (!res.ok) throw new Error('Failed to fetch stats');
  const data = await res.json();
  return data.tags ?? 0;
};

export const getQuestionsByTagId = async (params: GetQuestionsByTagIdParams) => {
  // No direct public endpoint implemented for tag details/questions in the API.
  // Attempt to call a conventional endpoint; caller should ensure server supports it.
  const { tagId, searchQuery, page = 1, pageSize = 10 } = params || {};
  const qs = new URLSearchParams();
  qs.set('tagId', String(tagId));
  if (searchQuery) qs.set('searchQuery', String(searchQuery));
  qs.set('page', String(page));
  qs.set('pageSize', String(pageSize));
  const res = await fetch(`${API_BASE}/tags/details?${qs.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch tag details (endpoint may be missing)');
  return res.json();
};

export const getPopularTags = async () => {
  const res = await fetch(`${API_BASE}/tags?filter=popular&page=1&pageSize=5`);
  if (!res.ok) throw new Error('Failed to fetch popular tags');
  const data = await res.json();
  return data.tags ?? [];
};

export const createTag = async ({ name, description, Developedby, Companywebsite }: { name: string; description: string; Developedby: string; Companywebsite: string }) => {
  const res = await fetch(`${API_BASE}/tags`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, description, Developedby, Companywebsite }),
  });
  if (!res.ok) throw new Error('Failed to create tag');
  return res.json();
};

export default { getAllTags, getTopInteractedTags, getTagCount, getQuestionsByTagId, getPopularTags, createTag };

