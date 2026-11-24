import React, { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { Card, Col, Form, Row, Button, Alert } from "react-bootstrap";

const tradeInDevices = {
  iPhone: [
    { name: "iPhone 18 Pro Max", price: 38990000 },
    { name: "iPhone 18 Pro", price: 34990000 },
    { name: "iPhone Duo", price: 64999000 },
    { name: "iPhone 17 Pro Max", price: 34990000 },
    { name: "iPhone 17", price: 28999000 },
    { name: "iPhone 16", price: 22990000 },
    { name: "iPhone 15", price: 17990000 },
  ],
  Samsung: [
    { name: "Galaxy Z Fold8", price: 46990000 },
    { name: "Galaxy Z Flip8", price: 31990000 },
    { name: "Galaxy S26 Ultra", price: 36990000 },
    { name: "Galaxy S26+", price: 26990000 },
    { name: "Galaxy S25 Ultra", price: 28990000 },
    { name: "Galaxy Z Fold6", price: 32990000 },
  ],
};

const conditions = [
  { key: "excellent", label: "Máy đẹp như mới", percent: 0.75 },
  { key: "good", label: "Máy sử dụng tốt", percent: 0.62 },
  { key: "scratched", label: "Trầy xước nhẹ", percent: 0.48 },
  { key: "damaged", label: "Màn hình/máy có hư hỏng", percent: 0.28 },
];

const formatVND = (value) =>
  new Intl.NumberFormat("vi-VN").format(Math.round(value || 0));

const TradeInScreen = () => {
  const location = useLocation();
  const requestedBonus = Number(new URLSearchParams(location.search).get("offer")) || 0;
  const tradeInBonus = Math.min(requestedBonus, 2000000);
  const [brand, setBrand] = useState("iPhone");
  const [model, setModel] = useState(tradeInDevices.iPhone[0].name);
  const [newBrand, setNewBrand] = useState("iPhone");
  const [newModel, setNewModel] = useState(tradeInDevices.iPhone[1].name);
  const [newStorage, setNewStorage] = useState("256GB");
  const [condition, setCondition] = useState("excellent");
  const [storage, setStorage] = useState("256GB");

  const devices = tradeInDevices[brand];

  const selectedDevice = useMemo(
    () => devices.find((device) => device.name === model) || devices[0],
    [devices, model]
  );

  const selectedCondition =
    conditions.find((item) => item.key === condition) || conditions[0];

  const storageAdjustment =
    storage === "1TB" ? 1.12 : storage === "512GB" ? 1.06 : 1;

  const estimatedValue =
    selectedDevice.price * selectedCondition.percent * storageAdjustment;

  const newDevices = tradeInDevices[newBrand];
  const selectedNewDevice =
    newDevices.find((device) => device.name === newModel) || newDevices[0];
  const newStorageAdjustment =
    newStorage === "1TB" ? 1.12 : newStorage === "512GB" ? 1.06 : 1;
  const newPrice =
    selectedNewDevice.price * newStorageAdjustment;
  const amountToPay = Math.max(0, newPrice - estimatedValue - tradeInBonus);

  const handleNewBrandChange = (nextBrand) => {
    setNewBrand(nextBrand);
    setNewModel(tradeInDevices[nextBrand][0].name);
  };

  const handleBrandChange = (nextBrand) => {
    setBrand(nextBrand);
    setModel(tradeInDevices[nextBrand][0].name);
  };

  return (
    <div className="py-3">
      <h1 className="text-center fw-bold mb-4">Thu cũ đổi mới</h1>
      <Alert variant="info" className="text-center">
        Mức giá chỉ mang tính tham khảo; kiểm tra thực tế có thể thay đổi.
      </Alert>

      <Row className="g-4">
        <Col lg={7}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-4">
              <h5 className="fw-bold mb-3">Thông tin máy cũ</h5>

              <Form.Group className="mb-3">
                <Form.Label>Thương hiệu</Form.Label>
                <Form.Control
                  as="select"
                  value={brand}
                  onChange={(e) => handleBrandChange(e.target.value)}
                  style={{ height: "48px" }}
                >
                  <option value="iPhone">iPhone</option>
                  <option value="Samsung">Samsung</option>
                </Form.Control>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Dòng máy</Form.Label>
                <Form.Control
                  as="select"
                  value={selectedDevice.name}
                  onChange={(e) => setModel(e.target.value)}
                  style={{ height: "48px" }}
                >
                  {devices.map((device) => (
                    <option key={device.name} value={device.name}>
                      {device.name}
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Dung lượng</Form.Label>
                <Form.Control
                  as="select"
                  value={storage}
                  onChange={(e) => setStorage(e.target.value)}
                  style={{ height: "48px" }}
                >
                  <option value="128GB">128GB</option>
                  <option value="256GB">256GB</option>
                  <option value="512GB">512GB</option>
                  <option value="1TB">1TB</option>
                </Form.Control>
              </Form.Group>

              <Form.Group>
                <Form.Label>Tình trạng máy</Form.Label>
                {conditions.map((item) => (
                  <Form.Check
                    key={item.key}
                    type="radio"
                    name="condition"
                    id={`condition-${item.key}`}
                    label={item.label}
                    checked={condition === item.key}
                    onChange={() => setCondition(item.key)}
                    className="mb-2"
                  />
                ))}
              </Form.Group>

              <hr className="my-4" />
              <h5 className="fw-bold mb-3">Máy mới muốn đổi sang</h5>

              <Form.Group className="mb-3">
                <Form.Label>Thương hiệu máy mới</Form.Label>
                <Form.Control
                  as="select"
                  value={newBrand}
                  onChange={(e) => handleNewBrandChange(e.target.value)}
                  style={{ height: "48px" }}
                >
                  <option value="iPhone">iPhone</option>
                  <option value="Samsung">Samsung</option>
                </Form.Control>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Dòng máy mới</Form.Label>
                <Form.Control
                  as="select"
                  value={selectedNewDevice.name}
                  onChange={(e) => setNewModel(e.target.value)}
                  style={{ height: "48px" }}
                >
                  {newDevices.map((device) => (
                    <option key={device.name} value={device.name}>
                      {device.name}
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>

              <Form.Group>
                <Form.Label>Dung lượng máy mới</Form.Label>
                <Form.Control
                  as="select"
                  value={newStorage}
                  onChange={(e) => setNewStorage(e.target.value)}
                  style={{ height: "48px" }}
                >
                  <option value="128GB">128GB</option>
                  <option value="256GB">256GB</option>
                  <option value="512GB">512GB</option>
                  <option value="1TB">1TB</option>
                </Form.Control>
              </Form.Group>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={5}>
          <Card className="border-0 shadow-sm sticky-top" style={{ top: "96px" }}>
            <Card.Body className="p-4 text-center">
              <small className="text-muted">Giá thu cũ tham khảo</small>
              <h2 className="fw-bold my-3">
                {formatVND(estimatedValue)} VND
              </h2>
              <div className="text-start border-top border-bottom py-3 mb-3">
                <div className="d-flex justify-content-between mb-2">
                  <span>Máy cũ</span>
                  <strong>{brand} {selectedDevice.name}</strong>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Máy mới</span>
                  <strong>{newBrand} {selectedNewDevice.name}</strong>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Giá máy mới</span>
                  <strong>{formatVND(newPrice)} VND</strong>
                </div>
                <div className="d-flex justify-content-between">
                  <span>Giá trừ máy cũ</span>
                  <strong>-{formatVND(estimatedValue)} VND</strong>
                </div>
                {tradeInBonus > 0 && (
                  <div className="d-flex justify-content-between text-success mt-2">
                    <span>Trợ giá theo ưu đãi</span>
                    <strong>-{formatVND(tradeInBonus)} VND</strong>
                  </div>
                )}
              </div>
              <small className="text-muted d-block">Số tiền cần bù</small>
              <h3 className="fw-bold text-danger my-2">
                {formatVND(amountToPay)} VND
              </h3>
              <Button
                variant="dark"
                className="w-100"
                onClick={() => window.alert("Vui lòng mang máy đến cửa hàng để kiểm tra thực tế")}
              >
                Nhận tư vấn đổi máy
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default TradeInScreen;
