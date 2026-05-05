'use client';

import { useState, useRef, useEffect } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2Icon, XIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Editor } from '@tinymce/tinymce-react';
import envConfig from '@/config';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { usePathname, useRouter } from 'next/navigation';
import { TagBadge } from '../tags-badge';
import { useTheme } from 'next-themes';

const formSchema = z.object({
  title: z.string().trim().min(1, { message: 'Required' }).min(5).max(120),
  content: z.string().min(20),
  tags: z.array(z.string().trim().min(1).max(15)).min(1, { message: 'Required' }).max(3),
});

type FormValues = z.infer<typeof formSchema>;

interface Props {
  type: 'Create' | 'Edit';
  userId: string;
  questionDetails?: string;
}

export default function QuestionForm({ userId, type, questionDetails }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const editorRef = useRef<any>(null);
  const router = useRouter();
  const pathname = usePathname();
  const { theme } = useTheme();

  useEffect(() => {
    async function fetchTags() {
      try {
        const url = new URL('/api/tags', location.origin);
        url.searchParams.set('page', '1');
        url.searchParams.set('pageSize', '100');
        const res = await fetch(url.toString());
        if (!res.ok) return;
        const data = await res.json();
        const plainTags = (data.tags || []).map((tag: any) => tag.name);
        setTags(plainTags);
      } catch (err) {
        console.error('Failed to fetch tags', err);
      }
    }
    fetchTags();
  }, []);

  const parsedQuestionDetails = JSON.parse(questionDetails || '{}');
  const questionTags = parsedQuestionDetails?.tags?.map((tag: any) => tag.name);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim().toLowerCase();
    setInputValue(value);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, field: any) => {
    if (e.key === 'Enter' && inputValue) {
      e.preventDefault();
      const tagValue = inputValue.trim().toLowerCase();
      if (tagValue.length <= 15 && !field.value.includes(tagValue)) {
        form.setValue('tags', [...field.value, tagValue]);
        setInputValue('');
      } else {
        form.trigger();
      }
    }
  };

  const handleTagRemove = (tag: string, field: any) => {
    const newTags = field.value.filter((t: string) => t !== tag);
    form.setValue('tags', newTags);
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: parsedQuestionDetails.title || '',
      content: parsedQuestionDetails.content || '',
      tags: questionTags || [],
    },
  });

  async function onSubmit(values: FormValues) {
    setIsSubmitting(true);
    try {
      if (type === 'Create') {
        const payload = { ...values, author: userId };
        const res = await fetch('/api/questions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const errBody = await res.json().catch(() => null);
          throw new Error(errBody?.error || 'Failed to create question');
        }
        toast.success('Question posted successfully');
        router.push('/');
      } else if (type === 'Edit') {
        try {
          const res = await fetch('/api/questions', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'update', questionId: parsedQuestionDetails._id, title: values.title, content: values.content, path: pathname }),
          });
          if (!res.ok) throw new Error('Failed to update question');
          toast.success('Question updated successfully');
          router.push(`/question/${parsedQuestionDetails._id}`);
        } catch (err) {
          console.error(err);
          toast.error('Something went wrong');
        }
      }
    } catch (err) {
      console.log(err);
      toast.error('Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="paragraph-semibold text-dark400_light800">
                Question Title <span className="text-brand-500">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="What is your question?"
                  className="paragraph-regular light-border-2 background-light700_dark300 text-dark300_light700"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Be specific and imagine you&apos;re asking a question to another person
              </FormDescription>
              <FormMessage className="text-red-500" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="paragraph-semibold text-dark400_light800">
                Detail explanation of your problem <span className="text-brand-500">*</span>
              </FormLabel>
              <FormControl>
                <Editor
                  apiKey={envConfig.TINY_API_KEY}
                  // @ts-ignore
                  onInit={(evt, editor) => (editorRef.current = editor)}
                  onBlur={field.onBlur}
                  onEditorChange={(content) => field.onChange(content)}
                  initialValue={parsedQuestionDetails.content || ''}
                  init={{
                    height: 350,
                    menubar: false,
                    placeholder: 'Explain your problem in detail...',
                    plugins: [
                      'advlist',
                      'autolink',
                      'lists',
                      'link',
                      'image',
                      'charmap',
                      'print',
                      'preview',
                      'anchor',
                      'searchreplace',
                      'visualblocks',
                      'codesample',
                      'fullscreen',
                      'insertdatetime',
                      'media',
                      'table',
                    ],
                    toolbar:
                      'undo redo | bold italic forecolor backcolor | alignleft aligncenter alignright alignjustify | bullist numlist image fullscreen',
                    content_style: 'body { font-family:Inter; font-size:14px }',
                    skin: theme === 'dark' ? 'oxide-dark' : 'oxide',
                    content_css: theme === 'dark' ? 'dark' : 'light',
                    setup: (editor) => {
                      editor.on('init', () => {
                        editor.contentDocument.querySelector('p')?.remove();
                      });
                    },
                    automatic_uploads: true,
                    image_title: true,
                    file_picker_types: 'image',
                    file_picker_callback: (cb, value, meta) => {
                      const input = document.createElement('input');
                      input.setAttribute('type', 'file');
                      input.setAttribute('accept', 'image/*');

                      input.addEventListener('change', (e) => {
                        const target = e.target as HTMLInputElement | null;
                        if (target && target.files) {
                          const file = target.files[0];
                          const reader = new FileReader();
                          reader.addEventListener('load', () => {
                            if (editorRef.current && reader.result) {
                              const base64 = (reader.result as string).split(',')[1];
                              const id = 'blobid' + new Date().getTime();
                              const blobCache = editorRef.current.editorUpload.blobCache;
                              const blobInfo = blobCache.create(id, file, base64);
                              blobCache.add(blobInfo);

                              cb(blobInfo.blobUri(), { title: file.name });
                            }
                          });
                          reader.readAsDataURL(file);
                        }
                      });

                      input.click();
                    },
                  }}
                />
              </FormControl>
              <FormMessage className="text-red-500" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="paragraph-semibold text-dark400_light800">
                Tags <span className="text-brand-500">*</span>
              </FormLabel>
              <FormControl>
                <>
                  <div className="relative">
                    <Input
                      placeholder="Add tags..."
                      disabled={type === 'Edit'}
                      className="paragraph-regular light-border-2 background-light700_dark300 text-dark300_light700 border"
                      onChange={handleInputChange}
                      onKeyDown={(e) => handleInputKeyDown(e, field)}
                      value={inputValue}
                    />
                  </div>
                  {field.value.length > 0 && (
                    <div className="mt-2.5 flex items-center gap-2.5">
                      {field.value.map((tag: string) => (
                        <TagBadge key={tag} size="sm">
                          {tag}
                          {type === 'Create' && (
                            <XIcon
                              className="h-3.5 w-3.5"
                              role="button"
                              onClick={() => handleTagRemove(tag, field)}
                            />
                          )}
                        </TagBadge>
                      ))}
                    </div>
                  )}
                </>
              </FormControl>
              <FormDescription>
                Type & then press
                <kbd className="font-semibold text-light-500"> Enter ↵ </kbd>
                to add a tag. Add up to 3 tags to describe what your question is about. You need to
                press enter to add a tag.
              </FormDescription>
              <FormMessage className="text-red-500" />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          disabled={isSubmitting}
          className="primary-gradient px-10 text-light-800"
        >
          {isSubmitting ? (
            <>
              <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
              {type === 'Create' ? 'Posting...' : 'Updating...'}
            </>
          ) : (
            <>{type === 'Create' ? 'Post Question' : 'Save Changes'}</>
          )}
        </Button>
      </form>
    </Form>
  );
}
