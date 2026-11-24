import { saleUtils } from "./saleUtils.js";

const pricingError = (message, statusCode = 400) =>
  Object.assign(new Error(message), { statusCode });

export const priceInstallmentCart = (cartItems, productsById) => {
  const includesPhone = cartItems.some(
    (item) => productsById.get(String(item.product))?.category !== "accessory"
  );
  const items = cartItems.map((item) => {
    const product = productsById.get(String(item.product));
    const quantity = Number(item.qty);
    const submittedPrice = Number(item.price);
    const bundleDiscountPercent = Number(item.bundleDiscountPercent || 0);

    if (!product) {
      throw pricingError("Một sản phẩm không còn kinh doanh hoặc không tồn tại");
    }

    if (!Number.isInteger(quantity) || quantity < 1) {
      throw pricingError("Số lượng sản phẩm không hợp lệ");
    }

    const colorName = String(item.color || "");
    const sizeName = String(item.size || "");
    const color = colorName
      ? product.colors.find((variant) => variant.colorName === colorName)
      : null;
    const size = sizeName
      ? product.sizes.find((variant) => variant.sizeName === sizeName)
      : null;

    if (
      (colorName && (!color || !color.isAvailable)) ||
      (sizeName && (!size || !size.isAvailable)) ||
      (!colorName && !product.colors.some((variant) => variant.isAvailable)) ||
      (!sizeName && !product.sizes.some((variant) => variant.isAvailable))
    ) {
      throw pricingError(`Phiên bản sản phẩm ${product.name} không khả dụng`);
    }

    const unitPrice = Number(
      (
        saleUtils.calculateSalePrice(product) +
        Number(color?.priceAdjustment || 0) +
        Number(size?.priceAdjustment || 0)
      ).toFixed(2)
    );

    if (!Number.isFinite(unitPrice) || unitPrice < 0) {
      throw pricingError(`Giá sản phẩm ${product.name} không hợp lệ`);
    }

    if (![0, 15].includes(bundleDiscountPercent)) {
      throw pricingError("Mức giảm giá phụ kiện không hợp lệ");
    }
    if (
      bundleDiscountPercent === 15 &&
      (product.category !== "accessory" || !includesPhone)
    ) {
      throw pricingError("Ưu đãi combo chỉ áp dụng cho phụ kiện mua kèm điện thoại");
    }
    const quotedPrice =
      bundleDiscountPercent === 15 ? Math.round(unitPrice * 0.85) : unitPrice;

    if (!Number.isFinite(submittedPrice) || submittedPrice < 0) {
      throw pricingError("Giá sản phẩm trong giỏ hàng không hợp lệ");
    }

    if (Math.abs(submittedPrice - quotedPrice) > 0.01) {
      throw pricingError(
        `Giá sản phẩm ${product.name} đã thay đổi. Vui lòng tải lại giỏ hàng`,
        409
      );
    }

    return {
      product: product._id,
      name: product.name,
      qty: quantity,
      color: colorName,
      size: sizeName,
      price: quotedPrice,
      bundleDiscountPercent,
    };
  });

  const quantitiesByProduct = new Map();
  for (const item of items) {
    const key = String(item.product);
    quantitiesByProduct.set(
      key,
      (quantitiesByProduct.get(key) || 0) + item.qty
    );
  }
  for (const [productId, quantity] of quantitiesByProduct) {
    const product = productsById.get(productId);
    if (quantity > product.countInStock) {
      throw pricingError(`Sản phẩm ${product.name} không đủ số lượng tồn kho`);
    }
  }

  const itemsPrice = Number(
    items
      .reduce((total, item) => total + item.qty * item.price, 0)
      .toFixed(2)
  );

  if (!Number.isFinite(itemsPrice) || itemsPrice <= 0) {
    throw pricingError("Tổng giá trị giỏ hàng không hợp lệ");
  }

  return { items, itemsPrice };
};
