import type { Metadata } from "next";
import { Outfit, DM_Sans } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
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
    "SSR methodology",
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
      <body className={`${outfit.variable} ${dmSans.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
