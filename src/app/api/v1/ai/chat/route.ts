import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth';
import { chatWithAI, chatWithContext, analyzePaper, suggestResearchDirections } from '@/lib/ai/claude-service';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();

    const { messages, action, context } = body as {
      messages?: ChatMessage[];
      action?: 'analyze' | 'suggest';
      context?: {
        discipline?: string;
        papers?: Array<{
          title: string;
          abstract?: string;
          authors?: string[];
          year?: number;
        }>;
      };
    };

    // Handle different AI actions
    if (action === 'analyze' && body.content) {
      const result = await analyzePaper(body.content);
      return NextResponse.json({
        success: true,
        data: result,
        meta: null,
      });
    }

    if (action === 'suggest' && body.topic) {
      const result = await suggestResearchDirections(
        body.topic,
        context?.discipline
      );
      return NextResponse.json({
        success: true,
        data: result,
        meta: null,
      });
    }

    // Default: chat
    if (!messages || messages.length === 0) {
      return NextResponse.json({
        success: false,
        data: null,
        error: { code: 'INVALID_REQUEST', message: '消息不能为空' },
      }, { status: 400 });
    }

    const result = context
      ? await chatWithContext(messages, context)
      : await chatWithAI(messages);

    if (result.error) {
      return NextResponse.json({
        success: false,
        data: null,
        error: { code: 'AI_ERROR', message: result.error },
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: { content: result.content },
      meta: null,
    });
  } catch (error) {
    console.error('POST /api/v1/ai/chat error:', error);
    return NextResponse.json({
      success: false,
      data: null,
      error: {
        code: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : '服务器内部错误',
      },
    }, { status: 500 });
  }
}
