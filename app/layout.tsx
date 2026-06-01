import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "모자이크",
  description: "협업자들이 모든 유형의 콘텐츠를 함께 올리고 정리하는 가상 게시판",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" data-theme="light">
      <body>{children}</body>
    </html>
  );
}
