"use client";

import "./globals.css";
import { SessionProvider } from "next-auth/react";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <SessionProvider refetchOnWindowFocus={false}>
        <body style={{ backgroundColor: "#f1f5f9" }}>{children}</body>
      </SessionProvider>
    </html>
  );
}
