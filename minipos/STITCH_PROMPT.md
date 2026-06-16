# Google Stitch Prompt — MiniPOS UI Redesign

> Copy toàn bộ nội dung dưới đây, paste vào Google Stitch để generate UI.

---

## Project Context

Design a professional Point-of-Sale (POS) web application for small businesses in Vietnam. The app is called **MiniPOS** and is part of the **Systems Universe** ecosystem.

**Tech constraints:**
- Single HTML file (no React/Vue framework)
- Tailwind CSS for styling
- Google Material Symbols for icons
- Inter font for UI, JetBrains Mono for data/metrics
- Mobile-first responsive design (used on phones, tablets, and desktop)
- Dark sidebar + light content area layout

**Brand identity:** Technical, trustworthy, modern. Part of the "Systems Universe" family — use the same design DNA.

---

## Design System Tokens

### Colors (Material Design 3 tonal palette)

```
Primary:        #000613 (near black — headers, sidebar, primary buttons)
On-primary:     #ffffff
Secondary:      #005eb2 (blue — links, active states, highlights)
Secondary-container: #4597fe (light blue — badges, indicators)
Primary-container:   #001f3f (dark navy — cards, code blocks)
Surface:        #f9f9f9 (page background)
Surface-container-lowest: #ffffff (card backgrounds)
Surface-container:       #eeeeee (hover states, disabled)
Outline-variant: #c4c6cf (borders, dividers)
Success:        #10b981 (green — positive KPIs, payment confirmations)
Warning:        #f59e0b (amber — low stock alerts)
Error:          #ba1a1a (red — errors, out-of-stock)
On-surface:     #1a1c1c (primary text)
On-surface-variant: #43474e (secondary text/muted)
```

### Typography

```
Headlines:  Inter, weight 600-700, uppercase for section titles
Body:       Inter, weight 400, 14px base
Data/KPI:   Inter, weight 800, large sizes for numbers
Code:       JetBrains Mono, weight 400-500, for product codes and metrics
Icons:      Material Symbols Outlined, weight 400, 24px default
```

### Spacing
- Base unit: 4px
- Card padding: 16-20px
- Section gap: 16px
- Sidebar width: 220px desktop, hidden with overlay on mobile

---

## Screens to Design

