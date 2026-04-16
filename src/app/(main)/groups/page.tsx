'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Plus, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GroupCard } from '@/components/features/groups/GroupCard';

interface Group {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  description: string | null;
  institution: {
    name: string;
    logo: string | null;
  };
  _count: {
    members: number;
    publications: number;
    news: number;
    patents: number;
  };
}

interface GroupsResponse {
  success: boolean;
  data: Group[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchGroups = async (searchTerm = '', pageNum = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pageNum.toString(),
        pageSize: '12',
      });
      if (searchTerm) params.set('search', searchTerm);

      const res = await fetch(`/api/v1/groups?${params}`);
      const data: GroupsResponse = await res.json();

      if (data.success) {
        setGroups(data.data);
        setTotalPages(data.meta.totalPages);
        setTotal(data.meta.total);
      }
    } catch (error) {
      console.error('Failed to fetch groups:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchGroups(search, 1);
  };

  return (
    <div className="container mx-auto py-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">课题组</h1>
          <p className="mt-1 text-muted-foreground">
            发现并加入优秀的研究团队 · 共 {total} 个课题组
          </p>
        </div>
        <Link href="/groups/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            创建课题组
          </Button>
        </Link>
      </div>

      {/* Search & Filters */}
      <div className="mb-6 flex items-center gap-4">
        <form onSubmit={handleSearch} className="flex flex-1 items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="搜索课题组..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button type="submit" variant="secondary">
            搜索
          </Button>
        </form>
        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      {/* Groups Grid */}
      {loading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse rounded-lg border bg-card p-4">
              <div className="h-24 bg-muted" />
              <div className="mt-4 h-4 w-2/3 bg-muted" />
              <div className="mt-2 h-3 w-1/2 bg-muted" />
              <div className="mt-4 h-3 w-full bg-muted" />
              <div className="mt-2 h-3 w-3/4 bg-muted" />
            </div>
          ))}
        </div>
      ) : groups.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-muted-foreground">暂无课题组</p>
          <Link href="/groups/new" className="mt-4">
            <Button>创建第一个课题组</Button>
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {groups.map((group) => (
              <GroupCard key={group.id} group={group} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  const newPage = page - 1;
                  setPage(newPage);
                  fetchGroups(search, newPage);
                }}
                disabled={page === 1}
              >
                上一页
              </Button>
              <span className="text-sm text-muted-foreground">
                第 {page} / {totalPages} 页
              </span>
              <Button
                variant="outline"
                onClick={() => {
                  const newPage = page + 1;
                  setPage(newPage);
                  fetchGroups(search, newPage);
                }}
                disabled={page === totalPages}
              >
                下一页
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
