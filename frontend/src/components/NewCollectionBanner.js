import React from "react";
import { Link } from "react-router-dom";

const NewCollectionBanner = () => {
  return (
    <div className="py-3 mb-4 text-center">
      <h1 className="fw-bold">CÔNG NGHỆ MỚI NHẤT</h1>
      <div className="mt-3 p-4 p-md-5 rounded new-collection-banner">
        <div>
          <p className="mb-2 text-uppercase small fw-bold">Công nghệ mới nhất</p>
          <h2 className="fw-bold text-white">IPHONE & GALAXY THẾ HỆ MỚI</h2>
          <p className="mb-0">Khám phá thiết bị phù hợp với bạn.</p>
        </div>
        <Link className="btn btn-light fw-bold" to="/products">
          Khám phá ngay
        </Link>
      </div>
    </div>
  );
};

export default NewCollectionBanner;
