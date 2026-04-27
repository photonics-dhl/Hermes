'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { GraduationCap, Users, MessageCircle, Sparkles, Trophy, ArrowRight, BookOpen, TrendingUp, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

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
  description: string | null;
  institution: { name: string };
  _count: { members: number };
}

interface Discipline {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  _count: { groups: number; posts: number };
}

export default function HomePage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [featuredGroups, setFeaturedGroups] = useState<FeaturedGroup[]>([]);
  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/v1/groups?pageSize=4').then(r => r.json()),
      fetch('/api/v1/disciplines').then(r => r.json()),
      fetch('/api/v1/posts?pageSize=1').then(r => r.json()).catch(() => ({ success: false, meta: { total: 0 } })),
    ]).then(([groupsData, disciplinesData, postsData]) => {
      if (groupsData.success) {
        setFeaturedGroups(groupsData.data);
        setStats(prev => prev ? { ...prev, groups: groupsData.meta.total, publications: 0 } : { groups: groupsData.meta.total, publications: 0, posts: postsData.meta?.total || 0, users: 0 });
      }
      if (disciplinesData.success) {
        setDisciplines(disciplinesData.data.slice(0, 6));
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const quickAccessItems = [
    { href: '/disciplines', icon: GraduationCap, title: '学科社区', desc: '探索不同学科领域，与学者们交流思想', color: 'from-blue-500/10 to-blue-500/5' },
    { href: '/groups', icon: Users, title: '课题组', desc: '发现并加入优秀的研究团队', color: 'from-emerald-500/10 to-emerald-500/5' },
    { href: '/tea-party', icon: MessageCircle, title: '茶话会', desc: '加入实时聊天室，与研究者交流', color: 'from-amber-500/10 to-amber-500/5' },
    { href: '/workshop', icon: Sparkles, title: '思想工坊', desc: '与 AI 助手讨论学术问题', color: 'from-purple-500/10 to-purple-500/5' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section - Full Width */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/10 via-background to-background">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
        <div className="relative container mx-auto px-4 py-20 md:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="outline" className="mb-6 px-4 py-1.5 text-sm font-normal">
              <Sparkles className="h-3.5 w-3.5 mr-1.5 text-primary" />
              高校学术交流社区
            </Badge>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
              学者茶话会
              <span className="block text-2xl md:text-3xl lg:text-4xl font-normal text-muted-foreground mt-2">
                Scholar&apos;s Tea
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
              连接优秀研究者，分享学术见解，发现前沿研究。加入我们，开启您的学术交流之旅。
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="px-8">
                <Link href="/disciplines">
                  <BookOpen className="mr-2 h-5 w-5" />
                  探索学科
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="px-8">
                <Link href="/groups">
                  <Users className="mr-2 h-5 w-5" />
                  浏览课题组
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section - Full Width Cards */}
      <section className="container mx-auto px-4 -mt-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {loading ? (
            [...Array(4)].map((_, i) => (
              <Card key={i} className="bg-gradient-to-br from-card to-card/50">
                <CardContent className="p-4 md:p-6 text-center">
                  <Skeleton className="h-8 w-16 mx-auto mb-2" />
                  <Skeleton className="h-4 w-20 mx-auto" />
                </CardContent>
              </Card>
            ))
          ) : (
            <>
              <Card className="bg-gradient-to-br from-card to-primary/5 border-primary/20">
                <CardContent className="p-4 md:p-6 text-center">
                  <div className="text-3xl md:text-4xl font-bold text-primary">{stats?.groups || 0}</div>
                  <div className="text-sm text-muted-foreground mt-1">课题组</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-card to-blue-500/5 border-blue-500/20">
                <CardContent className="p-4 md:p-6 text-center">
                  <div className="text-3xl md:text-4xl font-bold text-blue-600">{stats?.publications || 0}</div>
                  <div className="text-sm text-muted-foreground mt-1">发表论文</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-card to-amber-500/5 border-amber-500/20">
                <CardContent className="p-4 md:p-6 text-center">
                  <div className="text-3xl md:text-4xl font-bold text-amber-600">{stats?.posts || 0}</div>
                  <div className="text-sm text-muted-foreground mt-1">讨论帖子</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-card to-emerald-500/5 border-emerald-500/20">
                <CardContent className="p-4 md:p-6 text-center">
                  <div className="text-3xl md:text-4xl font-bold text-emerald-600">{stats?.users || 0}</div>
                  <div className="text-sm text-muted-foreground mt-1">注册用户</div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </section>

      {/* Quick Access - Icon Grid */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          快速入口
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {quickAccessItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} className="group">
                <Card className={`h-full transition-all duration-300 group-hover:shadow-lg group-hover:-translate-y-1 bg-gradient-to-br ${item.color}`}>
                  <CardContent className="p-6">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg mb-2">{item.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                    <div className="mt-4 flex items-center text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      进入
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Featured Groups */}
      {featuredGroups.length > 0 && (
        <section className="container mx-auto px-4 pb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              优秀课题组
            </h2>
            <Button variant="ghost" asChild>
              <Link href="/groups" className="flex items-center gap-1">
                查看全部
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {featuredGroups.map((group) => (
              <Link key={group.id} href={`/groups/${group.slug}`} className="group">
                <Card className="h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                  <CardContent className="p-5">
                    <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-4 group-hover:from-primary/30 transition-colors">
                      <Users className="h-7 w-7 text-primary" />
                    </div>
                    <h3 className="font-semibold text-lg mb-1 truncate group-hover:text-primary transition-colors">{group.name}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{group.institution.name}</p>
                    {group.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2">{group.description}</p>
                    )}
                    <div className="mt-3 pt-3 border-t flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {group._count.members} 成员
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Discipline Preview */}
      {disciplines.length > 0 && (
        <section className="container mx-auto px-4 pb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              热门学科
            </h2>
            <Button variant="ghost" asChild>
              <Link href="/disciplines" className="flex items-center gap-1">
                查看全部
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {disciplines.map((discipline) => (
              <Link key={discipline.id} href={`/disciplines/${discipline.slug}`} className="group">
                <Card className="transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
                  <CardContent className="p-4 text-center">
                    <h3 className="font-medium text-sm mb-1 group-hover:text-primary transition-colors">{discipline.name}</h3>
                    <p className="text-xs text-muted-foreground">{discipline._count.groups} 课题组</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Top Questions CTA */}
      <section className="container mx-auto px-4 pb-16">
        <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-primary/20 overflow-hidden">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="h-16 w-16 rounded-2xl bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
                <Trophy className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="font-semibold text-xl mb-1">TOP10 问题</h3>
                <p className="text-muted-foreground">
                  每月最受欢迎的研究讨论，看看社区最热门的话题
                </p>
              </div>
              <Button size="lg" asChild className="flex-shrink-0">
                <Link href="/top-questions">
                  查看排行
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2">
              <GraduationCap className="h-5 w-5 text-primary" />
              <span className="font-semibold">Scholar&apos;s Tea 学者茶话会</span>
            </div>
            <p className="text-sm text-muted-foreground">
              高校学术交流社区 · 连接学者，创造价值
            </p>
            <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
              <Link href="/disciplines" className="hover:text-foreground transition-colors">学科</Link>
              <Link href="/groups" className="hover:text-foreground transition-colors">课题组</Link>
              <Link href="/top-questions" className="hover:text-foreground transition-colors">TOP10</Link>
              <Link href="/tea-party" className="hover:text-foreground transition-colors">茶话会</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
