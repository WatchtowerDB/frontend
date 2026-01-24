import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const vipnagorgialla = localFont({
  src: [
    {
      path: "../../public/fonts/Vipnagorgialla Rg.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/Vipnagorgialla Bd.otf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-vipnagorgialla",
  display: "swap",
});

export const metadata: Metadata = {
  title: "WatchtowerDB",
  description: "WatchtowerDB: AI-enhanced database protection",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const themeScript = `(function() {
    const saved = localStorage.getItem('theme');
    if (saved) document.documentElement.setAttribute('data-theme', saved);
  })()`;

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${vipnagorgialla.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
