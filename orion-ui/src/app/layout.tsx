import type { Metadata } from "next";
import { Share_Tech_Mono, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const shareTechMono = Share_Tech_Mono({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-orion",
  display: "swap",
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "O.R.I.O.N. — Omnipresent Responsive Intelligent Operative Network",
  description: "Your personal AI assistant",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${shareTechMono.variable} ${jetBrainsMono.variable}`}>
      <body className="bg-orion-void text-orion-ice antialiased">{children}</body>
    </html>
  );
}
