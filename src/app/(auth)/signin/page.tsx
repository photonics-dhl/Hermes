'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Github } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);
  const [error, setError] = useState('');

  const handleOAuthSignIn = async (provider: string) => {
    setOauthLoading(provider);
    try {
      await signIn(provider, { callbackUrl: '/' });
    } catch (err) {
      setError('OAuth 登录失败');
      setOauthLoading(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('登录失败，请检查邮箱和密码');
      } else {
        router.push('/');
        router.refresh();
      }
    } catch (err) {
      setError('登录失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto flex min-h-[80vh] items-center justify-center py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">登录</CardTitle>
          <CardDescription>登录到 Scholar&apos;s Tea</CardDescription>
        </CardHeader>
        <CardContent>
          {/* OAuth Providers */}
          <div className="space-y-3">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => handleOAuthSignIn('github')}
              disabled={!!oauthLoading}
            >
              {oauthLoading === 'github' ? (
                '跳转中...'
              ) : (
                <>
                  <Github className="mr-2 h-4 w-4" />
                  使用 GitHub 登录
                </>
              )}
            </Button>
          </div>

          <Separator className="my-4" />

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">邮箱</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">密码</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? '登录中...' : '登录'}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm text-muted-foreground">
            还没有账号？{' '}
            <Link href="/auth/signup" className="text-primary hover:underline">
              注册
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
