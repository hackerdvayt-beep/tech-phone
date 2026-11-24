import React from "react";
import styled from "styled-components";
import { Carousel } from "react-bootstrap";
import { Link } from "react-router-dom";

const FullWidthWrapper = styled.div`
  width: 100vw;
  margin-left: 50%;
  transform: translateX(-50%);
`;

const StyledCarousel = styled(Carousel)`
  .carousel-item {
    min-height: 520px;
  }
  .carousel-control-prev,
  .carousel-control-next {
    width: 8%;
  }
  .carousel-control-prev-icon,
  .carousel-control-next-icon {
    width: 2.5rem;
    height: 2.5rem;
    padding: 1rem;
    border-radius: 50%;
    background-color: rgba(15, 23, 42, 0.75);
    background-size: 55%;
  }
  .carousel-indicators [data-bs-target] {
    width: 32px;
    height: 4px;
    border-radius: 99px;
  }
`;

const slides = [
  {
    eyebrow: "Đỉnh cao công nghệ",
    title: "iPhone 18 Pro Max",
    text: "Hiệu năng mạnh mẽ, trải nghiệm cao cấp mỗi ngày.",
    price: "Từ 44.990.000₫",
    image: "/images/tech/iphone-18-pro.png",
    category: "apple",
    background: "linear-gradient(120deg, #f8fafc, #e2e8f0)",
  },
  {
    eyebrow: "Màn hình lớn, trải nghiệm lớn",
    title: "Samsung Galaxy S26 Ultra",
    text: "Khám phá thế hệ Galaxy mới tại TECH PHONE.",
    price: "Từ 44.990.000₫",
    image: "/images/phones/commons-samsung-galaxy-s25-ultra-back.jpg",
    category: "samsung",
    background: "linear-gradient(120deg, #eef2ff, #dbeafe)",
  },
  {
    eyebrow: "Nhiếp ảnh flagship",
    title: "Xiaomi 17 Ultra",
    text: "Lựa chọn mới cho người yêu công nghệ và nhiếp ảnh.",
    price: "Từ 39.990.000₫",
    image: "/images/phones/commons-xiaomi-14t-pro.jpg",
    category: "xiaomi",
    background: "linear-gradient(120deg, #fff7ed, #ffedd5)",
  },
];

const Banner = () => (
  <FullWidthWrapper>
    <StyledCarousel interval={5000} pause="hover" aria-label="Sản phẩm nổi bật">
      {slides.map((slide) => (
        <Carousel.Item key={slide.title}>
          <div className="hero-slide" style={{ background: slide.background }}>
            <div className="hero-copy">
              <span className="hero-eyebrow">{slide.eyebrow}</span>
              <h1>{slide.title}</h1>
              <p>{slide.text}</p>
              <strong>{slide.price}</strong>
              <Link className="btn btn-dark hero-cta" to={`/products?category=${slide.category}`}>
                Mua ngay
              </Link>
            </div>
            <div className="hero-art">
              <img
                src={slide.image}
                alt={slide.title}
                onError={(event) => {
                  event.currentTarget.onerror = null;
                  event.currentTarget.src = "/images/phones/commons-google-pixel-8pro.jpg";
                }}
              />
            </div>
          </div>
        </Carousel.Item>
      ))}
    </StyledCarousel>
  </FullWidthWrapper>
);

export { Banner, StyledCarousel, FullWidthWrapper };
