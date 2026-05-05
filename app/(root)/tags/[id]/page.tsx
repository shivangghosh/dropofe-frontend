import { Metadata, ResolvingMetadata } from 'next';
import { SearchIcon } from 'lucide-react';
import { MetaDataProps, ParamsSearchProps } from '@/types/props';
import { getQuestionsByTagId } from '@/lib/services/tag.service';
import { tagQuestionNoResult } from '@/constants/no-result';
import LocalSearch from '@/components/local-search';
import NoResult from '@/components/no-result';
import QuestionCard from '@/components/cards/question-card';
import Pagination from '@/components/pagination';

export async function generateMetadata(
  { params }: MetaDataProps,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const id = params.id;
  const tag = await getQuestionsByTagId({ tagId: id });
  const { tagName, companyName } = tag;
  const previousImages = (await parent).openGraph?.images || [];
  return {
    title: `Dropofe| Tag - ${tagName}`,
    openGraph: {
      images: ['/some-specific-page-image.jpg', ...previousImages],
    },
  };
}

export default async function TagDetailsPage({ params, searchParams }: ParamsSearchProps) {
  const tag = await getQuestionsByTagId({
    tagId: params.id,
    searchQuery: searchParams.q,
    page: Number(searchParams.page) || 1,
  });
  const { companyWeb, companyName, tagName, description, questions, isNext } = tag;

  return (
    <>
      <div className="container mx-auto p-4">
        <div className="mb-8 rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
          <h1 className="mb-4 text-3xl font-bold uppercase text-gray-900 dark:text-gray-100">
            {tagName}
          </h1>
          {companyName && (
            <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
              <span className="mb-1 block font-semibold">Developed/Owned By:</span>
              <span className="text-lg text-[#ff7000]">{companyName}</span>
            </div>
          )}
          {description && (
            <div className="mb-4 rounded-lg bg-gray-100 p-4 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
              <span className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Brief Description:
              </span>
              <p className="text-lg">{description}</p>
            </div>
          )}
          {companyWeb && (
            <div>
              <span className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Website:
              </span>
              <a href={companyWeb} className="text-blue-500 hover:underline dark:text-blue-400">
                {companyWeb}
              </a>
            </div>
          )}
        </div>
      </div>
      <div className="container mx-auto px-4 py-8 dark:bg-gray-900 dark:text-white">
        <div className="mb-6">
          <LocalSearch
            route={`/tags/${params.id}`}
            icon={<SearchIcon />}
            iconPosition="left"
            placeholder="Search tag questions"
            className="flex-1"
          />
        </div>

        <div className="flex flex-col gap-5">
          {questions.length > 0 ? (
            questions.map((question: any) => (
              <QuestionCard key={question._id} question={question} />
            ))
          ) : (
            <NoResult
              title={tagQuestionNoResult.title}
              description={tagQuestionNoResult.description}
              buttonText={tagQuestionNoResult.buttonText}
              buttonLink={tagQuestionNoResult.buttonLink}
            />
          )}
        </div>

        <Pagination pageNumber={Number(searchParams.page) || 1} isNext={isNext} />
      </div>
    </>
  );
}
