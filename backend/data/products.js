const toRetailPrice = (price) => {
  const value = Math.max(0, Math.round(Number(price) || 0));
  const million = 1000000;
  return Math.max(million - 10000, Math.round(value / million) * million - 10000);
};

const phone = (
  name,
  category,
  price,
  image,
  specifications,
  options = {}
) => {
  const retailPrice = toRetailPrice(price);
  const retailOriginalPrice = toRetailPrice(
    options.originalPrice ||
      (options.discountPercent
        ? retailPrice / (1 - options.discountPercent / 100)
        : retailPrice)
  );
  const actualDiscount = retailOriginalPrice > retailPrice
    ? Math.round((1 - retailPrice / retailOriginalPrice) * 100)
    : 0;

  return {
    name,
    image,
    images: [...new Set(options.images || [image])].slice(0, 4),
    description:
      "Sản phẩm thuộc danh mục demo TECH PHONE. Tên model, giá và thông số là dữ liệu tham khảo, cần xác nhận trước khi kinh doanh.",
    category,
    price: retailPrice,
    originalPrice: retailOriginalPrice,
    specifications,
    badge: actualDiscount > 0
      ? `-${actualDiscount}%`
      : options.badge || "Trả góp 0%",
    rating: 5,
    countInStock: 20,
    isActive: true,
    colors: (options.colors || ["black", "white", "blue"]).map((colorName) => ({
      colorName,
      isAvailable: true,
      priceAdjustment: 0,
    })),
    sizes: (options.sizes || [
      ["256GB", 0],
      ["512GB", 5000000],
      ["1TB", 10000000],
      ["2TB", 18000000],
    ]).map(([sizeName, priceAdjustment]) => ({
      sizeName,
      isAvailable: true,
      priceAdjustment,
    })),
    sale: { isOnSale: false, saleType: "percentage", saleValue: 0 },
  };
};

const accessory = (
  name,
  price,
  image,
  specifications,
  accessoryType,
  images = [image]
) => ({
  ...phone(name, "accessory", price, image, specifications, {
    originalPrice: price,
    badge: "Trả góp 0%",
    colors: ["black", "white"],
    sizes: [["Standard", 0]],
  }),
  images,
  accessoryType,
});

