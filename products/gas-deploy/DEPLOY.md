# 🚀 Systems Universe — Google Apps Script Deployment Guide

> **Cost: $0.00/tháng** | **Hosting: Google Cloud (Free Tier)** | **Domain: script.google.com**

---

## 📋 Tổng quan

Systems Universe được deploy dưới dạng **Google Apps Script Web App**. Toàn bộ hệ thống chạy miễn phí trên hạ tầng Google Cloud, không cần VPS, không cần domain riêng.

### File trong bộ deploy

| File | Vai trò | Vị trí |
|------|---------|--------|
| `Index.html` | Giao diện hub chính (HTML/CSS/JS) | `products/gas-deploy/Index.html` |
| `Code.gs` | Backend server (GAS V8 JavaScript) | `products/gas-deploy/Code.gs` |
| `appsscript.json` | Cấu hình project GAS | `products/gas-deploy/appsscript.json` |

### File tham khảo (local dev)

| File | Vai trò |
|------|---------|
| `products/index.html` | Bản local dev — mở trực tiếp bằng browser |
| `products/reference-portfolio-os.html` | Reference design từ anh Thanh |
| `products/pos-demos/minipos-info.html` | Trang chi tiết sản phẩm MiniPOS |

---

## 📦 Bước 1: Tạo Google Apps Script Project

### 1.1 — Truy cập Google Apps Script
```
https://script.google.com
→ Nhấn "New Project"
```

### 1.2 — Đổi tên project
```
Nhấp vào "Untitled project" (góc trên bên trái)
→ Đặt tên: Systems Universe
→ OK
```

### 1.3 — Cấu trúc file sau khi tạo xong
```
Systems Universe (Google Apps Script Project)
├── Code.gs          ← Copy nội dung từ products/gas-deploy/Code.gs
├── Index.html       ← TẠO MỚI: File > New > HTML > Đặt tên "Index"
├── appsscript.json  ← TỰ ĐỘNG (có thể edit sau)
```

---

## 📝 Bước 2: Copy code vào GAS Editor

### 2.1 — Code.gs (Backend)

Mở file `products/gas-deploy/Code.gs` → Copy toàn bộ → Paste vào `Code.gs` trong GAS Editor.

```javascript
// Nội dung chính:
// - doGet()      → Serve Index.html khi user truy cập URL
// - doPost()     → Xử lý POST requests (API)
// - getStatus()  → Health check (có thể gọi từ client)
// - logEvent()   → Ghi log vào Google Sheets (tuỳ chọn)
```

### 2.2 — Index.html (Frontend)

1. Trong GAS Editor: `File → New → HTML file`
2. Đặt tên: **`Index`** (chữ I viết hoa, không cần .html)
3. Mở file `products/gas-deploy/Index.html` → Copy toàn bộ → Paste vào

```html
<!-- File này chứa toàn bộ giao diện hub:
     - Tailwind CSS (CDN)
     - Google Fonts: Inter + JetBrains Mono
     - Material Symbols icons
     - Scroll spy navigation
     - 6 product cards + metrics + roadmap
-->
```

### 2.3 — appsscript.json (Manifest)

1. Trong GAS Editor: `View → Show project manifest`
2. File `appsscript.json` sẽ xuất hiện
3. Copy nội dung từ `products/gas-deploy/appsscript.json` → Paste đè

```json
{
  "timeZone": "Asia/Ho_Chi_Minh",
  "runtimeVersion": "V8",
  "webapp": {
    "executeAs": "USER_DEPLOYING",
    "access": "ANYONE"
  }
}
```

---

## 🚀 Bước 3: Deploy lên Web App

### 3.1 — Mở hộp thoại Deploy
```
Deploy → New Deployment
```

### 3.2 — Cấu hình Deployment
```
Loại (Type):         Web App
Mô tả (Description): Systems Universe_v1.0
Thực thi như:        Me (email-của-bạn@gmail.com)
Ai có quyền truy cập: Anyone
```
![Deploy settings]

### 3.3 — Authorize (lần đầu)
```
Google sẽ hỏi quyền → Chọn tài khoản → Review Permissions
→ Allow (cho phép GAS chạy với tư cách của bạn)
```

### 3.4 — Nhận URL
```
Sau khi deploy, copy URL:
https://script.google.com/macros/s/AKfycbwXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX/exec

ĐÂY LÀ URL CHÍNH THỨC CỦA Systems Universe
→ Gửi link này cho khách hàng / team
→ Nhúng vào website / QR code nếu cần
```

---

## 🔧 Bước 4: Cấu hình lại Demo Links

Sau khi có URL thực tế, cần cập nhật các link demo trong `Index.html`:

### 4.1 — Cập nhật MiniPOS Demo Link
```javascript
// Tìm trong Index.html dòng (khoảng line 270):
href="https://script.google.com/macros/s/AKfycbwXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXx/exec"

// Thay bằng URL Web App thực tế của MiniPOS:
href="https://script.google.com/macros/s/AKfycbw_YOUR_ACTUAL_MINIPOS_ID/exec"
```

