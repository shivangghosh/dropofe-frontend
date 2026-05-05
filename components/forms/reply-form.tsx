'use client';

import { useState, FormEvent, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';

interface ReplyFormProps {
  answerId: string;
  userId: string;
}

interface Reply {
  _id: string;
  content: string;
  author: {
    name: string;
  };
}

const ReplyForm: React.FC<ReplyFormProps> = ({ answerId, userId }) => {
  const [content, setContent] = useState<string>('');
  const [replies, setReplies] = useState<Reply[]>([]);
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [editingReply, setEditingReply] = useState<Reply | null>(null);

  // Fetch replies when component mounts or answerId changes
  useEffect(() => {
    const fetchReplies = async () => {
      try {
        const response = await fetch(`/api/reply?answerId=${answerId}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error);
        }
        const data = await response.json();
        setReplies(data);
      } catch (error) {
        setError((error as Error).message);
      }
    };

    fetchReplies();
  }, [answerId]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!answerId || !userId) {
      setError('Invalid answer or user ID');
      return;
    }

    setIsSubmitting(true); // Start submitting state

    try {
      const method = editingReply ? 'PUT' : 'POST';
      const body = JSON.stringify(
        editingReply ? { replyId: editingReply._id, content } : { answerId, userId, content },
      );

      const response = await fetch('/api/reply', {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error);
      }

      // Reset content and fetch updated replies
      setContent('');
      setEditingReply(null); // Close the editor after submission
      const updatedRepliesResponse = await fetch(`/api/reply?answerId=${answerId}`);
      if (!updatedRepliesResponse.ok) {
        const errorData = await updatedRepliesResponse.json();
        throw new Error(errorData.error);
      }
      const updatedRepliesData = await updatedRepliesResponse.json();
      setReplies(updatedRepliesData);
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setIsSubmitting(false); // Reset submitting state
    }
  };

  const handleEditClick = (reply: Reply) => {
    setEditingReply(reply);
    setContent(reply.content); // Pre-fill the editor with existing content
  };

  return (
    <div>
      {/* Display list of replies */}
      <div className="mb-4">
        {replies.length > 0 ? (
          <ul>
            {replies.map((reply) => (
              <li
                key={reply._id}
                className="cursor-pointer border-b py-2"
                onClick={() => handleEditClick(reply)}
              >
                <span className="text-blue-500">{reply.author.name}</span>:{' '}
                {reply.content.slice(0, 20)} {/* Show a snippet of the content */}
              </li>
            ))}
          </ul>
        ) : (
          <p>No replies yet.</p>
        )}
      </div>

      {/* Display reply editor */}
      <Dialog.Root>
        <Dialog.Trigger asChild>
          <button className="mt-2 rounded-md bg-blue-500 p-2 text-white" disabled={isSubmitting}>
            {editingReply ? 'Edit Reply' : 'Write Reply'}
          </button>
        </Dialog.Trigger>

        <Dialog.Content className="fixed inset-0 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-md bg-white p-4">
            <Dialog.Title>{editingReply ? 'Edit Reply' : 'New Reply'}</Dialog.Title>
            <form onSubmit={handleSubmit}>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your reply..."
                className="w-full rounded-md border p-2"
                rows={4}
                required
              ></textarea>
              <button
                type="submit"
                className="mt-2 rounded-md bg-blue-500 p-2 text-white"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : editingReply ? 'Update Reply' : 'Comment'}
              </button>
            </form>
            <Dialog.Close asChild>
              <button className="mt-2 rounded-md border p-2 text-red-500">Close</button>
            </Dialog.Close>
            {error && <p className="text-red-500">{error}</p>}
          </div>
        </Dialog.Content>
      </Dialog.Root>
    </div>
  );
};

export default ReplyForm;
