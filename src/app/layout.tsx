import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Checkout Service",
  description: "A simple e-commerce checkout application",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
