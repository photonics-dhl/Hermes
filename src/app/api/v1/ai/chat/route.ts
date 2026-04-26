import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth';
import { chatWithAI, chatWithContext, analyzePaper, suggestResearchDirections } from '@/lib/ai/claude-service';
import { getContextForQuery } from '@/lib/ai/rag-service';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();

    const { messages, action, context, useRag } = body as {
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
      useRag?: boolean;
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

    // Enhance with RAG context if enabled
    let enhancedMessages = messages;
    let ragContext = null;

    if (useRag && messages.length > 0) {
      const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');
      if (lastUserMessage) {
        const { context: ragContextText, sources } = await getContextForQuery(lastUserMessage.content);
        if (ragContextText) {
          ragContext = sources;
          const ragEnhancedMessages = messages.map(m => {
            if (m.role === 'user') {
              return {
                ...m,
                content: `${m.content}\n\n【相关知识背景】\n${ragContextText}`,
              };
            }
            return m;
          });
          enhancedMessages = ragEnhancedMessages;
        }
      }
    }

    const result = context
      ? await chatWithContext(enhancedMessages, context)
      : await chatWithAI(enhancedMessages);

    if (result.error) {
      return NextResponse.json({
        success: false,
        data: null,
        error: { code: 'AI_ERROR', message: result.error },
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: { content: result.content, ragContext },
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
