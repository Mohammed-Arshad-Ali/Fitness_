import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VITA:ON | AI Biological Operating System",
  description: "Your autonomous life optimization platform. Unify fitness, nutrition, sleep, and productivity under one intelligent biological umbrella powered by your Digital Twin.",
  keywords: ["health", "fitness", "biometrics", "AI", "digital twin", "sleep", "nutrition", "wellness", "optimization"],
  authors: [{ name: "VITA:ON" }],
  openGraph: {
    title: "VITA:ON | AI Biological Operating System",
    description: "Your autonomous life optimization platform.",
    type: "website",
    locale: "en_US",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
