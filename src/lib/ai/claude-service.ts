import { prisma } from '@/lib/db/prisma';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ClaudeResponse {
  content: string;
  error?: string;
}

const SYSTEM_PROMPT = `你是一位博学的研究助手，专注于学术讨论和研究支持。

你的能力包括：
- 解释复杂的学术概念和研究方法
- 分析和讨论学术论文
- 提供研究思路和方法论建议
- 帮助理解和应用研究理论

请用中文回答，保持专业且友好的语气。如果不确定某些事情，请如实说明。`;

export async function chatWithAI(messages: ChatMessage[]): Promise<ClaudeResponse> {
  const apiKey = process.env.ANTHROPIC_API_KEY || process.env.ZCHAT_API_KEY;
  const baseUrl = process.env.ANTHROPIC_BASE_URL || process.env.ZCHAT_BASE_URL;

  if (!apiKey) {
    return { content: '', error: 'AI 服务未配置' };
  }

  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...messages.map(m => ({ role: m.role, content: m.content }))
        ],
        max_tokens: 2048,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      return { content: '', error: `AI 服务错误: ${response.status}` };
    }

    const data = await response.json();
    return { content: data.choices?.[0]?.message?.content || '' };
  } catch (error) {
    console.error('AI chat error:', error);
    return { content: '', error: error instanceof Error ? error.message : '未知错误' };
  }
}

interface ResearchContext {
  papers?: Array<{
    title: string;
    abstract?: string;
    authors?: string[];
    year?: number;
  }>;
  discipline?: string;
}

export async function chatWithContext(
  messages: ChatMessage[],
  context: ResearchContext
): Promise<ClaudeResponse> {
  const contextPrompt = context.discipline
    ? `\n用户所在学科领域: ${context.discipline}`
    : '';

  const papersPrompt = context.papers && context.papers.length > 0
    ? `\n相关论文参考:\n${context.papers.map(p =>
        `- ${p.title}${p.authors ? ` (${p.authors.join(', ')}${p.year ? `, ${p.year}` : ''})` : ''}${p.abstract ? `\n  摘要: ${p.abstract.slice(0, 200)}...` : ''}`
      ).join('\n')}`
    : '';

  const enhancedMessages = messages.map(m => ({
    ...m,
    content: m.content + (m.role === 'user' ? `${contextPrompt}${papersPrompt}` : '')
  }));

  return chatWithAI(enhancedMessages);
}

export async function analyzePaper(content: string): Promise<{
  summary?: string;
  keywords?: string[];
  error?: string;
}> {
  const result = await chatWithAI([
    { role: 'user', content: `请分析以下学术论文，返回JSON格式的摘要和关键词：\n\n${content.slice(0, 5000)}` }
  ]);

  if (result.error) {
    return { error: result.error };
  }

  try {
    const jsonMatch = result.content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return { summary: result.content.slice(0, 500) };
  } catch {
    return { summary: result.content.slice(0, 500) };
  }
}

export async function suggestResearchDirections(
  topic: string,
  discipline?: string
): Promise<{ suggestions?: string[]; error?: string }> {
  const disciplineContext = discipline ? `在 ${discipline} 领域，` : '';
  const result = await chatWithAI([
    { role: 'user', content: `${disciplineContext}关于"${topic}"的研究，有哪些值得关注的研究方向？请列出3-5个潜在的研究方向简述。` }
  ]);

  if (result.error) {
    return { error: result.error };
  }

  const suggestions = result.content
    .split(/\n|；|;/)
    .filter(s => s.trim().length > 10)
    .map(s => s.replace(/^\d+[\.)、]\s*/, '').trim())
    .slice(0, 5);

  return { suggestions };
}
