"use client";
import { useEffect } from "react";

export default function PlayerLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", "dark");
  }, []);
  return <>{children}</>;
}
