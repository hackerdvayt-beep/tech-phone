import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Form, Row, Col } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import Message from "../components/Message";
import Loader from "../components/Loader";
import InputBar from "../components/InputBar";
import DarkButton from "../components/StyledButton";
import FormContainer from "../components/FormContainer";
import axios from "axios";
import { USER_LOGIN_SUCCESS } from "../constants/userConstants";

const RegisterScreen = ({ location, history }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState(null);
  const [otp, setOtp] = useState("");
  const [country, setCountry] = useState("Việt Nam");
  const [birthDay, setBirthDay] = useState("16");
  const [birthMonth, setBirthMonth] = useState("12");
  const [birthYear, setBirthYear] = useState("2010");
  const [phone, setPhone] = useState("");
  const countryOptions = [
    { name: "Afghanistan", dial: "+93" },
    { name: "Albania", dial: "+355" },
    { name: "Algeria", dial: "+213" },
    { name: "Argentina", dial: "+54" },
    { name: "Australia", dial: "+61" },
    { name: "Austria", dial: "+43" },
    { name: "Bangladesh", dial: "+880" },
    { name: "Belgium", dial: "+32" },
    { name: "Brazil", dial: "+55" },
    { name: "Cambodia", dial: "+855" },
    { name: "Canada", dial: "+1" },
    { name: "China", dial: "+86" },
    { name: "Denmark", dial: "+45" },
    { name: "Egypt", dial: "+20" },
    { name: "Finland", dial: "+358" },
    { name: "France", dial: "+33" },
    { name: "Germany", dial: "+49" },
    { name: "Greece", dial: "+30" },
    { name: "Hong Kong", dial: "+852" },
    { name: "India", dial: "+91" },
    { name: "Indonesia", dial: "+62" },
    { name: "Italy", dial: "+39" },
    { name: "Japan", dial: "+81" },
    { name: "Laos", dial: "+856" },
    { name: "Malaysia", dial: "+60" },
    { name: "Mexico", dial: "+52" },
    { name: "Myanmar", dial: "+95" },
    { name: "Netherlands", dial: "+31" },
    { name: "New Zealand", dial: "+64" },
    { name: "Norway", dial: "+47" },
    { name: "Philippines", dial: "+63" },
    { name: "Russia", dial: "+7" },
    { name: "Singapore", dial: "+65" },
    { name: "South Korea", dial: "+82" },
    { name: "Spain", dial: "+34" },
    { name: "Sweden", dial: "+46" },
    { name: "Switzerland", dial: "+41" },
    { name: "Taiwan", dial: "+886" },
    { name: "Thailand", dial: "+66" },
    { name: "United Kingdom", dial: "+44" },
    { name: "United States", dial: "+1" },
    { name: "Vietnam", dial: "+84" },
    { name: "Việt Nam", dial: "+84" },
  ].sort((a, b) =>
    a.name === "Việt Nam" ? -1 : b.name === "Việt Nam" ? 1 : a.name.localeCompare(b.name)
  );
  const selectedCountry =
    countryOptions.find((item) => item.name === country) || countryOptions[0];
  const [pendingVerification, setPendingVerification] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);

  const userRegister = useSelector((state) => state.userRegister);
  const { loading, error, userInfo } = userRegister;
  const dispatch = useDispatch();

  const redirect = location.search ? location.search.split("=")[1] : "/";

  const passwordChecks = {
    length: password.length >= 8,
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>_\-+=[\]\\;/`~]/.test(password),
  };
  const passwordScore =
    [passwordChecks.length, passwordChecks.number, passwordChecks.special].filter(
      Boolean
    ).length;
  const passwordStrength =
    passwordScore === 0 ? 0 : passwordScore === 1 ? 30 : passwordScore === 2 ? 65 : 100;
  const strengthColor =
    passwordStrength >= 100
      ? "#198754"
      : passwordStrength >= 65
      ? "#f59e0b"
      : "#dc3545";

  const getPasswordError = (value) => {
    if (!value || value.length < 8) {
      return "Mật khẩu phải có ít nhất 8 ký tự";
    }
    if (!/[0-9]/.test(value)) {
      return "Mật khẩu phải có ít nhất 1 chữ số";
    }
    if (!/[!@#$%^&*(),.?":{}|<>_\-+=[\]\\;/`~]/.test(value)) {
      return "Mật khẩu phải có ít nhất 1 ký tự đặc biệt";
    }
    return "";
  };

  // Redirect if user logged in
  useEffect(() => {
    if (userInfo) {
      history.push(redirect);
    }
  }, [history, userInfo, redirect]);

  const submitHandler = async (e) => {
    e.preventDefault();
    const phoneDigits = phone.replace(/\D/g, "");
    if (phoneDigits.length < 8 || phoneDigits.length > 15) {
      setMessage("Số điện thoại phải có từ 8 đến 15 chữ số");
      return;
    }
    const birthDate = new Date(
      Number(birthYear),
      Number(birthMonth) - 1,
      Number(birthDay)
    );
    if (
      birthDate.getFullYear() !== Number(birthYear) ||
      birthDate.getMonth() !== Number(birthMonth) - 1 ||
      birthDate.getDate() !== Number(birthDay)
    ) {
      setMessage("Ngày sinh không hợp lệ");
      return;
    }
    if (!email.trim().toLowerCase().endsWith("@gmail.com")) {
      setMessage("Vui lòng dùng địa chỉ Gmail kết thúc bằng @gmail.com");
      return;
    }
    const passwordError = getPasswordError(password);
    if (passwordError) {
      setMessage(passwordError);
    } else if (confirmPassword !== password) {
      setMessage("Mật khẩu không khớp");
    } else {
      try {
        setMessage(null);
        const { data } = await axios.post("/api/users", {
          name,
          email: email.trim().toLowerCase(),
          password,
          country,
          birthDate: `${birthYear}-${birthMonth.padStart(2, "0")}-${birthDay.padStart(2, "0")}`,
          phone: phone.trim(),
        });
        if (data?.requiresVerification) {
          setPendingVerification(true);
          setMessage(
            "Đã gửi mã xác nhận đến " +
              email.trim().toLowerCase()
          );
        }
      } catch (error) {
        setMessage(
          error.response?.data?.message ||
            "Không thể gửi mã xác nhận"
        );
      }
    }
  };

  const verifyOtpHandler = async (e) => {
    e.preventDefault();
    setVerifying(true);
    setMessage(null);
    try {
      const { data } = await axios.post("/api/users/verify-email", {
        email: email.trim().toLowerCase(),
        otp: otp.trim(),
      });
      if (data._id && data.token) {
        dispatch({ type: USER_LOGIN_SUCCESS, payload: data });
        localStorage.setItem("userInfo", JSON.stringify(data));
        history.push(redirect);
      }
      setMessage("Xác nhận email thành công");
      setPendingVerification(false);
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Mã xác nhận không chính xác"
      );
    } finally {
      setVerifying(false);
    }
  };

  const resendOtpHandler = async () => {
    setResending(true);
    setMessage(null);
    try {
      await axios.post("/api/users/resend-otp", {
        email: email.trim().toLowerCase(),
      });
      setMessage("Đã gửi lại mã xác nhận");
    } catch (error) {
      setMessage(error.response?.data?.message || "Không thể gửi lại mã");
    } finally {
      setResending(false);
    }
  };
  return (
    <FormContainer>
      <h1 className="text-center">Đăng ký</h1>
      {message && <Message variant="danger">{message}</Message>}
      {error && <Message variant="danger">{error}</Message>}
      {loading && <Loader></Loader>}
      <Form onSubmit={submitHandler}>
        <InputBar
          legend="Tên"
          type="text"
          placeholder="Nhập tên"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <InputBar
          legend="Địa chỉ Email"
          type="email"
          placeholder="Nhập email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <Form.Group controlId="country" className="mb-3">
          <Form.Label style={{ color: "#333", fontWeight: "500" }}>
            Quốc Gia/Vùng
          </Form.Label>
          <Form.Control
            as="select"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            style={{
              height: "48px",
              borderRadius: "12px",
              border: "1px solid #ced4da",
              fontSize: "16px",
            }}
          >
            {countryOptions.map((item) => (
              <option key={item.name} value={item.name}>
                {item.name}
              </option>
            ))}
          </Form.Control>
        </Form.Group>

        <h5 className="mb-2">Ngày sinh</h5>
        <Row className="g-2 mb-3">
          <Col xs={4}>
            <Form.Control
              as="select"
              value={birthDay}
              onChange={(e) => setBirthDay(e.target.value)}
              style={{ height: "48px", borderRadius: "12px", border: "1px solid #ced4da" }}
            >
              {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                <option key={day} value={String(day)}>
                  Ngày {day}
                </option>
              ))}
            </Form.Control>
          </Col>
          <Col xs={4}>
            <Form.Control
              as="select"
              value={birthMonth}
              onChange={(e) => setBirthMonth(e.target.value)}
              style={{ height: "48px", borderRadius: "12px", border: "1px solid #ced4da" }}
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                <option key={month} value={String(month)}>
                  Tháng {month}
                </option>
              ))}
            </Form.Control>
          </Col>
          <Col xs={4}>
            <Form.Control
              as="select"
              value={birthYear}
              onChange={(e) => setBirthYear(e.target.value)}
              style={{ height: "48px", borderRadius: "12px", border: "1px solid #ced4da" }}
            >
              {Array.from({ length: 100 }, (_, i) => 2026 - i).map((year) => (
                <option key={year} value={String(year)}>
                  Năm {year}
                </option>
              ))}
            </Form.Control>
          </Col>
        </Row>

        <Form.Group controlId="phone" className="mb-3">
          <div className="d-flex align-items-center mb-1">
            <Form.Label className="mb-0" style={{ fontWeight: "500" }}>
              Số điện thoại
            </Form.Label>
            <span
              className="rounded-circle text-white ms-2 d-flex align-items-center justify-content-center"
              style={{ width: "26px", height: "26px", background: "#707070", fontSize: "13px" }}
            >
              ?
            </span>
          </div>
          <div className="d-flex" style={{ gap: "8px" }}>
            <Form.Control
              as="select"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              style={{ height: "48px", borderRadius: "12px", border: "1px solid #ced4da", maxWidth: "220px" }}
            >
              {countryOptions.map((item) => (
                <option key={item.name} value={item.name}>
                  {item.dial} ({item.name})
                </option>
              ))}
            </Form.Control>
            <Form.Control
              type="tel"
              inputMode="numeric"
              placeholder="Số điện thoại"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, "").slice(0, 15))}
              required
              style={{ height: "48px", borderRadius: "12px", border: "2px solid #4a90e2" }}
            />
          </div>
          <small className="text-muted d-block mt-2">
            Nhập số điện thoại gồm 8 đến 15 chữ số
          </small>
        </Form.Group>
        <InputBar
          legend="Mật khẩu"
          type="password"
          placeholder="Nhập mật khẩu"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={8}
          title="Ít nhất 8 ký tự, gồm 1 chữ số và 1 ký tự đặc biệt"
          required
          style={{
            backgroundColor: "#fff",
            border:
              password.length > 0 && passwordStrength < 100
                ? "2px solid #dc3545"
                : "2px solid #4a90e2",
            borderRadius: "14px",
            height: "54px",
            fontSize: "15px",
          }}
        />

        {password.length > 0 && (
          <div className="mb-3">
            <div className="d-flex justify-content-between mb-1">
              <small>Cường độ:</small>
              <small style={{ color: strengthColor, fontWeight: "600" }}>
                {passwordStrength}%
              </small>
            </div>
            <div
              style={{
                height: "8px",
                borderRadius: "8px",
                background: "#e5e7eb",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${passwordStrength}%`,
                  height: "100%",
                  background: strengthColor,
                  transition: "width 0.25s ease",
                }}
              />
            </div>
          </div>
        )}

        <div
          className="mb-3"
          style={{
            background: "#f8fafc",
            border: "1px solid #e5e7eb",
            borderRadius: "12px",
            padding: "14px",
          }}
        >
          <div className="fw-semibold mb-2">Yêu cầu đối với mật khẩu</div>
          {[
            [passwordChecks.length, "Ít nhất 8 ký tự"],
            [passwordChecks.number, "Ít nhất 1 số"],
            [passwordChecks.special, "Ít nhất 1 ký tự đặc biệt"],
          ].map(([valid, label]) => (
            <div
              key={label}
              className="d-flex align-items-center"
              style={{ color: valid ? "#198754" : "#5f6b7a", lineHeight: "1.7" }}
            >
              <span style={{ width: "22px", fontWeight: "bold" }}>
                {valid ? "✓" : "•"}
              </span>
              {label}
            </div>
          ))}
        </div>

        <InputBar
          legend="Xác nhận mật khẩu"
          type="password"
          placeholder="Xác nhận mật khẩu"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          style={{
            backgroundColor: "#fff",
            border:
              confirmPassword.length > 0 && confirmPassword !== password
                ? "2px solid #dc3545"
                : "2px solid #4a90e2",
            borderRadius: "14px",
            height: "54px",
          }}
        />
        {confirmPassword.length > 0 && confirmPassword !== password && (
          <small
            className="d-block mb-3"
            style={{ color: "#dc3545", marginTop: "-8px" }}
          >
            <span aria-hidden="true">ⓘ</span> Mật khẩu xác nhận không khớp
          </small>
        )}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: "10px",
          }}
        >
          <DarkButton type="submit" size="medium">
            Đăng ký
          </DarkButton>
        </div>
      </Form>

      {pendingVerification && (
        <Form onSubmit={verifyOtpHandler} className="mt-3">
          <InputBar
            legend="Mã xác nhận gửi đến Gmail"
            type="text"
            placeholder="Nhập mã 6 chữ số"
            value={otp}
            onChange={(e) =>
              setOtp(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))
            }
            minLength={6}
            maxLength={6}
            required
          />
          <div className="d-flex justify-content-center gap-2">
            <DarkButton type="submit" size="medium" disabled={verifying}>
              Xác nhận
            </DarkButton>
            <DarkButton
              type="button"
              size="medium"
              disabled={resending}
              onClick={resending ? undefined : resendOtpHandler}
            >
              Gửi lại mã
            </DarkButton>
          </div>
        </Form>
      )}

      <Row className="py-3">
        <Col>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginTop: "-8px",
            }}
          >
            Đã có tài khoản?{" "}
            <Link to={redirect ? `/login?redirect=${redirect}` : `/login`}>
              Đăng nhập
            </Link>
          </div>
        </Col>
      </Row>
    </FormContainer>
  );
};

export default RegisterScreen;
