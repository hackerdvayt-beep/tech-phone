export const calculateCheckoutPricing = (cartItems = []) => {
  const itemsPrice = Number(
    cartItems
      .reduce(
        (total, item) => total + Number(item.price) * Number(item.qty),
        0
      )
      .toFixed(2)
  );
  const shippingPrice = itemsPrice > 100 ? 0 : 100;
  const taxPrice = Number((itemsPrice * 0.15).toFixed(2));

  return {
    itemsPrice,
    shippingPrice,
    taxPrice,
    totalPrice: Number((itemsPrice + shippingPrice + taxPrice).toFixed(2)),
  };
};
