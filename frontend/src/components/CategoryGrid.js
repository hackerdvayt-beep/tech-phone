import React from "react";
import { Row, Col, Card } from "react-bootstrap";

const categoryImages = {
  apple: "/images/tech/iphone-duo.png",
  samsung: "/images/categories/category-samsung.png",
  xiaomi: "/images/categories/category-xiaomi.png",
  oppo: "/images/categories/category-oppo.png",
  google: "/images/categories/category-google.png",
  accessory: "/images/tech/airpods.jpg",
};

const CategoryGrid = ({ onCategorySelect }) => {
  const categories = [
    { key: "apple", label: "Apple" },
    { key: "samsung", label: "Samsung" },
    { key: "xiaomi", label: "Xiaomi" },
    { key: "oppo", label: "OPPO" },
    { key: "google", label: "Google" },
    { key: "accessory", label: "Phụ Kiện" },
  ];

  return (
    <div className="my-5">
      <h1 className="fw-bold text-center">ĐA DẠNG BỘ SƯU TẬP</h1>

      <Row className="g-3 category-grid-row">
        {categories.map((category) => (
          <Col key={category.key} xs={6} sm={4} lg={2}>
            <Card
              className="category-card h-100 border-0 "
              onClick={() => onCategorySelect && onCategorySelect(category.key)}
              style={{
                cursor: "pointer",
                width: "100%",
                maxWidth: "360px",
                margin: "0 auto",
              }}
            >
              <div className="category-image-wrapper">
                <Card.Img
                  variant="top"
                  src={categoryImages[category.key]}
                  alt={category.label}
                  className={`category-image ${category.key === "apple" ? "category-image--apple" : ""}`}
                  onError={(event) => {
                    event.currentTarget.onerror = null;
                    event.currentTarget.src = "/images/tech/iphone-18-pro.png";
                  }}
                />
              </div>

              <Card.Body className="text-center border-0 p-3">
                <Card.Title className="category-name mb-1">
                  {category.label.toUpperCase()}
                </Card.Title>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default CategoryGrid;
