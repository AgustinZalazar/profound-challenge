import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Profound — AI Summarizer",
  description: "Summarize and understand any content instantly with our AI-powered summarizer. Paste a URL and get concise summaries in seconds.",
  icons: {
    icon: [
      { url: "/favicon/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/favicon/apple-touch-icon.png",
    shortcut: "/favicon/favicon.ico",
  },
  openGraph: {
    title: "Profound — AI Summarizer",
    description: "Summarize and understand any content instantly with our AI-powered summarizer. Paste a URL and get concise summaries in seconds.",
    images: [{ url: "/image-metatag.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Profound — AI Summarizer",
    description: "Summarize and understand any content instantly with our AI-powered summarizer. Paste a URL and get concise summaries in seconds.",
    images: ["/image-metatag.png"],
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
        className={`${inter.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
