import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Token Optimizer",
  description: "See exactly how much your prompts cost — and how much we save.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full bg-gray-950 text-gray-100 antialiased">{children}</body>
    </html>
  );
}
