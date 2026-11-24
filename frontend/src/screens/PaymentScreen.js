import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Alert, Button, Col, Form } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import FormContainer from "../components/FormContainer";
import CheckoutSteps from "../components/CheckoutSteps";
import {
  saveInstallmentRequest,
  savePaymentMethod,
} from "../actions/cartActions";
import { createInstallmentRequest } from "../actions/installmentActions";
import { calculateCheckoutPricing } from "../utils/checkoutPricing";

const paymentMethods = [
  { value: "Bank QR", label: "QR chuyển khoản ngân hàng" },
  { value: "COD", label: "Thanh toán khi nhận hàng (COD)" },
  { value: "Installment", label: "Trả góp - yêu cầu tư vấn" },
  { value: "MoMo", label: "Ví điện tử MoMo" },
  { value: "PayPal", label: "PayPal hoặc thẻ tín dụng" },
];

const PaymentScreen = ({ history }) => {
  const dispatch = useDispatch();
  const cart = useSelector((state) => state.cart);
  const userInfo = useSelector((state) => state.userLogin.userInfo);
  const { shippingAddress } = cart;

  const [paymentMethod, setPaymentMethod] = useState(cart.paymentMethod || "COD");
  const [bankConfig, setBankConfig] = useState(null);
  const [bankConfigError, setBankConfigError] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [applicantName, setApplicantName] = useState(userInfo?.name || "");
  const [phone, setPhone] = useState(userInfo?.phone || "");
  const [downPaymentPercent, setDownPaymentPercent] = useState(30);
  const [termMonths, setTermMonths] = useState(6);

  const pricing = useMemo(
    () => calculateCheckoutPricing(cart.cartItems),
    [cart.cartItems]
  );
  const downPaymentAmount = Math.round(
    (pricing.totalPrice * downPaymentPercent) / 100
  );
  const monthlyPayment = Math.ceil(
    (pricing.totalPrice - downPaymentAmount) / termMonths
  );

  useEffect(() => {
    if (!shippingAddress.address) {
      history.push("/shipping");
    }
  }, [history, shippingAddress.address]);

  useEffect(() => {
    axios
      .get("/api/payment/bank/config")
      .then(({ data }) => setBankConfig(data))
      .catch((requestError) => {
        setBankConfigError(
          requestError.response?.data?.message ||
            "Không thể tải cấu hình thanh toán ngân hàng"
        );
      });
  }, []);

  useEffect(() => {
    if (userInfo?.name) setApplicantName((current) => current || userInfo.name);
    if (userInfo?.phone) setPhone((current) => current || userInfo.phone);
  }, [userInfo]);

  const submitHandler = async (event) => {
    event.preventDefault();
    setError("");

    if (paymentMethod === "Bank QR" && !bankConfig?.configured) {
      setError("QR ngân hàng chưa được cấu hình. Vui lòng liên hệ cửa hàng.");
      return;
    }

    if (paymentMethod === "Installment") {
      setLoading(true);
      try {
        const existingRequest = cart.installmentRequest;
        const normalizedPhone = phone.replace(/\D/g, "");
        const sameItems =
          existingRequest?.items?.length === cart.cartItems.length &&
          existingRequest.items.every((item, index) => {
            const cartItem = cart.cartItems[index];
            return (
              String(item.product) === String(cartItem.product) &&
              item.name === cartItem.name &&
              Number(item.qty) === Number(cartItem.qty) &&
              String(item.color || "") === String(cartItem.color || "") &&
              String(item.size || "") === String(cartItem.size || "") &&
              Number(item.bundleDiscountPercent || 0) ===
                Number(cartItem.bundleDiscountPercent || 0) &&
              Math.abs(Number(item.price) - Number(cartItem.price)) <= 0.01
            );
          });
        const requestMatchesSelection =
          existingRequest &&
          existingRequest.applicantName === applicantName.trim() &&
          existingRequest.phone === normalizedPhone &&
          Number(existingRequest.downPaymentPercent) === downPaymentPercent &&
          Number(existingRequest.termMonths) === termMonths &&
          Math.round(Number(existingRequest.orderTotal)) ===
            Math.round(pricing.totalPrice) &&
          sameItems;

        if (!requestMatchesSelection) {
          const request = await dispatch(
            createInstallmentRequest({
              applicantName,
              phone,
              downPaymentPercent,
              termMonths,
              cartItems: cart.cartItems.map(
                ({
                  product,
                  name,
                  qty,
                  price,
                  color,
                  size,
                  bundleDiscountPercent,
                }) => ({
                  product,
                  name,
                  qty,
                  price,
                  color,
                  size,
                  bundleDiscountPercent,
                })
              ),
            })
          );
          dispatch(saveInstallmentRequest(request));
        }
      } catch (requestError) {
        setError(
          requestError.response?.data?.message ||
            requestError.message ||
            "Không thể gửi yêu cầu tư vấn trả góp"
        );
        setLoading(false);
        return;
      }
      setLoading(false);
    }

    dispatch(savePaymentMethod(paymentMethod));
    history.push("/placeorder");
  };

  return (
    <FormContainer>
      <CheckoutSteps step1 step2 step3 />
      <h1>Phương thức thanh toán</h1>
      <Form onSubmit={submitHandler}>
        <Form.Group className="mb-4">
          <Form.Label as="legend">Chọn phương thức</Form.Label>
          <Col>
            {paymentMethods.map((method) => (
              <Form.Check
                key={method.value}
                type="radio"
                label={method.label}
                id={`payment-${method.value
                  .replace(/\s+/g, "-")
                  .toLowerCase()}`}
                name="paymentMethod"
                value={method.value}
                checked={paymentMethod === method.value}
                onChange={(event) => setPaymentMethod(event.target.value)}
                className="mb-2"
              />
            ))}
          </Col>
        </Form.Group>

        {paymentMethod === "Bank QR" && (
          <Alert variant={bankConfig?.configured ? "info" : "warning"}>
            <Alert.Heading>QR chuyển khoản ngân hàng</Alert.Heading>
            {bankConfigError ? (
              <p className="mb-0">{bankConfigError}</p>
            ) : bankConfig?.configured ? (
              <>
                <p className="mb-1">
                  Ngân hàng: <strong>{bankConfig.bankCode}</strong>
                </p>
                <p className="mb-1">
                  Chủ tài khoản: <strong>{bankConfig.accountName}</strong>
                </p>
                <p className="mb-1">
                  Số tài khoản: <strong>{bankConfig.accountNumber}</strong>
                </p>
                <p className="mb-0">
                  Mã QR và số tiền chính xác sẽ hiển thị sau khi tạo đơn hàng.
                </p>
              </>
            ) : (
              <p className="mb-0">
                Cửa hàng chưa cấu hình tài khoản nhận tiền. Vui lòng liên hệ
                cửa hàng hoặc chọn phương thức khác.
              </p>
            )}
          </Alert>
        )}

        {paymentMethod === "COD" && (
          <Alert variant="info">
            Bạn thanh toán cho nhân viên giao hàng khi nhận đủ sản phẩm.
          </Alert>
        )}

        {paymentMethod === "Installment" && (
          <section className="installment-request-form mb-4">
            <h4>Đăng ký tư vấn trả góp</h4>
            <p className="text-muted">
              Gửi thông tin để nhân viên liên hệ tư vấn. Đây là yêu cầu tư vấn,
              không phải xác nhận duyệt hồ sơ.
            </p>
            <Form.Group className="mb-3" controlId="installmentApplicantName">
              <Form.Label>Họ tên</Form.Label>
              <Form.Control
                required
                minLength={2}
                maxLength={100}
                value={applicantName}
                onChange={(event) => setApplicantName(event.target.value)}
                autoComplete="name"
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="installmentPhone">
              <Form.Label>Số điện thoại</Form.Label>
              <Form.Control
                required
                type="tel"
                inputMode="tel"
                minLength={9}
                maxLength={15}
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                autoComplete="tel"
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="installmentDownPayment">
              <Form.Label>Mức trả trước</Form.Label>
              <Form.Control
                as="select"
                value={downPaymentPercent}
                onChange={(event) =>
                  setDownPaymentPercent(Number(event.target.value))
                }
              >
                {[30, 50, 70].map((percent) => (
                  <option key={percent} value={percent}>
                    {percent}%
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
            <Form.Group className="mb-3" controlId="installmentTerm">
              <Form.Label>Kỳ hạn</Form.Label>
              <Form.Control
                as="select"
                value={termMonths}
                onChange={(event) => setTermMonths(Number(event.target.value))}
              >
                {[6, 9, 12].map((months) => (
                  <option key={months} value={months}>
                    {months} tháng
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
            <Alert variant="light" className="border mb-0">
              Trả trước dự kiến:{" "}
              <strong>{downPaymentAmount.toLocaleString("vi-VN")}₫</strong>
              <br />
              Khoản góp dự kiến mỗi tháng:{" "}
              <strong>{monthlyPayment.toLocaleString("vi-VN")}₫</strong>
              <br />
              <small>
                Ước tính chưa gồm lãi/phí tài chính; nhân viên sẽ xác nhận
                phương án cụ thể.
              </small>
            </Alert>
          </section>
        )}

        {paymentMethod === "MoMo" && (
          <Alert variant="info">
            Bạn sẽ được chuyển đến cổng thanh toán MoMo sau khi xác nhận đơn
            hàng.
          </Alert>
        )}

        {error && <Alert variant="danger">{error}</Alert>}
        <Button
          type="submit"
          variant="primary"
          disabled={
            loading ||
            (paymentMethod === "Bank QR" && !bankConfig?.configured)
          }
        >
          {loading
            ? "Đang gửi yêu cầu..."
            : paymentMethod === "Installment"
              ? "Gửi yêu cầu và tiếp tục"
              : "Tiếp tục"}
        </Button>
      </Form>
    </FormContainer>
  );
};

export default PaymentScreen;
