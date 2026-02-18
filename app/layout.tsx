import type { Metadata } from "next";
import { Merriweather, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Container } from "@/components/layout/container";

const titleFont = Merriweather({
  variable: "--font-title",
  subsets: ["latin"],
  weight: ["700"],
});

const bodyFont = Space_Grotesk({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
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
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${titleFont.variable} ${bodyFont.variable} antialiased`}>
        <AuthProvider>
          <div className="app-shell">
            <Header />
            <main className="site-main">
              <Container>{children}</Container>
            </main>
            <Footer />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
