import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// Preload dengan subset minimal dan weight yang dipakai
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  // Hanya weight yang benar-benar dipakai — kurangi ukuran font download
  weight: ["400", "500", "600", "700", "800"],
  preload: true,
  fallback: ["system-ui", "-apple-system", "sans-serif"],
});

export const metadata: Metadata = {
  title: {
    default: "LevelUp Planner",
    template: "%s — LevelUp Planner",
  },
  description:
    "Aplikasi produktivitas kalender dengan sistem gamifikasi. Selesaikan tugas, dapatkan EXP, naik level.",
  keywords: ["produktivitas", "gamifikasi", "todo", "kalender", "leveling"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full bg-[#0a0a0f] font-[family-name:var(--font-inter)]">
        {children}
      </body>
    </html>
  );
}
