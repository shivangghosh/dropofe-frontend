"use client";

import { SignedIn, UserButton } from '@clerk/nextjs';
import { ThemeToggle } from './theme-toggle';
import MobileMenu from './MobileMenu';
import Link from 'next/link';
import Image from 'next/image';
import GlobalSearch from './global-search';
import MobileGlobalSearch from './mobile-global-search';

export default function Header() {
  return (
    <header className="flex-between background-light900_dark200 sticky top-0 z-50 h-20 w-full gap-5 px-6 shadow-light-300 dark:shadow-none sm:px-12">
      <Link href="/" className="flex items-center gap-1">
        <Image src="/assets/images/logo.svg" height={25} width={25} alt="CoderZHub" />

        <p className="h2-bold font-spaceGrotesk text-gray-800 dark:text-white max-sm:hidden">
          dropofe<span className="primary-text-gradient"></span>
        </p>
      </Link>
      <GlobalSearch />
      <div className="flex-between gap-5">
        <MobileGlobalSearch />
        <SignedIn>
          <UserButton
            afterSignOutUrl="/"
            appearance={{
              elements: { avatarBox: 'h-10 w-10' },
              variables: { colorPrimary: '#ff7000' },
            }}
          />
        </SignedIn>
        <ThemeToggle />
        <MobileMenu />
      </div>
    </header>
  );
}
