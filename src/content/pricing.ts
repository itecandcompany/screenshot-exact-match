export const pricing = [
  {
    name: "MINI",
    designs: 4,
    price: 100000,
    visible: true,
    popular: false,
    description: "A focused start for a stronger brand presence.",
  },
  {
    name: "STARTER",
    designs: 8,
    price: 200000,
    visible: true,
    popular: false,
    description: "Keep your brand visible with consistent creative.",
  },
  {
    name: "GROWTH",
    designs: 12,
    price: 330000,
    visible: true,
    popular: false,
    description: "More creative room for your growing business.",
  },
  {
    name: "BUSINESS",
    designs: 20,
    price: 500000,
    visible: true,
    popular: false,
    description: "A comprehensive creative rhythm for active brands.",
  },
];
export const formatPrice = (value: number) =>
  `TSh ${new Intl.NumberFormat("en-TZ", { maximumFractionDigits: 0 }).format(value)}`;
