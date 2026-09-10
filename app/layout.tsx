import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Y❤C — Birthday Love Letter · V5",
  description: "A birthday love letter, a memory archive, and a shared wishlist for Yuliya and Chih-hsing.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
