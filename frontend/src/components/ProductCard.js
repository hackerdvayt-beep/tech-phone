import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Card, Button } from "react-bootstrap";
import { useDispatch } from "react-redux";
import Rating from "./Rating";
import { saleUtils } from "../utils/saleUtils";
import { addToCart } from "../actions/cartActions";
import { addToCompareSelection, getCompareSelection } from "../utils/compareSelection";
// This component is for displaying products in a list/grid
const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const [added, setAdded] = useState(false);
  const [compareMessage, setCompareMessage] = useState("");
  // Get sale information
  const saleInfo = saleUtils.getSaleInfo(product);
  const isOnSale =
    saleUtils.isProductOnSale(product) || product.originalPrice > product.price;
  const formatVND = (price) =>
    new Intl.NumberFormat("vi-VN").format(Number(price) || 0);

  const secondaryImage = product.images?.find((image) => image && image !== product.image);
  const addItemToCart = async () => {
    const color = product.colors?.find((item) => item.isAvailable)?.colorName || "";
    const size = product.sizes?.find((item) => item.isAvailable);
    const colorOption = product.colors?.find((item) => item.colorName === color);
    const price =
      Number(product.currentPrice || product.price) +
      Number(colorOption?.priceAdjustment || 0) +
      Number(size?.priceAdjustment || 0);
    await dispatch(addToCart(product._id, 1, color, size?.sizeName || "", price));
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
  };
  const addItemToCompare = () => {
    if (getCompareSelection().length >= 3 && !getCompareSelection().some((item) => item._id === product._id)) {
      setCompareMessage("Tối đa 3 máy");
      window.setTimeout(() => setCompareMessage(""), 1800);
      return;
    }
    addToCompareSelection(product);
    setCompareMessage("Đã thêm so sánh");
    window.setTimeout(() => setCompareMessage(""), 1800);
  };

  return (
    <Card className="my-1 mx-0 px-0 py-3 product-card">
      <Link to={`/product/${product._id}`} className="text-decoration-none">
        <div className="product-image-wrapper position-relative">
          {(product.badge || isOnSale) && (
            <span className="product-badge">
              {product.badge?.startsWith("-")
                ? product.badge
                : isOnSale
                  ? `-${Math.round((1 - product.price / product.originalPrice) * 100)}%`
                  : product.badge}
            </span>
          )}
          <Card.Img
            src={product.image}
            variant="top"
            className={`product-image ${product.category === "apple" ? "product-image--apple" : ""}`}
            data-secondary-image={secondaryImage || ""}
            onMouseEnter={(event) => {
              if (secondaryImage) event.currentTarget.src = secondaryImage;
            }}
            onMouseLeave={(event) => {
              event.currentTarget.src = product.image;
            }}
            onError={(event) => {
              event.currentTarget.onerror = null;
              event.currentTarget.src = "/images/phones/commons-google-pixel-8pro.jpg";
            }}
          />
        </div>
      </Link>

      <Card.Body className="py-3 px-3">
        <div className="d-flex align-items-start justify-content-between gap-2 mb-2 product-card-heading">
          <Link to={`/product/${product._id}`} className="text-decoration-none product-card-title-link">
            <Card.Title as="div" className="product-title-small">{product.name}</Card.Title>
          </Link>
          <Rating value={product.rating || 0} text="" size="small" justifyEnd />
        </div>
        <div className="product-color-dots" aria-label="Màu sắc">
          {(product.colors || []).slice(0, 4).map((color, index) => (
            <span key={`${color.colorName}-${index}`} title={color.colorName} className={`color-dot color-${color.colorName}`} />
          ))}
        </div>
        <div className="product-price py-2">
          <span className="fw-bold">{formatVND(isOnSale ? saleInfo.salePrice : product.price)}₫</span>
          {(product.originalPrice > product.price || isOnSale) && (
            <del className="original-price">            {formatVND(saleUtils.isProductOnSale(product) ? saleInfo.originalPrice : product.originalPrice)}₫</del>
          )}
        </div>
        <div className="product-card-actions">
          <Button size="sm" variant="dark" onClick={addItemToCart}>{added ? "Đã thêm" : "Thêm vào giỏ"}</Button>
          <Button size="sm" variant="outline-dark" onClick={addItemToCompare}>+ So sánh</Button>
        </div>
        {compareMessage && <small className="d-block text-center mt-2 text-muted">{compareMessage}</small>}
      </Card.Body>
    </Card>
  );
};

export default ProductCard;
