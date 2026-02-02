import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Giffy - Video to GIF Converter",
  description: "Convert videos to GIFs instantly. No upload, no tracking, fully browser-based.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Giffy",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
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
