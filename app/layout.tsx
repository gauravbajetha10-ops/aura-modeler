import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Aura Modeler | Interactive 3D Car Visualizer",
  description: "Experience the next generation of 3D modeling with Aura Modeler. Interact with high-quality 3D car models in a stunning, glassmorphic web dashboard.",
  keywords: ["3D models", "car visualizer", "Aura Modeler", "interactive 3D", "React Three Fiber", "3D cars"],
  openGraph: {
    title: "Aura Modeler | Interactive 3D Visualizer",
    description: "Experience the next generation of 3D modeling with Aura Modeler. Interact with high-quality 3D car models in a stunning web dashboard.",
    type: "website",
    url: "https://aura-modeler.vercel.app",
    siteName: "Aura Modeler"
  },
  twitter: {
    card: "summary_large_image",
    title: "Aura Modeler | 3D Car Visualizer",
    description: "Interact with high-quality 3D car models in a stunning web dashboard."
  }
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
