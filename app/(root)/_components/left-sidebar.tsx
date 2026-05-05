'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { sidebarLinks } from '@/constants/navigation';
import { SignedOut, useUser } from '@clerk/nextjs';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import { UserCircle, UserPlus } from 'lucide-react';
import { useEffect, useState } from 'react';
import Stats from '@/components/sidebarStats';

const SkeletonLoader = () => (
  <div className="flex animate-pulse flex-col gap-2">
    <div className="mb-2 h-4 w-3/4 rounded bg-gray-300"></div>
    <div className="mb-2 h-4 w-1/2 rounded bg-gray-300"></div>
    <div className="h-4 w-1/4 rounded bg-gray-300"></div>
  </div>
);

const LeftSidebar: React.FC = () => {
  const pathname = usePathname();
  const { user } = useUser();
  const [questionsCount, setQuestionsCount] = useState<number | null>(null);
  const [usersCount, setUsersCount] = useState<number | null>(null);
  const [tagsCount, setTagsCount] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [prevQuestionsCount, setPrevQuestionsCount] = useState<number>(5); // Example previous value
  const [prevUsersCount, setPrevUsersCount] = useState<number>(7); // Example previous value
  const [prevTagsCount, setPrevTagsCount] = useState<number>(5); // Example previous value

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const res = await fetch('/api/stats');
        if (!res.ok) throw new Error('Failed to fetch stats');
        const data = await res.json();
        setQuestionsCount(data.questions ?? null);
        setUsersCount(data.users ?? null);
        setTagsCount(data.tags ?? null);
      } catch (err) {
        console.error('Failed to fetch counts', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCounts();
  }, []);

  const calculatePercentageChange = (current: number | null, previous: number) => {
    if (current === null || previous === 0) return '??';
    return (((current - previous) / previous) * 100).toFixed(2);
  };

  const questionsChange = calculatePercentageChange(questionsCount, prevQuestionsCount);
  const usersChange = calculatePercentageChange(usersCount, prevUsersCount);
  const tagsChange = calculatePercentageChange(tagsCount, prevTagsCount);

  return (
    <aside className="background-light900_dark200 light-border sticky left-0 top-20 flex h-[calc(100vh-5rem)] flex-col border-r p-5 shadow dark:shadow-none max-sm:hidden lg:w-[250px]">
      <div className="flex h-screen flex-col justify-between">
        <div className="flex flex-col gap-1">
          {sidebarLinks.map((item) => {
            const isActive =
              (pathname.includes(item.route) && item.route.length > 1) || pathname === item.route;
            if (item.route === '/profile') {
              if (user?.username) {
                item.route = `/profile/${user.username}`;
              } else {
                return null;
              }
            }
            return (
              <Link
                key={item.route}
                href={item.route}
                className={`flex items-center gap-3 rounded-md p-4 text-sm ${
                  isActive ? 'primary-gradient' : ''
                }`}
              >
                <Image
                  src={item.imgURL}
                  alt={item.label}
                  width={20}
                  height={20}
                  className={`${isActive ? '' : 'invert-colors'}`}
                />
                <span className={`${isActive ? 'font-bold' : 'font-medium'} max-lg:hidden`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
        <div className="flex-col">
          <div className="flex justify-between gap-2">
            {loading ? (
              <SkeletonLoader />
            ) : (
              <Stats
                title="Questions"
                value={questionsCount ?? '??'}
                change={questionsChange}
                isIncrease={parseFloat(questionsChange) > 0}
              />
            )}
            {loading ? (
              <SkeletonLoader />
            ) : (
              <Stats
                title="Users"
                value={usersCount ?? '??'}
                change={usersChange}
                isIncrease={parseFloat(usersChange) > 0}
              />
            )}
          </div>
          <div className="mt-3 flex justify-center">
            {loading ? (
              <SkeletonLoader />
            ) : (
              <Stats
                title="Engineering Tags"
                value={tagsCount ?? '??'}
                change={tagsChange}
                isIncrease={parseFloat(tagsChange) > 0}
              />
            )}
          </div>
        </div>

        <SignedOut>
          <div className="flex flex-col gap-3">
            <Link
              href="/sign-in"
              className={cn(buttonVariants(), 'btn-secondary small-medium w-full text-orange-500')}
            >
              <UserCircle className="h-5 w-5 lg:hidden" />
              <span className="max-lg:hidden">Login</span>
            </Link>
            <Link
              href="/sign-up"
              className={cn(buttonVariants(), 'btn-tertiary text-dark400_light900 w-full')}
            >
              <UserPlus className="h-5 w-5 lg:hidden" />
              <span className="max-lg:hidden">Sign up</span>
            </Link>
          </div>
        </SignedOut>
      </div>
    </aside>
  );
};

export default LeftSidebar;
