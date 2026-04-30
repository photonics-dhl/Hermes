'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronRight, BookOpen, Users, MessageSquare } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

interface Discipline {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  level: number;
  _count: {
    posts: number;
    groups: number;
  };
  children?: Discipline[];
}

function DisciplineCard({ discipline, animationDelay = 0 }: { discipline: Discipline; animationDelay?: number }) {
  return (
    <Card className="group hover:shadow-md transition-all duration-200 overflow-hidden animate-fade-in-up" style={{ animationDelay: `${animationDelay}ms` }}>
      <CardContent className="p-0">
        {/* Header */}
        <div className="p-5 border-b bg-gradient-to-r from-primary/5 to-transparent">
          <div className="flex items-start justify-between gap-4">
            <Link
              href={`/disciplines/${discipline.slug}`}
              className="flex-1 min-w-0 group/title"
            >
              <div className="flex items-center gap-2.5">
                <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 group-hover/title:bg-primary/20 transition-colors">
                  <BookOpen className="h-4 w-4 text-primary" />
                </div>
                <h2 className="text-lg font-semibold truncate group-hover/title:text-primary transition-colors">
                  {discipline.name}
                </h2>
                <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover/title:opacity-100 transition-opacity flex-shrink-0" />
              </div>
              {discipline.description && (
                <p className="mt-2 text-sm text-muted-foreground line-clamp-2 pl-11">
                  {discipline.description}
                </p>
              )}
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="px-5 py-3 flex items-center gap-6 text-sm text-muted-foreground bg-muted/30">
          <div className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" />
            <span>{discipline._count.groups} 课题组</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MessageSquare className="h-3.5 w-3.5" />
            <span>{discipline._count.posts} 帖子</span>
          </div>
        </div>

        {/* Children */}
        {discipline.children && discipline.children.length > 0 && (
          <div className="px-5 py-4 border-t">
            <div className="flex flex-wrap gap-2">
              {discipline.children.map((child) => (
                <Link
                  key={child.id}
                  href={`/disciplines/${child.slug}`}
                  className="inline-flex items-center gap-1.5 rounded-full bg-background px-3 py-1.5 text-sm border hover:border-primary hover:text-primary transition-colors"
                >
                  <span className="truncate max-w-[120px]">{child.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {child._count.groups}组
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function DisciplinePageSkeleton() {
  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-5 w-72" />
      </div>
      <div className="grid gap-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-40 w-full" />
        ))}
      </div>
    </div>
  );
}

export default function DisciplinesPage() {
  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/v1/disciplines')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setDisciplines(data.data);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <DisciplinePageSkeleton />;
  }

  return (
    <div className="container mx-auto py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold tracking-tight">学科社区</h1>
        <p className="mt-2 text-muted-foreground">
          探索不同学科领域，与学者们交流思想 · 共{' '}
          <span className="font-medium text-foreground">{disciplines.length}</span>{' '}
          个一级学科
        </p>
      </div>

      {/* Disciplines Grid */}
      {disciplines.length > 0 ? (
        <div className="grid gap-4">
          {disciplines.map((discipline, index) => (
            <DisciplineCard key={discipline.id} discipline={discipline} animationDelay={index * 100} />
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/50" />
          <h3 className="mt-4 font-medium">暂无学科</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            敬请期待，即将上线
          </p>
        </Card>
      )}
    </div>
  );
}
