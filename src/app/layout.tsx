import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { CookieBanner } from "@/components/layout/CookieBanner";
import { NavigationProgress } from "@/components/layout/NavigationProgress";
import { NetworkIndicator } from "@/components/layout/NetworkIndicator";
import { AuthModal } from "@/components/auth/AuthModal";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: "#0F766E",
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://learnloom.app"),
  title: {
    default: "LearnLoom — Build and Share Courses from YouTube",
    template: "%s | LearnLoom",
  },
  description:
    "Weave YouTube videos into clean, distraction-free courses. Share your knowledge with the world, free forever — no login required to watch.",
  keywords: [
    "online learning",
    "YouTube courses",
    "free courses",
    "education",
    "distraction free video player",
  ],
  authors: [{ name: "LearnLoom" }],
  creator: "LearnLoom",
  icons: {
    icon: [
      { url: "/favicon.png", sizes: "64x64", type: "image/png" },
      { url: "/icon.png", sizes: "512x512", type: "image/png" },
      { url: "/favicon.ico" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: "/favicon.png",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://learnloom.app",
    siteName: "LearnLoom",
    title: "LearnLoom — Weave Videos into Courses",
    description: "Create free courses from YouTube videos and share your knowledge with the world.",
    images: [{ url: "/logo.png", width: 920, height: 240, alt: "LearnLoom Logo" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "LearnLoom — Weave Videos into Courses",
    description: "Create free courses from YouTube videos.",
    images: ["/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="overflow-x-hidden w-full" suppressHydrationWarning>
      <head>
        <link rel="icon" type="image/png" sizes="64x64" href="/favicon.png" />
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      </head>
      <body className="overflow-x-hidden w-full max-w-full bg-background text-foreground antialiased selection:bg-primary-500 selection:text-white">
        <AuthProvider>
          <AuthModal />
          <Suspense fallback={null}>
            <NavigationProgress />
          </Suspense>
          <div className="flex flex-col min-h-dvh overflow-x-hidden w-full">
            <Header />
            <main id="main-content" className="flex-1 overflow-x-hidden w-full pb-20 md:pb-0">
              {children}
            </main>
            <Footer />
            <MobileBottomNav />
            <CookieBanner />
            <NetworkIndicator />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
