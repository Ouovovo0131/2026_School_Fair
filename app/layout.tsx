import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import { getSiteOrigin } from "@/lib/site";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteOrigin()),
  alternates: {
    canonical: "/",
  },
  title: "花蓮高中90周年校慶拾光地圖",
  description: "花蓮高中90周年校慶互動地圖平台，探索校園、完成任務、蒐集回憶",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW">
      <body
        className={`${outfit.variable} antialiased`}
        suppressHydrationWarning={true}
      >
        {children}
      </body>
    </html>
  );
}
