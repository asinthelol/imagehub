"use client";
import { Inter } from "next/font/google";
import { notFound } from "next/navigation";
import Navbar from "./components/navbar/Navbar";
import Footer from "./components/footer/Footer";
import "./styles/globals.scss";
import "./layout.module.scss";

const inter = Inter({
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  if (!children) {return notFound();}

  return (
    <html lang="en-US">
      <head>
        <link rel="icon" sizes="64x64" href="./favicon.ico" />
        <link rel="preload" as="image" href="/public/hero-mobile.webp" />
      </head>
      <body className={`${inter.className}`}>
        <Navbar />

        {children}

        <Footer />
      </body>
    </html>
  );
}
