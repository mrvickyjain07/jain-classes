import type { Metadata, Viewport } from "next";
import { Inter, Mukta, Poppins } from "next/font/google";
import { getSiteContent } from "@/lib/cms/data";
import { siteUrl } from "@/lib/site";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const poppins = Poppins({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-poppins", display: "swap" });
const mukta = Mukta({ subsets: ["devanagari"], weight: ["400", "600", "700"], variable: "--font-mukta", display: "swap", preload: false });

export async function generateMetadata(): Promise<Metadata> {
  const { settings } = await getSiteContent();
  const name = settings.institute_name;
  return {
    metadataBase: new URL(siteUrl()),
    title: { default: settings.seo_title || name, template: `%s | ${name}` },
    description: settings.seo_description,
    applicationName: name,
    keywords: [
      "Jain Classes", "UPSC Classes", "MPSC Classes", "MPSC Rajyaseva Preparation", "MPSC Group B", "MPSC Group C",
      "Maharashtra Competitive Examination Preparation", "Free MPSC Study Materials",
    ],
    alternates: { canonical: "/" },
    openGraph: {
      type: "website",
      siteName: name,
      locale: "en_IN",
      title: settings.seo_title || name,
      description: settings.seo_description,
      url: "/",
      images: [{ url: "/images/jain-classes-banner.jpg", width: 1600, height: 639, alt: `${name} - UPSC, MPSC and competitive examinations` }],
    },
    twitter: { card: "summary_large_image" },
    formatDetection: { telephone: true, email: true },
  };
}

export const viewport: Viewport = { themeColor: "#102A43", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" className={`${inter.variable} ${poppins.variable} ${mukta.variable}`}>
      <body className="min-h-dvh antialiased">{children}</body>
    </html>
  );
}
