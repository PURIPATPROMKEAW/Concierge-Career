import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "Concierge-Career | Find where you fit",
  description:
    "Understand your skills. Discover your strongest career matches. Know what to improve next.",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
