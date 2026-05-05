"use client";

import React, { useEffect, useState } from 'react';
import { getUserAnswers } from '@/actions/user.action';
import { useSearchParams } from 'next/navigation';
import AnswerCard from './cards/answer-card';
import Pagination from './pagination';

type AuthorType = { _id: string; clerkId?: string; name?: string; username?: string; picture?: string } | null;
type UserAnswer = {
  _id: string;
  question?: { _id: string; title?: string } | null;
  content?: string;
  author?: AuthorType;
  upvotes?: string[];
  downvotes?: string[];
  createdAt?: string;
  updatedAt?: string;
};

interface Props {
  userId: string;
  searchParams?: Record<string, unknown>;
}

export default function AnswerTabs({ userId }: Props) {
  const searchParams = useSearchParams();
  const pageNumber = Number(searchParams?.get('page') || '1');
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [isNext, setIsNext] = useState(false);

  useEffect(() => {
    let mounted = true;
    getUserAnswers({ userId, page: pageNumber })
      .then((data) => {
        if (!mounted) return;
        setUserAnswers(data.userAnswers || []);
        setIsNext(Boolean(data.isNext));
      })
      .catch((err) => console.error(err));
    return () => {
      mounted = false;
    };
  }, [userId, pageNumber]);

  return (
    <>
      <div className="space-y-5">
        {userAnswers.map((answer) => (
          <AnswerCard key={answer._id} answer={answer} clerkId={answer.author?.clerkId} />
        ))}
      </div>
      <Pagination pageNumber={pageNumber} isNext={isNext} />
    </>
  );
}
