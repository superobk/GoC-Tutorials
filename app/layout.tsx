import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "魔法画笔 GoC 陪读探险站",
  description: "让7-12岁孩子和家长一起，用GoC把想法画成故事。",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN"><body>{children}</body></html>;
}
