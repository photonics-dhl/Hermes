'use client';

import { Users, MessageSquare } from 'lucide-react';

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

interface RoomCardProps {
  room: Room;
}

export function RoomCard({ room }: RoomCardProps) {
  const isFull = room.participantCount >= room.maxParticipants;

  return (
    <div className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-lg">{room.name}</h3>
          {room.host && (
            <p className="text-sm text-muted-foreground">
              主持人: {room.host.name || '匿名用户'}
            </p>
          )}
        </div>
        {!room.isPublic && (
          <span className="text-xs bg-secondary px-2 py-1 rounded">私有</span>
        )}
      </div>

      {room.description && (
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {room.description}
        </p>
      )}

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span className="flex items-center gap-1">
          <Users className="w-4 h-4" />
          {room.participantCount} / {room.maxParticipants}
          {isFull && <span className="text-destructive ml-1">(已满)</span>}
        </span>
        <span className="flex items-center gap-1">
          <MessageSquare className="w-4 h-4" />
          {room.messageCount}
        </span>
      </div>
    </div>
  );
}