### 1. Login Page
**Purpose:** Simple authentication screen.
- Centered card (max 400px) on gradient background
- Gradient: 135° from primary (#000613) to secondary (#005eb2)
- App logo/icon at top (storefront icon)
- Title: "MiniPOS" + subtitle: "Point of Sale System"
- Email input with icon
- Password input with icon
- Full-width primary button: "Sign In"
- Hint text below: "Default: admin@minipos.com / admin123"
- Clean, minimal, professional — no clutter

### 2. Main Layout (after login)
**Purpose:** App shell with sidebar navigation + main content area.

**Sidebar (left, 220px, dark bg: #000613):**
- Brand area: Store icon + "MiniPOS" + store name + version badge
- Nav items with icons (left-aligned, 12px padding):
  - 📊 Dashboard
  - 🛒 Point of Sale
  - 📋 Orders
  - 📦 Products
  - 🚚 Stock In
  - 💰 Expenses
  - 👥 Customers
  - 📈 Reports
  - ⚙️ Settings
- Active item: subtle left border accent (#10b981 green), lighter bg
- Logout button at bottom
- On mobile: sidebar hidden by default, hamburger toggle, overlay when open

**Top Bar (above content area):**
- Page title (left)
- Store selector (center)
- User avatar + name (right)
- Mobile: hamburger menu button

**Main Content:**
- Background: #f9f9f9 with subtle dot pattern (like Hub)
- All pages rendered here via SPA-style navigation

### 3. Dashboard
**Purpose:** At-a-glance business health.

**4 KPI Cards (top row, 2x2 on mobile, 4 columns on desktop):**
- Today's Revenue (with % change vs yesterday, green up / red down arrow)
- Monthly Revenue (with order count)
- Today's Profit (after COGS + expenses)
- Monthly Profit (accumulated)
- Each card: icon (colored circle, top-left) + value (large, bold) + label + trend indicator

**Recent Orders (left 2/3):**
- Table: Order #, Customer, Time, Payment Method (colored badge), Value
- Hover highlight rows
- Empty state: icon + "No orders yet"

**Alerts Panel (right 1/3):**
- Total Products count
- Low Stock count (red highlight)
- Today's Orders count

### 4. Point of Sale (POS)
**Purpose:** The main selling interface. Split layout.

**Left panel (60%):**
- Search bar with icon (search by name, SKU, or barcode) — autofocus
- Product grid: responsive cards (min 120px), each showing:
  - Product name (bold)
  - Selling price (red, bold)
  - Stock quantity (small, muted)
  - Visual states: normal (white), low stock (yellow border/background), out of stock (red border, 50% opacity, click disabled)
  - Click to add to cart
  - Active press: scale down animation

**Right panel (40%, sticky):**
- Cart header: "Cart" + item count badge + clear button
- Cart items list (scrollable, max 40vh):
  - Product name + unit price × quantity
  - Qty adjuster: − and + circular buttons
  - Line total (right-aligned, bold)
  - Remove button (×)
- Cart footer:
  - Subtotal
  - Discount input (number, right-aligned)
  - **TOTAL** (large, red, bold)
  - Payment method selector: Cash | Bank Transfer | MoMo (grid of 3, selected has blue border + light blue bg)
  - Checkout button (full width, green, large, with checkmark icon)

**On mobile:** Product grid full width on top, cart slides up or is below. Bottom nav for quick page switching.

### 5. Orders
**Purpose:** View and filter order history.

- Top bar: title + date picker (default: today)
- Table: Order #, Customer, Time, Value, Payment Method (colored badge), View button
- Click "View" → modal showing order detail:
  - Order #, date, customer info
  - Line items table: product, qty, price, total
  - Payment method + total at bottom
- Empty state: receipt icon + "No orders for this date"

### 6. Products
**Purpose:** Manage product catalog.

- Top bar: "Products (N)" + search input + "Add Product" button (primary)
- Table: Name, SKU, Category, Purchase Price, Selling Price (red bold), Stock, Actions (Edit + Delete)
- Edit/Delete buttons: outline style, small
- Search filters in real-time
- Add/Edit: modal form with fields:
  - Name* | SKU | Category
  - Purchase Price | Selling Price*
  - Unit | Barcode
- Delete: confirm dialog

### 7. Stock In
**Purpose:** Record inventory intake.

- Top section: "New Stock In"
  - Dynamic rows: Product dropdown (select from catalog) + Qty + Purchase Price + Total (auto-calc)
  - "Add Row" button to add more lines
  - Supplier input
  - Notes input
  - Submit button: "Confirm Stock In"
- Bottom section: "Stock In History"
  - Table: Time, Product, Qty, Price, Total, Supplier

### 8. Expenses
**Purpose:** Track business costs.

- Top bar: "Expenses" + "Add Expense" button
- Table: Date, Category, Amount (red), Note
- Add modal: Category dropdown (Rent/Utilities/Payroll/Shipping/Marketing/Other), Amount*, Note
- Empty state: money icon + "No expenses recorded"

### 9. Customers
**Purpose:** Simple CRM.

- Top bar: "Customers (N)" + "Add Customer" button
- Table: Name, Phone, Address, Date Added
- Add modal: Name*, Phone, Address
- Future: total purchases, last visit

### 10. Reports
**Purpose:** Data visualization.

- 4 KPI cards on top (same style as Dashboard)
- Revenue bar chart (Chart.js): daily revenue, blue bars, rounded corners
- Below: Payment method breakdown summary

### 11. Settings
**Purpose:** Configure store.

- Form fields:
  - Store Name
  - Store Phone
  - Store Address
  - Low Stock Alert Threshold (number input)
- Save button
- Demo Data section (separated):
  - Description: "Generate 15 sample products and 7 days of order data for testing"
  - Button: "Generate Demo Data" (outline warning style)

---

## Mobile Design Notes

- Sidebar becomes hamburger menu + overlay
- Bottom navigation bar (5 main items: Dashboard, POS, Orders, Products, Reports) — fixed, white background, top border
- Product grid: 2-3 columns instead of auto-fill
- Cart on POS: full-width below products, not side panel
- KPI cards: 2 columns
- Tables: horizontal scroll
- Modals: full-screen on mobile
- Touch targets minimum 44px (iOS HIG)

---

## Animation & Micro-interactions

- Page transitions: subtle fade (150ms)
- KPI cards: subtle hover lift (translateY -2px)
- Product cards: active press scale (0.96)
- Add to cart: brief success flash on cart icon
- Payment success: green toast notification (top-right, auto-dismiss 2.5s)
- Sidebar: smooth slide (300ms)
- Modal: fade in + backdrop blur

---

## Reference

**Existing Hub design at:** `products/index.html` in the Systems Universe repo.
- Use the same design tokens, color palette, typography
- Match the "technical aesthetic" (code-like badges, blueprint background optional)
- Keep the professional but not corporate feel

**Goal:** A POS app that looks like it belongs in the Systems Universe family — cohesive, modern, professional — while being distinctly a tool (not a landing page).

---

## Output Format

Generate a complete, production-ready single HTML file with:
1. Tailwind CSS via CDN
2. All screens/modules listed above
3. Material Symbols icons
4. Inter + JetBrains Mono fonts
5. Responsive design (mobile + tablet + desktop)
6. All JavaScript logic for navigation, cart, and CRUD operations
7. Demo/offline mode (works without backend)
8. Google Apps Script bridge (google.script.run) with graceful fallback
