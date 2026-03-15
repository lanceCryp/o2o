import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/contexts/theme-provider";
import { I18nProvider } from "@/contexts/i18n-provider";
import CookieConsent from "@/components/cookie-consent";
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
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: {
    default: "o2o - Private 1-on-1 Video Calls",
    template: "%s | o2o",
  },
  description: "The safest way to connect privately. One link, two people, zero compromises. End-to-end encrypted video calls with no download required.",
  keywords: ["video call", "1-on-1", "private", "encrypted", "browser-based", "no download"],
  authors: [{ name: "o2o" }],
  creator: "o2o",
  publisher: "o2o",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: "o2o - Private 1-on-1 Video Calls",
    description: "The safest way to connect privately. One link, two people, zero compromises.",
    siteName: "o2o",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "o2o - Private 1-on-1 Video Calls",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "o2o - Private 1-on-1 Video Calls",
    description: "The safest way to connect privately. One link, two people, zero compromises.",
    creator: "@o2o",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
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
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
    >
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <ThemeProvider>
            <I18nProvider>
              {children}
              <CookieConsent />
            </I18nProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
