'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { GroupHeader } from '@/components/features/groups/GroupHeader';
import { GroupMemberList } from '@/components/features/groups/GroupMemberList';
import { PublicationsList } from '@/components/features/groups/PublicationsList';
import { NewsList } from '@/components/features/groups/NewsList';
import { PatentsList } from '@/components/features/groups/PatentsList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText, Newspaper, Award, Users, Settings } from 'lucide-react';
import type { GroupWithRelations } from '@/types';

interface GroupDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default function GroupDetailPage({ params }: GroupDetailPageProps) {
  const { slug } = use(params);
  const router = useRouter();
  const [group, setGroup] = useState<GroupWithRelations | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    const fetchGroup = async () => {
      try {
        const res = await fetch(`/api/v1/groups/${slug}`);
        const data = await res.json();

        if (data.success) {
          setGroup(data.data);
        } else {
          setError(data.error?.message || '课题组不存在');
        }
      } catch (err) {
        setError('加载失败');
      } finally {
        setLoading(false);
      }
    };

    fetchGroup();
  }, [slug]);

  if (loading) {
    return (
      <div>
        <Skeleton className="h-48 w-full" />
        <div className="mx-auto max-w-5xl px-4">
          <div className="relative -mt-16">
            <Skeleton className="h-32 w-32 rounded-xl" />
          </div>
          <div className="mt-4 space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className="container mx-auto py-16 text-center">
        <h1 className="text-2xl font-bold">课题组不存在</h1>
        <p className="mt-2 text-muted-foreground">{error}</p>
        <Button onClick={() => router.push('/groups')} className="mt-4">
          返回列表
        </Button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <GroupHeader
        group={group}
        isFollowing={isFollowing}
        onFollowToggle={() => setIsFollowing(!isFollowing)}
      />

      {/* Tabs */}
      <div className="mx-auto max-w-5xl px-4 py-6">
        <Tabs defaultValue="overview">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="overview">
              <FileText className="mr-2 h-4 w-4" />
              概况
            </TabsTrigger>
            <TabsTrigger value="publications">
              <FileText className="mr-2 h-4 w-4" />
              论文 ({group._count.publications})
            </TabsTrigger>
            <TabsTrigger value="news">
              <Newspaper className="mr-2 h-4 w-4" />
              动态 ({group._count.news})
            </TabsTrigger>
            <TabsTrigger value="patents">
              <Award className="mr-2 h-4 w-4" />
              专利 ({group._count.patents})
            </TabsTrigger>
            <TabsTrigger value="members">
              <Users className="mr-2 h-4 w-4" />
              成员 ({group._count.members})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="prose dark:prose-invert">
              {group.description ? (
                <p>{group.description}</p>
              ) : (
                <p className="text-muted-foreground">暂无简介</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="publications" className="mt-6">
            <PublicationsList groupId={group.id} />
          </TabsContent>

          <TabsContent value="news" className="mt-6">
            <NewsList groupId={group.id} />
          </TabsContent>

          <TabsContent value="patents" className="mt-6">
            <PatentsList groupId={group.id} />
          </TabsContent>

          <TabsContent value="members" className="mt-6">
            <GroupMemberList members={group.members} />
          </TabsContent>
        </Tabs>

        {/* Settings Button (for group admins) */}
        <div className="mt-6 border-t pt-6">
          <Button variant="outline" asChild>
            <a href={`/groups/${slug}/settings`}>
              <Settings className="mr-2 h-4 w-4" />
              课题组设置
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
