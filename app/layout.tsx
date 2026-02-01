import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Giffy - Video to GIF Converter",
  description: "Convert videos to GIFs instantly. No upload, no tracking, fully browser-based.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
