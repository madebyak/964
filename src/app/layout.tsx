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
  title: "+964 Media - Motion Design System",
  description: "Discover the cutting-edge motion design system powering +964 Media's next-generation news experiences. From seamless transitions to captivating animations.",
  keywords: ["motion design", "news media", "964 media", "design system", "animations"],
  authors: [{ name: "+964 Media Team" }],
  openGraph: {
    title: "+964 Media - Motion Design System",
    description: "Discover the cutting-edge motion design system powering +964 Media's next-generation news experiences.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
