import axios from "axios";
import {
  CART_ADD_ITEM,
  CART_REMOVE_ITEM,
  CART_REMOVE_SPECIFIC_ITEM,
  CART_SAVE_SHIPPING_ADDRESS,
  CART_SAVE_PAYMENT_METHOD,
  CART_SAVE_INSTALLMENT_REQUEST,
  CART_CLEAR_ITEMS,
} from "../constants/cartConstants";

export const addToCart =
  (id, qty, color = "", size = "", variantPrice = null, bundleDiscountPercent = 0) =>
  async (dispatch, getState) => {
    const startsNewCart = getState().cart.cartItems.length === 0;
    const { data } = await axios.get(`/api/products/${id}`);

    if (startsNewCart) {
      localStorage.removeItem("paymentMethod");
      localStorage.removeItem("installmentRequest");
    }

    dispatch({
      type: CART_ADD_ITEM,
      payload: {
        product: data._id,
        name: data.name,
        image: data.image,
        price:
          variantPrice !== null && variantPrice !== undefined
            ? Number(variantPrice)
            : data.currentPrice || data.price,
        countInStock: data.countInStock,
        qty,
        color,
        size,
        bundleDiscountPercent,
      },
    });

    localStorage.setItem(
      "cartItems",
      JSON.stringify(getState().cart.cartItems)
    );
  };

export const removeFromCart = (id) => (dispatch, getState) => {
  dispatch({
    type: CART_REMOVE_ITEM,
    payload: id,
  });

  localStorage.setItem("cartItems", JSON.stringify(getState().cart.cartItems));
};

export const removeSpecificFromCart =
  (productId, color, size) => (dispatch, getState) => {
    dispatch({
      type: CART_REMOVE_SPECIFIC_ITEM,
      payload: { productId, color, size },
    });

    localStorage.setItem(
      "cartItems",
      JSON.stringify(getState().cart.cartItems)
    );
  };

export const saveShippingAddress = (data) => (dispatch) => {
  dispatch({
    type: CART_SAVE_SHIPPING_ADDRESS,
    payload: data,
  });

  localStorage.setItem("shippingAddress", JSON.stringify(data));
};

export const savePaymentMethod = (data) => (dispatch) => {
  dispatch({
    type: CART_SAVE_PAYMENT_METHOD,
    payload: data,
  });

  localStorage.setItem("paymentMethod", JSON.stringify(data));
};

export const saveInstallmentRequest = (data) => (dispatch) => {
  dispatch({
    type: CART_SAVE_INSTALLMENT_REQUEST,
    payload: data,
  });
  localStorage.setItem("installmentRequest", JSON.stringify(data));
};

export const buyNow =
  (id, qty, color = "", size = "", variantPrice = null) =>
  async (dispatch, getState) => {
    // Clear existing cart items first for buy now functionality
    dispatch({
      type: CART_CLEAR_ITEMS,
    });
    localStorage.removeItem("cartItems");

    // Add the single item to cart
    await dispatch(addToCart(id, qty, color, size, variantPrice));

    // Return success to allow redirect in component
    return Promise.resolve();
  };
