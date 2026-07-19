import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SyncStudy | Your Study Partner",
  description: "Your ultimate collaborative study platform. Match with peers based on your goals and crush your next exam together!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
