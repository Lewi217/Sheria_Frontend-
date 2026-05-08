import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SheriaSummary — AI-Powered Legal Document Assistant",
  description:
    "Upload legal documents and get instant, accurate AI-powered answers. Powered by advanced NLP to analyze contracts, agreements, and legal texts.",
  keywords: "legal AI, document analysis, contract review, AI lawyer, legal assistant",
  openGraph: {
    title: "SheriaSummary — AI Legal Assistant",
    description: "AI-powered legal document analysis and Q&A",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-animated">
        {children}
      </body>
    </html>
  );
}
