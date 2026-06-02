import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NewsScope",
  description: "Transparent, rule-based news analysis without LLM APIs."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
