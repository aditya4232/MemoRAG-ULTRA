import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { DevelopmentPopup } from "@/components/DevelopmentPopup";
import { ClerkProvider } from '@clerk/nextjs';
import { ToastProvider } from "@/components/providers/toast-provider";
import { CookiesConsent } from "@/components/CookiesConsent";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CodeGenesis | AI Software Architect - Beta v0.45",
  description: "Autonomous AI Software Architect. Build production-ready applications with AI. Open source, MIT licensed. Join our beta and shape the future of AI-powered development.",
  keywords: ["AI coding", "software architect", "code generation", "AI development", "autonomous coding", "open source AI"],
  authors: [{ name: "Aditya Shenvi & Sneha Sah" }],
  icons: {
    icon: '/favicon.png',
    apple: '/favicon.png',
  },
  openGraph: {
    title: "CodeGenesis | AI Software Architect",
    description: "Build production-ready applications with AI. Open source, MIT licensed.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: '#6366f1',
          colorBackground: '#09090b',
          colorText: '#fafafa',
        },
        elements: {
          formButtonPrimary: 'bg-primary hover:bg-primary/90',
          card: 'bg-black border border-white/10',
        },
      }}
    >
      <html lang="en" className="dark" suppressHydrationWarning data-scroll-behavior="smooth">
        <body className={`${inter.className} min-h-screen bg-background text-foreground antialiased`} suppressHydrationWarning>
          {children}
          <DevelopmentPopup />
          <ToastProvider />
          <CookiesConsent />
        </body>
      </html>
    </ClerkProvider>
  );
}
