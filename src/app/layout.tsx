import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "웹기반 온(ON)동네 복지안전망 Signal Light",
  description: "광명시립 하안종합사회복지관 웹기반 온(ON)동네 복지안전망 Signal Light",
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
