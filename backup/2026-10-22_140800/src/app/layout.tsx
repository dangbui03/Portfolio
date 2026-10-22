import type { Metadata } from "next";
import { Outfit, Geist_Mono, Geist } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Antigravity | Self-Persona Digital Space",
  description: "An interactive, gravity-defying digital portfolio built on clean physics, modern motion principles, and sophisticated dark UI structures.",
  keywords: ["Antigravity", "Creative Developer", "Frontend Engineer", "Next.js", "Framer Motion", "Interactive Portfolio"],
  authors: [{ name: "Antigravity Dev" }],
  openGraph: {
    title: "Antigravity | Self-Persona Space",
    description: "An interactive, gravity-defying digital portfolio built on clean physics and elegant motion.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("dark scroll-smooth", "font-sans", geist.variable)}>
      <body
        className={`${outfit.variable} ${geistMono.variable} min-h-screen bg-space-950 text-slate-100 antialiased selection:bg-indigo-500/30 selection:text-indigo-200`}
      >
        {children}
      </body>
    </html>
  );
}
