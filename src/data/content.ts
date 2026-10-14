// All editorial content and project details live here, away from animation code.
// Verified against Planet Green and the official websites of its four ventures.
export const contact = {
  phone: "+91 9555 700 900",
  phoneHref: "tel:+919555700900",
  email: "marketing@planetgreen.co.in",
  address: "2nd Floor, Regent Square Building, Q-City Road, Gowlidoddi, Hyderabad 500075",
};

export const pillars = [
  {
    number: "01",
    title: "Indulge",
    text: "Slow down. Breathe deeply. Find the joy in a life surrounded by nature.",
  },
  {
    number: "02",
    title: "Involve",
    text: "Reconnect with the land, the food you grow, and the people you share it with.",
  },
  {
    number: "03",
    title: "Impact",
    text: "Make a conscious choice today. Leave a greener, more meaningful tomorrow.",
  },
];

export const communities = [
  {
    id: "dates-county",
    number: "01",
    name: "Dates County",
    category: "A landscape of possibilities",
    logo: "/brand/dates-county.svg",
    image: "/images/dates-county.webp",
    detailImage: "/images/dates-county-community.webp",
    description:
      "A 300+ acre villa plot community in Kandukur, where green landscapes and shared spaces bring families closer to nature.",
    detail:
      "Find room to breathe, reconnect and create a life around nature. Dates County brings together residential villa plots, green parks, a natural stream and spaces for recreation along the Srisailam Highway.",
    facts: ["300+ acre community", "Kandukur · Hyderabad", "Residential villa plots"],
    url: "https://www.thedatescounty.in/",
  },
  {
    id: "farm-natura",
    number: "02",
    name: "Farm Natura",
    category: "The farm life, beautifully reimagined",
    logo: "/brand/farm-natura.svg",
    image: "/images/farm-natura.webp",
    detailImage: "/images/farm-natura-building.webp",
    description:
      "A 110+ acre managed farming estate shaped by living soil, indigenous seeds, and the simple pleasure of growing together.",
    detail:
      "At Kandukur, along the Srisailam Highway, Farm Natura offers an invitation to live closer to the land. More than six years of soil revitalisation form the foundation for a farm community supported by dedicated agronomy staff.",
    facts: ["110+ acres", "Kandukur · Srisailam Highway", "6+ years of soil revitalisation"],
    url: "https://www.farmnatura.in/",
  },
  {
    id: "green-land-capital",
    number: "03",
    name: "Green Land Capital",
    category: "A greener vision for tomorrow",
    logo: "/brand/green-land-capital.svg",
    image: "/images/green-land-capital.webp",
    detailImage: "/images/green-land-capital.webp",
    description:
      "A platform connecting people with verified natural farming farmlands, with transparency and sustainability at its heart.",
    detail:
      "Green Land Capital focuses on restoring land for productive natural farming. Its farmland platform brings together landowners, buyers and authorised partners through a process of document handling and verification.",
    facts: ["Verified farmlands", "Natural farming", "Land restoration"],
    url: "https://greenlandcapital.in/",
  },
  {
    id: "veda-bharath",
    number: "04",
    name: "Veda Bharath",
    category: "Ancient wisdom. A living future.",
    logo: "/brand/veda-bharath.webp",
    image: "/images/veda-bharath.webp",
    detailImage: "/images/veda-bharath-farming.webp",
    description:
      "Traditional Indian rice varieties, cultivated through natural farming and rooted in generations of farming knowledge.",
    detail:
      "Veda Bharath works with farmers and communities to revive India's heritage rice varieties. Through seed preservation and natural cultivation, it keeps the connection between our land, our food and our traditions alive.",
    facts: ["Heritage rice varieties", "Natural cultivation", "Seed preservation"],
    url: "https://vedabharath.com/",
  },
];

export type Community = (typeof communities)[number];

export const gallery = [
  {
    image: "/images/farm-natura-building.webp",
    caption: "Room to come home to yourself",
    tag: "Living",
  },
  { image: "/images/farm-natura-07.webp", caption: "Good things take root here", tag: "Growing" },
  {
    image: "/images/farm-natura-01.webp",
    caption: "Places that bring us together",
    tag: "Belonging",
  },
  {
    image: "/images/farm-natura-family.webp",
    caption: "A slower pace. A fuller life.",
    tag: "Connecting",
  },
  {
    image: "/images/farm-natura-farmhouse-02.webp",
    caption: "A new perspective on home",
    tag: "Discovering",
  },
];
