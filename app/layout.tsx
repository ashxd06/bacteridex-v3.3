import type { Metadata, Viewport } from "next";
import { Space_Grotesk, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/components/AuthProvider";
import AuthModal from "@/components/AuthModal";
import Navbar from "@/components/Navbar";
import MobileNav from "@/components/MobileNav";
import Footer from "@/components/Footer";

const display = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display"
});
const body = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body"
});
const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono"
});

export const metadata: Metadata = {
  title: "BacteriDex — Enciclopedia interactiva de Laboratorio Clínico",
  description:
    "Estudia, compara e identifica bacterias, virus, hongos y parásitos con fichas clínicas, quizzes, flashcards y casos reales.",
  manifest: "/manifest.json"
};

export const viewport: Viewport = {
  themeColor: "#0B1220"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body>
        <ThemeProvider>
          <AuthProvider>
            <Navbar />
            <main className="mx-auto max-w-6xl px-4 pb-24 pt-6 md:pb-12">{children}</main>
            <Footer />
            <MobileNav />
            <AuthModal />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
