"use client";
import { Inter } from "next/font/google";
import { notFound } from "next/navigation";
import Navbar from "@/shared/components/navbar/Navbar";
import Footer from "@/shared/components/footer/Footer";
import "@/shared/styles/globals.scss";
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
        <link rel="icon" sizes="64x64" href="/favicon.ico" />
      </head>
      <body className={`${inter.className}`}>
        <Navbar />

        {children}

        <Footer />
      </body>
    </html>
  );
}
