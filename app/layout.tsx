import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Giffy - Instant Video to GIF Converter",
  description: "Convert videos up to 60 seconds into GIFs instantly. No upload, no tracking, fully browser-based.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <div className="min-h-screen flex flex-col">
          <header className="border-b border-[var(--border)] py-4 px-6">
            <div className="max-w-5xl mx-auto">
              <h1 className="text-2xl font-bold">Giffy</h1>
              <p className="text-sm text-[var(--muted)] mt-1">
                Instant Video → GIF Converter
              </p>
            </div>
          </header>
          
          <main className="flex-1 py-8 px-6">
            <div className="max-w-5xl mx-auto">
              {children}
            </div>
          </main>
          
          <footer className="border-t border-[var(--border)] py-6 px-6 text-center text-sm text-[var(--muted)]">
            <p>
              No uploads. No tracking. No accounts.{" "}
              <br className="sm:hidden" />
              Everything runs in your browser.
            </p>
          </footer>
        </div>
      </body>
    </html>
  );
}
