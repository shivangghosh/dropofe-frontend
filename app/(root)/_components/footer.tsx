// components/footer.tsx

import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="mt-10 w-full bg-gray-800 py-6 text-white">
      <div className="container mx-auto flex flex-col items-center justify-between md:flex-row">
        <div className="mb-4 text-sm md:mb-0">
          &copy; {new Date().getFullYear()} Dropofe. All rights reserved.
        </div>
        <div className="flex space-x-4">
          <Link href="/privacy-policy" className="hover:underline">
            Privacy Policy
          </Link>
          <Link href="/terms-of-service" className="hover:underline">
            Terms of Service
          </Link>
          <Link href="/about" className="hover:underline">
            About Us
          </Link>
          <Link href="/contact-us" className="hover:underline">
            Contact Us
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
