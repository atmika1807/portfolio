import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { PROFILE } from "@/lib/data";

const inter = localFont({
  src: "../fonts/InterTight-Variable.woff2",
  variable: "--f-inter",
  display: "swap",
  weight: "100 900",
});
const serif = localFont({
  src: [{ path: "../fonts/DMSerifDisplay-Italic.woff2", weight: "400", style: "italic" }],
  variable: "--f-serif",
  display: "swap",
});
const mono = localFont({
  src: "../fonts/JetBrainsMono-Variable.woff2",
  variable: "--f-mono",
  display: "swap",
  weight: "100 800",
});

const title = `${PROFILE.name} · ${PROFILE.role}, ${PROFILE.roleAccent.replace("&", "and")}`;
const description = `${PROFILE.name} is a ${PROFILE.role.toLowerCase()} working across data and AI: production AI platforms, data pipelines, RAG systems and MLOps.`;

export const metadata: Metadata = {
  metadataBase: new URL("https://atmika-parey.vercel.app"),
  title,
  description,
  openGraph: {
    title,
    description,
    type: "website",
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: `${PROFILE.name}, animated portrait` }],
  },
  twitter: { card: "summary_large_image", title, description, images: ["/og.jpg"] },
  icons: { icon: "/favicon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#eceef0",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${serif.variable} ${mono.variable}`} suppressHydrationWarning>
      {/* Browser extensions (e.g. Grammarly) add attributes to <body> before React loads */}
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
