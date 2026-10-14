// All editorial content and project details live here, away from animation code.
// Verified against Planet Green and the official websites of its four ventures.
export const contact = {
  phone: "+91 9555 700 900",
  phoneHref: "tel:+919555700900",
  email: "marketing@planetgreen.co.in",
  address:
    "2nd Floor, Regent Square Building, Q-City Road, Beside Heritage Fresh, Gowlidoddi, Hyderabad 500075",
};

export const pillars = [
  {
    number: "01",
    title: "Indulge",
    text: "Experience nature through green living communities and time spent on the land.",
  },
  {
    number: "02",
    title: "Involve",
    text: "Take part in natural farming and reconnect with how food is grown.",
  },
  {
    number: "03",
    title: "Impact",
    text: "Care for the soil and support a closer relationship between people and nature.",
  },
];

export const communities = [
  {
    id: "ecoworld",
    number: "01",
    name: "Ecoworld",
    category: "Nature-led residential villa plots",
    logo: "/brand/ecoworld.png",
    image: "/images/dates-county.webp",
    detailImage: "/images/dates-county-community.webp",
    description:
      "A 300+ acre villa plot community in Kandukur, where green landscapes and shared spaces bring families closer to nature.",
    detail:
      "Ecoworld is a residential villa plot community in Kandukur, Hyderabad. The project brings together green parks, a natural stream and shared recreational spaces as part of its approach to eco-friendly living.",
    facts: ["300+ acre community", "Kandukur · Hyderabad", "Residential villa plots"],
    url: "https://www.thedatescounty.in/",
  },
  {
    id: "farm-natura",
    number: "02",
    name: "Farm Natura",
    category: "Managed natural farming estate",
    logo: "/brand/farm-natura.svg",
    image: "/images/farm-natura.webp",
    detailImage: "/images/farm-natura-building.webp",
    description:
      "A 110+ acre managed natural-farming estate near Kandukur, focused on soil health, indigenous seeds and farm living.",
    detail:
      "Farm Natura is Planet Green’s managed natural-farming estate near Kandukur on the Srisailam Highway. Its official project website reports 110+ acres of managed farmland and 6+ years of soil revitalisation, with dedicated agronomy staff managing everyday farming operations.",
    facts: ["110+ acres", "Kandukur · Srisailam Highway", "6+ years of soil revitalisation"],
    url: "https://www.farmnatura.in/",
  },
  {
    id: "green-land-capital",
    number: "03",
    name: "Green Land Capital",
    category: "Verified natural farming farmlands",
    logo: "/brand/green-land-capital.svg",
    image: "/images/green-land-capital.webp",
    detailImage: "/images/green-land-capital.webp",
    description:
      "A platform for buying and selling verified natural farming farmlands, focused on transparency and sustainable agriculture.",
    detail:
      "Green Land Capital focuses on restoring land for productive natural farming. Its farmland platform brings together landowners, buyers and authorised partners through a process of document handling and verification.",
    facts: ["Verified farmlands", "Natural farming", "Land restoration"],
    url: "https://greenlandcapital.in/",
  },
  {
    id: "veda-bharath",
    number: "04",
    name: "Veda Bharath",
    category: "Traditional rice, naturally grown",
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
    caption: "Farm Natura farmhouse",
    tag: "Living",
  },
  {
    image: "/images/farm-natura-07.webp",
    caption: "Produce growing at Farm Natura",
    tag: "Growing",
  },
  {
    image: "/images/farm-natura-01.webp",
    caption: "Shared spaces at Farm Natura",
    tag: "Belonging",
  },
  {
    image: "/images/farm-natura-family.webp",
    caption: "Farm living at Farm Natura",
    tag: "Connecting",
  },
  {
    image: "/images/farm-natura-farmhouse-02.webp",
    caption: "Farmhouses at Farm Natura",
    tag: "Discovering",
  },
];
