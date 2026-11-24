import React, { useMemo, useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import { Link } from "react-router-dom";

const SmartPhoneFinder = ({ products = [] }) => {
  const [show, setShow] = useState(false);
  const [budget, setBudget] = useState("45000000");
  const [need, setNeed] = useState("camera");
  const [os, setOs] = useState("any");

  const suggestions = useMemo(() => {
    const needsAccessory = (product) => product.category !== "accessory";
    const withinBudget = products.filter(
      (product) =>
        product.isActive &&
        needsAccessory(product) &&
        product.price <= Number(budget) &&
        (os === "any" ||
          (os === "ios" && product.category === "apple") ||
          (os === "android" && product.category !== "apple"))
    );
    const keywordMap = {
      camera: "camera",
      gaming: "chip",
      battery: "battery",
      fold: "fold",
    };
    const keyword = keywordMap[need];
    return withinBudget
      .sort((a, b) => {
        const score = (product) => {
          const text = `${product.name} ${product.specifications?.[keyword] || ""}`.toLowerCase();
          return (
            (need === "fold" && /fold|flip|gập|duo/.test(text) ? 2 : 0) +
            (need === "camera" && /camera|leica|hasselblad|200mp|48mp/.test(text) ? 1 : 0) +
            (need === "gaming" && /snapdragon|chip|a20|tensor/.test(text) ? 1 : 0) +
            (need === "battery" && /mah|pin/.test(text) ? 1 : 0)
          );
        };
        return score(b) - score(a) || a.price - b.price;
      })
      .slice(0, 3);
  }, [products, budget, need, os]);

  return (
    <>
      <section className="finder-promo">
        <div className="finder-promo-icon" aria-hidden="true">
          <i className="fas fa-search" />
        </div>
        <div className="finder-promo-copy">
          <strong>Gợi ý chọn máy trong 30 giây</strong>
          <span>Trả lời 3 câu hỏi nhanh để tìm chiếc smartphone chân ái của bạn.</span>
        </div>
        <Button variant="dark" className="finder-trigger" onClick={() => setShow(true)}>
          Bắt đầu
        </Button>
      </section>
      <Modal show={show} onHide={() => setShow(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Chọn điện thoại phù hợp</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Ngân sách tối đa</Form.Label>
            <Form.Control as="select" value={budget} onChange={(event) => setBudget(event.target.value)}>
              <option value="15000000">15 triệu</option>
              <option value="25000000">25 triệu</option>
              <option value="35000000">35 triệu</option>
              <option value="45000000">45 triệu</option>
              <option value="70000000">Không giới hạn</option>
            </Form.Control>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Nhu cầu</Form.Label>
            <Form.Control as="select" value={need} onChange={(event) => setNeed(event.target.value)}>
              <option value="camera">Chụp ảnh</option>
              <option value="gaming">Chơi game</option>
              <option value="battery">Pin trâu</option>
              <option value="fold">Gập thời trang</option>
            </Form.Control>
          </Form.Group>
          <Form.Group>
            <Form.Label>Hệ điều hành</Form.Label>
            <Form.Control as="select" value={os} onChange={(event) => setOs(event.target.value)}>
              <option value="any">Không giới hạn</option>
              <option value="ios">iOS</option>
              <option value="android">Android</option>
            </Form.Control>
          </Form.Group>
          <h6 className="fw-bold mt-4">Gợi ý dành cho bạn</h6>
          {suggestions.length ? suggestions.map((product) => (
            <Link key={product._id} className="finder-result" to={`/product/${product._id}`} onClick={() => setShow(false)}>
              <span>{product.name}</span>
              <strong>{new Intl.NumberFormat("vi-VN").format(product.price)}₫</strong>
            </Link>
          )) : <p className="text-muted mb-0">Chưa có sản phẩm phù hợp với tiêu chí này.</p>}
        </Modal.Body>
      </Modal>
    </>
  );
};

export default SmartPhoneFinder;
