import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Card, Col, Form, Row, Button, Table } from "react-bootstrap";

const formatVND = (price) =>
  new Intl.NumberFormat("vi-VN").format(Number(price || 0));

const CompareScreen = ({ location }) => {
  const query = new URLSearchParams(location.search);
  const requestedIds = (query.get("ids") || "").split(",").filter(Boolean);
  const fromQuickCompare = requestedIds.length > 0;
  const [brand, setBrand] = useState(query.get("brand") || "apple");
  const [products, setProducts] = useState([]);
  const [selected, setSelected] = useState([
    requestedIds[0] || query.get("p1") || "",
    requestedIds[1] || query.get("p2") || "",
    requestedIds[2] || "",
  ]);

  useEffect(() => {
    axios
      .get("/api/products")
      .then(({ data }) => setProducts(Array.from(data)))
      .catch(() => setProducts([]));
  }, []);

  const filtered = useMemo(
    () => fromQuickCompare ? products : products.filter((product) => product.category === brand),
    [products, brand, fromQuickCompare]
  );

  const chosen = selected
    .map((id) => products.find((product) => product._id === id))
    .filter(Boolean);

  const handleBrandChange = (nextBrand) => {
    setBrand(nextBrand);
    setSelected(["", "", ""]);
  };

  const handleProductChange = (index, id) => {
    setSelected((previous) => {
      const next = [...previous];
      next[index] = id;
      return next;
    });
  };

  return (
    <div className="py-3">
      <h1 className="text-center fw-bold mb-4">
        So sánh điện thoại
      </h1>

      <Card className="border-0 shadow-sm mb-4">
        <Card.Body className="p-4">
          <Row className="g-3">
            <Col md={3}>
              <Form.Group>
                <Form.Label>Hệ điều hành</Form.Label>
                <Form.Control
                  as="select"
                  value={brand}
                  onChange={(e) => handleBrandChange(e.target.value)}
                  style={{ height: "48px" }}
                >
                  <option value="apple">iPhone</option>
                  <option value="samsung">Samsung</option>
                  <option value="xiaomi">Xiaomi</option>
                  <option value="oppo">OPPO</option>
                  <option value="google">Google</option>
                </Form.Control>
              </Form.Group>
            </Col>
            {[0, 1, 2].map((index) => (
              <Col md={4.5} key={index}>
                <Form.Group>
                  <Form.Label>Sản phẩm {index + 1}</Form.Label>
                  <Form.Control
                    as="select"
                    value={selected[index]}
                    onChange={(e) =>
                      handleProductChange(index, e.target.value)
                    }
                    style={{ height: "48px" }}
                  >
                    <option value="">Chọn sản phẩm</option>
                    {filtered.map((product) => (
                      <option key={product._id} value={product._id}>
                        {product.name}
                      </option>
                    ))}
                  </Form.Control>
                </Form.Group>
              </Col>
            ))}
          </Row>
        </Card.Body>
      </Card>

      {chosen.length > 0 ? (
        <Row className="g-3">
          {chosen.map((product) => (
            <Col md={12 / chosen.length} key={product._id}>
              <Card className="border-0 shadow-sm h-100 text-center">
                <Card.Img
                  src={product.image}
                  style={{
                    height: "260px",
                    objectFit: "contain",
                    padding: "20px",
                  }}
                  onError={(event) => {
                    event.currentTarget.onerror = null;
                    event.currentTarget.src = "/images/phones/commons-google-pixel-8pro.jpg";
                  }}
                />
                <Card.Body>
                  <h5 className="fw-bold">{product.name}</h5>
                  <h4 className="fw-bold">
                    {formatVND(product.price)} VND
                  </h4>
                  <div className="text-muted mb-2">
                    {product.sizes?.map((size) => size.sizeName).join(" • ") ||
                      "Standard"}
                  </div>
                  <div className="text-muted">
                    Tồn kho: {product.countInStock}
                  </div>
                  <Button
                    variant="outline-danger"
                    href={`/product/${product._id}`}
                    className="mt-3"
                  >
                    Xem sản phẩm
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        <Card className="border-0 shadow-sm text-center p-5 text-muted">
          Chọn ít nhất một sản phẩm để so sánh
        </Card>
      )}

      {chosen.length > 1 && (
        <Card className="border-0 shadow-sm mt-4">
          <Card.Body>
            <h5 className="fw-bold mb-3">Thông số nhanh</h5>
            <Table responsive bordered className="mb-0 text-center">
              <thead>
                <tr>
                  <th>Thông số</th>
                  {chosen.map((product) => (
                    <th key={product._id}>{product.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Giá từ</td>
                  {chosen.map((product) => (
                    <td key={product._id}>
                      {formatVND(product.price)} VND
                    </td>
                  ))}
                </tr>
                <tr>
                  <td>Dung lượng</td>
                  {chosen.map((product) => (
                    <td key={product._id}>
                      {product.sizes
                        ?.map((size) => size.sizeName)
                        .join(", ") || "Standard"}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td>Màu sắc</td>
                  {chosen.map((product) => (
                    <td key={product._id}>
                      {product.colors
                        ?.map((color) => color.colorName)
                        .join(", ") || "-"}
                    </td>
                  ))}
                </tr>
                {["screen", "chip", "ram", "storage", "camera", "battery"].map((key) => (
                  <tr key={key}>
                    <td>{({ screen: "Màn hình", chip: "Chip", ram: "RAM", storage: "Bộ nhớ", camera: "Camera", battery: "Pin/Sạc" })[key]}</td>
                    {chosen.map((product) => (
                      <td key={product._id}>{product.specifications?.[key] || "-"}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}
    </div>
  );
};

export default CompareScreen;
