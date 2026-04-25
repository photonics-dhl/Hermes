import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth';
import { createComment } from '@/services/comments';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: {
            code: 'UNAUTHORIZED',
            message: '请先登录',
          },
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { postId, content, parentId } = body;

    if (!postId || !content) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: {
            code: 'VALIDATION_ERROR',
            message: '帖子ID和内容不能为空',
          },
        },
        { status: 400 }
      );
    }

    const comment = await createComment(session.user.id, postId, {
      content,
      parentId,
    });

    return NextResponse.json({
      success: true,
      data: comment,
      meta: null,
    }, { status: 201 });
  } catch (error) {
    console.error('POST /api/v1/comments error:', error);

    const message = error instanceof Error ? error.message : '服务器内部错误';
    const status = message.includes('不存在') || message.includes('锁定') ? 400 : 500;

    return NextResponse.json(
      {
        success: false,
        data: null,
        error: {
          code: status === 400 ? 'BAD_REQUEST' : 'INTERNAL_ERROR',
          message,
        },
      },
      { status }
    );
  }
}
