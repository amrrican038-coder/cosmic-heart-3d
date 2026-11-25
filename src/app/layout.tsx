import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Animasyon",
  description: "Mobil uyumlu TypeScript ve React animasyonu",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className="w-screen h-[100dvh] overflow-hidden bg-[#06060b] select-none">
        {children}
      </body>
    </html>
  );
}
