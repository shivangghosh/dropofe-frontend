'use client';

import { toast } from 'sonner';
import getFormatNumber from '@/utils/getFormatNumber';
import { Star, ThumbsDown, ThumbsUp } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface Props {
  type: 'Question' | 'Answer';
  itemId: string;
  userId: string;
  upvotes: number;
  hasUpvoted: boolean;
  downvotes: number;
  hasDownvoted: boolean;
  hasSaved?: boolean;
}

export default function Votes({
  type,
  itemId,
  userId,
  upvotes,
  hasUpvoted,
  downvotes,
  hasDownvoted,
  hasSaved,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const handleSave = async () => {
    if (!userId) {
      return toast.error('You must be logged in to save question');
    }
    if (type === 'Question') {
      const res = await fetch('/api/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggleSave', questionId: itemId, userId }),
      });
      if (res.ok) {
        hasSaved
          ? toast.warning('Question is removed from your collection')
          : toast.success('Question is added to your collection');
      } else {
        toast.error('Failed to update saved questions');
      }
    }
  };

  const handleVote = async (voteType: string) => {
    if (!userId) {
      return toast.error('You must be logged in to vote');
    }

    try {
      if (type === 'Question') {
        if (voteType === 'upvote') {
          const res = await fetch('/api/questions', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'upvote', questionId: itemId, userId, hasUpvoted, hasDownvoted }),
          });
          if (res.ok) {
            hasUpvoted ? toast('Upvote removed') : toast.success('Upvoted successfully');
          }
        } else {
          const res = await fetch('/api/questions', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'downvote', questionId: itemId, userId, hasUpvoted, hasDownvoted }),
          });
          if (res.ok) {
            hasDownvoted ? toast('Downvote removed') : toast('Downvoted successfully');
          }
        }
      } else if (type === 'Answer') {
        if (voteType === 'upvote') {
          const res = await fetch('/api/answers', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'upvote', answerId: itemId, userId, hasUpvoted, hasDownvoted }),
          });
          if (!res.ok) throw new Error('Failed to upvote');
        } else {
          const res = await fetch('/api/answers', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'downvote', answerId: itemId, userId, hasUpvoted, hasDownvoted }),
          });
          if (!res.ok) throw new Error('Failed to downvote');
        }
      }
      // TODO: toast
    } catch (err) {
      console.log(err);
    } finally {
    }
  };

  useEffect(() => {
    fetch('/api/interactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ questionId: itemId, userId: userId ? userId : undefined }),
    }).catch((e) => console.log('Failed to record view', e));
  }, [itemId, userId, pathname, router]);

  return (
    <div>
      <div className="flex items-center gap-5">
        <div className="flex items-center gap-2">
          <ThumbsUp
            className={`h-4 w-4 cursor-pointer text-blue-500 transition-all hover:scale-110 ${
              hasUpvoted && 'fill-blue-500'
            }`}
            onClick={() => handleVote('upvote')}
          />
          <p className="background-light700_dark400 rounded-sm px-2 py-1 text-[11px] font-medium">
            {getFormatNumber(upvotes)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ThumbsDown
            className={`h-4 w-4 cursor-pointer text-red-500 transition-all hover:scale-110 ${
              hasDownvoted && 'fill-red-500'
            }`}
            onClick={() => handleVote('downvote')}
          />
          <p className="background-light700_dark400 rounded-sm px-2 py-1 text-[11px] font-medium">
            {getFormatNumber(downvotes)}
          </p>
        </div>
        {type === 'Question' && (
          <div>
            <Star
              className={`h-4 w-4 cursor-pointer text-brand-500 transition-all hover:scale-110 ${
                hasSaved && 'fill-brand-500'
              }`}
              onClick={handleSave}
            />
          </div>
        )}
      </div>
    </div>
  );
}