### 4.2 — Cập nhật Live Demo Button (About section)
```javascript
// Tìm trong Index.html (khoảng line 590):
href="https://script.google.com/macros/s/AKfycbwXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXx/exec"

// Cùng URL MiniPOS như trên
```

### 4.3 — Redeploy sau khi sửa
```
Deploy → Manage Deployments → Click vào deployment hiện tại
→ Edit (biểu tượng bút) → Version: New → Deploy
```

---

## 📊 Bảng giá — Hoàn toàn miễn phí

| Thành phần | Giới hạn Free | Dùng cho Systems Universe |
|------------|---------------|------------------|
| **GAS Web App requests** | 20,000/ngày | Hub page view (~1 req/lần mở) |
| **GAS Runtime** | 6 giờ/ngày | Code.gs chạy <1ms/request |
| **Google Sheets cells** | 10 triệu cells | Logs & config (tuỳ chọn) |
| **Bandwidth** | Không giới hạn | HTML/CSS/JS ~100KB/lần load |
| **CDN (Tailwind, Fonts)** | Miễn phí | Load từ CDN bên ngoài |

**Kết luận**: Với <1,000 lượt xem/ngày, chi phí = **$0.00/tháng**.

---

## 🔄 Quy trình cập nhật (Update)

```
1. Sửa code trong GAS Editor (Code.gs hoặc Index.html)
2. Deploy → Manage Deployments
3. Click "Edit" trên deployment đang chạy
4. Version → New
5. Deploy
6. URL không thay đổi — KH không cần link mới
```

---

## 📁 Cấu trúc thư mục đầy đủ

```
C:\Workspace\OPC\
├── production/                         ← MiniPOS (đã có)
│   ├── index.html
│   ├── Code.gs
│   └── ...
│
├── products/                           ← THƯ MỤC SẢN PHẨM
│   ├── index.html                      ← Hub local dev (mở = browser)
│   ├── reference-portfolio-os.html     ← Reference design anh Thanh
│   ├── pos-demos/
│   │   └── minipos-info.html           ← Trang chi tiết MiniPOS
│   └── gas-deploy/                     ← BỘ DEPLOY GAS (mới)
│       ├── Code.gs                     ← Backend server
│       ├── Index.html                  ← Hub HTML (copy lên GAS)
│       ├── appsscript.json             ← Project manifest
│       └── DEPLOY.md                   ← File hướng dẫn này
│
└── agency-agents/                      ← (đã có)
```

---

## 🧪 Test sau khi deploy

### Test 1: Mở URL Web App
```
Mở URL: https://script.google.com/macros/s/XXX/exec
→ Trang hub hiển thị đầy đủ
→ Scroll mượt, navigation hoạt động
→ Click "Launch Demo" → Mở MiniPOS (nếu đã cấu hình URL)
```

### Test 2: Health check
```
Gọi: https://script.google.com/macros/s/XXX/exec
→ View → Logs (trong GAS Editor)
→ Tìm dòng: "doGet called — serving Index"
```

### Test 3: Mobile responsive
```
Mở Chrome DevTools (F12) → Toggle device toolbar
→ Chọn iPhone 12 Pro
→ Giao diện responsive, không bị vỡ layout
```

---

## ⚠️ Troubleshooting

| Lỗi | Nguyên nhân | Cách sửa |
|-----|-------------|----------|
| "404 — Page Not Found" | File HTML sai tên | File phải tên chính xác là `Index` (không phải `index`) |
| "Script function not found: doGet" | Code.gs thiếu hàm doGet | Copy đầy đủ Code.gs từ gas-deploy |
| Trang trắng, không CSS | CDN bị chặn | Kiểm tra `cdn.tailwindcss.com` có truy cập được không |
| Demo link không hoạt động | Chưa cập nhật URL thật | Sửa URL placeholder trong Index.html |
| "Authorization Required" | Chưa cấp quyền | Deploy lại, chọn "Anyone" trong mục Who has access |

---

## 🔮 Mở rộng sau này

### Kết nối Google Sheets làm backend
```javascript
// Thêm vào Code.gs:
function getProductsFromSheet() {
  const ss = SpreadsheetApp.openById('YOUR_SHEET_ID');
  const data = ss.getSheetByName('Products').getDataRange().getValues();
  return data;
}

// Gọi từ Index.html:
google.script.run
  .withSuccessHandler(renderProducts)
  .getProductsFromSheet();
```

### Thêm Google Analytics
```html
<!-- Thêm vào Index.html trước </head> -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
```

### Custom domain (nếu cần)
```
GAS không hỗ trợ custom domain trực tiếp.
Giải pháp: Dùng Cloudflare Workers hoặc Google Sites redirect.
```

---

> **Built with:** Claude Code AI + VS Code + Google Apps Script + Google Sheets
> **Cost:** $0.00/month — Zero-Cost Infrastructure
> **Creator:** Ninh Quang Thanh — Systems Universe Product Team
