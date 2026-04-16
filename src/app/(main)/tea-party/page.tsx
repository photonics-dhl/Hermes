'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Plus, Users, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RoomCard } from '@/components/features/tea-party/RoomCard';
import { CreateRoomDialog } from '@/components/features/tea-party/CreateRoomDialog';

interface Room {
  id: string;
  name: string;
  description: string | null;
  isPublic: boolean;
  maxParticipants: number;
  hostId: string;
  host: {
    id: string;
    name: string | null;
    avatar: string | null;
  };
  participantCount: number;
  messageCount: number;
  createdAt: string;
}

interface RoomsResponse {
  success: boolean;
  data: Room[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export default function TeaPartyPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [showCreate, setShowCreate] = useState(false);

  const fetchRooms = async (searchTerm = '', pageNum = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pageNum.toString(),
        pageSize: '20',
      });
      if (searchTerm) params.set('search', searchTerm);

      const res = await fetch(`/api/v1/tea-party/rooms?${params}`);
      const data: RoomsResponse = await res.json();

      if (data.success) {
        setRooms(data.data);
        setTotalPages(data.meta.totalPages);
        setTotal(data.meta.total);
      }
    } catch (error) {
      console.error('Failed to fetch rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchRooms(search, 1);
  };

  const handleRoomCreated = (room: Room) => {
    setRooms((prev) => [room, ...prev]);
    setTotal((prev) => prev + 1);
    setShowCreate(false);
  };

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">茶话会</h1>
          <p className="text-muted-foreground mt-1">
            加入实时聊天室，与研究者交流
          </p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="w-4 h-4 mr-2" />
          创建房间
        </Button>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="搜索房间..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button type="submit" variant="secondary">
          搜索
        </Button>
      </form>

      {/* Stats */}
      <div className="flex gap-6 mb-6 text-sm text-muted-foreground">
        <span className="flex items-center gap-1">
          <MessageSquare className="w-4 h-4" />
          共 {total} 个房间
        </span>
      </div>

      {/* Room List */}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-48 rounded-lg bg-muted animate-pulse"
            />
          ))}
        </div>
      ) : rooms.length === 0 ? (
        <div className="text-center py-12">
          <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">暂无房间</h3>
          <p className="text-muted-foreground mb-4">
            成为第一个创建茶话会房间的人
          </p>
          <Button onClick={() => setShowCreate(true)}>
            <Plus className="w-4 h-4 mr-2" />
            创建房间
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {rooms.map((room) => (
            <Link key={room.id} href={`/tea-party/${room.id}`}>
              <RoomCard room={room} />
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <Button
            variant="outline"
            disabled={page === 1}
            onClick={() => {
              setPage((p) => p - 1);
              fetchRooms(search, page - 1);
            }}
          >
            上一页
          </Button>
          <span className="px-4 py-2 text-sm text-muted-foreground">
            {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            disabled={page === totalPages}
            onClick={() => {
              setPage((p) => p + 1);
              fetchRooms(search, page + 1);
            }}
          >
            下一页
          </Button>
        </div>
      )}

      {/* Create Dialog */}
      <CreateRoomDialog
        open={showCreate}
        onOpenChange={setShowCreate}
        onSuccess={handleRoomCreated}
      />
    </div>
  );
}
