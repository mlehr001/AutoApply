import type { Metadata } from "next";
import { Raleway, Open_Sans } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { PosthogProvider } from "@/lib/posthog";
import Nav from "@/components/Nav";
import "./globals.css";

const raleway = Raleway({
  subsets:  ["latin"],
  weight:   ["300", "400", "600", "700", "800"],
  variable: "--font-raleway",
  display:  "swap",
});

const openSans = Open_Sans({
  subsets:  ["latin"],
  weight:   ["300", "400", "600"],
  variable: "--font-open-sans",
  display:  "swap",
});

export const metadata: Metadata = {
  title:       "ResumAI — Job Search OS",
  description: "Marc Lehrmann's personal job search command center.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider afterSignOutUrl="/">
      <html lang="en" className={`${raleway.variable} ${openSans.variable}`}>
        <body
          style={{
            margin:     0,
            padding:    0,
            background: "#F5F5F3",
            fontFamily: "var(--font-open-sans), system-ui, sans-serif",
            fontSize:   14,
            color:      "#2C3E50",
          }}
        >
          <PosthogProvider>
            <Nav />
            <main>{children}</main>
          </PosthogProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
