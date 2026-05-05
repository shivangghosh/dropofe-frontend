import type { } from '@/types/action';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const createReply = async (params: { content: string; answerId: string; author: string; path?: string }) => {
  const { content, answerId, author } = params;
  if (!content || !answerId || !author) throw new Error('Missing required fields');
  const res = await fetch(`${API_BASE}/reply`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content, answerId, userId: author }),
  });
  if (!res.ok) throw new Error('Failed to create reply');
  return res.json();
};

export const getRepliesByAnswerId = async (answerId: string) => {
  const res = await fetch(`${API_BASE}/reply?answerId=${encodeURIComponent(answerId)}`);
  if (!res.ok) throw new Error('Failed to fetch replies');
  return res.json();
};

export const updateReply = async (replyId: string, content: string) => {
  if (!replyId || !content) throw new Error('Missing required fields');
  const res = await fetch(`${API_BASE}/reply`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ replyId, content }),
  });
  if (!res.ok) throw new Error('Failed to update reply');
  return res.json();
};

export default { createReply, getRepliesByAnswerId, updateReply };
