'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronRight, Users, FileText, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { GroupCard } from '@/components/features/groups/GroupCard';

interface Discipline {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  level: number;
  parent: {
    id: string;
    name: string;
    slug: string;
    parent: {
      id: string;
      name: string;
      slug: string;
    } | null;
  } | null;
  children: {
    id: string;
    name: string;
    slug: string;
    _count: {
      posts: number;
      groups: number;
    };
  }[];
  groups: {
    group: {
      id: string;
      name: string;
      slug: string;
      logo: string | null;
      description: string | null;
      institution: {
        id: string;
        name: string;
        logo: string | null;
      };
      _count: {
        members: number;
        publications: number;
      };
    };
  }[];
  _count: {
    posts: number;
    groups: number;
  };
}

interface DisciplinePageProps {
  params: Promise<{ slug: string }>;
}

export default function DisciplineDetailPage({ params }: DisciplinePageProps) {
  const { slug } = use(params);
  const router = useRouter();
  const [discipline, setDiscipline] = useState<Discipline | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDiscipline = async () => {
      try {
        const res = await fetch(`/api/v1/disciplines/${slug}`);
        const data = await res.json();

        if (data.success) {
          setDiscipline(data.data);
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

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <Skeleton className="h-8 w-48 mb-4" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!discipline) return null;

  const levelLabels = ['一级学科', '二级学科', '研究方向'];

  return (
    <div className="container mx-auto py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
        <Link href="/disciplines" className="hover:text-foreground">
          学科社区
        </Link>
        {discipline.parent?.parent && (
          <>
            <ChevronRight className="h-4 w-4" />
            <Link
              href={`/disciplines/${discipline.parent.parent.slug}`}
              className="hover:text-foreground"
            >
              {discipline.parent.parent.name}
            </Link>
          </>
        )}
        {discipline.parent && (
          <>
            <ChevronRight className="h-4 w-4" />
            <Link
              href={`/disciplines/${discipline.parent.slug}`}
              className="hover:text-foreground"
            >
              {discipline.parent.name}
            </Link>
          </>
        )}
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground">{discipline.name}</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <BookOpen className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">{discipline.name}</h1>
            <p className="text-muted-foreground">
              {levelLabels[discipline.level] || '学科'}
            </p>
          </div>
        </div>
        {discipline.description && (
          <p className="mt-4 text-muted-foreground max-w-3xl">
            {discipline.description}
          </p>
        )}
        <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            {discipline._count.groups} 课题组
          </span>
          <span className="flex items-center gap-1">
            <FileText className="h-4 w-4" />
            {discipline._count.posts} 帖子
          </span>
        </div>
      </div>

      {/* Sub-disciplines */}
      {discipline.children.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">子领域</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {discipline.children.map((child) => (
              <Link
                key={child.id}
                href={`/disciplines/${child.slug}`}
                className="rounded-lg border p-4 hover:bg-accent"
              >
                <h3 className="font-medium">{child.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {child._count.groups} 课题组 · {child._count.posts} 帖子
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Tabs: Groups & Posts */}
      <Tabs defaultValue="groups">
        <TabsList>
          <TabsTrigger value="groups">
            课题组 ({discipline._count.groups})
          </TabsTrigger>
          <TabsTrigger value="posts">
            帖子 ({discipline._count.posts})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="groups" className="mt-6">
          {discipline.groups.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {discipline.groups.map(({ group }) => (
                <GroupCard
                  key={group.id}
                  group={{
                    ...group,
                    institution: group.institution,
                    _count: {
                      members: group._count.members,
                      publications: group._count.publications,
                      news: 0,
                      patents: 0,
                    },
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              暂无课题组
            </div>
          )}
        </TabsContent>

        <TabsContent value="posts" className="mt-6">
          <div className="text-center py-8 text-muted-foreground">
            暂无帖子
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
