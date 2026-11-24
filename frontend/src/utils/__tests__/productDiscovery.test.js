import {
  filterAndSortProducts,
  getDiscoveryPrice,
} from "../productDiscovery";

const products = [
  {
    name: "Budget phone",
    category: "apple",
    isActive: true,
    price: 14990000,
    originalPrice: 16990000,
    specifications: { ram: "8GB", camera: "12MP", battery: "5,000mAh" },
  },
  {
    name: "Camera phone",
    category: "samsung",
    isActive: true,
    price: 30000000,
    originalPrice: 39990000,
    specifications: { ram: "12GB", camera: "Leica 200MP", battery: "4,800mAh" },
  },
  {
    name: "Fold phone",
    category: "samsung",
    isActive: true,
    price: 30000001,
    originalPrice: 30000001,
    specifications: { screen: "Màn hình gập" },
  },
];

test("filters discovery products by inclusive price bands and needs", () => {
  expect(
    filterAndSortProducts(products, {
      priceRange: "under15",
      need: "battery",
    }).map((product) => product.name)
  ).toEqual(["Budget phone"]);

  expect(
    filterAndSortProducts(products, {
      priceRange: "from15to30",
      need: "photography",
    }).map((product) => product.name)
  ).toEqual(["Camera phone"]);
});

test("sorts by effective price and recognizes folding phones", () => {
  expect(
    filterAndSortProducts(products, { sortBy: "price-asc" }).map(
      (product) => product.name
    )
  ).toEqual(["Budget phone", "Camera phone", "Fold phone"]);

  expect(
    filterAndSortProducts(products, { need: "folding" }).map(
      (product) => product.name
    )
  ).toEqual(["Fold phone"]);

  expect(getDiscoveryPrice(products[0])).toBe(14990000);
});
