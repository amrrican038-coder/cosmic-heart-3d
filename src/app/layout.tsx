import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Senin İçin",
  description: "Mobil uyumlu TypeScript & React kalp animasyonu",
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
      <body className="w-screen h-screen overflow-hidden bg-[#07070c] select-none">
        {children}
      </body>
    </html>
  );
}
