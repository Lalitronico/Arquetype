import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Syntheia - Real insights. Synthetic speed.",
  description:
    "Generate synthetic survey respondents using AI. Get market research insights in minutes, not weeks.",
  keywords: [
    "synthetic respondents",
    "market research",
    "AI survey",
    "consumer insights",
    "synthetic panelists",
  ],
  authors: [{ name: "Syntheia" }],
  openGraph: {
    title: "Syntheia - Real insights. Synthetic speed.",
    description:
      "Generate synthetic survey respondents using AI. Get market research insights in minutes, not weeks.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Syntheia - Real insights. Synthetic speed.",
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
