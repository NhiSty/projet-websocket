import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "#/utils/css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Wasoot", // Kahoot with websockets
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={cn(inter.className)}>{children}</body>
    </html>
  );
}
