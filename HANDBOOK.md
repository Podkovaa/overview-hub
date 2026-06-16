# Systems Universe — Project Handbook

> **Version:** 1.0.0 | **Started:** June 2025 | **Author:** Ninh Quang Thanh
>
> A living document — updated as the project evolves. Treat this as the single source of truth for all architectural decisions, processes, and learnings.

---

## Table of Contents

- [Chapter 1: The Zero-Cost Architecture Decision](#chapter-1-the-zero-cost-architecture-decision)
- [Chapter 2: Infrastructure Layer](#chapter-2-infrastructure-layer)
- [Chapter 3: Frontend Layer](#chapter-3-frontend-layer)
- [Chapter 4: Backend & Database Layer](#chapter-4-backend--database-layer)
- [Chapter 5: Design & UX Layer](#chapter-5-design--ux-layer)
- [Chapter 6: CI/CD Pipeline](#chapter-6-cicd-pipeline)
- [Chapter 7: Product Registry](#chapter-7-product-registry)
- [Chapter 8: Operations & Monitoring](#chapter-8-operations--monitoring)
- [Chapter 9: Lessons Learned](#chapter-9-lessons-learned)

---

## Chapter 1: The Zero-Cost Architecture Decision

### 1.1 The Core Philosophy

> **Build enterprise-grade POS systems at $0.00/month.**

Systems Universe was born from a simple observation: most SMBs in Vietnam cannot afford traditional SaaS POS solutions ($50–$200/month), nor do they have the technical capacity to self-host open-source alternatives.

The goal was to prove that a solo developer, armed with AI tooling and free-tier cloud infrastructure, can build, deploy, and operate a full POS ecosystem — from landing page to transaction processing — with zero recurring cost.

### 1.2 Why Google Apps Script?

| Criteria | Traditional Stack | GAS Stack |
|----------|------------------|-----------|
| **Monthly hosting** | $20–$200 (VPS/Render/Heroku) | **$0.00** |
| **Database** | PostgreSQL/MySQL ($15–$50/mo) | **Google Sheets (free)** |
| **Backend runtime** | Node.js/Django on VPS | **GAS V8 JavaScript engine** |
| **Frontend hosting** | Vercel/Netlify/CDN | **GAS Web App (public deeplink)** |
| **Deployment** | Docker + CI/CD + domain | **1-click Deploy in GAS Editor** |
| **SSL/TLS** | Certbot/Cloudflare | **Built-in (script.google.com)** |
| **Scaling** | Manual + monitoring | **Google Cloud auto-scales** |
| **Auth** | Custom/OAuth implementation | **Google IAM (built-in)** |

**Key insight:** Google Apps Script provides a complete application platform — not just a scripting tool. The Web App feature gives you a public URL serving HTML/CSS/JS, while Google Sheets acts as a live relational database accessible from the same runtime. All within Google's free tier limits (20,000 requests/day, 6 hours runtime/day — far beyond what a small business needs).

### 1.3 The "Mini Infrastructure" Mindset

Running Systems Universe on GAS is intentional. By managing multiple GAS projects (Hub, MiniPOS, CoffeePOS…) as separate deployments, each with its own manifest, version history, and logs, we create a miniature version of:

- **Multi-service architecture** — each product is an independent service
- **Infrastructure-as-Code** — `appsscript.json` is our deployment descriptor
- **Zero-cost DevOps** — GAS Editor is our CI/CD dashboard
- **Observability** — Stackdriver logs, Sheets-based monitoring
- **Access control** — Google IAM for who can deploy vs. who can use

This teaches real infrastructure management patterns without the complexity (and cost) of AWS/GCP/Azure.

### 1.4 The AI Co-Developer

**Claude Code** (via VS Code extension) is the primary development accelerator. The workflow:

1. **Ideation:** Discuss product requirements in natural language (Vietnamese or English)
2. **Code generation:** Claude generates full-stack HTML/CSS/JS + GAS backend
3. **Review & refine:** Iterate on UI, logic, and data models
4. **Deploy:** Copy to GAS Editor, deploy with one click

This AI-human pairing achieves ~10x development velocity compared to hand-coding, while keeping the developer in full control of architecture decisions.

---

## Chapter 2: Infrastructure Layer

### 2.1 Platform Architecture

```
┌─────────────────────────────────────────────────┐
│                  GOOGLE CLOUD                    │
│                                                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │  HUB     │  │ MiniPOS  │  │CoffeePOS │  ...  │
│  │ GAS #1   │  │ GAS #2   │  │ GAS #3   │       │
│  │          │  │          │  │          │       │
│  │ Web App  │  │ Web App  │  │ Web App  │       │
│  │ + Sheets │  │ + Sheets │  │ + Sheets │       │
│  └──────────┘  └──────────┘  └──────────┘       │
│       │              │              │             │
│  ┌────┴──────────────┴──────────────┴────┐      │
│  │         Google Identity (IAM)          │      │
│  │    Single account manages all apps     │      │
│  └────────────────────────────────────────┘      │
└─────────────────────────────────────────────────┘
```

### 2.2 GAS Project Inventory

| Project | GAS File ID | Web App URL | Sheets DB | Status |
|---------|------------|-------------|-----------|--------|
| Systems Universe Hub | `TBD` | `TBD` | N/A (static) | 🟢 LIVE |
| MiniPOS | `TBD` | `TBD` | `MiniPOS_Data` | 🟡 DEV |

> **Naming convention:** `{ProductName}` for GAS project, `{ProductName}_Data` for Sheets.

### 2.3 Free Tier Limits (per project)

| Resource | Limit | Monitoring |
|----------|-------|------------|
| Web App requests | 20,000/day | GAS Dashboard → Executions |
| Runtime execution | 6 hrs/day | GAS Dashboard → Executions |
| URL Fetch calls | 20,000/day | N/A (not used) |
| Sheets cells | 10,000,000 | Sheets → Help → Activity |
| Script properties | 500 KB | Code.gs → PropertiesService |

**Current usage:** Well below 1% of all limits. No cost expected at any scale achievable by SMBs.

---

## Chapter 3: Frontend Layer

### 3.1 Tech Stack

| Component | Technology | Rationale |
|-----------|-----------|-----------|
| **Markup** | HTML5 | GAS serves HTML natively via `HtmlService` |
| **Styling** | Tailwind CSS (CDN) | Utility-first, rapid prototyping, zero build step |
| **Icons** | Material Symbols (CDN) | Google's icon library, variable weight/fill |
| **Fonts** | Inter + JetBrains Mono (CDN) | Clean sans-serif + monospace for code blocks |
| **Charts** | Chart.js (CDN, MiniPOS only) | Client-side visualization from Sheets data |

### 3.2 Deployment Model

Each product is a standalone HTML file served by GAS `HtmlService`:

```javascript
// Code.gs
function doGet(e) {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('Systems Universe | POS Systems Showcase')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1.0');
}
```

- **Public URL format:** `https://script.google.com/macros/s/{DEPLOY_ID}/exec`
- **No custom domain needed** — `script.google.com` is universally trusted
- **Auto-SSL** — Google handles TLS termination
- **Mobile-responsive** — Tailwind breakpoints, tested on iPhone 12 Pro viewport

### 3.3 Frontend Architecture Pattern

```
index.html
├── <head>
│   ├── Tailwind CSS (CDN)
│   ├── Google Fonts (CDN)
│   ├── Material Symbols (CDN)
│   ├── Tailwind config (inline)
│   └── Custom CSS animations (inline)
├── <body>
│   ├── Navigation (sticky, scroll-spy)
│   ├── Hero section (animated SVG diagram, particles, glow)
│   ├── Metrics strip
│   ├── Product cards (CSS Grid, flex-aligned buttons)
│   ├── How We Build (pipeline visualization)
│   ├── Infrastructure Stack
│   ├── Development Roadmap
│   ├── About (profile, LinkedIn, Email contact)
│   └── Footer
└── <script>
    ├── Scroll spy navigation
    ├── Smooth scroll
    ├── Contact popup (mailto / Gmail / copy)
    └── Email copy to clipboard
```

### 3.4 Image Strategy

| Environment | Approach |
|-------------|----------|
| **Local dev** (`products/index.html`) | Relative path: `images/ThanhNQ.jpg` |
| **GAS deploy** (`gas-deploy/Index.html`) | Base64 data URI embedded inline |

**Why base64 for GAS?** GAS `HtmlService` does not serve static assets from the project file system. Embedding images as base64 makes the HTML fully self-contained, working regardless of repo visibility or external hosting.

---

## Chapter 4: Backend & Database Layer

### 4.1 Google Sheets as a Database

Google Sheets is used as a **live, relational database** with the following characteristics:

| Database Concept | Sheets Equivalent |
|-----------------|-------------------|
| **Table** | Sheet (tab) |
| **Row** | Spreadsheet row |
| **Column** | Spreadsheet column |
| **Primary Key** | Column A (ID) |
| **CRUD operations** | `SpreadsheetApp` API in GAS |
| **Index** | Not supported (small datasets) |
| **Transactions** | Not natively supported (app-level locking) |

### 4.2 Data Schema (MiniPOS example)

**Products Sheet:**
| id | name | sku | category | purchasePrice | sellingPrice | stock | unit | barcode |
|----|------|-----|----------|---------------|-------------|-------|------|---------|

**Orders Sheet:**
| id | orderNo | date | items (JSON) | subtotal | discount | total | paymentMethod | cashierName | customerName |

**Customers Sheet:**
| id | name | phone | address | createdAt |

**Expenses Sheet:**
| id | date | category | amount | note | cashierName |

### 4.3 GAS Backend Pattern

```javascript
// Code.gs — MiniPOS backend
function doGet(e) {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('MiniPOS — Point of Sale')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function getProducts() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Products');
  const data = sheet.getDataRange().getValues();
  // Convert to array of objects, return to client
  return data.slice(1).map(row => ({ id: row[0], name: row[1], /* ... */ }));
}

// Called from client: google.script.run.getProducts()
```

### 4.4 Client-Server Communication

```
[Browser]                          [GAS Server]                    [Sheets]
    │                                    │                              │
    │ google.script.run.getProducts()    │                              │
    │───────────────────────────────────→│                              │
    │                                    │ SpreadsheetApp.getActive()   │
    │                                    │─────────────────────────────→│
    │                                    │←─────────────────────────────│
    │←───────────────────────────────────│                              │
    │ renderProducts(data)               │                              │
```

**Fallback mode:** When running locally (no `google.script.run` available), the app operates in offline/demo mode with hardcoded sample data.

---

## Chapter 5: Design & UX Layer

### 5.1 Design Tooling

**Google Stitch** is used as the primary design tool (vibe design, free). The design workflow:

1. **Concept:** Rough layout ideas discussed with Claude Code
2. **Mockup:** Google Stitch for visual design and component arrangement
3. **Implementation:** Claude Code translates designs to Tailwind CSS
4. **Iteration:** Visual feedback loop — screenshot → describe issues → code fix

### 5.2 Design System

**Colors** (based on Material Design 3 tonal palette):

| Token | Hex | Usage |
|-------|-----|-------|
| `primary` | `#000613` | Headers, navigation, primary buttons |
| `secondary` | `#005eb2` | Links, highlights, active indicators |
| `surface` | `#f9f9f9` | Page background |
| `surface-container-lowest` | `#ffffff` | Card backgrounds |
| `outline-variant` | `#c4c6cf` | Borders, dividers |
| `error` | `#ba1a1a` | Danger indicators |
| `success` | `#10b981` | Live status indicator |

**Typography:**
- **Headlines:** Inter, 600–700 weight, uppercase
- **Body:** Inter, 400 weight
- **Code/Technical:** JetBrains Mono, 400–500 weight

**Spacing scale:** Based on Tailwind defaults (4px base unit)

### 5.3 UX Principles

1. **Technical aesthetic:** Code-like UI elements (comment syntax `//`, monospace badges, blueprint background pattern) signal "developer-built quality"
2. **Immediate trust:** Status badges (LIVE/RESEARCH/PLANNING), maturity bars, and version numbers communicate transparency
3. **Progressive disclosure:** Product cards show summary → click to launch full app
4. **Zero friction contact:** 3-option email popup ensures visitors can reach out regardless of their email setup

---

## Chapter 6: CI/CD Pipeline

### 6.1 Development Flow

```
┌────────┐    ┌───────────┐    ┌──────────┐    ┌──────────┐
│ IDE    │    │ Local Test │    │ Git Push │    │ GAS Deploy│
│ VS Code│───→│ Browser   │───→│ GitHub   │───→│ Web App  │
│ Claude │    │ file://   │    │ (backup) │    │ (prod)   │
└────────┘    └───────────┘    └──────────┘    └──────────┘
```

### 6.2 Environments

| Environment | URL / Path | Purpose |
|-------------|-----------|---------|
| **Local** | `file:///C:/Workspace/OPC/products/index.html` | Development & preview |
| **Staging** | GAS Dev deployment (optional) | Pre-prod testing |
| **Production** | `https://script.google.com/macros/s/{ID}/exec` | Public-facing |

### 6.3 Deploy Checklist

Before each production deployment:

- [ ] All text reviewed (English, no placeholder content)
- [ ] Images loaded (base64 embedded for GAS)
- [ ] Links verified (Live Demo, LinkedIn, Email)
- [ ] Mobile responsive (tested at 375px, 768px, 1280px)
- [ ] Navigation smooth scroll works
- [ ] Contact popup opens and all 3 options work
- [ ] Git committed and pushed

### 6.4 Rollback Procedure

1. Git: `git revert <commit-hash>` or checkout previous version
2. GAS: **Deploy → Manage Deployments →** select previous version → **Activate**
3. No downtime — GAS switches versions instantly

### 6.5 Versioning Convention

```
v{major}.{minor}.{patch}
```

- **Major:** New product launch or architectural change
- **Minor:** New feature or section added
- **Patch:** Bug fix, typo, styling adjustment

---

## Chapter 7: Product Registry

### 7.1 Product Catalog

| Code | Name | Status | Maturity | GAS Project | Sheets DB | Live URL |
|------|------|--------|----------|-------------|-----------|----------|
| MP_001 | MiniPOS | 🟢 LIVE | 5/5 | TBD | TBD | TBD |
| CF_002 | CoffeePOS | 🔵 RESEARCH | 1/5 | — | — | — |
| RT_003 | RestaurantPOS | ⚪ PLANNING | 0/5 | — | — | — |
| RL_004 | RetailPOS | ⚪ IDEA | 0/5 | — | — | — |
| DL_005 | Data Lens | 🟡 BUILDING | 2/5 | — | — | — |
| QR_006 | QR Order | 🔵 RESEARCH | 1/5 | — | — | — |

### 7.2 Product Lifecycle Stages

```
IDEA → RESEARCH → PLANNING → BUILDING → LIVE → MAINTAINED → RETIRED
  │        │          │          │        │
  └─ Idea ─┘── Research ─┘── Plan ─┘─ Build ─┘─ Active ─┘
     no code     feasibility   spec     dev       users
```

---

## Chapter 8: Operations & Monitoring

### 8.1 Health Checks

| Check | Method | Frequency |
|-------|--------|-----------|
| Web App reachable | Open URL in browser | Weekly |
| GAS executions | GAS Dashboard → Executions | Weekly |
| Sheets data integrity | Manual spot-check | Per transaction batch |
| Link validity | Click-through test | Per deploy |

### 8.2 Logging

GAS automatically logs to Stackdriver (Google Cloud Operations). Custom logging:

```javascript
function logEvent(event, data) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('_HubLogs');
  if (sheet) {
    sheet.appendRow([new Date(), event, JSON.stringify(data || {})]);
  }
}
```

### 8.3 Backup Strategy

- **Code:** GitHub is the primary backup (`git push` after every session)
- **Data (Sheets):** Google Sheets has built-in version history (File → Version History)
- **Manual export:** Periodic CSV export of critical sheets

---

## Chapter 9: Lessons Learned

### 9.1 What Works Well

1. **GAS Web App + Sheets is genuinely production-ready** for SMB-scale applications
2. **Claude Code 10x acceleration** is real — entire features delivered in single sessions
3. **Tailwind CDN** eliminates build tools while maintaining design consistency
4. **Base64 images** solve the GAS static asset limitation cleanly
5. **Zero-cost is a powerful USP** — both for customers and for development agility

### 9.2 Pain Points

1. **GAS Editor UX** — not designed for large files, no diff view, limited debugging
2. **No custom domain** — `script.google.com` works but lacks brand polish
3. **Sheets as DB** — no transactions, no indexes, no migrations (acceptable at small scale)
4. **Image handling** — base64 works but adds ~135KB to HTML payload
5. **Single-user deploy** — only the project owner can deploy (team collaboration via shared Google account)

### 9.3 Future Improvements

- [ ] Explore Google Sites or Cloudflare Workers for custom domain
- [ ] Implement Sheets-based analytics dashboard (Data Lens product)
- [ ] Build automated test suite for GAS backend functions
- [ ] Set up Google Analytics on Hub page
- [ ] Create deployment script to sync local → GAS via `clasp` CLI

---

> **Last updated:** June 16, 2026
>
> **Next review:** When a new product enters BUILDING stage or a significant architecture decision is made.
