import type { Metadata } from "next";
import Script from "next/script";
import { GeistMono } from "geist/font/mono";
import { Poppins } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/store/session";
import ThemeProvider from "@/store/theme";
import { ToastProvider } from "@/store/toast";
import CookieBanner from "@/components/CookieBanner";
import PWARegister from "@/components/PWARegister";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  title: "JOTA DISTRIBUIDORA",
  description:
    "Distribuidora de alimentos para bares, restaurantes e afins. Alimentos de qualidade. Mais facilidade e praticidade para seu estabelecimento.",
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "JOTA Distribuidora",
    description:
      "Distribuidora de alimentos para bares, restaurantes e afins. Alimentos de qualidade. Mais facilidade e praticidade para seu estabelecimento.",
    type: "website",
    locale: "pt_BR",
    images: [
      {
        url: "/assets/logo/logo.png",
        width: 1200,
        height: 630,
        alt: "JOTA Distribuidora",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "JOTA Distribuidora",
    description:
      "Distribuidora de alimentos para bares, restaurantes e afins. Alimentos de qualidade. Mais facilidade e praticidade para seu estabelecimento.",
    images: ["/assets/logo/logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br">
      <head>
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#4CA771" />
        <meta name="msapplication-TileColor" content="#4CA771" />
      </head>
      <body className={`${poppins.variable} ${GeistMono.variable} antialiased`}>
        {/* GA4 */}
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);} 
                gtag('js', new Date()); 
                gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}', { send_page_view: true });
              `}
            </Script>
          </>
        )}
        {/* JSON-LD Organization */}
        <Script id="jsonld-org" type="application/ld+json" strategy="afterInteractive">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'JOTA Distribuidora',
            url: siteUrl,
            logo: `${siteUrl}/assets/logo/logo.png`,
            sameAs: [],
            address: {
              '@type': 'PostalAddress',
              addressCountry: 'BR'
            }
          })}
        </Script>
        {/* JSON-LD Breadcrumbs */}
        <Script id="jsonld-breadcrumb" type="application/ld+json" strategy="afterInteractive">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                name: 'Início',
                item: siteUrl
              },
              {
                '@type': 'ListItem',
                position: 2,
                name: 'Produtos',
                item: `${siteUrl}/#produtos`
              },
              {
                '@type': 'ListItem',
                position: 3,
                name: 'Contato',
                item: `${siteUrl}/#contato`
              }
            ]
          })}
        </Script>
        <SessionProvider>
          <ThemeProvider>
            <ToastProvider>
              {children}
              <CookieBanner />
              <PWARegister />
            </ToastProvider>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
