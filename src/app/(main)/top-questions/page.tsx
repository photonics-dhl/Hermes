'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Trophy, Flame, Calendar, ArrowUp, MessageSquare, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Author {
  id: string;
  name: string | null;
  avatar: string | null;
}

interface Discipline {
  id: string;
  name: string;
  slug: string;
}

interface Post {
  id: string;
  title: string;
  author: Author;
  discipline: Discipline | null;
  viewCount: number;
  createdAt: string;
  score: number;
  topTenVotes: number;
  _count: {
    comments: number;
  };
}

interface TopTenEntry {
  rank: number;
  post: Post;
  voteCount: number;
}

interface TopTenResponse {
  success: boolean;
  data: {
    entries: TopTenEntry[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    year?: number;
    month?: number;
  };
}

export default function TopQuestionsPage() {
  const [entries, setEntries] = useState<TopTenEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [viewMode, setViewMode] = useState<'monthly' | 'allTime'>('monthly');
  const [voting, setVoting] = useState<string | null>(null);

  const fetchTopTen = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (viewMode === 'monthly') {
        params.set('year', year.toString());
        params.set('month', month.toString());
      } else {
        params.set('allTime', 'true');
      }

      const res = await fetch(`/api/v1/top-questions?${params}`);
      const data: TopTenResponse = await res.json();

      if (data.success) {
        setEntries(data.data.entries);
      }
    } catch (err) {
      console.error('Failed to fetch top ten:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopTen();
  }, [year, month, viewMode]);

  const handleVote = async (postId: string) => {
    if (voting) return;
    setVoting(postId);

    try {
      const res = await fetch(`/api/v1/top-questions/${postId}/vote`, {
        method: 'POST',
      });
      const data = await res.json();

      if (data.success) {
        setEntries(entries.map((entry) => {
          if (entry.post.id === postId) {
            return {
              ...entry,
              voteCount: data.data.voteCount,
              post: {
                ...entry.post,
                topTenVotes: data.data.voteCount,
              },
            };
          }
          return entry;
        }));
      }
    } catch (err) {
      console.error('Vote failed:', err);
    } finally {
      setVoting(null);
    }
  };

  const formatMonth = (y: number, m: number) => {
    return `${y}年${m}月`;
  };

  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  return (
    <div className="container mx-auto py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Trophy className="h-8 w-8 text-yellow-500" />
        <div>
          <h1 className="text-3xl font-bold">TOP10 问题</h1>
          <p className="text-muted-foreground">每月最受欢迎的研究讨论</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-8">
        <div className="flex items-center gap-2">
          <Select
            value={viewMode}
            onValueChange={(v) => setViewMode(v as 'monthly' | 'allTime')}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">
                <span className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" /> 月度
                </span>
              </SelectItem>
              <SelectItem value="allTime">
                <span className="flex items-center gap-2">
                  <Trophy className="h-4 w-4" /> 总榜
                </span>
              </SelectItem>
            </SelectContent>
          </Select>

          {viewMode === 'monthly' && (
            <>
              <Select
                value={year.toString()}
                onValueChange={(v) => setYear(parseInt(v))}
              >
                <SelectTrigger className="w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map((y) => (
                    <SelectItem key={y} value={y.toString()}>
                      {y}年
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={month.toString()}
                onValueChange={(v) => setMonth(parseInt(v))}
              >
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {months.map((m) => (
                    <SelectItem key={m} value={m.toString()}>
                      {m}月
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </>
          )}
        </div>

        <Badge variant="outline" className="text-sm">
          {viewMode === 'monthly' ? formatMonth(year, month) : '全时间'} TOP10
        </Badge>
      </div>

      {/* Rankings */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : entries.length > 0 ? (
        <div className="space-y-4">
          {entries.map((entry) => (
            <div
              key={entry.post.id}
              className={`rounded-lg border p-4 ${
                entry.rank <= 3
                  ? entry.rank === 1
                    ? 'border-yellow-400 bg-yellow-50 dark:bg-yellow-950/20'
                    : entry.rank === 2
                    ? 'border-gray-300 bg-gray-50 dark:bg-gray-800/20'
                    : 'border-amber-600 bg-amber-50 dark:bg-amber-950/20'
                  : ''
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Rank */}
                <div className="flex flex-col items-center min-w-[60px]">
                  <span
                    className={`text-3xl font-bold ${
                      entry.rank === 1
                        ? 'text-yellow-500'
                        : entry.rank === 2
                        ? 'text-gray-400'
                        : entry.rank === 3
                        ? 'text-amber-600'
                        : 'text-muted-foreground'
                    }`}
                  >
                    #{entry.rank}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <Link href={`/disciplines/${entry.post.discipline?.slug || 'general'}/posts/${entry.post.id}`}>
                    <h3 className="font-semibold text-lg hover:text-primary line-clamp-1">
                      {entry.post.title}
                    </h3>
                  </Link>

                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <span>{entry.post.author.name || '匿名用户'}</span>
                    {entry.post.discipline && (
                      <Link
                        href={`/disciplines/${entry.post.discipline.slug}`}
                        className="hover:text-foreground"
                      >
                        {entry.post.discipline.name}
                      </Link>
                    )}
                    <span className="flex items-center gap-1">
                      <MessageSquare className="h-4 w-4" />
                      {entry.post._count.comments}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      {entry.post.viewCount}
                    </span>
                  </div>
                </div>

                {/* Vote Button */}
                <Button
                  variant={entry.post.topTenVotes > 0 ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleVote(entry.post.id)}
                  disabled={voting === entry.post.id}
                  className="flex flex-col items-center min-w-[60px] h-auto py-2"
                >
                  <ArrowUp className="h-5 w-5" />
                  <span className="font-semibold">{entry.voteCount}</span>
                  <span className="text-xs">投票</span>
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-muted-foreground">
          <Trophy className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg">暂无排名数据</p>
          <p className="text-sm mt-2">
            {viewMode === 'monthly'
              ? `${formatMonth(year, month)}还没有帖子获得投票`
              : '还没有帖子获得投票'}
          </p>
        </div>
      )}
    </div>
  );
}
