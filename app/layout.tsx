import type { Metadata } from "next";
import { Playfair_Display, DM_Sans } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { getSiteSettings } from "@/lib/data.server";
import { WhatsAppWidget } from "@/components/whatsapp-widget";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "DigitalServices4U | Premium Digital Subscription Marketplace",
  description: "Get premium access to AI, software, streaming, and digital accounts instantly. Fast setup and dedicated support via WhatsApp.",
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
        className={`${playfair.variable} ${dmSans.variable} antialiased min-h-screen bg-background text-foreground`}
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
