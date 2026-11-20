import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "https://fixmate-service.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "FixMate | Smart Device & Home Appliance Repair Platform",
    template: "%s | FixMate",
  },
  description:
    "On-demand device and home appliance repair platform with certified local technicians. Track your repair jobs step by step, view itemized costs upfront, and pay only after completion.",
  keywords: [
    "appliance repair",
    "smartphone repair",
    "laptop repair",
    "macbook repair",
    "ac servicing",
    "refrigerator repair",
    "tv repair",
    "washing machine repair",
    "home electrical repair",
    "verified technicians",
    "on-demand repair",
    "fixmate",
    "repair booking",
  ],
  authors: [{ name: "FixMate", url: siteUrl }],
  creator: "FixMate",
  publisher: "FixMate",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    title: "FixMate | Smart Device & Home Appliance Repair Platform",
    description:
      "On-demand device and home appliance repair booking with certified local technicians. Step-by-step job tracking & secure post-completion payments.",
    siteName: "FixMate",
    images: [
      {
        url: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&h=630&q=80",
        width: 1200,
        height: 630,
        alt: "FixMate Verified Technicians Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FixMate | Smart Device & Home Appliance Repair Platform",
    description:
      "Book certified technicians for device and home appliance repairs. Track repairs step by step and pay safely after completion.",
    images: ["https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&h=630&q=80"],
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

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "HomeAndConstructionBusiness",
  name: "FixMate",
  url: siteUrl,
  description:
    "On-demand smart device and home appliance repair platform connecting customers with certified technicians.",
  priceRange: "$$",
  currenciesAccepted: "USD",
  paymentAccepted: "Credit Card, Stripe",
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.9",
    reviewCount: "520",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${inter.className} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('fixmate_theme');
                  var isDark = saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
                  if (isDark) {
                    document.documentElement.classList.add('dark');
                    document.documentElement.setAttribute('data-theme', 'dark');
                    document.documentElement.style.colorScheme = 'dark';
                  } else {
                    document.documentElement.classList.remove('dark');
                    document.documentElement.setAttribute('data-theme', 'light');
                    document.documentElement.style.colorScheme = 'light';
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body
        suppressHydrationWarning
        className={`${inter.className} font-sans min-h-full flex flex-col bg-slate-50 text-slate-900 dark:bg-zinc-950 dark:text-zinc-100 transition-colors`}
      >
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
