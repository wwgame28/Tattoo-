import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";

export const metadata: Metadata = {
  title: "FrameGuide",
  description: "Умная камера с подсказками по композиции и AI-оценкой кадра",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "FrameGuide" },
  icons: { icon: "/icon-192.png", apple: "/apple-touch-icon.png" },
};

export const viewport: Viewport = {
  themeColor: "#080a0d",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  userScalable: false,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru">
      <body>
        <ServiceWorkerRegister />
        {children}
      </body>
    </html>
  );
}
