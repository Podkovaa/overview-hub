# Systems Universe — Overview Hub

> **Cost: $0.00/month** | **Hosting: Google Cloud (Free Tier)** | **Built with Claude Code AI**

A POS (Point of Sale) ecosystem showcase built with Claude Code AI + Google Apps Script + Google Sheets. Zero-cost architecture, modern UI, AI-accelerated development.

## Project Structure

```
overview-hub/
├── products/
│   ├── index.html                  ← Main hub page (open in browser)
│   ├── images/
│   │   └── ThanhNQ.jpg             ← Profile photo
│   ├── pos-demos/
│   │   └── minipos-info.html       ← MiniPOS product detail page
│   └── gas-deploy/                 ← Google Apps Script deployment package
│       ├── Index.html              ← Hub HTML for GAS Web App
│       ├── Code.gs                 ← GAS backend (V8 JavaScript)
│       ├── appsscript.json         ← GAS project manifest
│       └── images/
│           └── ThanhNQ.jpg
├── production/                     ← MiniPOS application (separate app)
│   └── index.html
└── README.md
```

## Quick Start (Local)

Open `products/index.html` directly in your browser:

```
file:///C:/Workspace/OPC/products/index.html
```

No server needed — pure HTML/CSS/JS with Tailwind CDN.

---

## Deploy to Google Apps Script (Free Hosting)

### Prerequisites

- A Google account (Gmail)
- Web browser

### Step 1: Create a Google Apps Script Project

1. Go to [script.google.com](https://script.google.com)
2. Click **"New Project"**
3. Click on "Untitled project" (top-left) → rename to **Systems Universe**

### Step 2: Upload Backend Code (`Code.gs`)

1. In the GAS Editor, you'll see a file named `Code.gs` (created by default)
2. Open `products/gas-deploy/Code.gs` from this repo
3. Copy all content → Paste into `Code.gs` in GAS Editor (replace existing content)

### Step 3: Upload Frontend (`Index.html`)

1. In GAS Editor: **File → New → HTML file**
2. Name it exactly **`Index`** (capital I, no `.html` extension)
3. Open `products/gas-deploy/Index.html` from this repo
4. Copy all content → Paste into the `Index` file in GAS Editor

### Step 4: Configure Manifest (`appsscript.json`)

1. In GAS Editor: **View → Show project manifest**
2. A file named `appsscript.json` will appear
3. Copy content from `products/gas-deploy/appsscript.json` → Paste (replace defaults)

Your manifest should look like:
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

### Step 5: Deploy as Web App

1. Click **Deploy → New Deployment**
2. Configure:
   - **Type:** Web App
   - **Description:** `Systems Universe v1.0`
   - **Execute as:** Me (`your-email@gmail.com`)
   - **Who has access:** Anyone
3. Click **Deploy**
4. **Authorize** the app when prompted (Google will ask for permissions — click Allow)
5. **Copy the URL** you receive — this is your live hub!

```
https://script.google.com/macros/s/AKfycbwXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX/exec
```

### Step 6: Update Demo Links (Optional)

After deploying MiniPOS separately and getting its URL, update the "Launch Demo" link:

1. Open `Index.html` in GAS Editor
2. Find the existing `href="../production/index.html"` 
3. Replace with your actual MiniPOS Web App URL
4. Redeploy: **Deploy → Manage Deployments → Edit (pencil icon) → Version: New → Deploy**

> **Note:** URL stays the same after redeployment — no need to share a new link.

### Step 7: Test

1. Open your Web App URL in a browser
2. Verify: page loads with all sections, animations, and images
3. Test mobile responsiveness (F12 → Device Toolbar)
4. Click all buttons (Live Demo, LinkedIn, Email)

---

## Pricing — $0.00 Forever

| Component | Free Tier Limit | Usage |
|-----------|----------------|-------|
| GAS Web App requests | 20,000/day | ~1 req per page view |
| GAS Runtime | 6 hours/day | Code.gs runs <1ms/request |
| Google Sheets cells | 10 million | Logs & config (optional) |
| Bandwidth | Unlimited | HTML/CSS/JS ~100KB per load |
| CDN (Tailwind, Fonts) | Free | Loaded from external CDN |

**With <1,000 daily views, your cost = $0.00/month forever.**

---

## Updating After Deploy

1. Edit files in GAS Editor (`Code.gs` or `Index.html`)
2. **Deploy → Manage Deployments**
3. Click the pencil icon (Edit) on your active deployment
4. **Version → New**
5. Click **Deploy**
6. ✅ URL unchanged — users see new version immediately

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| AI Development | Claude Code |
| Frontend | HTML5 + Tailwind CSS + Material Symbols |
| Backend | Google Apps Script (V8 JavaScript) |
| Database | Google Sheets (live, relational) |
| Hosting | Google Cloud (free tier) |
| IDE | VS Code + Claude Code extension |

## Author

**Ninh Quang Thanh** — Full-Stack Developer & Product Builder

- LinkedIn: [linkedin.com/in/ninhquangthanh](https://www.linkedin.com/in/ninhquangthanh/)
- Email: giaodich.3p@gmail.com
- GitHub: [Podkovaa](https://github.com/Podkovaa)

---

> Built with Claude Code AI + Google Apps Script + Google Sheets. All systems operational. $0.00/month.
