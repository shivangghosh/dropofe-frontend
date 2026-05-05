import connectToDb from '@/db';
import { getAnswer, getQuestion, getTag, getUser } from '@/lib/simulator/modelProvider';

const searchableTypes = ['question', 'answer', 'user', 'tag'];

export const globalSearch = async (params: { query?: string; type?: string }) => {
  try {
    await connectToDb();
    const { query, type } = params;
    const regexQuery = new RegExp(String(query || ''), 'i');
    let results: { title: string; type: string; id: string }[] = [];

    const modelsAndTypes = [
      { model: getQuestion(), type: 'question', searchField: 'title' },
      { model: getAnswer(), type: 'answer', searchField: 'content' },
      { model: getUser(), type: 'user', searchField: 'name' },
      { model: getTag(), type: 'tag', searchField: 'name' },
    ];

    const typeLower = type?.toLowerCase();
    if (!typeLower || !searchableTypes.includes(typeLower)) {
      for (const { model, type, searchField } of modelsAndTypes) {
        const items = await model.find({});
        const queryResults = items.filter((item: any) => regexQuery.test(item[searchField])).slice(0, 2);
          results.push(
            ...queryResults.map((item: any) => ({
              title: type === 'answer' ? `Answer containing ${query}` : item[searchField],
              type: String(type),
              id: String(type === 'user' ? item.username : type === 'answer' ? item.question : item._id),
            })),
          );
      }
    } else {
      const modelInfo = modelsAndTypes.find((item) => item.type === typeLower);
      if (!modelInfo) throw new Error('Invalid search type');
      const items = await modelInfo.model.find({});
      const queryResults = items.filter((item: any) => regexQuery.test(item[modelInfo.searchField])).slice(0, 8);
      results = queryResults.map((item: any) => ({
        title: type === 'answer' ? `Answer containing ${query}` : item[modelInfo.searchField],
        type: String(type),
        id: String(type === 'user' ? item.username : type === 'answer' ? item.question : item._id),
      }));
    }
    return JSON.stringify(results);
  } catch (err) {
    console.error('globalSearch service error', err);
    throw err;
  }
};

export default { globalSearch };
