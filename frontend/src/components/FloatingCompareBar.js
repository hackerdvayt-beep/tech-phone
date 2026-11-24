import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCompareSelection, setCompareSelection } from "../utils/compareSelection";

const FloatingCompareBar = () => {
  const [items, setItems] = useState(getCompareSelection);

  useEffect(() => {
    const refresh = () => setItems(getCompareSelection());
    window.addEventListener("tech-phone-compare-change", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("tech-phone-compare-change", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  if (!items.length) return null;

  return (
    <div className="floating-compare-bar">
      <div className="floating-compare-items">
        <strong>So sánh nhanh ({items.length}/3)</strong>
        {items.map((item) => (
          <span key={item._id} className="floating-compare-item">
            {item.name}
            <button type="button" aria-label={`Bỏ ${item.name}`} onClick={() => setCompareSelection(items.filter((entry) => entry._id !== item._id))}>×</button>
          </span>
        ))}
      </div>
      {items.length > 1 ? (
        <Link className="btn btn-dark" to={`/compare?ids=${items.map((item) => item._id).join(",")}`}>
          So sánh
        </Link>
      ) : (
        <button type="button" className="btn btn-dark" disabled>
          So sánh
        </button>
      )}
    </div>
  );
};

export default FloatingCompareBar;
