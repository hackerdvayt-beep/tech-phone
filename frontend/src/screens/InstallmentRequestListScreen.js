import React, { useEffect, useState } from "react";
import axios from "axios";
import { Alert, Form, Table } from "react-bootstrap";
import { useSelector } from "react-redux";
import Loader from "../components/Loader";
import Message from "../components/Message";

const requestStatuses = [
  "Chờ nhân viên liên hệ tư vấn trả góp",
  "Đã liên hệ khách hàng",
  "Đang tư vấn",
  "Đã tư vấn xong",
  "Khách từ chối tư vấn",
];

const formatVND = (value) =>
  `${Number(value || 0).toLocaleString("vi-VN")}₫`;

const InstallmentRequestListScreen = ({ history }) => {
  const { userInfo } = useSelector((state) => state.userLogin);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (!userInfo?.isAdmin) {
      history.push("/login");
      return undefined;
    }

    let active = true;
    const config = {
      headers: { Authorization: `Bearer ${userInfo.token}` },
    };

    axios
      .get("/api/installment-requests/admin", config)
      .then(({ data }) => {
        if (active) setRequests(data);
      })
      .catch((requestError) => {
        if (active) {
          setError(
            requestError.response?.data?.message ||
              "Không thể tải danh sách yêu cầu trả góp"
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [history, userInfo]);

  const updateStatusHandler = async (requestId, status) => {
    setUpdating(true);
    setError("");
    setNotice("");

    try {
      const { data } = await axios.put(
        `/api/installment-requests/${requestId}/status`,
        { status },
        { headers: { Authorization: `Bearer ${userInfo.token}` } }
      );
      setRequests((current) =>
        current.map((request) =>
          request._id === requestId ? data : request
        )
      );
      setNotice("Đã cập nhật trạng thái yêu cầu.");
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Không thể cập nhật trạng thái yêu cầu"
      );
    } finally {
      setUpdating(false);
    }
  };

  return (
    <>
      <h1>Yêu cầu tư vấn trả góp</h1>
      <p className="text-muted">Hiển thị tối đa 100 yêu cầu mới nhất.</p>
      {error && <Message variant="danger">{error}</Message>}
      {notice && <Alert variant="success">{notice}</Alert>}
      {loading ? (
        <Loader />
      ) : requests.length === 0 ? (
        <Alert variant="info">Chưa có yêu cầu tư vấn trả góp.</Alert>
      ) : (
        <Table striped bordered hover responsive className="table-sm">
          <thead>
            <tr>
              <th>Ngày gửi</th>
              <th>Khách hàng</th>
              <th>Sản phẩm quan tâm</th>
              <th>Phương án</th>
              <th>Ước tính</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((request) => (
              <tr key={request._id}>
                <td>{new Date(request.createdAt).toLocaleString("vi-VN")}</td>
                <td>
                  <strong>{request.applicantName}</strong>
                  <br />
                  <a href={`tel:${request.phone}`}>{request.phone}</a>
                  {request.user?.email && (
                    <>
                      <br />
                      <a href={`mailto:${request.user.email}`}>
                        {request.user.email}
                      </a>
                    </>
                  )}
                </td>
                <td>
                  {request.items?.length ? (
                    <ul className="mb-0 ps-3">
                      {request.items.map((item, index) => (
                        <li key={`${request._id}-${index}`}>
                          {item.name} × {item.qty}
                          {(item.color || item.size) &&
                            ` (${[item.color, item.size]
                              .filter(Boolean)
                              .join(", ")})`}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    "Không có thông tin sản phẩm"
                  )}
                </td>
                <td>
                  Trả trước {request.downPaymentPercent}%
                  <br />
                  {request.termMonths} tháng
                </td>
                <td>
                  Tổng: {formatVND(request.orderTotal)}
                  <br />
                  Mỗi tháng: {formatVND(request.monthlyPayment)}
                </td>
                <td>
                  <Form.Control
                    as="select"
                    aria-label={`Trạng thái yêu cầu của ${request.applicantName}`}
                    value={request.status}
                    disabled={updating}
                    onChange={(event) =>
                      updateStatusHandler(request._id, event.target.value)
                    }
                  >
                    {requestStatuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </Form.Control>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </>
  );
};

export default InstallmentRequestListScreen;
