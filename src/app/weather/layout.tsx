import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "أحوال الطقس في العراق - +964 Media",
  description: "أحوال الطقس الحالية والمحدثة لحظياً في جميع محافظات العراق. بيانات موثوقة من محطات الرصد الجوي المعتمدة دولياً.",
  keywords: [
    "الطقس", 
    "العراق", 
    "أحوال الطقس", 
    "بغداد", 
    "البصرة", 
    "الموصل", 
    "أربيل", 
    "النجف", 
    "كربلاء", 
    "السليمانية", 
    "كركوك",
    "الرمادي", 
    "الفلوجة",
    "964 media",
    "درجة الحرارة",
    "الرطوبة",
    "سرعة الرياح"
  ],
  authors: [{ name: "+964 Media Team" }],
  openGraph: {
    title: "أحوال الطقس في العراق - +964 Media",
    description: "أحوال الطقس الحالية والمحدثة لحظياً في جميع محافظات العراق. بيانات موثوقة ودقيقة.",
    type: "website",
    locale: "ar_IQ",
    images: [
      {
        url: "/logo-white.svg",
        width: 400,
        height: 200,
        alt: "+964 Media Weather",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "أحوال الطقس في العراق - +964 Media",
    description: "أحوال الطقس الحالية والمحدثة لحظياً في جميع محافظات العراق",
  },
  alternates: {
    canonical: "/weather",
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

export default function WeatherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      {children}
    </div>
  );
}
