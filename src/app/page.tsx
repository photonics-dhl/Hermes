'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { GraduationCap, Users, MessageCircle, Sparkles, Trophy, ArrowRight, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface Stats {
  groups: number;
  publications: number;
  posts: number;
  users: number;
}

interface FeaturedGroup {
  id: string;
  name: string;
  slug: string;
  institution: { name: string };
  _count: { members: number };
}

interface RecentPost {
  id: string;
  title: string;
  discipline: { name: string; slug: string } | null;
  createdAt: string;
}

export default function HomePage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [featuredGroups, setFeaturedGroups] = useState<FeaturedGroup[]>([]);
  const [recentPosts, setRecentPosts] = useState<RecentPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/v1/groups?pageSize=4').then(r => r.json()),
      fetch('/api/v1/posts?pageSize=5').then(r => r.json()),
    ]).then(([groupsData, postsData]) => {
      if (groupsData.success) {
        setFeaturedGroups(groupsData.data);
        setStats(prev => prev ? { ...prev, groups: groupsData.meta.total } : { groups: groupsData.meta.total, publications: 0, posts: postsData.meta?.total || 0, users: 0 });
      }
      if (postsData.success) {
        setRecentPosts(postsData.data);
        setStats(prev => prev ? { ...prev, posts: postsData.meta.total } : { groups: 0, publications: 0, posts: postsData.meta.total, users: 0 });
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm text-primary mb-6">
              <Sparkles className="h-4 w-4" />
              高校学术交流社区
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
              学者茶话会
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              连接优秀研究者，分享学术见解，发现前沿研究。加入我们，开启您的学术交流之旅。
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/disciplines">
                  <BookOpen className="mr-2 h-5 w-5" />
                  探索学科
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/groups">
                  <Users className="mr-2 h-5 w-5" />
                  浏览课题组
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 -mt-8 mb-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {loading ? (
            [...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4 text-center">
                  <Skeleton className="h-8 w-16 mx-auto mb-2" />
                  <Skeleton className="h-4 w-20 mx-auto" />
                </CardContent>
              </Card>
            ))
          ) : (
            <>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-3xl font-bold text-primary">{stats?.groups || 0}</div>
                  <div className="text-sm text-muted-foreground">课题组</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-3xl font-bold text-primary">{stats?.publications || 0}</div>
                  <div className="text-sm text-muted-foreground">发表论文</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-3xl font-bold text-primary">{stats?.posts || 0}</div>
                  <div className="text-sm text-muted-foreground">讨论帖子</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-3xl font-bold text-primary">{stats?.users || 0}</div>
                  <div className="text-sm text-muted-foreground">注册用户</div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </section>

      {/* Quick Access */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-6">
          <Link href="/disciplines" className="group">
            <Card className="h-full transition-colors group-hover:bg-accent">
              <CardHeader>
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                  <GraduationCap className="h-5 w-5 text-primary" />
                </div>
                <CardTitle>学科社区</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  探索不同学科领域，与学者们交流思想
                </p>
                <div className="mt-4 flex items-center text-primary text-sm font-medium">
                  进入社区
                  <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/groups" className="group">
            <Card className="h-full transition-colors group-hover:bg-accent">
              <CardHeader>
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <CardTitle>课题组</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  发现并加入优秀的研究团队
                </p>
                <div className="mt-4 flex items-center text-primary text-sm font-medium">
                  浏览课题组
                  <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/tea-party" className="group">
            <Card className="h-full transition-colors group-hover:bg-accent">
              <CardHeader>
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                  <MessageCircle className="h-5 w-5 text-primary" />
                </div>
                <CardTitle>茶话会</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  加入实时聊天室，与研究者交流
                </p>
                <div className="mt-4 flex items-center text-primary text-sm font-medium">
                  加入讨论
                  <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </section>

      {/* Featured Groups */}
      {featuredGroups.length > 0 && (
        <section className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">优秀课题组</h2>
            <Button variant="ghost" asChild>
              <Link href="/groups">
                查看全部
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {featuredGroups.map((group) => (
              <Link key={group.id} href={`/groups/${group.slug}`}>
                <Card className="h-full hover:bg-accent transition-colors">
                  <CardContent className="p-4">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold truncate">{group.name}</h3>
                    <p className="text-sm text-muted-foreground">{group.institution.name}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {group._count.members} 位成员
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Top Questions CTA */}
      <section className="container mx-auto px-4 py-12">
        <Card className="bg-gradient-to-r from-primary/10 to-transparent">
          <CardContent className="p-8">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-yellow-500/20 flex items-center justify-center">
                <Trophy className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">TOP10 问题</h3>
                <p className="text-muted-foreground text-sm">
                  每月最受欢迎的研究讨论
                </p>
              </div>
              <Button asChild>
                <Link href="/top-questions">
                  查看排行
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t mt-12">
        <div className="container mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
          <p>Scholar&apos;s Tea 学者茶话会 · 高校学术交流社区</p>
        </div>
      </footer>
    </div>
  );
}
