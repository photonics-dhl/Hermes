import { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: "Scholar's Tea - 学者茶话会",
    template: "%s | Scholar's Tea",
  },
  description: '高校学术交流社区平台，支持课题组管理、学科社区、实时茶话会（Tea Party）和 AI 思想工坊。',
};

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
