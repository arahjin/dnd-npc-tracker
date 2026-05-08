import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Wildgipfel NPCs",
  description: "NPC Tracker für die Wildgipfel Kampagne",
};

export default function RootLayout({
  children,
  modal,
}: Readonly<{
  children: React.ReactNode;
  modal?: React.ReactNode;
}>) {
  return (
    <html lang="de" className="h-full">
      <body className="min-h-full flex flex-col antialiased">
        {children}
        {modal}
      </body>
    </html>
  );
}
