import type { Metadata } from "next";
import { Oxanium, Space_Grotesk } from "next/font/google";
import type { ReactNode } from "react";

import "./globals.css";

const displayFont = Oxanium({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const bodyFont = Space_Grotesk({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "ZAYN // JARVIS UI",
  description:
    "A cinematic holographic control interface powered by hand gestures, face-guided focus, and immersive 3D visuals.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${displayFont.variable} ${bodyFont.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
