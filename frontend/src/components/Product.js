import React, { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Card, Row, Col, Badge } from "react-bootstrap";
import Rating from "./Rating";
import { saleUtils } from "../utils/saleUtils";
import { listProductDetails } from "../actions/productActions";

// NOTE: Aware of custom CSS when edit this
const Product = () => {
  // Removed props parameter
  const { id } = useParams(); // Get product ID from URL
  const dispatch = useDispatch();

  // Get product details from Redux store
  const productDetails = useSelector((state) => state.productDetails);
  const { loading, error, product } = productDetails;

  // Fetch product details when component mounts or ID changes
  useEffect(() => {
    if (id) {
      dispatch(listProductDetails(id));
    }
  }, [dispatch, id]);

  // Handle loading state
  if (loading) {
    return (
      <Card className="my-1 mx-0 px-0 py-3 product-card">
        <Card.Body className="text-center py-5">
          <div>Đang tải...</div>
        </Card.Body>
      </Card>
    );
  }

  // Handle error state
  if (error) {
    return (
      <Card className="my-1 mx-0 px-0 py-3 product-card">
        <Card.Body className="text-center py-5">
          <div className="text-danger">Lỗi: {error}</div>
        </Card.Body>
      </Card>
    );
  }

  // Handle no product found
  if (!product || !product._id) {
    return (
      <Card className="my-1 mx-0 px-0 py-3 product-card">
        <Card.Body className="text-center py-5">
          <div>Không tìm thấy sản phẩm</div>
        </Card.Body>
      </Card>
    );
  }

  // Get sale information
  const saleInfo = saleUtils.getSaleInfo(product);
  const isOnSale = saleUtils.isProductOnSale(product);
  const isSaleEndingSoon = saleUtils.isSaleEndingSoon(product);
  const daysRemaining = saleUtils.getDaysRemaining(product);

  // Format price in VND
  const formatVND = (price) => {
    return new Intl.NumberFormat("vi-VN").format(price);
  };

  return (
    <Card className="my-1 mx-0 px-0 py-3 product-card">
      <Link to={`/product/${product._id}`} className="text-decoration-none">
        <div className="product-image-wrapper position-relative">
          <Card.Img
            src={product.image}
            variant="top"
            className="product-image"
          />
        </div>
      </Link>

      <Card.Body className="py-3 px-0">
        <Row className="align-items-center mb-1">
          <Col xs={7}>
            <Link
              to={`/product/${product._id}`}
              className="text-decoration-none"
            >
              <Card.Title as="div" className="product-title-small">
                {product.name}
              </Card.Title>
            </Link>
          </Col>
          <Col xs={5} className="text-end">
            <Rating value={product.rating || 0} text="" size="small" />
          </Col>
        </Row>

        {/* Price Section */}
        <div className="pt-4 product-price">
          {isOnSale ? (
            <div className="price-section">
              <div>
                <span className="fw-bold">
                  Giá: {formatVND(saleInfo.salePrice)} VND
                </span>
                <span
                  className="original-price text-muted"
                  style={{
                    textDecoration: "line-through",
                    fontSize: "0.85em",
                    padding: "0.6rem",
                  }}
                >
                  {formatVND(saleInfo.originalPrice)} VND
                </span>
              </div>
            </div>
          ) : (
            <Card.Text className="regular-price mb-0">
              Giá: {formatVND(product.price)} VND
            </Card.Text>
          )}
        </div>
      </Card.Body>
    </Card>
  );
};

export default Product;
