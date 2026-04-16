'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronRight, BookOpen, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

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
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8">学科社区</h1>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">学科社区</h1>
        <p className="mt-1 text-muted-foreground">
          探索不同学科领域 · 共 {disciplines.length} 个一级学科
        </p>
      </div>

      <div className="space-y-6">
        {disciplines.map((discipline) => (
          <div key={discipline.id} className="rounded-lg border">
            {/* Level 0: Primary Discipline */}
            <div className="p-4">
              <div className="flex items-center justify-between">
                <Link
                  href={`/disciplines/${discipline.slug}`}
                  className="flex items-center gap-3 hover:text-primary"
                >
                  <BookOpen className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-semibold">{discipline.name}</h2>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </Link>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{discipline._count.groups} 课题组</span>
                  <span>{discipline._count.posts} 帖子</span>
                </div>
              </div>
              {discipline.description && (
                <p className="mt-2 text-sm text-muted-foreground">
                  {discipline.description}
                </p>
              )}
            </div>

            {/* Level 1: Secondary Disciplines */}
            {discipline.children && discipline.children.length > 0 && (
              <div className="border-t bg-muted/30 p-4">
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                  {discipline.children.map((child) => (
                    <Link
                      key={child.id}
                      href={`/disciplines/${child.slug}`}
                      className="rounded-md bg-background p-3 hover:bg-accent"
                    >
                      <h3 className="font-medium text-sm">{child.name}</h3>
                      <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{child._count.groups} 组</span>
                        <span>·</span>
                        <span>{child._count.posts} 帖</span>
                      </div>

                      {/* Level 2: Research Directions */}
                      {child.children && child.children.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {child.children.slice(0, 3).map((grandchild) => (
                            <Badge key={grandchild.id} variant="secondary" className="text-xs">
                              {grandchild.name}
                            </Badge>
                          ))}
                          {child.children.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{child.children.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
