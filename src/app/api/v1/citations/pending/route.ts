import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { CitationStatus } from '@prisma/client';

// GET /api/v1/citations/pending - List pending citations for verification
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1;
    const pageSize = searchParams.get('pageSize') ? parseInt(searchParams.get('pageSize')!) : 20;

    const where = { status: CitationStatus.PENDING };

    const [total, citations] = await Promise.all([
      prisma.communityCitation.count({ where }),
      prisma.communityCitation.findMany({
        where,
        include: {
          citingUser: { select: { id: true, name: true, avatar: true } },
          publication: { select: { id: true, title: true } },
          group: { select: { id: true, name: true } },
          citingPost: { select: { id: true, title: true } },
          citingComment: { select: { id: true, content: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: citations,
      meta: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error('GET /api/v1/citations/pending error:', error);
    return NextResponse.json(
      {
        success: false,
        data: null,
        error: {
          code: 'INTERNAL_ERROR',
          message: error instanceof Error ? error.message : '服务器内部错误',
        },
      },
      { status: 500 }
    );
  }
}
