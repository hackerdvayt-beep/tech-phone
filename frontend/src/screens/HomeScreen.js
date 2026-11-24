/* Luna: HomeScreen 

k1en: Vài components được sử dụng trong đây sử dụng static path
*/
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Row, Col, Container, Pagination, Form } from "react-bootstrap";
import Message from "../components/Message";
import Loader from "../components/Loader";
import { Banner } from "../components/Banner";
import NewCollectionBanner from "../components/NewCollectionBanner";
import CategoryBar from "../components/CategoryBar";
import CategoryGrid from "../components/CategoryGrid";
import { listProducts } from "../actions/productActions";
import OnlyOnline from "../components/OnlyOnline";
import ProductCard from "../components/ProductCard";
import SmartPhoneFinder from "../components/SmartPhoneFinder";
import { filterAndSortProducts } from "../utils/productDiscovery";

const HomeScreen = () => {
  const dispatch = useDispatch();
  const [activeCategory, setActiveCategory] = useState("all");
  const [page, setPage] = useState(1);
  const [discoveryFilters, setDiscoveryFilters] = useState({
    priceRange: "all",
    need: "all",
    sortBy: "featured",
  });

  const productList = useSelector((state) => state.productList);
  const { loading, error, products } = productList;

  useEffect(() => {
    dispatch(listProducts());
  }, [dispatch]);

  const handleCategoryGridSelect = (category) => {
    setActiveCategory(category);
    // Cuộn mượt đến phần sản phẩm
    const productsSection = document.getElementById("products-section");
    if (productsSection) {
      productsSection.scrollIntoView({ behavior: "smooth" });
    }
  };
  // Helper function to get category label for display
  const getCategoryLabel = (category) => {
    const categoryMap = {
      all: "Tất cả",
      apple: "Apple",
      samsung: "Samsung",
      xiaomi: "Xiaomi",
      oppo: "OPPO",
      google: "Google",
      accessory: "Phụ kiện",
      "sale-off": "Giảm giá",
    };
    return categoryMap[category] || category;
  };

  const handleCategoryChange = (category) => {
    setActiveCategory(category);
    setPage(1);
  };

  const featuredOrder = [
    "iPhone 18 Pro Max",
    "Samsung Galaxy S26 Ultra",
    "Xiaomi 17 Ultra",
    "Samsung Galaxy S26+",
    "iPhone 18 Pro",
    "iPhone Air",
    "Xiaomi 17 Pro",
    "Samsung Galaxy Z Fold8",
    "Samsung Galaxy Z Flip8",
    "iPhone 17",
    "iPhone 17e",
    "Redmi Note 15 Pro+",
    "OPPO Find X9 Pro",
    "OPPO Reno15",
    "Google Pixel 11 Pro XL",
    "iPhone Duo",
    "Samsung Galaxy A57 5G",
    "AirPods Pro 3",
    "Apple Watch Series 12",
    "Samsung Galaxy Watch9",
    "Sạc nhanh GaN 65W",
    "Ốp lưng MagSafe",
  ];
  const filteredProducts = filterAndSortProducts(products, {
    category: activeCategory,
    ...discoveryFilters,
    featuredOrder,
  });
  const handleDiscoveryFilterChange = (event) => {
    const { name, value } = event.target;
    setDiscoveryFilters((current) => ({
      ...current,
      [name]: value,
    }));
    setPage(1);
  };
  const productsPerPage = 8;
  const pageCount = Math.max(1, Math.ceil(filteredProducts.length / productsPerPage));
  const pageProducts = filteredProducts.slice((page - 1) * productsPerPage, page * productsPerPage);

  return (
    <Container fluid className="px-0">
      <Banner />

      <Container className="mt-4">
        {/*New Collection Section */}
        <NewCollectionBanner />
        <div className="my-4">
          <SmartPhoneFinder products={products || []} />
        </div>
        {/* Category Grid Section */}
        {loading ? (
          <div className="text-center py-5">
            <Loader />
          </div>
        ) : error ? (
          <Message variant="danger">{error}</Message>
        ) : (
          <CategoryGrid
            products={products || []}
            onCategorySelect={handleCategoryGridSelect}
          />
        )}

        <CategoryBar
          activeCategory={activeCategory}
          onCategoryChange={handleCategoryChange}
        />

        <div className="home-product-filters" aria-label="Lọc và sắp xếp sản phẩm">
          <Form.Control
            as="select"
            name="priceRange"
            aria-label="Lọc theo khoảng giá"
            value={discoveryFilters.priceRange}
            onChange={handleDiscoveryFilterChange}
          >
            <option value="all">Mọi khoảng giá</option>
            <option value="under15">Dưới 15 triệu</option>
            <option value="from15to30">15 - 30 triệu</option>
            <option value="over30">Trên 30 triệu</option>
          </Form.Control>
          <Form.Control
            as="select"
            name="need"
            aria-label="Lọc theo nhu cầu"
            value={discoveryFilters.need}
            onChange={handleDiscoveryFilterChange}
          >
            <option value="all">Mọi nhu cầu</option>
            <option value="gaming">Chơi game</option>
            <option value="photography">Chụp ảnh</option>
            <option value="battery">Pin trâu</option>
            <option value="folding">Màn hình gập</option>
          </Form.Control>
          <Form.Control
            as="select"
            name="sortBy"
            aria-label="Sắp xếp sản phẩm"
            value={discoveryFilters.sortBy}
            onChange={handleDiscoveryFilterChange}
          >
            <option value="featured">Nổi bật</option>
            <option value="price-asc">Giá thấp đến cao</option>
            <option value="price-desc">Giá cao đến thấp</option>
            <option value="discount">Giảm giá sâu</option>
          </Form.Control>
        </div>

        {loading ? (
          <Loader />
        ) : error ? (
          <Message variant="danger">{error}</Message>
        ) : (
          <>
            <Row className="mt-4">
              {filteredProducts.length > 0 ? (
                pageProducts.map((product) => (
                  <Col key={product._id} xs={6} md={4} lg={3} className="mb-3">
                    <ProductCard product={product} />{" "}
                    {/* Use ProductCard instead of Product */}
                  </Col>
                ))
              ) : (
                <Col>
                  <Message variant="info">
                    {activeCategory === "sale-off"
                      ? "Hiện tại không có sản phẩm nào đang được giảm giá"
                      : `Không có sản phẩm nào trong danh mục ${getCategoryLabel(
                          activeCategory
                        )}`}
                  </Message>
                </Col>
              )}
            </Row>
            {pageCount > 1 && (
              <Pagination className="justify-content-center mt-3">
                <Pagination.Prev disabled={page === 1} onClick={() => setPage(page - 1)} />
                {Array.from({ length: pageCount }, (_, index) => (
                  <Pagination.Item key={index + 1} active={page === index + 1} onClick={() => setPage(index + 1)}>
                    {index + 1}
                  </Pagination.Item>
                ))}
                <Pagination.Next disabled={page === pageCount} onClick={() => setPage(page + 1)} />
              </Pagination>
            )}
          </>
        )}
      </Container>
      {/* Last part just for looking good */}

      <OnlyOnline></OnlyOnline>
    </Container>
  );
};

export default HomeScreen;
