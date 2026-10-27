import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KINGSOK ECOSYSTEM — Multi-Sector Operations & Workforce Platform",
  description:
    "Identity Before Temptation. Systems Form Competence. Truth Is Not Negotiated. Multi-sector operational ecosystem covering Accommodation, Properties, Rentals, and Food.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0A0A0A",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 antialiased min-h-screen flex flex-col">
        {children}
      </body>
    </html>
  );
}
