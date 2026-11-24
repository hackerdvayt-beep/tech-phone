# TECH PHONE

TECH PHONE là website thương mại điện tử demo dành cho điện thoại thông minh và phụ kiện. Trang chủ giới thiệu các dòng máy Apple, Samsung, Xiaomi, OPPO và Google; hỗ trợ khám phá sản phẩm, so sánh cấu hình và đặt hàng trực tuyến.

## Một số danh mục sản phẩm

<p align="center">
  <img src="./frontend/public/images/categories/category-samsung.png" alt="Danh mục Samsung" height="180" />
  <img src="./frontend/public/images/categories/category-xiaomi.png" alt="Danh mục Xiaomi" height="180" />
  <img src="./frontend/public/images/categories/category-oppo.png" alt="Danh mục OPPO" height="180" />
  <img src="./frontend/public/images/categories/category-google.png" alt="Danh mục Google" height="180" />
</p>

## Tính năng

- Khám phá sản phẩm theo thương hiệu, khoảng giá và nhu cầu; sắp xếp theo giá hoặc mức giảm.
- Xem chi tiết sản phẩm, biến thể màu sắc, phụ kiện mua kèm và tình trạng hàng tại chi nhánh.
- Nhận gợi ý qua công cụ chọn máy và Trợ lý AI bán hàng.
- So sánh sản phẩm, thêm vào giỏ hàng và thanh toán bằng QR ngân hàng hoặc COD; gửi yêu cầu tư vấn trả góp.
- Tra cứu đơn hàng bằng số điện thoại hoặc mã đơn; hỗ trợ luồng thu cũ đổi mới.
- Khu vực quản trị để quản lý sản phẩm, đơn hàng, người dùng và yêu cầu trả góp.

## Công nghệ

- **Frontend:** React, Redux, React Router, React Bootstrap, Axios
- **Backend:** Node.js, Express, MongoDB, Mongoose, JWT
- **Tiện ích:** Multer cho tải ảnh; Nodemailer cho email xác minh

## Chạy dự án ở máy local

### Yêu cầu

- Node.js và npm
- MongoDB local hoặc MongoDB Atlas

### Cài đặt

```bash
git clone https://github.com/hackerdvayt-beep/tech-phone.git
cd tech-phone
npm install
npm install --prefix frontend
```

Tạo file `.env` tại thư mục gốc:

```env
MONGO_URI=mongodb://127.0.0.1:27017/tech_phone
PORT=5000
NODE_ENV=development
JWT_SECRET=replace-with-a-long-random-secret

# Cấu hình tùy chọn để tạo QR chuyển khoản ngân hàng
BANK_QR_BANK_CODE=
BANK_QR_ACCOUNT=
BANK_QR_ACCOUNT_NAME=

# Cấu hình tùy chọn cho email xác minh tài khoản
EMAIL_USER=
EMAIL_APP_PASSWORD=
```

Thay `MONGO_URI` bằng URI MongoDB của bạn nếu dùng Atlas. Chỉ điền thông tin ngân hàng/email trong môi trường riêng; không commit `.env` hoặc thông tin xác thực lên Git.

### Nạp dữ liệu sản phẩm

Đồng bộ catalog mẫu mà không xóa dữ liệu hiện có:

```bash
npm run data:sync-products
```

Hoặc nạp bộ dữ liệu khởi tạo:

```bash
npm run data:import
```

> `data:import` xóa dữ liệu đơn hàng, sản phẩm, người dùng và banner hiện có trước khi nạp lại. Chỉ chạy trên cơ sở dữ liệu dùng để phát triển hoặc khi bạn chủ động muốn khởi tạo lại dữ liệu.

### Khởi động

```bash
npm run dev
```

Frontend chạy tại [http://localhost:3000](http://localhost:3000), backend API tại [http://localhost:5000](http://localhost:5000). Có thể chạy riêng bằng `npm run client` hoặc `npm run server`.

## API chính

| Method | Endpoint | Mô tả |
| --- | --- | --- |
| `GET` | `/api/products` | Danh sách sản phẩm |
| `GET` | `/api/products/:id` | Chi tiết sản phẩm |
| `POST` | `/api/orders` | Tạo đơn hàng (cần đăng nhập) |
| `POST` | `/api/orders/lookup` | Tra cứu đơn hàng |
| `GET` | `/api/payment/bank/config` | Cấu hình công khai để tạo QR ngân hàng |
| `POST` | `/api/installment-requests` | Gửi yêu cầu tư vấn trả góp (cần đăng nhập) |

## Scripts

```bash
npm run dev                 # Chạy backend và frontend
npm run server              # Chạy backend
npm run client              # Chạy frontend
npm run data:sync-products  # Đồng bộ catalog sản phẩm
npm run data:import         # Xóa dữ liệu hiện tại và nạp dữ liệu mẫu
npm run data:destroy        # Xóa dữ liệu đơn hàng, sản phẩm, người dùng và banner
```
