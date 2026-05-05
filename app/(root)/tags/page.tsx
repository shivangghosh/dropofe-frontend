'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { SearchIcon } from 'lucide-react';
import { SearchParamsProps } from '@/types/props';
import { TagFilters } from '@/constants/filters';
import { tagNoResult } from '@/constants/no-result';
// tags are fetched from the API in client-side code
import LocalSearch from '@/components/local-search';
import Filter from '@/components/filter';
import NoResult from '@/components/no-result';
import { tagVariants } from '@/components/tags-badge';
import { cn } from '@/lib/utils';
import Pagination from '@/components/pagination';
import Spinner from '@/app/(root)/_components/spinner'; // Import Spinner component

interface Tag {
  _id: string;
  name: string;
  Developedby: string;
  description: string;
  Companywebsite: string;
  questions: { length: number };
}

const truncateDescription = (description?: string, wordLimit = 6) => {
  if (!description) return '';
  const words = description.split(' ');
  if (words.length > wordLimit) {
    return words.slice(0, wordLimit).join(' ') + '...';
  }
  return description;
};

export default function TagsPage({ searchParams }: SearchParamsProps) {
  const [tags, setTags] = useState<Tag[]>([]);
  const [isNext, setIsNext] = useState(false);
  const [loading, setLoading] = useState(true); // Add loading state

  useEffect(() => {
    const fetchTags = async () => {
      setLoading(true);
      try {
        const url = new URL('/api/tags', location.origin);
        if (searchParams.q) url.searchParams.set('searchQuery', searchParams.q);
        if (searchParams.filter) url.searchParams.set('filter', searchParams.filter);
        url.searchParams.set('page', String(Number(searchParams.page) || 1));
        const res = await fetch(url.toString());
        if (!res.ok) throw new Error('Failed to fetch tags');
        const result = await res.json();
        setTags(result.tags || []);
        setIsNext(result.isNext || false);
      } catch (err) {
        console.error('Failed to load tags', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTags();
  }, [searchParams]);

  return (
    <>
      <h1 className="h1-bold">All Engineering Software/Tags</h1>
      <div className="mt-11 flex justify-between gap-5 max-sm:flex-col sm:items-center">
        <LocalSearch
          route="/tags"
          icon={<SearchIcon />}
          iconPosition="left"
          placeholder="Search for tags"
          className="flex-1"
        />
        <Filter filters={TagFilters} />
      </div>
      <section className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-3 2xl:grid-cols-4">
        {loading ? (
          <Spinner /> // Render spinner while loading
        ) : tags.length > 0 ? (
          tags.map((tag) => (
            <Link
              href={`tags/${tag._id}`}
              key={tag._id}
              className="rounded-lg bg-gray-100 dark:bg-dark-200"
            >
              <article className="flex w-full flex-col items-center gap-3 p-5">
                <div>
                  <p
                    className={cn(
                      tagVariants({ size: 'md' }),
                      'background-light700_dark300 font-semibold shadow',
                    )}
                  >
                    {tag.name}
                  </p>
                </div>
                <p className="font-semibold text-[#ff7000] ">{tag.Developedby}</p>
                <span className="text-xs text-[#ff7000] ">{tag.Companywebsite}</span>
                <p className="text-center font-semibold text-gray-500">
                  {truncateDescription(tag.description, 10)}
                </p>
                <p className="text-dark400_light500 text-sm">
                  <span className="primary-text-gradient mr-2 font-semibold">
                    {tag.questions.length}+
                  </span>
                  Questions
                </p>
              </article>
            </Link>
          ))
        ) : (
          <NoResult
            title={tagNoResult.title}
            description={tagNoResult.description}
            buttonText={tagNoResult.buttonText}
            buttonLink={tagNoResult.buttonLink}
          />
        )}
      </section>
      <Pagination pageNumber={Number(searchParams.page) || 1} isNext={isNext} />
    </>
  );
}
