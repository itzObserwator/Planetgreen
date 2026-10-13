import type { Metadata } from "next";
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
    images: ["/images/farm-natura-living.jpg"],
  },
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link
          rel="preload"
          href="/fonts/plus-jakarta-sans-variable.ttf"
          as="font"
          type="font/ttf"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
