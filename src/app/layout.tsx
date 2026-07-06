import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "ConvertFlow — Convert Anything, Instantly",
  description:
    "20+ free file, data, and image converters. Files never leave your device. JSON formatter, color converter, case converter, hash generator, image converter, and more.",
  keywords: [
    "file converter",
    "online converter",
    "JSON formatter",
    "color converter",
    "case converter",
    "hash generator",
    "image converter",
    "base64",
    "epoch converter",
    "free converter",
  ],
  authors: [{ name: "ConvertFlow" }],
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>⚡</text></svg>",
  },
  openGraph: {
    title: "ConvertFlow — Convert Anything, Instantly",
    description:
      "20+ free file, data, and image converters. Files never leave your device.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7878398091851771"
          crossOrigin="anonymous"
        ></script>
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-CMV34ZVLE7"
        ></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-CMV34ZVLE7');
            `,
          }}
        ></script>
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}