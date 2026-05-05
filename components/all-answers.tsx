"use client";
import { AnswerFilters } from '@/constants/filters';
import Filter from './filter';
import Link from 'next/link';
import Image from 'next/image';
import getTimeStamp from '@/utils/getTimeStamp';
import ParseHTML from './parse-html';
import Votes from './votes';
import Pagination from './pagination';
import ReplyForm from './forms/reply-form';
import { useEffect, useState } from 'react';

interface Props {
  questionId: string;
  userId: string;
  totalAnswers: number;
  page?: number;
  filter?: string;
}

export default function AllAnswers({ questionId, userId, totalAnswers, page, filter }: Props) {
  type Author = { _id: string; clerkId?: string; name?: string; picture?: string } | null;
  type Answer = {
    _id: string;
    content?: string;
    author?: Author;
    upvotes?: string[];
    downvotes?: string[];
    createdAt?: string;
  };

  const [answers, setAnswers] = useState<Answer[]>([]);
  const [isNext, setIsNext] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function fetchAnswers() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.set('questionId', questionId);
        params.set('page', String(page || 1));
        if (filter) params.set('sortBy', filter);
        const res = await fetch(`/api/answers?${params.toString()}`);
        if (!res.ok) throw new Error('Failed to fetch answers');
        const data = await res.json();
        if (!mounted) return;
        setAnswers(data.answers || []);
        setIsNext(Boolean(data.isNext));
      } catch (e) {
        console.error('Failed to load answers', e);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetchAnswers();
    return () => { mounted = false; };
  }, [questionId, page, filter]);

  return (
    <div className="mt-11">
      <div className="flex items-center justify-between">
        <h3 className="primary-text-gradient">{totalAnswers} Answers</h3>
        <Filter filters={AnswerFilters} />
      </div>
      <div>
        {loading ? (
          <p>Loading answers...</p>
        ) : (
          answers.map((answer) => (
            <article key={answer._id} className="light-border border-b py-10">
              <div className="mb-5 flex items-center justify-between">
                <div className="flex w-full flex-col-reverse justify-between gap-4 sm:flex-row sm:items-center">
                    <Link href={`/profile/${answer.author?.clerkId}`} className="flex gap-2">
                    <Image
                      src={answer.author?.picture || '/assets/images/default-avatar.png'}
                      alt={answer.author?.name || 'Author picture'}
                      width={22}
                      height={22}
                      className="h-6 w-6 rounded-full"
                    />
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-end">
                      <p className="body-semibold text-dark300_light700">{answer.author?.name}</p>
                        <p className="text-light400_light500 text-xs">
                        <span className="max-sm:hidden"> - </span>answered{' '}
                        {answer.createdAt ? `${getTimeStamp(new Date(answer.createdAt))} ago` : 'some time ago'}
                      </p>
                    </div>
                  </Link>
                  <Votes
                    type="Answer"
                    itemId={answer._id.toString()}
                    userId={userId}
                    upvotes={answer.upvotes?.length || 0}
                    hasUpvoted={(answer.upvotes || []).includes(userId)}
                    downvotes={answer.downvotes?.length || 0}
                    hasDownvoted={(answer.downvotes || []).includes(userId)}
                  />
                </div>
              </div>
              <ParseHTML content={answer.content || ''} />
              <ReplyForm answerId={answer._id.toString()} userId={userId} />
            </article>
          ))
        )}
      </div>
      <Pagination pageNumber={Number(page) || 1} isNext={isNext} />
    </div>
  );
}
