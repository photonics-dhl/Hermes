'use client';

import Link from 'next/link';
import { Building2, Users, FileText, Newspaper, Award } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface GroupCardProps {
  group: {
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
  };
  className?: string;
}

export function GroupCard({ group, className }: GroupCardProps) {
  return (
    <Link href={`/groups/${group.slug}`}>
      <div
        className={cn(
          'group relative flex flex-col overflow-hidden rounded-lg border bg-card transition-all hover:shadow-md',
          className
        )}
      >
        {/* Banner placeholder */}
        <div className="h-24 bg-gradient-to-r from-primary/20 to-primary/5" />

        {/* Logo */}
        <div className="absolute left-4 top-12 flex h-16 w-16 items-center justify-center rounded-lg border-2 border-background bg-background shadow-sm">
          {group.logo ? (
            <img
              src={group.logo}
              alt={group.name}
              className="h-full w-full rounded-lg object-cover"
            />
          ) : (
            <Building2 className="h-8 w-8 text-muted-foreground" />
          )}
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col p-4 pt-16">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold group-hover:text-primary">{group.name}</h3>
              <p className="mt-0.5 flex items-center text-xs text-muted-foreground">
                {group.institution.logo && (
                  <img
                    src={group.institution.logo}
                    alt=""
                    className="mr-1 h-3 w-3"
                  />
                )}
                {group.institution.name}
              </p>
            </div>
          </div>

          {group.description && (
            <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
              {group.description}
            </p>
          )}

          {/* Stats */}
          <div className="mt-auto flex items-center gap-4 border-t pt-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {group._count.members}
            </span>
            <span className="flex items-center gap-1">
              <FileText className="h-3 w-3" />
              {group._count.publications}
            </span>
            <span className="flex items-center gap-1">
              <Newspaper className="h-3 w-3" />
              {group._count.news}
            </span>
            <span className="flex items-center gap-1">
              <Award className="h-3 w-3" />
              {group._count.patents}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
