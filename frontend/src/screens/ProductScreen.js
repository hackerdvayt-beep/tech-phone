import React, { useState, useEffect } from "react";
import ProductCard from "../components/ProductCard";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Row, Col, Image, Button, ToggleButton, Card, Modal, Form, Table } from "react-bootstrap";

import Rating from "../components/Rating";
import Message from "../components/Message";
import Loader from "../components/Loader";
import { listProductDetails, listProducts } from "../actions/productActions";
import { addToCart, buyNow } from "../actions/cartActions";

const getProductImageLabel = (image) => {
  const fileName = image.split("/").pop().toLowerCase();

  if (fileName.includes("camera")) return "Cụm camera";
  if (fileName.includes("front")) return "Mặt trước";
  if (fileName.includes("edge") || fileName.includes("side")) return "Cạnh viền";
  if (fileName.includes("bottom")) return "Cạnh dưới";
  if (fileName.includes("back") || fileName.includes("rear")) return "Mặt lưng";
  return "Góc sản phẩm";
};

const bundleProductOptions = [
  { name: "Sạc nhanh GaN 65W", label: "Sạc nhanh GaN 65W" },
  { name: "Ốp lưng MagSafe", label: "Ốp lưng MagSafe" },
  { name: "AirPods Pro 3", label: "Tai nghe AirPods Pro 3" },
];

