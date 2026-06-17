import type { Metadata, Viewport } from "next";
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
  applicationName: "a11am",
  title: {
    default: "a11am | After 11 AM Art Talent Incubator",
    template: "%s | a11am",
  },
  description:
    "After 11 AM is an art talent incubator for image-makers, motion artists, and new visual signatures.",
  keywords: [
    "a11am",
    "after 11 am",
    "art talent incubator",
    "visual art",
    "motion art",
    "NaSofia",
    "Toanlelet",
  ],
  authors: [{ name: "a11am" }],
  creator: "a11am",
  publisher: "a11am",
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml", sizes: "any" }],
    apple: [{ url: "/apple-icon" }],
  },
  openGraph: {
    title: "a11am | After 11 AM Art Talent Incubator",
    description:
      "An art talent incubator for image-makers, motion artists, and new visual signatures.",
    siteName: "a11am",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "a11am | After 11 AM Art Talent Incubator",
    description:
      "An art talent incubator for image-makers, motion artists, and new visual signatures.",
  },
};

export const viewport: Viewport = {
  themeColor: "#ff5f1f",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
