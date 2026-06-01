import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "모자이크",
  description: "협업자들이 모든 유형의 콘텐츠를 함께 올리고 정리하는 가상 게시판",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" data-theme="light">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;700&family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-25..200&display=block"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