const ProductScreen = ({ history, match }) => {
  const [qty, setQty] = useState(1);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedImage, setSelectedImage] = useState("");
  const [zoomOpen, setZoomOpen] = useState(false);
  const [downPayment, setDownPayment] = useState(30);
  const [installmentMonths, setInstallmentMonths] = useState(12);
  const [recentProducts, setRecentProducts] = useState([]);
  const [selectedBundleIds, setSelectedBundleIds] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState("Quận Gò Vấp");
  const [addingBundle, setAddingBundle] = useState(false);
  const [bundleError, setBundleError] = useState("");

  const dispatch = useDispatch();
  // Use selector here
  const productDetails = useSelector((state) => state.productDetails);
  const { loading, error, product } = productDetails;
  const productList = useSelector((state) => state.productList);
  const { products = [], error: productListError } = productList;
  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;

  // Hard coded this because only have 3 colors
  const colorMapping = {
    blue: "#4A90E2",
    black: "#2C2C2C",
    pink: "#FF6B9D",
    white: "#F5F5F5",
    lavender: "#B8A4D9",
    cream: "#F3E9D2",
    pistachio: "#C9D7A5",
  };

  const getVariantPrice = () => {
    if (!product) return 0;
    const basePrice = product.saleInfo?.isOnSale
      ? product.currentPrice || product.price
      : product.price;
    const size = product.sizes?.find(
      (item) => item.sizeName === selectedSize
    );
    const color = product.colors?.find(
      (item) => item.colorName === selectedColor
    );
    return (
      Number(basePrice) +
      Number(size?.priceAdjustment || 0) +
      Number(color?.priceAdjustment || 0)
    );
  };

  const formatVND = (price) =>
    new Intl.NumberFormat("vi-VN").format(Math.round(Number(price) || 0));

  useEffect(() => {
    dispatch(listProductDetails(match.params.id));
    dispatch(listProducts());
  }, [dispatch, match]);

  // Reset selections when product changes
  useEffect(() => {
    if (product && product.colors && product.sizes) {
      setSelectedImage(product.images?.[0] || product.image || "");
      // Set default selections to first available options
      const firstAvailableColor = product.colors.find(
        (color) => color.isAvailable
      );
      const firstAvailableSize = product.sizes.find((size) => size.isAvailable);

      setSelectedColor(
        firstAvailableColor ? firstAvailableColor.colorName : ""
      );
      setSelectedSize(firstAvailableSize ? firstAvailableSize.sizeName : "");
      setSelectedBundleIds([]);
      setBundleError("");
    }
  }, [product, products]);

  useEffect(() => {
    if (!product?._id) return;
    let previous = [];
    try {
      previous = JSON.parse(localStorage.getItem("techPhoneRecentlyViewed") || "[]");
      if (!Array.isArray(previous)) previous = [];
    } catch (error) {
      console.error("Could not read recently viewed products", error);
    }
    const current = {
      _id: product._id,
      name: product.name,
      image: product.image,
      price: product.price,
    };
    const next = [current, ...previous.filter((item) => item._id !== product._id)].slice(0, 8);
    localStorage.setItem("techPhoneRecentlyViewed", JSON.stringify(next));
    setRecentProducts(next.filter((item) => item._id !== product._id));
  }, [product?._id, product?.image, product?.name, product?.price]);

  const addToCartHandler = () => {
    // Include color and size in the cart URL if needed
    const params = new URLSearchParams({
      qty: qty,
      ...(selectedColor && { color: selectedColor }),
      ...(selectedSize && { size: selectedSize }),
      price: getVariantPrice(),
    });
    history.push(`/cart/${match.params.id}?${params.toString()}`);
  };

  const bundleProducts = bundleProductOptions
    .map((option) => ({
      ...option,
      product: products.find((item) => item.name === option.name),
    }))
    .filter((option) => option.product);

  const selectedBundleProducts = bundleProducts.filter(({ product: item }) =>
    selectedBundleIds.includes(item._id)
  );

  const getBundlePrice = (item) =>
    Math.round(Number(item.currentPrice || item.price) * 0.85);

  const addBundleToCartHandler = async () => {
    setAddingBundle(true);
    setBundleError("");
    try {
      await dispatch(
        addToCart(
          product._id,
          qty,
          selectedColor,
          selectedSize,
          getVariantPrice()
        )
      );
      for (const { product: item } of selectedBundleProducts) {
        await dispatch(
          addToCart(item._id, 1, "", "", getBundlePrice(item), 15)
        );
      }
      history.push("/cart");
    } catch (error) {
      console.error("Could not add product bundle to cart", error);
      setBundleError("Chưa thể thêm combo vào giỏ. Vui lòng thử lại.");
    } finally {
      setAddingBundle(false);
    }
  };

  const buyNowHandler = async () => {
    try {
      // Use buyNow action to clear cart and add this item
      await dispatch(
        buyNow(match.params.id, qty, selectedColor, selectedSize, getVariantPrice())
      );
      // Redirect to checkout flow - skip login if already authenticated
      if (userInfo) {
        history.push("/shipping");
      } else {
        history.push("/login?redirect=shipping");
      }
    } catch (error) {
      console.error("Error during buy now:", error);
    }
  };

  // Helper function to check if a variant combination is valid
  const isVariantAvailable = (colorName, sizeName) => {
    const color = product.colors?.find((c) => c.colorName === colorName);
    const size = product.sizes?.find((s) => s.sizeName === sizeName);
    return color?.isAvailable && size?.isAvailable;
  };

  return (
    <>
      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger">{error}</Message>
      ) : (
        <>
          {/* Main Product Section */}
          <Row className="mb-4">
            {/* Product Images */}
            <Col lg={6}>
              <Row>
                <Col md={12} xs={12}>
                  <button type="button" className="product-gallery-main" onClick={() => setZoomOpen(true)} aria-label="Phóng to ảnh sản phẩm">
                    <Image
                      src={selectedImage || product.image}
                      alt={product.name}
                      className="w-100"
                      onError={(event) => {
                        event.currentTarget.onerror = null;
                        event.currentTarget.src = "/images/phones/commons-google-pixel-8pro.jpg";
                      }}
                    />
                    <span>Nhấn để phóng to</span>
                  </button>
                </Col>
                {product.images &&
                  product.images.length > 1 &&
                  product.images.map((image, index) => (
                    <Col xs={3} key={`${image}-${index}`}>
                      <button
                        type="button"
                        className={`product-gallery-thumb ${selectedImage === image ? "active" : ""}`}
                        onClick={() =>
                          setSelectedImage(image)
                        }
                        aria-label={`Xem ảnh ${index + 1} của ${product.name}`}
                      >
                        <Image
                          src={image}
                          alt={`${product.name} - ${getProductImageLabel(image)}`}
                          className="w-100"
                          onError={(event) => {
                            event.currentTarget.onerror = null;
                            event.currentTarget.src = "/images/phones/commons-google-pixel-8pro.jpg";
                          }}
                        />
                        <small className="product-gallery-thumb-label">{getProductImageLabel(image)}</small>
                      </button>
                    </Col>
                  ))}
              </Row>
            </Col>
            {/* Product Info */}
            <Col lg={6}>
              <div className="ps-lg-4">
                <h1 className="h3 fw-bold mb-1">{product.name}</h1>

                {/* Rating */}
                <div className="mb-3">
                  <Rating
                    value={product.rating || 0}
                    justifyEnd={false}
                    blackStar={true}
                  />
                </div>

                {/* Price */}
                <div className="mb-3">
                  <span className="h4 fw-bold">
                    {formatVND(getVariantPrice())} VND
                  </span>
                  {(product.saleInfo?.isOnSale || product.originalPrice > product.price) && (
                    <span
                      className="text-muted text-decoration-line-through ms-2 "
                      style={{
                        textDecoration: "line-through",
                        fontSize: "small",
                        padding: "0.6rem",
                      }}
                    >
                      {formatVND(
                        (product.originalPrice > product.price ? Number(product.originalPrice) : Number(product.price)) +
                        Number(
                          product.sizes?.find(
                            (item) => item.sizeName === selectedSize
                          )?.priceAdjustment || 0
                        ) +
                        Number(
                          product.colors?.find(
                            (item) => item.colorName === selectedColor
                          )?.priceAdjustment || 0
                        )
                      )} VND
                    </span>
                  )}
                </div>

                {/* Size */}
                {product.sizes && product.sizes.length > 0 && (
                  <div className="mb-3">
                    <h6 className="fw-bold mb-2">Dung lượng:</h6>
                    <div className="d-flex flex-wrap align-items-center" style={{ gap: "8px" }}>
                      {product.sizes
                        .filter((size) => size.isAvailable)
                        .map((size, idx) => (
                          <ToggleButton
                            key={idx}
                            id={`size-${idx}`}
                            type="radio"
                            variant={
                              selectedSize === size.sizeName
                                ? "dark"
                                : "outline-secondary"
                            }
                            name="size"
                            value={size.sizeName}
                            checked={selectedSize === size.sizeName}
                            onChange={(e) =>
                              setSelectedSize(e.currentTarget.value)
                            }
                            className="rounded d-flex align-items-center justify-content-center"
                            style={{
                              width: "auto",
                              minWidth: "74px",
                              height: "40px",
                              padding: "8px 12px",
                              border: "1px solid #ced4da",
                              whiteSpace: "nowrap",
                              fontSize: "14px",
                              lineHeight: "24px",
                            }}
                          >
                            {size.sizeName}
                          </ToggleButton>
                        ))}
                    </div>
                  </div>
                )}

                {/* Color */}
                {product.colors && product.colors.length > 0 && (
                  <div className="mb-3">
                    <h6 className="fw-bold mb-2">
                      Màu:{" "}
                      {selectedColor && (
                        <span className="text-muted fw-normal">
                          ({selectedColor})
                        </span>
                      )}
                    </h6>
                    <div className="d-flex gap-4">
                      {product.colors
                        .filter((color) => color.isAvailable)
                        .map((color, index) => (
                          <div
                            key={index}
                            className={`border rounded-circle position-relative ${
                              selectedColor === color.colorName
                                ? "border-dark border-3"
                                : "border-2"
                            }`}
                            style={{
                              marginRight: "0.4rem",
                              width: "20px",
                              height: "20px",
                              backgroundColor:
                                colorMapping[color.colorName] || "#ccc",
                              cursor: "pointer",
                            }}
                            onClick={() => {
                              setSelectedColor(color.colorName);
                            }}
                          />
                        ))}
                    </div>
                  </div>
                )}

                {/* Quantity */}
                {product.countInStock > 0 && (
                  <div className="mb-4">
                    <Row className="align-items-center">
                      <Col xs={3} className="d-flex align-items-center">
                        <h6 className="fw-bold mb-0 me-3">Số lượng</h6>
                      </Col>
                      <Col xs={6} className="d-flex align-items-start">
                        <div
                          className="d-flex align-items-center border rounded"
                          style={{
                            width: "fit-content",
                            backgroundColor: "#ffffff",
                            border: "1px solid #eeeeee",
                          }}
                        >
                          <button
                            type="button"
                            className="btn btn-outline-secondary border-0 px-3 py-2"
                            onClick={() => setQty(qty > 1 ? qty - 1 : 1)}
                            style={{
                              fontSize: "16px",
                              lineHeight: "1",
                              minWidth: "40px",
                              fontWeight: "bold",
                            }}
                          >
                            -
                          </button>
                          <span
                            className="px-3 py-2 border-start border-end text-center"
                            style={{
                              minWidth: "40px",
                              fontSize: "15px",
                              backgroundColor: "#f8f9fa",
                            }}
                          >
                            {qty}
                          </span>
                          <button
                            type="button"
                            className="btn btn-outline-secondary border-0 px-3 py-2"
                            onClick={() =>
                              setQty(qty < product.countInStock ? qty + 1 : qty)
                            }
                            style={{
                              fontSize: "16px",
                              lineHeight: "1",
                              minWidth: "40px",
                              fontWeight: "bold",
                            }}
                          >
                            +
                          </button>
                        </div>
                      </Col>
                    </Row>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="d-flex gap-2 mb-4">
                  <Button
                    variant="primary"
                    onClick={buyNowHandler}
                    disabled={
                      product.countInStock === 0 ||
                      !selectedColor ||
                      !selectedSize ||
                      !isVariantAvailable(selectedColor, selectedSize)
                    }
                    style={{
                      borderRadius: "8px",
                      marginRight: "1rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      maxWidth: "200px",
                      width: "100%",
                      height: "100%",
                      maxHeight: "40px",
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.textDecoration = "underline";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.textDecoration = "none";
                    }}
                  >
                    MUA NGAY
                  </Button>
                  <Button
                    variant="outline-primary"
                    onClick={addToCartHandler}
                    disabled={
                      product.countInStock === 0 ||
                      !selectedColor ||
                      !selectedSize ||
                      !isVariantAvailable(selectedColor, selectedSize)
                    }
                    style={{
                      borderRadius: "8px",
                      border: "solid 1px #000000",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      maxWidth: "200px",
                      width: "100%",
                      height: "100%",
                      maxHeight: "40px",
                      transition: "all 0.2s ease",
                      backgroundColor: "transparent",
                      color: "#000000",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.textDecoration = "underline";
                      e.target.style.backgroundColor = "#e6e6e6";
                      e.target.style.color = "black";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.textDecoration = "none";
                      e.target.style.backgroundColor = "transparent";
                      e.target.style.color = "black";
                    }}
                  >
                    THÊM VÀO GIỎ
                  </Button>
                </div>

                <div className="product-purchase-commitment" role="note">
                  ⚡ Giao hàng hỏa tốc trong 2 giờ - Bảo hành chính hãng 12 tháng - Lỗi 1 đổi 1 trong 30 ngày
                </div>

                <Card className="border-0 shadow-sm mb-4">
                  <Card.Body>
                    <h6 className="fw-bold mb-2">Còn hàng tại chi nhánh</h6>
                    <Form.Control
                      as="select"
                      aria-label="Chọn chi nhánh"
                      value={selectedBranch}
                      onChange={(event) => setSelectedBranch(event.target.value)}
                    >
                      {[
                        "Quận Gò Vấp",
                        "Quận 1",
                        "Thủ Đức",
                        "Quận 3",
                        "Quận Tân Bình",
                      ].map((branch) => (
                        <option key={branch} value={branch}>
                          {branch}
                        </option>
                      ))}
                    </Form.Control>
                    <p className="mt-2 mb-1">
                      {product.countInStock > 0
                        ? `Ước tính còn ${product.countInStock} sản phẩm tại ${selectedBranch}`
                        : `Tạm hết hàng tại ${selectedBranch}`}
                    </p>
                    <small className="text-muted">
                      Số lượng minh họa theo tồn kho toàn hệ thống, chưa phải tồn
                      thực tế của chi nhánh.
                    </small>
                  </Card.Body>
                </Card>

                <Card className="border-0 shadow-sm mb-4">
                  <Card.Body>
                    <h6 className="fw-bold mb-3">Mua kèm giá sốc</h6>
                    {bundleProducts.length === 0 ? (
                      <p className="text-muted mb-0">
                        {productListError
                          ? "Không tải được danh sách phụ kiện."
                          : "Đang tải danh sách phụ kiện..."}
                      </p>
                    ) : (
                      <>
                        <div className="d-grid gap-2">
                          {bundleProducts.map(({ label, product: item }) => (
                            <Form.Check
                              key={item._id}
                              type="checkbox"
                              id={`bundle-${item._id}`}
                              disabled={item.countInStock <= 0}
                              checked={selectedBundleIds.includes(item._id)}
                              onChange={(event) => {
                                const checked = event.target.checked;
                                setSelectedBundleIds((current) =>
                                  checked
                                    ? [...current, item._id]
                                    : current.filter((id) => id !== item._id)
                                )
                              }}
                              label={
                                <span>
                                  {label}{" "}
                                  <span className="text-muted text-decoration-line-through">
                                    {formatVND(item.currentPrice || item.price)}₫
                                  </span>{" "}
                                  <strong>{formatVND(getBundlePrice(item))}₫</strong>
                                  <small className="text-danger ms-1">-15%</small>
                                </span>
                              }
                            />
                          ))}
                        </div>
                        <Button
                          className="mt-3"
                          variant="outline-danger"
                          disabled={
                            selectedBundleProducts.length === 0 ||
                            addingBundle ||
                            product.countInStock <= 0
                          }
                          onClick={addBundleToCartHandler}
                        >
                          {addingBundle ? "Đang thêm..." : "Thêm combo vào giỏ"}
                        </Button>
                        {bundleError && (
                          <p className="text-danger small mt-2 mb-0" role="alert">
                            {bundleError}
                          </p>
                        )}
                      </>
                    )}
                  </Card.Body>
                </Card>

                <Card className="border-0 shadow-sm mb-4">
                  <Card.Body>
                    <h6 className="fw-bold mb-3">Ưu đãi & công cụ</h6>
                    <div className="d-grid gap-2">
                      <Link className="btn btn-outline-danger" to={`/trade-in?product=${product._id}&offer=2000000`}>
                        Thu cũ đổi mới - Trợ giá 2 triệu*
                      </Link>
                      <Link className="btn btn-outline-dark" to={`/compare?brand=${product.category}&p1=${product._id}`}>
                        So sánh với máy khác
                      </Link>
                    </div>
                    <small className="d-block text-muted mt-2">*Ưu đãi minh họa; điều kiện và giá thu máy cần xác nhận tại cửa hàng.</small>
                  </Card.Body>
                </Card>

                <Card className="border-0 shadow-sm mb-4">
                  <Card.Body>
                    <h6 className="fw-bold">Ước tính trả góp 0%</h6>
                    <Form.Group className="mb-3">
                      <Form.Label>Trả trước: {downPayment}% ({formatVND(getVariantPrice() * downPayment / 100)}₫)</Form.Label>
                      <Form.Control type="range" min="20" max="70" step="10" value={downPayment} onChange={(event) => setDownPayment(Number(event.target.value))} />
                    </Form.Group>
                    <Form.Group>
                      <Form.Label>Kỳ hạn</Form.Label>
                      <Form.Control as="select" value={installmentMonths} onChange={(event) => setInstallmentMonths(Number(event.target.value))}>
                        {[6, 9, 12].map((months) => <option key={months} value={months}>{months} tháng</option>)}
                      </Form.Control>
                    </Form.Group>
                    <p className="mt-3 mb-0">Ước tính mỗi tháng: <strong>{formatVND(getVariantPrice() * (1 - downPayment / 100) / installmentMonths)}₫</strong></p>
                    <small className="text-muted">Ước tính lãi suất 0%, chưa bao gồm phí/điều kiện của đơn vị tài chính.</small>
                  </Card.Body>
                </Card>

                {product.specifications && (
                  <Card className="border-0 shadow-sm mb-4">
                    <Card.Body>
                      <h6 className="fw-bold">Thông số kỹ thuật</h6>
                      <Table size="sm" responsive className="mb-0">
                        <tbody>
                          {[
                            ["Màn hình", "screen"],
                            ["Chip", "chip"],
                            ["RAM", "ram"],
                            ["Bộ nhớ", "storage"],
                            ["Camera", "camera"],
                            ["Pin/Sạc", "battery"],
                          ].map(([label, key]) => (
                            <tr key={key}><th>{label}</th><td>{product.specifications[key] || "-"}</td></tr>
                          ))}
                        </tbody>
                      </Table>
                    </Card.Body>
                  </Card>
                )}

                {/* Product Description */}
                <div className="mb-4">
                  <h6 className="fw-bold mb-2">Thông tin sản phẩm:</h6>
                  <p>{product.description}</p>
                </div>
              </div>
            </Col>
          </Row>

          {/* Other Products */}
          {product && (
            <Row>
              <Col>
                <h2 className="fw-bold mb-4 text-center">CÁC SẢN PHẨM KHÁC</h2>
                <div
                  className="d-flex gap-3 pb-3"
                  style={{
                    overflowX: "auto",
                    scrollBehavior: "smooth",
                    WebkitOverflowScrolling: "touch", // For smooth scrolling on iOS
                  }}
                >
                  {products
                    .filter(
                      (p) =>
                        p.category === product.category &&
                        p._id !== product._id &&
                        p.isActive // Only show active products
                    )
                    .map((p) => (
                      <div
                        key={p._id}
                        style={{ minWidth: "200px", margin: "1rem" }}
                      >
                        <ProductCard product={p} />
                      </div>
                    ))}
                </div>
                {products.filter(
                  (p) =>
                    p.category === product.category &&
                    p._id !== product._id &&
                    p.isActive
                ).length === 0 && (
                  <p className="text-muted">
                    Không có sản phẩm cùng danh mục khác.
                  </p>
                )}
              </Col>
            </Row>
          )}
          {recentProducts.length > 0 && (
            <section className="mt-5">
              <h2 className="fw-bold mb-3">Sản phẩm đã xem</h2>
              <div className="recent-products-row">
                {recentProducts.map((item) => (
                  <Link key={item._id} to={`/product/${item._id}`} className="recent-product-card">
                    <img src={item.image} alt="" onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = "/images/phones/commons-google-pixel-8pro.jpg"; }} />
                    <span>{item.name}</span>
                  </Link>
                ))}
              </div>
            </section>
          )}
          <Modal show={zoomOpen} onHide={() => setZoomOpen(false)} centered size="lg">
            <Modal.Body className="p-2 text-center">
              <Image src={selectedImage || product.image} alt={product.name} className="product-gallery-zoom" />
            </Modal.Body>
          </Modal>
        </>
      )}
    </>
  );
};

export default ProductScreen;
