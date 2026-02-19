import type { Metadata } from "next";
import { Merriweather, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Container } from "@/components/layout/container";
import { AppToaster } from "@/components/ui";

const titleFont = Merriweather({
  variable: "--font-title",
  subsets: ["latin"],
  weight: ["700"],
  preload: false,
});

const bodyFont = Space_Grotesk({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://foodhub.app"),
  title: {
    default: "FoodHub | Discover & Order Delicious Meals",
    template: "%s | FoodHub",
  },
  description:
    "FoodHub is a full-stack meal ordering platform where customers discover meals, providers manage menus, and admins oversee operations.",
  keywords: [
    "FoodHub",
    "meal ordering",
    "food delivery",
    "next.js app router",
    "restaurant provider",
    "online food order",
  ],
  openGraph: {
    title: "FoodHub | Discover & Order Delicious Meals",
    description:
      "Browse curated meals from trusted providers, place COD orders, and track every status.",
    type: "website",
    siteName: "FoodHub",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "FoodHub",
    description: "Premium meal ordering experience for customers, providers, and admins.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning className={`${titleFont.variable} ${bodyFont.variable} antialiased`}>
        <AuthProvider>
          <div className="app-shell">
            <Header />
            <main className="site-main">
              <Container>{children}</Container>
            </main>
            <Footer />
            <AppToaster />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
