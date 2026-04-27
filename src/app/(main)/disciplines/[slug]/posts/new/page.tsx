'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';

interface Discipline {
  id: string;
  name: string;
  slug: string;
}

interface DisciplineResponse {
  success: boolean;
  data: {
    discipline: Discipline;
  };
}

export default function NewPostPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const router = useRouter();
  const [discipline, setDiscipline] = useState<Discipline | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDiscipline = async () => {
      try {
        const res = await fetch(`/api/v1/disciplines/${slug}`);
        const data: DisciplineResponse = await res.json();
        if (data.success) {
          setDiscipline(data.data.discipline);
        } else {
          router.push('/disciplines');
        }
      } catch (err) {
        router.push('/disciplines');
      } finally {
        setLoading(false);
      }
    };

    fetchDiscipline();
  }, [slug, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('请输入标题');
      return;
    }

    if (!content.trim()) {
      setError('请输入内容');
      return;
    }

    setSubmitting(true);

    try {
      const tagList = tags
        .split(/[,，]/)
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      const res = await fetch('/api/v1/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          disciplineId: discipline?.id,
          tags: tagList.length > 0 ? tagList : undefined,
        }),
      });

      const data = await res.json();

      if (data.success) {
        router.push(`/disciplines/${slug}/posts/${data.data.id}`);
      } else {
        setError(data.error?.message || '发布失败');
      }
    } catch (err) {
      setError('网络错误，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 max-w-2xl">
        <Skeleton className="h-4 w-64 mb-6" />
        <Skeleton className="h-8 w-full mb-4" />
        <Skeleton className="h-64 w-full mb-4" />
        <Skeleton className="h-10 w-24" />
      </div>
    );
  }

  if (!discipline) return null;

  return (
    <div className="container mx-auto py-8 max-w-2xl">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link href="/disciplines" className="hover:text-foreground">
          学科社区
        </Link>
        <ChevronRight className="h-4 w-4" />
        <Link href={`/disciplines/${slug}`} className="hover:text-foreground">
          {discipline.name}
        </Link>
        <ChevronRight className="h-4 w-4" />
        <Link href={`/disciplines/${slug}/posts`} className="hover:text-foreground">
          帖子
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground">发布</span>
      </nav>

      <h1 className="text-2xl font-bold mb-8">发布新帖子</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="title">标题 *</Label>
          <Input
            id="title"
            placeholder="请输入帖子标题"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={200}
          />
          <p className="text-xs text-muted-foreground text-right">
            {title.length}/200
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="content">内容 *</Label>
          <Textarea
            id="content"
            placeholder="请输入帖子内容，支持 Markdown 格式"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[300px]"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="tags">标签</Label>
          <Input
            id="tags"
            placeholder="多个标签用逗号分隔，如：机器学习,NLP,论文解读"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            多个标签用逗号分隔
          </p>
        </div>

        <div className="flex items-center gap-4 pt-4">
          <Button type="submit" disabled={submitting}>
            {submitting ? '发布中...' : '发布帖子'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={submitting}
          >
            取消
          </Button>
        </div>
      </form>
    </div>
  );
}
