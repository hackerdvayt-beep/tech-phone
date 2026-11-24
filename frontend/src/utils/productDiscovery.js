import { saleUtils } from "./saleUtils.js";

export const getDiscoveryPrice = (product) =>
  saleUtils.isProductOnSale(product)
    ? Number(product.currentPrice || saleUtils.calculateSalePrice(product))
    : Number(product.price || 0);

const getDiscountPercent = (product) => {
  const price = getDiscoveryPrice(product);
  const referencePrice = Math.max(
    Number(product.originalPrice || 0),
    Number(product.price || 0)
  );
  return referencePrice > price
    ? Math.round(((referencePrice - price) / referencePrice) * 100)
    : 0;
};

const matchesNeed = (product, need) => {
  if (!need || need === "all") return true;

  const name = product.name?.toLowerCase() || "";
  const specifications = product.specifications || {};
  const isPhone = product.category !== "accessory";

  if (need === "folding") {
    return /fold|flip|gập/i.test(`${name} ${specifications.screen || ""}`);
  }

  if (!isPhone) return false;

  if (need === "gaming") {
    const ram = Number.parseInt(specifications.ram, 10) || 0;
    return (
      ram >= 12 ||
      /snapdragon|gaming|a\d+\s*pro/i.test(specifications.chip || "")
    );
  }

  if (need === "photography") {
    return /leica|hasselblad|telephoto|triple|200\s*mp/i.test(
      specifications.camera || ""
    );
  }

  if (need === "battery") {
    const battery = specifications.battery || "";
    const capacity = Number.parseInt(battery.match(/(\d[\d,]*)\s*mAh/i)?.[1]?.replace(/,/g, ""), 10);
    return capacity >= 5000;
  }

  return true;
};

export const filterAndSortProducts = (
  products,
  {
    category = "all",
    priceRange = "all",
    need = "all",
    sortBy = "featured",
    featuredOrder = [],
  } = {}
) => {
  const ranges = {
    under15: (price) => price < 15000000,
    from15to30: (price) => price >= 15000000 && price <= 30000000,
    over30: (price) => price > 30000000,
  };
  const priorityByName = new Map(
    featuredOrder.map((name, index) => [name, index])
  );

  const filtered = (Array.isArray(products) ? products : []).filter(
    (product) => {
      if (!product.isActive) return false;
      if (category === "sale-off") {
        if (
          !saleUtils.isProductOnSale(product) &&
          Number(product.originalPrice || 0) <= Number(product.price || 0)
        ) {
          return false;
        }
      } else if (
        category !== "all" &&
        product.category?.toLowerCase() !== category.toLowerCase()
      ) {
        return false;
      }

      const price = getDiscoveryPrice(product);
      return (
        (!ranges[priceRange] || ranges[priceRange](price)) &&
        matchesNeed(product, need)
      );
    }
  );

  return filtered.sort((a, b) => {
    if (sortBy === "price-asc") {
      return getDiscoveryPrice(a) - getDiscoveryPrice(b);
    }
    if (sortBy === "price-desc") {
      return getDiscoveryPrice(b) - getDiscoveryPrice(a);
    }
    if (sortBy === "discount") {
      return getDiscountPercent(b) - getDiscountPercent(a);
    }
    return (
      (priorityByName.get(a.name) ?? Number.MAX_SAFE_INTEGER) -
      (priorityByName.get(b.name) ?? Number.MAX_SAFE_INTEGER)
    );
  });
};
