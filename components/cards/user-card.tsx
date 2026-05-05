"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { TagBadge } from '../tags-badge';
import getFormatNumber from '@/utils/getFormatNumber';

type Tag = { _id?: string; id?: string; name: string };
type User = {
  _id: string;
  name: string;
  username: string;
  picture: string;
  reputation?: number;
};

export default function UserCard({ user }: { user: User }) {
  const [interactedTags, setInteractedTags] = useState<Tag[]>([]);

  useEffect(() => {
    let mounted = true;
    async function loadTags() {
      try {
        const res = await fetch(`/api/tags/top?userId=${encodeURIComponent(user._id)}`);
        if (!res.ok) return;
        const data = await res.json();
        if (!mounted) return;
        setInteractedTags(data || []);
      } catch (err) {
        console.error('Failed to load top tags', err);
      }
    }
    loadTags();
    return () => {
      mounted = false;
    };
  }, [user._id]);

  return (
    <Link
      href={`/profile/${user.username}`}
      className="overflow-hidden rounded-2xl border bg-gray-100 shadow transition-all hover:shadow-md dark:bg-dark-300"
    >
      <article className="shadow-light100_darknone item-center flex flex-col items-center justify-center p-8">
        <Image
          src={user.picture}
          alt={user.name}
          width={100}
          height={100}
          className="h-[80px] w-[80px] rounded-full"
        />
        <div className="mt-4 text-center">
          <h3 className="line-clamp-1 text-xl font-bold md:text-2xl" title={user.name}>
            {user.name}
          </h3>
          <p className="mt-2 font-medium text-gray-500 dark:text-gray-400">@{user.username}</p>
          <div className="mt-5">
            {interactedTags?.length ? (
              <div className="flex items-center gap-2 mb-3">
                {interactedTags.map((tag: any) => (
                  <TagBadge key={tag._id || tag.id} size="sm" className="px-3">
                    {tag.name}
                  </TagBadge>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-gray-500 dark:text-gray-400">No tags yet</p>
            )}
            <span className="rounded-full bg-orange-100 px-5 py-1 text-sm font-medium text-brand-500">
              Reputation {getFormatNumber(user.reputation || 0)}
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
