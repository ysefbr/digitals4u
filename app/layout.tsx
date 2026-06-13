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
