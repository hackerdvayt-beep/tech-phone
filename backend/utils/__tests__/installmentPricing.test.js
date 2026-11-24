import assert from "node:assert/strict";
import test from "node:test";
import { priceInstallmentCart } from "../installmentPricing.js";

const product = {
  _id: "product-1",
  name: "Test phone",
  category: "apple",
  price: 1000,
  countInStock: 5,
  sale: { isOnSale: false },
  colors: [{ colorName: "black", isAvailable: true, priceAdjustment: 50 }],
  sizes: [{ sizeName: "256GB", isAvailable: true, priceAdjustment: 200 }],
};

test("prices installment items from database product and variant values", () => {
  const result = priceInstallmentCart(
    [
      {
        product: "product-1",
        qty: 2,
        color: "black",
        size: "256GB",
        price: 1250,
      },
    ],
    new Map([["product-1", product]])
  );

  assert.equal(result.itemsPrice, 2500);
  assert.equal(result.items[0].price, 1250);
  assert.equal(result.items[0].name, "Test phone");
});

test("rejects a client price that differs from the database price", () => {
  assert.throws(
    () =>
      priceInstallmentCart(
        [
          {
            product: "product-1",
            qty: 1,
            color: "black",
            size: "256GB",
            price: 1,
          },
        ],
        new Map([["product-1", product]])
      ),
    { statusCode: 409 }
  );
});

test("rejects unavailable variants and quantities above stock", () => {
  assert.throws(
    () =>
      priceInstallmentCart(
        [
          {
            product: "product-1",
            qty: 1,
            color: "pink",
            size: "256GB",
            price: 1200,
          },
        ],
        new Map([["product-1", product]])
      ),
    /không khả dụng/
  );

  assert.throws(
    () =>
      priceInstallmentCart(
        [
          {
            product: "product-1",
            qty: 6,
            color: "black",
            size: "256GB",
            price: 1250,
          },
        ],
        new Map([["product-1", product]])
      ),
    /không đủ số lượng/
  );
});

test("counts stock across variants of the same product", () => {
  const productWithTwoColors = {
    ...product,
    colors: [
      { colorName: "black", isAvailable: true, priceAdjustment: 50 },
      { colorName: "white", isAvailable: true, priceAdjustment: 50 },
    ],
  };

  assert.throws(
    () =>
      priceInstallmentCart(
        [
          {
            product: "product-1",
            qty: 3,
            color: "black",
            size: "256GB",
            price: 1250,
          },
          {
            product: "product-1",
            qty: 3,
            color: "white",
            size: "256GB",
            price: 1250,
          },
        ],
        new Map([["product-1", productWithTwoColors]])
      ),
    /không đủ số lượng/
  );
});

test("validates the 15 percent accessory bundle offer", () => {
  const accessory = {
    ...product,
    _id: "accessory-1",
    name: "Test charger",
    category: "accessory",
    price: 200,
    colors: [{ colorName: "black", isAvailable: true, priceAdjustment: 0 }],
    sizes: [{ sizeName: "Standard", isAvailable: true, priceAdjustment: 0 }],
  };
  const products = new Map([
    ["product-1", product],
    ["accessory-1", accessory],
  ]);
  const result = priceInstallmentCart(
    [
      {
        product: "product-1",
        qty: 1,
        color: "black",
        size: "256GB",
        price: 1250,
      },
      {
        product: "accessory-1",
        qty: 1,
        color: "black",
        size: "Standard",
        price: 170,
        bundleDiscountPercent: 15,
      },
    ],
    products
  );

  assert.equal(result.items[1].price, 170);
  assert.throws(
    () =>
      priceInstallmentCart(
        [
          {
            product: "accessory-1",
            qty: 1,
            color: "black",
            size: "Standard",
            price: 170,
            bundleDiscountPercent: 15,
          },
        ],
        products
      ),
    /chỉ áp dụng/
  );
});
