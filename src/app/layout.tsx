import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "My Any Cart",
  description:
    "A cart that can be used to calculate the total price of your items",
};

const themeInitScript = `
(function() {
  try {
    var cookieMatch = document.cookie.match(/(?:^|;\\s*)theme=(dark|light)/);
    var cookieTheme = cookieMatch ? cookieMatch[1] : null;
    var stored = localStorage.getItem('theme'); // 'light' | 'dark' | null
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var theme = cookieTheme || stored || (prefersDark ? 'dark' : 'light');
    var root = document.documentElement;
    if (theme !== 'dark' && theme !== 'light') theme = 'light';
    root.classList.remove('light','dark');
    root.classList.add(theme);
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt" className={inter.variable} suppressHydrationWarning>
      <head>
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: themeInitScript }}
        />
      </head>
      <body className="antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
