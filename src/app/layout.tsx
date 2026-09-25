import type { Metadata, Viewport } from "next";
import { Instrument_Sans, JetBrains_Mono, Schibsted_Grotesk } from "next/font/google";
import { Providers } from "@/components/providers";
import { isSanityConfigured } from "@/sanity/env";
import { SanityLive } from "@/sanity/lib/live";
import "./globals.css";

const ui = Instrument_Sans({ subsets: ["latin"], variable: "--font-ui", display: "swap" });
const display = Schibsted_Grotesk({ subsets: ["latin"], variable: "--font-display-face", display: "swap", weight: ["600", "700", "800"] });
const code = JetBrains_Mono({ subsets: ["latin"], variable: "--font-code", display: "swap", weight: ["400", "500", "600"] });

export const metadata: Metadata = {
  title: { default: "DialBrio — Sales engagement & intelligent dialing", template: "%s · DialBrio" },
  description: "A modern sales engagement platform for calling, follow-up, qualification and appointment booking.",
  applicationName: "DialBrio",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0A0A0A" },
    { media: "(prefers-color-scheme: light)", color: "#FFFFFF" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${ui.variable} ${display.variable} ${code.variable}`}>
      <body>
        <Providers>{children}</Providers>
        {/* Live Content API: refreshes Sanity-backed pages when content is published. */}
        {isSanityConfigured && <SanityLive />}
      </body>
    </html>
  );
}
