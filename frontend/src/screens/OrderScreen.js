import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  Row,
  Col,
  ListGroup,
  Image,
  Card,
  Button,
  Alert,
} from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import Message from "../components/Message";
import Loader from "../components/Loader";
import {
  getOrderDetails,
  payOrder,
  deliverOrder,
} from "../actions/orderActions";
import {
  ORDER_PAY_RESET,
  ORDER_DELIVER_RESET,
} from "../constants/orderConstants";

const OrderScreen = ({ match, history }) => {
  const orderId = match.params.id;

  const dispatch = useDispatch();

  const orderDetails = useSelector((state) => state.orderDetails);
  const { order, loading, error } = orderDetails;

  const orderPay = useSelector((state) => state.orderPay);
  const { loading: loadingPay, success: successPay } = orderPay;

  const orderDeliver = useSelector((state) => state.orderDeliver);
  const { loading: loadingDeliver, success: successDeliver } = orderDeliver;

  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;
  const [bankConfig, setBankConfig] = useState(null);
  const [bankConfigError, setBankConfigError] = useState("");
  const [bankQrError, setBankQrError] = useState(false);

  useEffect(() => {
    if (order?.paymentMethod !== "Bank QR" || order.isPaid) return undefined;
    let active = true;
    axios
      .get("/api/payment/bank/config")
      .then(({ data }) => {
        if (active) setBankConfig(data);
      })
      .catch((requestError) => {
        if (active) {
          setBankConfigError(
            requestError.response?.data?.message ||
              "Không thể tải thông tin thanh toán ngân hàng"
          );
        }
      });

    return () => {
      active = false;
    };
  }, [order?._id, order?.paymentMethod, order?.isPaid]);

  if (!loading) {
    //   Calculate prices
    const addDecimals = (num) => {
      return (Math.round(num * 100) / 100).toFixed(2);
    };

    order.itemsPrice = addDecimals(
      order.orderItems.reduce((acc, item) => acc + item.price * item.qty, 0)
    );
  }

  useEffect(() => {
    if (!userInfo) {
      history.push("/login");
    }

    if (!order || successPay || successDeliver || order._id !== orderId) {
      dispatch({ type: ORDER_PAY_RESET });
      dispatch({ type: ORDER_DELIVER_RESET });
      dispatch(getOrderDetails(orderId));
    }
  }, [dispatch, orderId, successPay, successDeliver, order, userInfo, history]);

  const successPaymentHandler = () => {
    // Simple payment confirmation for testing
    const paymentResult = {
      id: Date.now().toString(),
      status: "COMPLETED",
      update_time: new Date().toISOString(),
      payer: {
        email_address: userInfo.email,
      },
    };
    dispatch(payOrder(orderId, paymentResult));
  };

  const deliverHandler = () => {
    dispatch(deliverOrder(order));
  };

  return loading ? (
    <Loader />
  ) : error ? (
    <Message variant="danger">{error}</Message>
  ) : (
    <>
      <h1>Đơn hàng {order._id}</h1>
      <Row>
        <Col md={8}>
          <ListGroup variant="flush">
            <ListGroup.Item>
              <h2>Giao hàng</h2>
              <p>
                <strong>Tên: </strong> {order.user.name}
              </p>
              <p>
                <strong>Email: </strong>{" "}
                <a href={`mailto:${order.user.email}`}>{order.user.email}</a>
              </p>
              <p>
                <strong>Địa chỉ:</strong>
                {order.shippingAddress.address}, {order.shippingAddress.city}{" "}
                {order.shippingAddress.postalCode},{" "}
                {order.shippingAddress.country}
              </p>
              {order.isDelivered ? (
                <Message variant="success">
                  Đã giao vào {order.deliveredAt}
                </Message>
              ) : (
                <Message variant="danger">Chưa giao hàng</Message>
              )}
            </ListGroup.Item>

            <ListGroup.Item>
              <h2>Phương thức thanh toán</h2>
              <p>
                <strong>Phương thức: </strong>
                {order.paymentMethod}
              </p>
              {order.isPaid ? (
                <Message variant="success">
                  Đã thanh toán vào {order.paidAt}
                </Message>
              ) : order.paymentMethod === "COD" ? (
                <Message variant="info">
                  Thanh toán khi nhận hàng (COD)
                </Message>
              ) : order.paymentMethod === "Installment" ? (
                <Message variant="info">
                  {order.installmentRequest?.status ||
                    "Chờ nhân viên liên hệ tư vấn trả góp"}
                </Message>
              ) : (
                <Message variant="danger">
                  {order.paymentMethod === "Bank QR"
                    ? "Đang chờ chuyển khoản"
                    : "Chưa thanh toán"}
                </Message>
              )}
              {order.paymentMethod === "Installment" &&
                order.installmentRequest && (
                  <Alert variant="info" className="mt-3 mb-0">
                    Trả trước{" "}
                    <strong>
                      {order.installmentRequest.downPaymentPercent}%
                    </strong>{" "}
                    (
                    {Number(
                      order.installmentRequest.downPaymentAmount
                    ).toLocaleString("vi-VN")}
                    ₫), kỳ hạn{" "}
                    <strong>{order.installmentRequest.termMonths} tháng</strong>
                    . Khoản góp dự kiến mỗi tháng:{" "}
                    <strong>
                      {Number(
                        order.installmentRequest.monthlyPayment
                      ).toLocaleString("vi-VN")}
                      ₫
                    </strong>
                    . Nhân viên sẽ liên hệ tư vấn; đây chưa phải xác nhận duyệt
                    hồ sơ.
                  </Alert>
                )}
              {order.paymentMethod === "Bank QR" && !order.isPaid && (
                <Alert variant="info" className="mt-3">
                  <h5>Quét mã để chuyển khoản</h5>
                  {bankConfigError ? (
                    <p className="mb-0">{bankConfigError}</p>
                  ) : bankConfig?.configured ? (
                    <>
                      <Image
                        src={`https://img.vietqr.io/image/${encodeURIComponent(
                          bankConfig.bankCode
                        )}-${encodeURIComponent(
                          bankConfig.accountNumber
                        )}-compact2.png?amount=${Math.round(
                          Number(order.totalPrice)
                        )}&addInfo=${encodeURIComponent(
                          `TECHPHONE ${order._id}`
                        )}&accountName=${encodeURIComponent(
                          bankConfig.accountName
                        )}`}
                        alt="Mã QR chuyển khoản đơn hàng"
                        width={240}
                        className="d-block mb-3"
                        onError={() => setBankQrError(true)}
                      />
                      {bankQrError && (
                        <p role="alert">
                          Không tải được mã QR. Bạn có thể chuyển khoản thủ
                          công theo thông tin tài khoản bên dưới.
                        </p>
                      )}
                      <p className="mb-1">
                        Ngân hàng: <strong>{bankConfig.bankCode}</strong>
                      </p>
                      <p className="mb-1">
                        Chủ tài khoản: <strong>{bankConfig.accountName}</strong>
                      </p>
                      <p className="mb-1">
                        Số tài khoản:{" "}
                        <strong>{bankConfig.accountNumber}</strong>
                      </p>
                      <p className="mb-0">
                        Nội dung: <strong>TECHPHONE {order._id}</strong> · Số
                        tiền:{" "}
                        <strong>
                          {Number(order.totalPrice).toLocaleString("vi-VN")}₫
                        </strong>
                      </p>
                    </>
                  ) : (
                    <p className="mb-0">
                      Tài khoản nhận tiền chưa được cấu hình. Vui lòng liên hệ
                      cửa hàng để được hỗ trợ.
                    </p>
                  )}
                </Alert>
              )}
            </ListGroup.Item>

            <ListGroup.Item>
              <h2>Sản phẩm đặt hàng</h2>
              {order.orderItems.length === 0 ? (
                <Message>Đơn hàng trống</Message>
              ) : (
                <ListGroup variant="flush">
                  {order.orderItems.map((item, index) => (
                    <ListGroup.Item key={index}>
                      <Row>
                        <Col md={1}>
                          <Image
                            src={item.image}
                            alt={item.name}
                            fluid
                            rounded
                          />
                        </Col>
                        <Col>
                          <Link to={`/product/${item.product}`}>
                            {item.name}
                          </Link>
                        </Col>
                        <Col md={4}>
                          {item.qty} x {item.price} VNĐ ={" "}
                          {item.qty * item.price} VNĐ
                        </Col>
                      </Row>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </ListGroup.Item>
          </ListGroup>
        </Col>
        <Col md={4}>
          <Card>
            <ListGroup variant="flush">
              <ListGroup.Item>
                <h2>Tóm tắt đơn hàng</h2>
              </ListGroup.Item>
              <ListGroup.Item>
                <Row>
                  <Col>Sản phẩm</Col>
                  <Col>{order.itemsPrice} VNĐ</Col>
                </Row>
              </ListGroup.Item>
              <ListGroup.Item>
                <Row>
                  <Col>Phí vận chuyển</Col>
                  <Col>{order.shippingPrice} VNĐ</Col>
                </Row>
              </ListGroup.Item>
              <ListGroup.Item>
                <Row>
                  <Col>Thuế</Col>
                  <Col>{order.taxPrice} VNĐ</Col>
                </Row>
              </ListGroup.Item>
              <ListGroup.Item>
                <Row>
                  <Col>Tổng cộng</Col>
                  <Col>{order.totalPrice} VNĐ</Col>
                </Row>
              </ListGroup.Item>
              {!order.isPaid &&
                !["Bank QR", "COD", "Installment"].includes(
                  order.paymentMethod
                ) && (
                <ListGroup.Item>
                  {loadingPay && <Loader />}
                  <Button
                    type="button"
                    className="btn btn-block"
                    onClick={successPaymentHandler}
                    disabled={loadingPay}
                  >
                    Đánh dấu đã thanh toán
                  </Button>
                </ListGroup.Item>
              )}
              {loadingDeliver && <Loader />}
              {userInfo &&
                userInfo.isAdmin &&
                order.isPaid &&
                !order.isDelivered && (
                  <ListGroup.Item>
                    <Button
                      type="button"
                      className="btn btn-block"
                      onClick={deliverHandler}
                    >
                      Đánh dấu đã giao hàng
                    </Button>
                  </ListGroup.Item>
                )}
            </ListGroup>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default OrderScreen;
