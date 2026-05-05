import { Toaster } from 'sonner';
import Header from './_components/header';
import LeftSidebar from './_components/left-sidebar';
import RightSidebar from './_components/right-sidebar';
import { ScrollArea } from '@/components/ui/scroll-area';
import Footer from './_components/footer';
import AccessCheck from './accessCheck';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AccessCheck>
        <Header />
        <div className="flex">
          <LeftSidebar />
          <ScrollArea className="h-[calc(100vh-5rem)] flex-1 sm:p-4">
            <main className="flex flex-col px-6 pb-14 pt-5 sm:px-10">{children}</main>
            <Footer />
          </ScrollArea>
          <RightSidebar />
        </div>
        <Toaster richColors position="top-center" />
      </AccessCheck>
    </>
  );
}
