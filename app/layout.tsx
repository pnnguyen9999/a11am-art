import type { Metadata, Viewport } from "next";
import { Mozilla_Text } from "next/font/google";
import "./globals.css";

const mozillaText = Mozilla_Text({
  variable: "--font-mozilla-text",
  subsets: ["latin"],
  weight: "variable",
});

export const metadata: Metadata = {
  applicationName: "a11am",
  title: {
    default: "A11:am",
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
    <html
      lang="en"
      className={`${mozillaText.variable} scroll-smooth bg-[#050505] motion-reduce:scroll-auto`}
    >
      <body className="m-0 min-h-screen overflow-x-hidden bg-[#050505] font-sans text-[#f5f1e8] selection:bg-[#cc3300] selection:text-[#050505] motion-reduce:[&_*]:!animate-none motion-reduce:[&_*]:!transition-none">
        {children}
      </body>
    </html>
  );
}
