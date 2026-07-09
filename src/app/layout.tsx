import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import { AppProviders } from "@/components/providers/app-providers";
import "./globals.css";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "DuoLearn｜把你的講義變成遊戲化學習地圖",
  description:
    "上傳你的教材，AI 自動幫你生成一套多鄰國式的遊戲化學習地圖，邊玩邊學。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-Hant" className={`${nunito.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-ink-100 text-ink-900">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
