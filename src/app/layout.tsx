import type { Metadata } from "next";
import { Geist, Geist_Mono, Montserrat } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { ThemeProvider } from "@/components/theme-provider";
import { PageErrorBoundary } from "@/components/ui/error-boundary";
import { ToastProvider } from "@/components/ui/toast";
import { RoleProvider } from "@/contexts/RoleContext";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const montserratBlack = Montserrat({
  weight: "900",
  variable: "--font-montserrat-black",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title:
    "SecuryFlex - Van Shift tot Betaling in 24 Uur | ZZP Beveiligers Platform",
  description:
    "🔥 Nederland's #1 beveiligingsplatform! WPBR geverifieerd, GPS check-in, 24u betaling. Verdien €28+/uur als ZZP beveiliger. Start vandaag!",
  keywords: [
    "beveiliger worden",
    "zzp beveiliger",
    "beveiliging vacature",
    "wpbr registratie",
    "beveiliger amsterdam",
    "beveiliging rotterdam",
    "security utrecht",
    "beveiligingsbedrijf",
    "gps tracking beveiliging",
    "flexibel werken beveiliger",
    "beveiliging platform",
    "beveiliger 28 euro uur",
    "security werk nederland",
    "bijbaan beveiliger",
    "beveiliging inhuren",
    "beveiligingsopdrachten",
  ],
  authors: [{ name: "SecuryFlex Team" }],
  creator: "SecuryFlex",
  publisher: "SecuryFlex B.V.",
  metadataBase: new URL("https://securyflex.nl"),
  alternates: {
    canonical: "/",
    languages: {
      "nl-NL": "/",
    },
  },
  openGraph: {
    title: "SecuryFlex - Nederland's #1 Beveiligingsplatform | €28+/uur",
    description:
      "🔥 WPBR geverifieerd platform voor beveiligers. GPS check-in, 24u betaling gegarandeerd. 2.847+ actieve beveiligers verdienen €28+/uur. Start vandaag!",
    url: "https://securyflex.nl",
    siteName: "SecuryFlex",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "SecuryFlex - Nederland's #1 Beveiligingsplatform voor ZZP beveiligers en bedrijven",
      },
    ],
    locale: "nl_NL",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SecuryFlex - Nederland's #1 Beveiligingsplatform | €28+/uur",
    description:
      "🔥 WPBR geverifieerd platform. GPS check-in, 24u betaling. 2.847+ beveiligers verdienen €28+/uur. Start vandaag!",
    images: ["/og-image.png"],
    creator: "@securyflex",
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
  verification: {
    google: "google-site-verification-code",
    // yandex: "yandex-verification-code",
  },
  category: "technology",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${montserratBlack.variable} antialiased`}
      >
        <PageErrorBoundary>
          <SessionProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <RoleProvider>
                {children}
                <ToastProvider />
                <Analytics />
                <SpeedInsights />
              </RoleProvider>
            </ThemeProvider>
          </SessionProvider>
        </PageErrorBoundary>
      </body>
    </html>
  );
}
