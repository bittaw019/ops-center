import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ops Center",
  description: "Pannello operativo multi-sito"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" className="dark">
      <body>{children}</body>
    </html>
  );
}
