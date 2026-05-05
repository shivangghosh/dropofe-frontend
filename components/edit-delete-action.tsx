'use client';

import { usePathname, useRouter } from 'next/navigation';
import { FileEditIcon, TrashIcon } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  type: 'Question' | 'Answer';
  itemId: string;
}

export default function EditDeleteAction({ type, itemId }: Props) {
  const router = useRouter();
  const pathname = usePathname();

  const handleEdit = () => {
    router.push(`/question/edit/${itemId}`);
  };

  const handleDelete = async () => {
    if (type === 'Question') {
      // delete question via API
      const res = await fetch('/api/questions', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId: itemId }),
      });
      if (res.ok) {
        toast.warning('Question deleted successfully');
        // navigate or refresh
      } else {
        toast.error('Failed to delete question');
      }
    } else if (type === 'Answer') {
      // delete answer via API
      const res = await fetch('/api/answers', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answerId: itemId }),
      });
      if (res.ok) {
        toast.warning('Answer deleted successfully');
      } else {
        toast.error('Failed to delete answer');
      }
    }
  };

  return (
    <div className="flex items-center gap-3">
      {type === 'Question' && (
        <FileEditIcon
          role="button"
          className="h-3.5 w-3.5 stroke-blue-400 transition-all hover:scale-110"
          onClick={handleEdit}
        />
      )}
      <TrashIcon
        role="button"
        className="h-3.5 w-3.5 stroke-red-500 transition-all hover:scale-110"
        onClick={handleDelete}
      />
    </div>
  );
}
