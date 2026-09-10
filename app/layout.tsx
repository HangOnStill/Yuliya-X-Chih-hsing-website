import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {width:"device-width",initialScale:1,viewportFit:"cover",themeColor:"#fff8fb"};

export const metadata: Metadata = {
  title: "Y ♥ C",
  description: "A birthday love letter, a memory archive, and a shared wishlist for Yuliya and Chih-hsing.",
  icons: {
    icon: "/favicon-yheartc.svg",
    shortcut: "/favicon-yheartc.svg",
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
