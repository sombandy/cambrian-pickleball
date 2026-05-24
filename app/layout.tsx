import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Bricolage_Grotesque, Source_Sans_3 } from "next/font/google";

import { SiteHeader } from "@/components/site-header";

import "./globals.css";

const displayFont = Bricolage_Grotesque({
  variable: "--font-display-source",
  subsets: ["latin"],
});

const bodyFont = Source_Sans_3({
  variable: "--font-body-source",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: {
    default: "Cambrian Community Pickleball",
    template: "%s | Cambrian Community Pickleball",
  },
  description:
    "A simple home for Cambrian Community Pickleball, with local play, tournament feedback, and community news.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${displayFont.variable} ${bodyFont.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <ClerkProvider>
          <div className="flex min-h-screen flex-col">
            <SiteHeader />
            <div className="mx-auto w-full max-w-4xl flex-1 px-4 pb-12 pt-5 sm:px-6">
              {children}
            </div>
          </div>
        </ClerkProvider>
      </body>
    </html>
  );
}
