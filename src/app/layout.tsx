import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "하안종합사회복지관 개관 35주년",
  description: "하안종합사회복지관 개관 35주년 기념행사 참여 안내",
};

export const viewport: Viewport = {
  themeColor: "#f7f5f1",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full bg-paper text-ink">{children}</body>
    </html>
  );
}
