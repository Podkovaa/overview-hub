# Google Stitch Prompts — MiniPOS Full UI

> **Cách dùng:** Copy từng prompt bên dưới, paste vào Google Stitch. Mỗi prompt = 1 màn hình.
> Generate xong màn hình nào → chụp lại → qua prompt tiếp theo.

---

## Design System (dùng chung cho tất cả prompt)

Copy đoạn này vào đầu MỖI prompt:

```
Design a professional Point-of-Sale web app UI using Tailwind CSS.

DESIGN TOKENS:
- Primary bg: #000613 (near black), Secondary: #005eb2 (blue)
- Surface bg: #f9f9f9, Cards: #ffffff
- Success: #10b981, Warning: #f59e0b, Error: #ba1a1a
- Text primary: #1a1c1c, Text muted: #43474e
- Borders: #c4c6cf, subtle 1px
- Font: Inter for UI, JetBrains Mono for code/metrics
- Icons: Material Symbols Outlined style
- Border radius: 12px for cards, 8px for buttons

LAYOUT: Fixed left sidebar (220px, bg #000613, white text, nav items with icons), top bar with page title + user avatar, main content area with light bg + subtle dot pattern.

This app is part of the "Systems Universe" ecosystem — professional, modern, technical aesthetic.
```

---

## Prompt 1: Main App Layout + Dashboard

```
Design the main Dashboard screen of a POS app called "MiniPOS".

Show the FULL layout:
- LEFT SIDEBAR (220px, dark bg #000613): Brand "🏪 MiniPOS" at top, then 9 nav items with icons: Dashboard (active, green left border), Point of Sale, Orders, Products, Stock In, Expenses, Customers, Reports, Settings. Logout at bottom.
- TOP BAR: Title "Dashboard" left, store name "🏪 My Store" center, user avatar "A" + "Admin" right.
- MAIN CONTENT (light bg):

Row 1 — 4 KPI Cards (equal width):
  Card 1: 💰 icon green circle, "Today's Revenue", "12.450.000đ", "+12.5% vs yesterday" green
  Card 2: 📅 icon blue circle, "Monthly Revenue", "187.200.000đ", "48 orders"
  Card 3: 💎 icon amber circle, "Today's Profit", "4.180.000đ", "+8.3%" green
  Card 4: 🏦 icon indigo circle, "Monthly Profit", "52.400.000đ"

Row 2 — Two columns (2/3 + 1/3):
  Left: "Recent Orders" table — columns: #, Customer, Time, Payment, Value. 5 rows of sample data. Payment method shown as colored badge (Cash=green badge, Transfer=blue, MoMo=pink).
  Right: "Alerts" card — Total Products: 156, Low Stock: 3 (red), Today's Orders: 12

Make it look like a real working dashboard with realistic Vietnamese Dong currency values. Show the full page, not cropped.
```

---

## Prompt 2: Point of Sale (POS)

```
Design the Point of Sale screen of MiniPOS.

Same sidebar + top bar layout as before, but top bar title is "Point of Sale" with a cart badge showing "3 SP".

Main content is split 60/40:

LEFT (60%):
- Search bar with magnifying glass icon, placeholder "Search product (name, SKU, barcode)..."
- Product grid: 4 columns of product cards. Show 8 products:
  - Each card: product name bold, price in red bold, "Stock: X" small muted text
  - Mix of states: some normal (white bg, blue border on hover), 1 yellow (low stock, yellow border/background), 1 red/greyed out (out of stock, opacity 0.5)
  - Examples: "Cà phê sữa đá" 35.000đ, "Trà đào" 45.000đ, "Bánh mì thịt" 20.000đ, "Nước suối" 10.000đ, etc.

RIGHT (40%, sticky card):
- Cart header: "🛒 Cart" + "3 items" + trash icon
- 3 cart items:
  - "Cà phê sữa đá" — 35.000đ × 2 — [−] [2] [+] — 70.000đ — ×
  - "Trà đào" — 45.000đ × 1 — [−] [1] [+] — 45.000đ — ×
  - "Bánh mì thịt" — 20.000đ × 1 — [−] [1] [+] — 20.000đ — ×
- Cart footer:
  - Subtotal: 135.000đ
  - Discount: [0] input
  - TOTAL: 135.000đ (large, red, bold)
  - Payment methods: 3 buttons in a row — "💵 Cash" (selected, blue border), "🏦 Transfer", "📱 MoMo"
  - Green checkout button: "✓ Checkout" full width, large

Show the full split layout. Make it look functional and ready to use.
```

---

## Prompt 3: Orders

