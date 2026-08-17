import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Noto_Sans_Devanagari } from "next/font/google";
import "./globals.css";
import { RootLayoutProvider } from "./root-provider";
import { GlobalNavbar } from "@/components/GlobalNavbar";
import { GlobalFooter } from "@/components/GlobalFooter";
import SchemaMarkup from "./schema";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "latin-ext"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const notoSansDevanagari = Noto_Sans_Devanagari({
  variable: "--font-noto-devanagari",
  subsets: ["devanagari"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.mineraltrack.shop"),
  title: {
    default: "MineralTrack | Mineral Transport Authorization",
    template: "%s | MineralTrack",
  },
  description:
    "MineralTrack is a secure digital mineral transport authorization platform for eForm-C issuance, QR verification, and compliance tracking in India.",
  applicationName: "MineralTrack",
  keywords: [
    "mineral transport",
    "eForm-C",
    "mineral pass",
    "transport authorization",
    "UP minerals compliance",
    "digital permit tracking",
  ],
  openGraph: {
    title: "MineralTrack | Digital Mineral Transport Authorization",
    description:
      "Secure digital mineral transport authorization, QR verification, and compliance tracking platform for mineral movement operations.",
    url: "https://www.mineraltrack.shop",
    siteName: "MineralTrack",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MineralTrack",
    description:
      "Modern mineral transport authorization and verification for compliant operations.",
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", rel: "shortcut icon" },
    ],
    apple: [{ url: "/icon.svg" }],
  },
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${notoSansDevanagari.variable} antialiased bg-background text-foreground transition-colors duration-300`}
      >
        <SchemaMarkup />
        <RootLayoutProvider>
          <GlobalNavbar />
          {children}
          <GlobalFooter />
        </RootLayoutProvider>
      </body>
    </html>
  );
}
