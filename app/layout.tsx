import type { Metadata } from "next";
import { Roboto, Oswald, Nunito } from "next/font/google";
import "./globals.css";
import SiteFooter from "@/components/SiteFooter";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-roboto",
  display: "swap",
});

const oswald = Oswald({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-oswald",
  display: "swap",
});

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-nunito",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Lorehub",
  description: "NPC Tracker für Lorehub",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" className={`h-full ${roboto.variable} ${oswald.variable} ${nunito.variable}`}>
      <body className="min-h-full flex flex-col antialiased">
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
