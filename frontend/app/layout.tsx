import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "Concierge Career",
  description: "Know me. Guide me. Grow with me.",
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
