import type { Metadata } from "next";
import { Preloader } from "@/components/preloader";
import { MotionProvider } from "@/components/motion-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Planet Green — Move to Nature",
  description:
    "A little closer to nature. A better way to live. Discover Planet Green's world of natural farming, green communities and heritage food: Farm Natura, Dates County, Green Land Capital and Veda Bharath.",
  metadataBase: new URL("https://planet-green-nature.techgylink-0150.chatgpt.site"),
  openGraph: {
    title: "Planet Green — Move to Nature",
    description: "Nature-led communities. Rooted in a better tomorrow.",
    images: ["/images/farm-natura-living.webp"],
  },
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="preloading">
      <head>
        <noscript>
          <style>{".site-preloader { display: none !important; }"}</style>
        </noscript>
        <link
          rel="preload"
          as="image"
          href="/textures/reference/foliage-events.webp"
          media="(min-width: 641px)"
        />
        <link
          rel="preload"
          as="image"
          href="/textures/reference/foliage-events-mobile.webp"
          media="(max-width: 640px)"
        />
        <link
          rel="preload"
          href="/fonts/plus-jakarta-sans-variable.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        <Preloader />
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
