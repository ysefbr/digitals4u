import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { getSiteSettings } from "@/lib/data.server";
import { WhatsAppWidget } from "@/components/whatsapp-widget";
import "./globals.css";

const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.digitals4u.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "DigitalServices4U | Premium Digital Subscription Marketplace",
    template: "%s | DigitalServices4U",
  },
  description:
    "Get premium access to AI tools, software subscriptions, streaming accounts, and digital assets in Tunisia. Fast setup, TND pricing, and dedicated support via WhatsApp.",
  keywords: [
    "digital subscriptions Tunisia",
    "buy ChatGPT Plus Tunisia",
    "Netflix premium TND",
    "Spotify premium Tunisia",
    "AI tools subscription",
    "digital accounts marketplace",
    "DigitalServices4U",
    "digitals4u",
    "streaming accounts TND",
    "Canva Pro Tunisia",
    "Midjourney subscription",
  ],
  authors: [{ name: "DigitalServices4U" }],
  creator: "DigitalServices4U",
  publisher: "DigitalServices4U",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "DigitalServices4U",
    title: "DigitalServices4U | Premium Digital Subscription Marketplace",
    description:
      "Get premium access to AI tools, software subscriptions, streaming accounts, and digital assets in Tunisia. Fast setup and dedicated WhatsApp support.",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "DigitalServices4U — Premium Digital Subscription Marketplace",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "DigitalServices4U | Premium Digital Subscriptions",
    description:
      "Buy premium AI, streaming, and software subscriptions in Tunisia. TND pricing with instant WhatsApp delivery.",
    images: ["/logo.png"],
  },
  alternates: {
    canonical: siteUrl,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getSiteSettings();

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${poppins.variable} font-sans antialiased min-h-screen bg-background text-foreground`}
        style={{ "--font-heading": "var(--font-sans)" } as React.CSSProperties}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <WhatsAppWidget phone={settings.whatsapp_number} siteName={settings.site_name} />
        </ThemeProvider>
      </body>
    </html>
  );
}
