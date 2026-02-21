import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "PatentBuddy — Draft Your US Provisional Patent",
  description:
    "PatentBuddy helps solo inventors draft a US provisional-style patent application via a guided interview. Not legal advice.",
  keywords: ["patent", "provisional patent", "invention", "patent application", "patent draft"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.variable} font-sans antialiased bg-gray-50 min-h-full`}>
        <Providers>
          <div className="min-h-screen">{children}</div>
        </Providers>
      </body>
    </html>
  );
}