```
Design the Orders screen of MiniPOS.

Same sidebar + top bar. Top bar title "📋 Orders" with a date picker showing today's date on the right.

Main content:
- A card containing a table:
  - Headers: #, Customer, Time, Payment, Value, Action
  - 8 rows with realistic Vietnamese data:
    - Order codes like "ORD-20260616-001"
    - Customer names: "Nguyễn Văn A", "Trần Thị B", "Lê Văn C", "Khách lẻ" (walk-in)
    - Times: various times today
    - Payment badges: Cash (green), Transfer (blue), MoMo (pink)
    - Values: 45.000đ, 120.000đ, 350.000đ, etc.
    - Action: eye icon button "View"
- Empty state hint: if no orders, show receipt icon + "No orders for this date"

Show the full table with realistic data, colored payment badges, and the View action buttons.
```

---

## Prompt 4: Products Management

```
Design the Products screen of MiniPOS.

Same sidebar + top bar. Top bar: "📦 Products (156)" + search input + blue "＋ Add Product" button.

Main content:
- A card containing a table with 8 rows:
  - Headers: Name, SKU, Category, Purchase Price, Selling Price, Stock, Actions
  - Realistic Vietnamese product data:
    - "Cà phê sữa đá" | CF001 | Drinks | 25.000đ | 35.000đ (red bold) | 48 | ✏️ 🗑
    - "Trà đào" | TD002 | Drinks | 30.000đ | 45.000đ | 32 | ✏️ 🗑
    - "Bánh mì thịt" | BM003 | Food | 12.000đ | 20.000đ | 3 (yellow warning) | ✏️ 🗑
    - "Nước suối" | NS004 | Drinks | 5.000đ | 10.000đ | 0 (red, out of stock) | ✏️ 🗑
    - 4 more rows with varied data
  - Edit (pencil icon) and Delete (trash icon) buttons per row, small outline style

Show the complete table with all data visible. The table should look professional with alternating row hover states.
```

---

## Prompt 5: Stock In + Expenses + Customers (3 smaller screens)

```
Design 3 screens of MiniPOS as separate sections in one view.

SECTION 1 — Stock In:
Top bar "🚚 Stock In".
- "New Stock In" form: 3 rows with Product dropdown + Qty input + Price input + auto-calculated Total. "＋ Add Row" link below. Supplier text input. Notes text input. Blue "Confirm Stock In" button.
- Below: "Stock In History" table with 5 rows showing recent stock-in records.

SECTION 2 — Expenses:
Top bar "💰 Expenses" + "＋ Add Expense" button.
- Table: Date, Category, Amount (red), Note. 6 rows of sample data. Categories: Rent, Utilities, Payroll, Shipping, Marketing, Other.

SECTION 3 — Customers:
Top bar "👥 Customers (24)" + "＋ Add Customer" button.
- Table: Name, Phone, Address, Date Added. 5 rows of sample Vietnamese customer data.

Show all 3 sections stacked. Each with its own mini top bar and table. Make them look like real data, not placeholders.
```

---

## Prompt 6: Reports

```
Design the Reports screen of MiniPOS.

Same sidebar + top bar. Top bar title "📈 Reports".

Main content:
Row 1 — 4 KPI cards (same style as Dashboard):
  - Total Revenue: 187.200.000đ
  - Total Orders: 486
  - Average/Order: 385.000đ
  - Cash Payments: 98.500.000đ

Row 2 — Full-width card:
  - Title: "Revenue by Day"
  - A bar chart showing 7 days of revenue:
    - Mon: 28.5M, Tue: 32.1M, Wed: 24.8M, Thu: 35.2M, Fri: 42.0M, Sat: 38.7M, Sun: 15.9M
    - Blue bars (#3949ab), rounded tops, no legend needed
    - Y-axis: VND amounts in millions
    - Clean, modern chart style

Show the complete page with KPI cards above the chart. The chart should look like a real Chart.js bar chart.
```

---

## Prompt 7: Settings

```
Design the Settings screen of MiniPOS.

Same sidebar + top bar. Top bar title "⚙️ Settings".

Main content — a card form:
- Store Name: [MiniPOS] text input
- Store Phone: [0900000000] text input
- Store Address: [123 Nguyễn Huệ, Q.1, TP.HCM] text input
- Low Stock Alert: [5] number input (small width)
- Blue "💾 Save Settings" button

Below, a separated section:
- Title: "🪄 Demo Data"
- Description: "Generate 15 sample products and 7 days of order data for testing purposes."
- Orange/amber outline button: "✨ Generate Demo Data"

Show the full settings page with both sections clearly separated.
```

---

## Notes

- **Generate từng prompt một.** Mỗi prompt paste vào Stitch → xem kết quả → chụp màn hình → prompt tiếp theo.
- **Nếu Stitch chỉ cho ra 1 phần**, thêm câu: "Show the FULL page, all elements visible, not cropped."
- **Nếu màu sai**, nhắc lại design tokens.
- **Không generate login screen** — app bắt đầu từ màn hình chính luôn.
