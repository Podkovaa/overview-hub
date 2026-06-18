/**
 * ============================================================
 * Systems Universe — Google Apps Script Backend
 * ============================================================
 * File: Code.gs
 * Purpose: Serve the Systems Universe overview page as a GAS Web App.
 *          All logic is client-side (HTML/CSS/JS). This backend
 *          handles HTTP routing and optional API endpoints.
 *
 * Architecture:
 *   Claude Code AI → VS Code → Google Apps Script → Google Sheets (DB)
 *
 * Deploy:
 *   Deploy → New Deployment → Web App → Execute as: Me → Anyone
 * ============================================================
 */

// ──────────────────────────────────────────
// WEB APP ENTRY POINT
// ──────────────────────────────────────────

/**
 * doGet() — Handles all GET requests to the Web App URL.
 * Serves the main Index.html hub page.
 *
 * @param {Object} e - Event object with query parameters
 * @returns {HtmlOutput} The rendered HTML page
 */
function doGet(e) {
  const page = e && e.parameter && e.parameter.page ? e.parameter.page : null;

  // Route to specific pages if needed (future expansion)
  if (page === 'minipos-info') {
    return renderPage('MiniPOSInfo', 'MiniPOS — Chi tiết | Systems Universe');
  }

  // Default: serve the main hub overview
  return renderPage('Index', 'Systems Universe | POS Systems Showcase');
}

/**
 * doPost() — Handles POST requests (for future API usage).
 *
 * @param {Object} e - Event object with POST data
 * @returns {ContentService} JSON response
 */
function doPost(e) {
  return ContentService
    .createTextOutput(JSON.stringify({
      status: 'ok',
      message: 'Systems Universe API v1.0',
      timestamp: new Date().toISOString()
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

// ──────────────────────────────────────────
// HTML RENDERING
// ──────────────────────────────────────────

/**
 * Renders an HTML file from the project with a given title.
 * Uses Google's HtmlService with sandboxed IFRAME mode.
 *
 * @param {string} filename - Name of the HTML file (without .html)
 * @param {string} title - Page title
 * @returns {HtmlOutput}
 */
function renderPage(filename, title) {
  try {
    const html = HtmlService.createHtmlOutputFromFile(filename)
      .setTitle(title)
      .setFaviconUrl('https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsoutlined/storefront/default/48px.svg')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
      .addMetaTag('viewport', 'width=device-width, initial-scale=1.0');
    return html;
  } catch (e) {
    return HtmlService.createHtmlOutput(
      '<h1>404 — Page Not Found</h1><p>' + e.message + '</p>'
    ).setTitle('Systems Universe — Error');
  }
}

/**
 * Includes an HTML file as a partial (for template composition).
 *
 * @param {string} filename - Name of the HTML file
 * @returns {HtmlOutput}
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

// ──────────────────────────────────────────
// API ENDPOINTS (Optional — for future use)
// ──────────────────────────────────────────

/**
 * Returns system status / health check.
 * Call from client via: google.script.run.withSuccessHandler(fn).getStatus()
 *
 * @returns {Object} Status object
 */
function getStatus() {
  return {
    app: 'Systems Universe',
    version: '1.0.0',
    timezone: Session.getScriptTimeZone(),
    serverTime: new Date().toISOString(),
    status: 'OPERATIONAL',
    products: getProductCount()
  };
}

/**
 * Returns product count from configuration (placeholder).
 * In production, this reads from a Google Sheet.
 *
 * @returns {number}
 */
function getProductCount() {
  return 6; // MiniPOS, CoffeePOS, RestaurantPOS, RetailPOS, DataLens, QR Order
}

// ──────────────────────────────────────────
// UTILITIES
// ──────────────────────────────────────────

/**
 * Logs an event with timestamp — useful for debugging.
 *
 * @param {string} event - Event name
 * @param {Object} data - Optional data to log
 */
function logEvent(event, data) {
  const sheet = getOrCreateLogSheet();
  sheet.appendRow([new Date(), event, JSON.stringify(data || {})]);
}

/**
 * Gets or creates a log sheet for the hub.
 *
 * @returns {Sheet}
 */
function getOrCreateLogSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('_HubLogs');
  if (!sheet) {
    sheet = ss.insertSheet('_HubLogs');
    sheet.appendRow(['Timestamp', 'Event', 'Data']);
  }
  return sheet;
}

/**
 * Creates a test spreadsheet for the hub if one doesn't exist.
 * This is optional — the hub works as a static site without it.
 */
function setupHubSpreadsheet() {
  const ss = SpreadsheetApp.create('Systems Universe_Data');
  ss.appendRow(['ID', 'Name', 'Status', 'Version', 'Maturity', 'DemoURL', 'Description']);
  ss.appendRow(['MP_001', 'MiniPOS', 'LIVE', 'v1.0', 5, '', 'POS cho cửa hàng nhỏ']);
  ss.appendRow(['CF_002', 'CoffeePOS', 'RESEARCH', 'v0.0', 1, '', 'POS cho quán cà phê']);
  ss.appendRow(['RT_003', 'RestaurantPOS', 'PLANNING', 'v0.0', 0, '', 'POS cho nhà hàng']);
  ss.appendRow(['RL_004', 'RetailPOS', 'IDEA', 'v0.0', 0, '', 'POS cho chuỗi bán lẻ']);
  ss.appendRow(['DL_005', 'Data Lens', 'BUILDING', 'v0.0', 2, '', 'Dashboard phân tích']);
  ss.appendRow(['QR_006', 'QR Order', 'RESEARCH', 'v0.0', 1, '', 'Gọi món QR']);
  Logger.log('Hub spreadsheet created: ' + ss.getUrl());
  return ss.getUrl();
}
