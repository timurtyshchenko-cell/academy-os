import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AcademyOS — Complete Management System for Tennis Academies",
  description: "Manage players, schedules, billing, and parent communication. Built for tennis academies.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
