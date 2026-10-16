import live from "./live-pages.json";

// Keep the six Bahrain gallery photos and the two user-selected exhibition photos.
// The nine introductory, project and award images are excluded from this collection.
export const bahrainPhotos = [
  ...live["behrain-expo-2023"].sections
    .filter((section) =>
      section.blocks.some((block) => block.text === "Visual Stories of Planet Green"),
    )
    .flatMap((section) => {
      const heading = section.blocks.find((block) => block.tag !== "p")?.text ?? "Planet Green";
      return section.images.map((src, index) => ({
        src,
        alt: `Bahrain 2023 archive · ${heading} · photograph ${index + 1}`,
      }));
    }),
  {
    src: "/images/live/singapore-expo-2023-assets-img-gallery-1.webp",
    alt: "Planet Green representatives seated at the exhibition stand",
  },
  {
    src: "/images/live/singapore-expo-2023-assets-img-gallery-2.webp",
    alt: "Planet Green exhibition stand with project displays and brochures",
  },
];
