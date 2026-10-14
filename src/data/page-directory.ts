// Route labels mirror the live site's navigation. Content is kept in live-pages.json.
export const pageDirectory = [
  { slug: "about-us", sourceKey: "about-us", title: "About Planet Green", label: "About us" },
  { slug: "philosophy", sourceKey: "philosophy", title: "Philosophy", label: "Philosophy" },
  { slug: "communities", sourceKey: "communities", title: "Communities", label: "Communities" },
  {
    slug: "collaborations",
    sourceKey: "collaborations",
    title: "Collaborations",
    label: "Collaborations",
  },
  { slug: "gallery", sourceKey: "gallery", title: "Gallery", label: "Gallery" },
  { slug: "careers", sourceKey: "careers", title: "Careers", label: "Careers" },
  { slug: "contact-us", sourceKey: "contact-us", title: "Contact Us", label: "Contact us" },
  {
    slug: "singapore-expo-2023",
    sourceKey: "singapore-expo-2023",
    title: "Singapore",
    label: "Singapore · 2023",
  },
  {
    slug: "behrain-expo-2023",
    sourceKey: "behrain-expo-2023",
    title: "Bahrain Expo",
    label: "Bahrain · 2023",
  },
  {
    slug: "privacy-policy",
    sourceKey: "privacy_policy",
    title: "Privacy Policy",
    label: "Privacy policy",
  },
  {
    slug: "terms-and-conditions",
    sourceKey: "terms_and_conditions",
    title: "Terms and Conditions",
    label: "Terms & conditions",
  },
] as const;
export type PageEntry = (typeof pageDirectory)[number];
