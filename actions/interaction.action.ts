import type { ViewQuestionParams } from '@/types/action';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const viewQuestion = async (params: ViewQuestionParams) => {
  const res = await fetch(`${API_BASE}/interactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error('Failed to record interaction');
  return res.json();
};

export default { viewQuestion };