const products = [
  phone("iPhone 18 Pro Max", "apple", 44990000, "/images/phones/iphone-18-pro-max-1.jpg", {
    screen: "6.9 inch OLED",
    chip: "Apple A20 Pro",
    ram: "12GB",
    storage: "256GB / 512GB / 1TB",
    camera: "48MP + 48MP + 48MP",
    battery: "Sạc nhanh USB-C",
  }, {
    discountPercent: 10,
    images: [
      "/images/phones/iphone-18-pro-max-1.jpg",
      "/images/phones/iphone-18-pro-max-2.jpg",
      "/images/phones/iphone-18-pro-max-3.jpg",
      "/images/phones/iphone-18-pro-max-4.jpg",
    ],
  }),
  phone("iPhone 18 Pro", "apple", 38990000, "/images/tech/iphone-18-pro.png", {
    screen: "6.3 inch OLED",
    chip: "Apple A20 Pro",
    ram: "12GB",
    storage: "256GB / 512GB / 1TB",
    camera: "48MP + 48MP + 48MP",
    battery: "Sạc nhanh USB-C",
  }, {
    images: [
      "/images/phones/iphone-18-pro-1.jpg",
      "/images/phones/iphone-18-pro-2.jpg",
      "/images/phones/iphone-18-pro-3.jpg",
      "/images/phones/iphone-18-pro-4.jpg",
    ],
  }),
  phone("iPhone Air", "apple", 34990000, "/images/tech/iphone-air.png", {
    screen: "6.5 inch OLED",
    chip: "Apple A20",
    ram: "8GB",
    storage: "256GB / 512GB / 1TB",
    camera: "48MP",
    battery: "Sạc nhanh USB-C",
  }, {
    discountPercent: 10,
    images: [
      "/images/phones/iphone-air-1.jpg",
      "/images/phones/iphone-air-2.jpg",
      "/images/phones/iphone-air-3.jpg",
      "/images/phones/iphone-air-4.jpg",
    ],
  }),
  phone("iPhone 17", "apple", 28990000, "/images/tech/iphone-17.png", {
    screen: "6.3 inch OLED",
    chip: "Apple A19",
    ram: "8GB",
    storage: "256GB / 512GB",
    camera: "48MP + 12MP",
    battery: "Sạc nhanh USB-C",
  }, {
    sizes: [["256GB", 0], ["512GB", 5000000]],
    discountPercent: 15,
    images: [
      "/images/phones/iphone-17-1.jpg",
      "/images/phones/iphone-17-2.jpg",
      "/images/phones/iphone-17-3.jpg",
      "/images/phones/iphone-17-4.jpg",
    ],
  }),
  phone("iPhone 17e", "apple", 21990000, "/images/tech/iphone-17e.png", {
    screen: "6.1 inch OLED",
    chip: "Apple A19",
    ram: "8GB",
    storage: "256GB / 512GB",
    camera: "48MP",
    battery: "Sạc nhanh USB-C",
  }, {
    sizes: [["256GB", 0], ["512GB", 4000000]],
    images: [
      "/images/phones/iphone-17e-1.png",
      "/images/phones/iphone-17e-2.jpg",
      "/images/phones/iphone-17e-3.jpg",
      "/images/phones/iphone-17e-4.jpg",
    ],
  }),
  phone("iPhone Duo", "apple", 64990000, "/images/tech/iphone-duo.png", {
    screen: "Màn hình gập 7.6 inch",
    chip: "Apple A20 Pro",
    ram: "12GB",
    storage: "512GB / 1TB / 2TB",
    camera: "48MP kép",
    battery: "Sạc nhanh USB-C",
  }, {
    images: [
      "/images/phones/iphone-duo-1.jpg",
      "/images/phones/iphone-duo-2.jpg",
      "/images/phones/iphone-duo-3.jpg",
      "/images/phones/iphone-duo-4.jpg",
    ],
    sizes: [["512GB", 0], ["1TB", 7000000], ["2TB", 14000000]],
    discountPercent: 15,
  }),
  phone("Samsung Galaxy S26 Ultra", "samsung", 44990000, "/images/phones/samsung-galaxy-s26-ultra-1.jpg", {
    screen: "6.9 inch AMOLED",
    chip: "Snapdragon flagship",
    ram: "12GB",
    storage: "256GB / 512GB / 1TB",
    camera: "200MP + telephoto",
    battery: "5,000mAh, sạc nhanh",
  }, {
    discountPercent: 10,
    images: [
      "/images/phones/samsung-galaxy-s26-ultra-1.jpg",
      "/images/phones/samsung-galaxy-s26-ultra-2.jpg",
      "/images/phones/samsung-galaxy-s26-ultra-3.jpg",
      "/images/phones/samsung-galaxy-s26-ultra-4.jpg",
    ],
  }),
  phone("Samsung Galaxy S26+", "samsung", 35990000, "/images/phones/samsung-galaxy-s26-plus-1.jpg", {
    screen: "6.7 inch AMOLED",
    chip: "Exynos flagship",
    ram: "12GB",
    storage: "256GB / 512GB",
    camera: "50MP đa camera",
    battery: "4,900mAh, sạc nhanh",
  }, {
    sizes: [["256GB", 0], ["512GB", 5000000]],
    images: [
      "/images/phones/samsung-galaxy-s26-plus-1.jpg",
      "/images/phones/samsung-galaxy-s26-plus-2.jpg",
      "/images/phones/samsung-galaxy-s26-plus-3.jpg",
      "/images/phones/samsung-galaxy-s26-plus-4.jpg",
    ],
  }),
  phone("Samsung Galaxy Z Fold8", "samsung", 46990000, "/images/tech/galaxy-z-fold8.jpg", {
    screen: "Màn hình gập AMOLED 7.6 inch",
    chip: "Snapdragon flagship",
    ram: "12GB",
    storage: "256GB / 512GB / 1TB",
    camera: "50MP đa camera",
    battery: "5,000mAh, sạc nhanh",
  }, {
    discountPercent: 15,
    images: [
      "/images/phones/samsung-galaxy-z-fold8-1.jpg",
      "/images/phones/samsung-galaxy-z-fold8-2.jpg",
      "/images/phones/samsung-galaxy-z-fold8-3.jpg",
      "/images/phones/samsung-galaxy-z-fold8-4.jpg",
    ],
  }),
  phone("Samsung Galaxy Z Flip8", "samsung", 42990000, "/images/phones/samsung-galaxy-z-flip8-1.jpg", {
    screen: "Màn hình gập AMOLED 6.7 inch",
    chip: "Snapdragon flagship",
    ram: "12GB",
    storage: "256GB / 512GB",
    camera: "50MP kép",
    battery: "4,000mAh, sạc nhanh",
  }, {
    sizes: [["256GB", 0], ["512GB", 5000000]],
    images: [
      "/images/phones/samsung-galaxy-z-flip8-1.jpg",
      "/images/phones/samsung-galaxy-z-flip8-2.jpg",
      "/images/phones/samsung-galaxy-z-flip8-3.jpg",
      "/images/phones/samsung-galaxy-z-flip8-4.jpg",
    ],
  }),
  phone("Samsung Galaxy A57 5G", "samsung", 12990000, "/images/phones/samsung-galaxy-a57-5g-1.jpg", {
    screen: "6.7 inch AMOLED",
    chip: "Exynos tầm trung",
    ram: "8GB",
    storage: "256GB / 512GB",
    camera: "50MP OIS",
    battery: "5,000mAh, sạc nhanh",
  }, {
    sizes: [["256GB", 0], ["512GB", 3000000]],
    discountPercent: 10,
    images: [
      "/images/phones/samsung-galaxy-a57-5g-1.jpg",
      "/images/phones/samsung-galaxy-a57-5g-2.jpg",
      "/images/phones/samsung-galaxy-a57-5g-3.jpg",
      "/images/phones/samsung-galaxy-a57-5g-4.jpg",
    ],
  }),
  phone("Xiaomi 17 Ultra", "xiaomi", 39990000, "/images/phones/xiaomi-17-ultra-1.jpg", {
    screen: "6.8 inch AMOLED",
    chip: "Snapdragon flagship",
    ram: "16GB",
    storage: "512GB / 1TB",
    camera: "Leica 1-inch multi-camera",
    battery: "5,500mAh, sạc nhanh",
  }, {
    sizes: [["512GB", 0], ["1TB", 5000000]],
    discountPercent: 15,
    images: [
      "/images/phones/xiaomi-17-ultra-1.jpg",
      "/images/phones/xiaomi-17-ultra-2.jpg",
      "/images/phones/xiaomi-17-ultra-3.jpg",
      "/images/phones/xiaomi-17-ultra-4.jpg",
    ],
  }),
  phone("Xiaomi 17 Pro", "xiaomi", 32990000, "/images/phones/xiaomi-17-pro-1.jpg", {
    screen: "6.4 inch AMOLED",
    chip: "Snapdragon flagship",
    ram: "12GB",
    storage: "256GB / 512GB",
    camera: "50MP Leica",
    battery: "5,000mAh, sạc nhanh",
  }, {
    sizes: [["256GB", 0], ["512GB", 4000000]],
    images: [
      "/images/phones/xiaomi-17-pro-1.jpg",
      "/images/phones/xiaomi-17-pro-2.jpg",
      "/images/phones/xiaomi-17-pro-3.jpg",
      "/images/phones/xiaomi-17-pro-4.jpg",
    ],
  }),
  phone("Redmi Note 15 Pro+", "xiaomi", 12990000, "/images/phones/redmi-note-15-pro-plus-1.jpg", {
    screen: "6.7 inch AMOLED",
    chip: "Snapdragon tầm trung",
    ram: "8GB",
    storage: "256GB / 512GB",
    camera: "200MP",
    battery: "6,000mAh, sạc nhanh",
  }, {
    sizes: [["256GB", 0], ["512GB", 3000000]],
    discountPercent: 10,
    images: [
      "/images/phones/redmi-note-15-pro-plus-1.jpg",
      "/images/phones/redmi-note-15-pro-plus-2.jpg",
      "/images/phones/redmi-note-15-pro-plus-3.jpg",
      "/images/phones/redmi-note-15-pro-plus-4.jpg",
    ],
  }),
  phone("OPPO Find X9 Pro", "oppo", 34990000, "/images/phones/oppo-find-x9-pro-1.png", {
    screen: "6.8 inch AMOLED",
    chip: "MediaTek flagship",
    ram: "16GB",
    storage: "512GB / 1TB",
    camera: "Hasselblad multi-camera",
    battery: "5,500mAh, sạc nhanh",
  }, {
    sizes: [["512GB", 0], ["1TB", 5000000]],
    images: [
      "/images/phones/oppo-find-x9-pro-1.png",
      "/images/phones/oppo-find-x9-pro-2.jpg",
      "/images/phones/oppo-find-x9-pro-3.jpg",
      "/images/phones/oppo-find-x9-pro-4.jpg",
    ],
  }),
  phone("OPPO Reno15", "oppo", 14990000, "/images/phones/oppo-reno15-1.jpg", {
    screen: "6.7 inch AMOLED",
    chip: "MediaTek tầm trung",
    ram: "12GB",
    storage: "256GB / 512GB",
    camera: "50MP portrait",
    battery: "5,000mAh, sạc nhanh",
  }, {
    sizes: [["256GB", 0], ["512GB", 3000000]],
    discountPercent: 15,
    images: [
      "/images/phones/oppo-reno15-1.jpg",
      "/images/phones/oppo-reno15-2.jpg",
      "/images/phones/oppo-reno15-3.jpg",
      "/images/phones/oppo-reno15-4.jpg",
    ],
  }),
  phone("Google Pixel 11 Pro XL", "google", 34990000, "/images/phones/google-pixel-11-pro-xl-1.jpg", {
    screen: "6.8 inch OLED",
    chip: "Google Tensor",
    ram: "16GB",
    storage: "256GB / 512GB / 1TB",
    camera: "50MP triple camera",
    battery: "5,000mAh, sạc nhanh",
  }, {
    discountPercent: 10,
    images: [
      "/images/phones/google-pixel-11-pro-xl-1.jpg",
      "/images/phones/google-pixel-11-pro-xl-2.jpg",
      "/images/phones/google-pixel-11-pro-xl-3.jpg",
      "/images/phones/google-pixel-11-pro-xl-4.jpg",
    ],
  }),
  accessory("AirPods Pro 3", 6490000, "/images/accessories/airpods-pro-3-1.jpg", {
    screen: "Không có",
    chip: "Apple H-series",
    ram: "Không áp dụng",
    storage: "Không áp dụng",
    camera: "Không có",
    battery: "Chống ồn chủ động",
  }, "earphone", [
    "/images/accessories/airpods-pro-3-1.jpg",
    "/images/accessories/airpods-pro-3-2.jpg",
    "/images/accessories/airpods-pro-3-3.jpg",
    "/images/accessories/airpods-pro-3-4.jpg",
  ]),
  accessory("Apple Watch Series 12", 11990000, "/images/accessories/apple-watch-series-12-1.jpg", {
    screen: "OLED",
    chip: "Apple S-series",
    ram: "Không công bố",
    storage: "Không công bố",
    camera: "Không có",
    battery: "Theo dõi sức khỏe",
  }, "watch-band", [
    "/images/accessories/apple-watch-series-12-1.jpg",
    "/images/accessories/apple-watch-series-12-2.png",
    "/images/accessories/apple-watch-series-12-3.jpeg",
    "/images/accessories/apple-watch-series-12-4.jpg",
  ]),
  accessory("Samsung Galaxy Watch9", 8990000, "/images/accessories/samsung-galaxy-watch9-1.jpg", {
    screen: "AMOLED",
    chip: "Exynos wearable",
    ram: "Không công bố",
    storage: "Không công bố",
    camera: "Không có",
    battery: "Theo dõi sức khỏe",
  }, "watch-band", [
    "/images/accessories/samsung-galaxy-watch9-1.jpg",
    "/images/accessories/samsung-galaxy-watch9-2.jpg",
    "/images/accessories/samsung-galaxy-watch9-3.jpg",
  ]),
  accessory("Sạc nhanh GaN 65W", 990000, "/images/accessories/gan-65w-charger-1.jpg", {
    screen: "Không có",
    chip: "GaN 65W",
    ram: "Không áp dụng",
    storage: "Không áp dụng",
    camera: "Không có",
    battery: "USB-C PD",
  }, "charger", [
    "/images/accessories/gan-65w-charger-1.jpg",
    "/images/accessories/gan-65w-charger-2.jpg",
    "/images/accessories/gan-65w-charger-3.jpg",
    "/images/accessories/gan-65w-charger-4.jpg",
  ]),
  accessory("Ốp lưng MagSafe", 1490000, "/images/accessories/magsafe-case-1.jpg", {
    screen: "Không có",
    chip: "Không áp dụng",
    ram: "Không áp dụng",
    storage: "Không áp dụng",
    camera: "Không có",
    battery: "Tương thích MagSafe",
  }, "case", [
    "/images/accessories/magsafe-case-1.jpg",
    "/images/accessories/magsafe-case-2.jpg",
    "/images/accessories/magsafe-case-3.jpg",
  ]),
];

export default products;
