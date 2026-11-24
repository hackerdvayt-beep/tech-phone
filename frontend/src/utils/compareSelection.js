const STORAGE_KEY = "techPhoneCompare";

export const getCompareSelection = () => {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(stored) ? stored : [];
  } catch (error) {
    console.error("Could not read the saved compare list", error);
    return [];
  }
};

export const setCompareSelection = (items) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, 3)));
  window.dispatchEvent(new Event("tech-phone-compare-change"));
};

export const addToCompareSelection = (product) => {
  const items = getCompareSelection();
  if (items.some((item) => item._id === product._id)) return items;
  if (items.length >= 3) return items;
  const next = [...items, {
    _id: product._id,
    name: product.name,
    category: product.category,
    image: product.image,
  }];
  setCompareSelection(next);
  return next;
};
