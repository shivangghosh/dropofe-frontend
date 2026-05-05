"use client";

import React, { useEffect, useState } from 'react';
import { getUserQuestions } from '@/actions/user.action';
import { useSearchParams } from 'next/navigation';
import QuestionCard from './cards/question-card';
import Pagination from './pagination';

type TagType = { _id: string; name: string };
type AuthorType = { _id: string; clerkId?: string; name?: string; username?: string; picture?: string } | null;
type UserQuestion = {
  _id: string;
  title: string;
  content?: string;
  tags?: TagType[];
  author?: AuthorType;
  createdAt?: string;
  updatedAt?: string;
  views?: number;
  upvotes?: string[];
  downvotes?: string[];
  answers?: string[];
};

interface Props {
  userId: string;
  searchParams?: Record<string, unknown>;
}

export default function QuestionsTab({ userId }: Props) {
  const searchParams = useSearchParams();
  const pageNumber = Number(searchParams?.get('page') || '1');
  const [userQuestions, setUserQuestions] = useState<UserQuestion[]>([]);
  const [isNext, setIsNext] = useState(false);

  useEffect(() => {
    let mounted = true;
    getUserQuestions({ userId, page: pageNumber })
      .then((data) => {
        if (!mounted) return;
        setUserQuestions(data.userQuestions || []);
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
        {userQuestions.map((question) => (
          <QuestionCard question={question} key={question._id} clerkId={question.author?.clerkId} />
        ))}
      </div>
      <Pagination pageNumber={pageNumber} isNext={isNext} />
    </>
  );
}
