import type { SearchParams } from '@/types/action';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const globalSearch = async (params: SearchParams) => {
  const { query = '', type } = params || '';
  const qs = new URLSearchParams();
  if (query) qs.set('q', String(query));
  if (type) qs.set('type', String(type));
  const res = await fetch(`${API_BASE}/search?${qs.toString()}`);
  if (!res.ok) throw new Error('Search failed');
  const data = await res.json();
  return data.results ?? [];
};

export default { globalSearch };
