import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { Alert, Button, Form } from "react-bootstrap";
import { getDiscoveryPrice } from "../utils/productDiscovery";

const quickQuestions = [
  "Tư vấn máy chụp ảnh đẹp",
  "Điện thoại pin trâu dưới 15tr",
  "So sánh flagship mới nhất",
  "Chính sách thu cũ đổi mới",
];

const normalizeText = (value) =>
  String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d");

const batteryCapacity = (product) => {
  const value = product.specifications?.battery || "";
  return Number.parseInt(
    value.match(/(\d[\d,]*)\s*mAh/i)?.[1]?.replace(/,/g, "") || 0,
    10
  );
};

const cameraScore = (product) => {
  const camera = normalizeText(product.specifications?.camera);
  const megapixels = Math.max(
    0,
    ...Array.from(camera.matchAll(/(\d+)\s*mp/g), (match) =>
      Number(match[1])
    )
  );
  return (
    megapixels +
    (/leica|hasselblad|telephoto/i.test(camera) ? 100 : 0)
  );
};

const findRecommendations = (question, products) => {
  const text = normalizeText(question);
  const phones = products.filter(
    (product) => product.isActive && product.category !== "accessory"
  );

  if (/thu cu|doi moi|chinh sach/.test(text)) {
    return {
      reply:
        "Bạn có thể xem thông tin chương trình thu cũ đổi mới tại đây. Ưu đãi thực tế cần được cửa hàng xác nhận.",
      link: "/trade-in",
      linkLabel: "Xem thu cũ đổi mới",
      recommendations: [],
    };
  }

  if (/so sanh|flagship/.test(text)) {
    return {
      reply: "Đây là một vài mẫu flagship nổi bật để bạn xem và so sánh:",
      recommendations: [...phones]
        .sort((a, b) => getDiscoveryPrice(b) - getDiscoveryPrice(a))
        .slice(0, 3),
    };
  }

  if (/pin trau|pin|duoi 15/.test(text)) {
    const candidates = phones
      .filter(
        (product) =>
          batteryCapacity(product) >= 5000 &&
          (!/duoi 15/.test(text) || getDiscoveryPrice(product) < 15000000)
      )
      .sort((a, b) => batteryCapacity(b) - batteryCapacity(a));
    return {
      reply: candidates.length
        ? "Mình tìm được các máy có pin từ 5.000mAh trở lên phù hợp:"
        : "Mình chưa tìm thấy máy thỏa điều kiện pin và mức giá này trong catalog hiện có.",
      recommendations: candidates.slice(0, 3),
    };
  }

  if (/chup anh|camera|anh dep/.test(text)) {
    return {
      reply: "Các mẫu có thông số camera nổi bật trong catalog:",
      recommendations: [...phones]
        .sort((a, b) => cameraScore(b) - cameraScore(a))
        .slice(0, 3),
    };
  }

  if (/choi game|gaming|game/.test(text)) {
    const candidates = phones
      .filter((product) => {
        const chip = normalizeText(product.specifications?.chip);
        const ram =
          Number.parseInt(product.specifications?.ram || "", 10) || 0;
        return ram >= 12 || /snapdragon|gaming|pro/.test(chip);
      })
      .sort((a, b) => getDiscoveryPrice(b) - getDiscoveryPrice(a));
    return {
      reply: "Mình gợi ý các máy có chip hoặc RAM phù hợp để chơi game:",
      recommendations: candidates.slice(0, 3),
    };
  }

  if (/gap|fold|flip/.test(text)) {
    return {
      reply: "Đây là các lựa chọn màn hình gập trong catalog:",
      recommendations: phones
        .filter((product) =>
          /fold|flip|gap/i.test(
            `${product.name} ${product.specifications?.screen || ""}`
          )
        )
        .slice(0, 3),
    };
  }

  return {
    reply: "Bạn có thể xem các sản phẩm nổi bật hoặc thử một câu hỏi gợi ý nhé:",
    recommendations: [...phones]
      .sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0))
      .slice(0, 3),
  };
};

const formatPrice = (price) =>
  `${new Intl.NumberFormat("vi-VN").format(Math.round(price))}₫`;

const SalesAssistant = () => {
  const [open, setOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [message, setMessage] = useState("");
  const [conversation, setConversation] = useState([
    {
      sender: "assistant",
      text: "Xin chào! Mình có thể gợi ý sản phẩm từ catalog TECH PHONE.",
    },
  ]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    axios
      .get("/api/products")
      .then(({ data }) => {
        if (active) setProducts(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (active) setLoadError("Chưa tải được danh sách sản phẩm.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const askQuestion = (question) => {
    if (!question.trim()) return;
    const answer = findRecommendations(question, products);
    setConversation((current) => [
      ...current,
      { sender: "user", text: question },
      { sender: "assistant", ...answer },
    ]);
    setMessage("");
  };

  return (
    <div className="sales-assistant">
      {open && (
        <section
          className="sales-assistant-panel"
          aria-label="Trợ lý AI TECH PHONE"
        >
          <div className="sales-assistant-header">
            <div>
              <strong>Trợ lý AI TECH PHONE</strong>
              <small>Tư vấn theo sản phẩm trong catalog</small>
            </div>
            <Button
              variant="light"
              size="sm"
              aria-label="Đóng trợ lý"
              onClick={() => setOpen(false)}
            >
              ×
            </Button>
          </div>
          <div className="sales-assistant-messages" aria-live="polite">
            {conversation.map((entry, index) => (
              <div
                key={`${entry.sender}-${index}`}
                className={`sales-assistant-message sales-assistant-message--${entry.sender}`}
              >
                <p>{entry.text}</p>
                {entry.link && (
                  <Link className="btn btn-sm btn-outline-primary" to={entry.link}>
                    {entry.linkLabel}
                  </Link>
                )}
                {entry.recommendations?.map((product) => (
                  <Link
                    className="sales-assistant-product"
                    to={`/product/${product._id}`}
                    key={product._id}
                  >
                    <span>{product.name}</span>
                    <strong>{formatPrice(getDiscoveryPrice(product))}</strong>
                    <small>Xem chi tiết →</small>
                  </Link>
                ))}
              </div>
            ))}
            {loading && <p className="text-muted small">Đang tải catalog...</p>}
            {loadError && <Alert variant="warning" className="py-2">{loadError}</Alert>}
          </div>
          <div className="sales-assistant-quick-questions">
            {quickQuestions.map((question) => (
              <Button
                key={question}
                size="sm"
                variant="outline-secondary"
                disabled={loading || !!loadError}
                onClick={() => askQuestion(question)}
              >
                {question}
              </Button>
            ))}
          </div>
          <Form
            className="sales-assistant-input"
            onSubmit={(event) => {
              event.preventDefault();
              askQuestion(message);
            }}
          >
            <Form.Control
              aria-label="Nhập câu hỏi tư vấn"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Bạn đang tìm điện thoại nào?"
            />
            <Button type="submit" disabled={!message.trim() || loading || !!loadError}>
              Gửi
            </Button>
          </Form>
        </section>
      )}
      <Button
        className="sales-assistant-toggle"
        aria-expanded={open}
        aria-label={open ? "Đóng trợ lý AI" : "Mở Trợ lý AI TECH PHONE"}
        onClick={() => setOpen((current) => !current)}
      >
        <i className="fas fa-comment-dots" aria-hidden="true" />
        <span>{open ? "Đóng chat" : "Tư vấn AI"}</span>
      </Button>
    </div>
  );
};

export default SalesAssistant;
