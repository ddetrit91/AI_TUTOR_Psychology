import type { Metadata } from "next";
import { Montserrat_Alternates, Commissioner } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { UserProvider } from "@/lib/user-context";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const montserratAlternates = Montserrat_Alternates({
  weight: ["500", "600", "700", "800"],
  subsets: ["latin", "cyrillic"],
  variable: "--font-heading",
  display: "swap",
});

const commissioner = Commissioner({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin", "cyrillic"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "MindBalance AI — Персональный AI-коуч по психологии",
  description:
    "SaaS сервис персонального когнитивно-поведенческого AI коуча по психологии. Практические уроки, квизы, глубокий разбор когнитивных ошибок и валидация шагов действий.",
  keywords: [
    "AI психолог",
    "коуч по психологии",
    "КПТ",
    "ACT",
    "когнитивные искажения",
    "эмоциональный интеллект",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body
        className={`${montserratAlternates.variable} ${commissioner.variable} min-h-screen flex flex-col font-body selection:bg-brand-sage selection:text-white`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
        >
          <UserProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </UserProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
