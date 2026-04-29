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
  animationDelay?: number;
}

export function GroupCard({ group, className, animationDelay = 0 }: GroupCardProps) {
  return (
    <Link href={`/groups/${group.slug}`} className="group">
      <div
        className={cn(
          'relative flex flex-col overflow-hidden rounded-lg border border-journal-border bg-card shadow-sm transition-all duration-200 hover:border-journal-gold hover:shadow-md hover:-translate-y-0.5',
          className
        )}
        style={{ animationDelay: `${animationDelay}ms` }}
      >
        {/* Banner with gradient overlay */}
        <div className="h-20 bg-gradient-to-br from-journal-primary/20 via-journal-primary/10 to-transparent relative">
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
        </div>

        {/* Logo */}
        <div className="absolute left-4 top-12 flex h-16 w-16 items-center justify-center rounded-full border-2 border-background bg-background shadow-md transition-transform duration-200 group-hover:scale-105">
          {group.logo ? (
            <img
              src={group.logo}
              alt={group.name}
              className="h-full w-full rounded-lg object-cover"
            />
          ) : (
            <Building2 className="h-8 w-8 text-journal-primary" />
          )}
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col p-4 pt-16">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="font-serif font-semibold text-base truncate group-hover:text-journal-primary transition-colors">
                {group.name}
              </h3>
              <p className="mt-0.5 flex items-center text-xs text-muted-foreground">
                {group.institution.logo && (
                  <img
                    src={group.institution.logo}
                    alt=""
                    className="mr-1 h-3 w-3"
                  />
                )}
                <span className="truncate">{group.institution.name}</span>
              </p>
            </div>
          </div>

          {group.description && (
            <p className="mt-2 line-clamp-2 text-sm text-muted-foreground font-source-serif leading-relaxed">
              {group.description}
            </p>
          )}

          {/* Stats */}
          <div className="mt-auto flex items-center gap-4 border-t border-journal-border pt-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3 text-tea-primary" />
              {group._count.members}
            </span>
            <span className="flex items-center gap-1">
              <FileText className="h-3 w-3 text-journal-gold" />
              {group._count.publications}
            </span>
            <span className="flex items-center gap-1">
              <Newspaper className="h-3 w-3 text-convo-blue" />
              {group._count.news}
            </span>
            <span className="flex items-center gap-1">
              <Award className="h-3 w-3 text-tea-accent" />
              {group._count.patents}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
