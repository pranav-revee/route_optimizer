import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TravelMate - AI Travel Optimizer",
  description: "Multi-modal route optimization powered by deep reinforcement learning. Get intelligent recommendations across flights, trains, bikes, and rideshare. Privacy-first, runs entirely on-device.",
  keywords: [
    "travel optimization",
    "AI route planner",
    "machine learning",
    "DQN reinforcement learning",
    "multi-modal travel",
    "on-device AI",
    "privacy-first",
    "Apple Silicon",
    "edge computing"
  ],
  authors: [{ name: "Pranav" }],
  openGraph: {
    title: "TravelMate - AI Travel Optimizer",
    description: "AI that plans your journey, not just shows routes. Powered by deep reinforcement learning.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TravelMate - AI Travel Optimizer",
    description: "AI that plans your journey, not just shows routes.",
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
          rel="icon"
          href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>✈️</text></svg>"
        />
        <meta name="theme-color" content="#1a0b2e" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
