import React from "react";
import { Container, Row, Col } from "react-bootstrap";

const Footer = () => (
  <footer className="bg-light text-dark py-4">
    <Container>
      <Row>
        <Col md={3} sm={6} xs={12} className="mb-3">
          <h6 className="fw-bold mb-3">Liên hệ</h6>
          <p className="mb-1"><small>Hotline: 1800 1234</small></p>
          <p className="mb-1"><small>Email: support@techphone.vn</small></p>
        </Col>
        <Col md={3} sm={6} xs={12} className="mb-3">
          <h6 className="fw-bold mb-3">Sản phẩm</h6>
          <p className="mb-1"><small>iPhone chính hãng</small></p>
          <p className="mb-1"><small>Samsung Galaxy</small></p>
          <p className="mb-1"><small>Phụ kiện công nghệ</small></p>
        </Col>
        <Col md={3} sm={6} xs={12} className="mb-3">
          <h6 className="fw-bold mb-3">Hỗ trợ</h6>
          <p className="mb-1"><small>Chính sách bảo hành</small></p>
          <p className="mb-1"><small>Đổi trả trong 7 ngày</small></p>
          <p className="mb-1"><small>Hướng dẫn mua hàng</small></p>
        </Col>
        <Col md={3} sm={6} xs={12} className="mb-3">
          <h6 className="fw-bold mb-3">TECH PHONE</h6>
          <p className="small mb-0">Hệ thống điện thoại và phụ kiện chính hãng.</p>
        </Col>
      </Row>
      <Row className="border-top pt-3 mt-3">
        <Col className="text-center">
          <small>Copyright &copy; TECH PHONE</small>
        </Col>
      </Row>
    </Container>
  </footer>
);

export default Footer;
