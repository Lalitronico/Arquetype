import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Arquetype - Real insights. Synthetic speed.",
  description:
    "Generate synthetic survey respondents using AI. Get market research insights in minutes, not weeks. Trusted by 500+ research teams.",
  keywords: [
    "synthetic respondents",
    "market research",
    "AI survey",
    "consumer insights",
    "synthetic panelists",
    "Arquetype",
  ],
  authors: [{ name: "Arquetype" }],
  openGraph: {
    title: "Arquetype - Real insights. Synthetic speed.",
    description:
      "Generate synthetic survey respondents using AI. Get market research insights in minutes, not weeks.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Arquetype - Real insights. Synthetic speed.",
    description:
      "Generate synthetic survey respondents using AI. Get market research insights in minutes, not weeks.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
