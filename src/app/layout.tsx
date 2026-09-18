import type { Metadata } from "next";
import type { ReactNode } from "react";

import "./globals.css";

export const metadata: Metadata = {
  title: "BilsenBol | Ваш путь к поступлению",
  description:
    "Постройте понятный персональный путь от вашего профиля до поступления в университет.",
};

type RootLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    // globals.css sets smooth scrolling for in-page anchors; this attribute tells
    // Next 16 to switch it off during route transitions so they jump instantly.
    <html data-scroll-behavior="smooth" lang="ru">
      <body>{children}</body>
    </html>
  );
}
