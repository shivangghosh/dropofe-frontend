'use client';

import { useState, useRef } from 'react';
import { Sparkles } from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { useTheme } from 'next-themes';
import { zodResolver } from '@hookform/resolvers/zod';
import { Editor } from '@tinymce/tinymce-react';
import { toast } from 'sonner';
import envConfig from '@/config';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { usePathname } from 'next/navigation';

const formSchema = z.object({
  answer: z.string().min(1, { message: 'Required' }).min(10),
});

type FormValues = z.infer<typeof formSchema>;

interface Props {
  questionId: string;
  questionTitleContent: string;
  userId: string;
}

export default function AnswerForm({ questionId, userId, questionTitleContent }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmittingAI, setIsSubmittingAI] = useState(false);
  const editorRef = useRef<any>(null);
  const pathname = usePathname();
  const { theme } = useTheme();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      answer: '',
    },
  });

  async function onSubmit(values: FormValues) {
    if (!userId) {
      return toast.error('You must be logged in to answer the question');
    }
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/answers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: values.answer, question: questionId, author: userId }),
      });
      if (!res.ok) throw new Error('Failed to submit answer');
      toast.success('Answer submitted successfully');
      form.reset();
      if (editorRef.current) {
        editorRef.current.setContent('');
      }
    } catch (error) {
      console.log(error);
      toast.error('Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  }

  const generateAIAnswer = async () => {
    if (!userId) {
      return toast.error('You must be logged in to generate an AI answer');
    }
    setIsSubmittingAI(true);
    try {
      const res = await fetch(`${envConfig.NEXT_PUBLIC_SERVER_URL}api/chatgpt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: questionTitleContent }),
      });
      const aiAnswer = await res.json();

      if (aiAnswer && aiAnswer.reply && typeof aiAnswer.reply === 'string') {
        const htmlAnswer = aiAnswer.reply.replace(/\n/g, '<br />');
        if (editorRef.current) {
          editorRef.current.setContent(htmlAnswer);
        }
        toast.success('AI Answer generated successfully');
      } else {
        toast.error('Unexpected AI response structure');
        console.error('AI Answer Response:', aiAnswer);
      }
    } catch (error) {
      console.log(error);
      toast.error('Something went wrong');
    } finally {
      setIsSubmittingAI(false);
    }
  };

  return (
    <div className="mt-10">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <h4 className="paragraph-semibold text-dark400_light800">Write your answer here</h4>
        <Button
          disabled={isSubmittingAI}
          className="btn light-border-2 border text-brand-500"
          onClick={generateAIAnswer}
        >
          <Sparkles className="mr-1 h-4 w-4 fill-orange-300" />
          {isSubmittingAI ? 'Generating...' : 'Generate AI Answer'}
        </Button>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-8">
          <FormField
            control={form.control}
            name="answer"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Editor
                    apiKey={envConfig.TINY_API_KEY}
                    onInit={(evt, editor) => (editorRef.current = editor)}
                    onBlur={field.onBlur}
                    onEditorChange={(content) => field.onChange(content)}
                    init={{
                      height: 350,
                      menubar: false,
                      placeholder: 'Explain your answer in detail...',
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
                        'undo redo | codesample | bold italic forecolor backcolor | alignleft aligncenter alignright alignjustify | bullist numlist fullscreen | image',
                      content_style: 'body { font-family:Inter; font-size:14px }',
                      skin: theme === 'dark' ? 'oxide-dark' : 'oxide',
                      content_css: theme === 'dark' ? 'dark' : 'light',
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
          <Button
            type="submit"
            disabled={isSubmitting}
            className="primary-gradient float-right px-10 text-light-800"
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </Button>
        </form>
      </Form>
    </div>
  );
}
