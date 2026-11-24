import React, { useState } from "react";
import axios from "axios";
import { Alert, Button, Card, Form, Spinner } from "react-bootstrap";

const formatPrice = (price) =>
  `${new Intl.NumberFormat("vi-VN").format(Number(price) || 0)}₫`;

const OrderLookupScreen = () => {
  const [phone, setPhone] = useState("");
  const [orderId, setOrderId] = useState("");
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submitHandler = async (event) => {
    event.preventDefault();
    setError("");
    setOrders([]);
    if (!phone.trim() && !orderId.trim()) {
      setError("Vui lòng nhập số điện thoại hoặc mã đơn hàng.");
      return;
    }

    setLoading(true);
    try {
      const { data } = await axios.post("/api/orders/lookup", {
        phone: phone.trim(),
        orderId: orderId.trim(),
      });
      setOrders(data.orders || []);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Chưa thể tra cứu đơn hàng. Vui lòng thử lại."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="order-lookup-page">
      <Card className="border-0 shadow-sm">
        <Card.Body>
          <h1 className="h3 fw-bold">Tra cứu đơn hàng</h1>
          <p className="text-muted">
            Nhập số điện thoại đã đăng ký hoặc mã đơn hàng để xem trạng thái.
          </p>
          <Form onSubmit={submitHandler}>
            <Form.Group className="mb-3" controlId="orderLookupPhone">
              <Form.Label>Số điện thoại</Form.Label>
              <Form.Control
                type="tel"
                autoComplete="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="Nhập số điện thoại"
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="orderLookupId">
              <Form.Label>Mã đơn hàng</Form.Label>
              <Form.Control
                value={orderId}
                onChange={(event) => setOrderId(event.target.value)}
                placeholder="Nhập mã đơn nếu có"
              />
            </Form.Group>
            {error && <Alert variant="danger">{error}</Alert>}
            <Button type="submit" variant="dark" disabled={loading}>
              {loading ? (
                <>
                  <Spinner size="sm" animation="border" className="me-2" />
                  Đang tra cứu...
                </>
              ) : (
                "Kiểm tra đơn hàng"
              )}
            </Button>
          </Form>
        </Card.Body>
      </Card>

      {orders.length > 0 && (
        <div className="mt-4 d-grid gap-3">
          {orders.map((order) => (
            <Card key={order.orderId} className="border-0 shadow-sm">
              <Card.Body>
                <div className="d-flex justify-content-between flex-wrap gap-2">
                  <strong>Mã đơn: {order.orderId}</strong>
                  <span className="badge bg-dark">{order.status}</span>
                </div>
                <p className="mb-1 mt-2">
                  Ngày đặt:{" "}
                  {new Date(order.createdAt).toLocaleString("vi-VN")}
                </p>
                <p className="mb-1">
                  Tổng tiền: {formatPrice(order.totalPrice)}
                </p>
                <p className="mb-0 text-muted">
                  Thanh toán: {order.isPaid ? "Đã thanh toán" : "Chưa thanh toán"}
                  {order.deliveredAt &&
                    ` · Giao lúc ${new Date(order.deliveredAt).toLocaleString(
                      "vi-VN"
                    )}`}
                </p>
              </Card.Body>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
};

export default OrderLookupScreen;
