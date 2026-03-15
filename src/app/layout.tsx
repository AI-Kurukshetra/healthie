import type { Metadata } from "next";
import { Manrope, Space_Grotesk } from "next/font/google";

import "@/app/globals.css";
import { ToastProvider } from "@/components/ui/toast";

const sans = Manrope({
  subsets: ["latin"],
  variable: "--font-sans"
});

const display = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display"
});

export const metadata: Metadata = {
  title: "Health Platform",
  description: "Virtual care operations, patient engagement, and provider workflows in one modern health platform."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${sans.variable} ${display.variable} bg-canvas text-ink antialiased`}>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
