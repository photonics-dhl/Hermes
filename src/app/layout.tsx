import type { Metadata } from 'next';
import { Providers } from '@/components/providers/Providers';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: "Scholar's Tea",
  description: '高校学术交流社区，在这里，不同高校、不同领域的不同课题组均可入住，交流分享自己的工作、探讨产生新的思想火花。',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
