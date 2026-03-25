import type { Metadata } from "next";
import { Inter, Noto_Sans_TC } from "next/font/google";
import "./globals.css";
import ConfettiEffect from "./components/ConfettiEffect";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const notoSansTC = Noto_Sans_TC({
  variable: "--font-noto-sans-tc",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "🎪 校慶拾光地圖",
  description: "2026校園校慶互動遊戲平台 | 完成任務蒐集徽章領取獎品",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW">
      <body
        className={`${inter.variable} ${notoSansTC.variable} antialiased`}
        suppressHydrationWarning={true}
      >
        <ConfettiEffect />
        {children}
      </body>
    </html>
  );
}
