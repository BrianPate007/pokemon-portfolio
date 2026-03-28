import type { Metadata } from "next";
import "./globals.css";
import AuthGate from "@/components/AuthGate";

export const metadata: Metadata = {
  title: "Pokemon Portfolio",
  description: "Pokemon card collection tracker & P&L analyzer",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full bg-gray-950 antialiased">
        <AuthGate>{children}</AuthGate>
      </body>
    </html>
  );
}
