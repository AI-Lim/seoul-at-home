import type { Metadata } from "next";
import "./globals.css";



export const metadata: Metadata = {
  title: "Seoul At Home 2026",
  description: "Réservez votre Soul Pass pour Seoul At Home 2026",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" translate='no'>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
