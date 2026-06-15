// ============================================================
// Portfolio Tracker — Quản lý danh mục Coin & Stock
// Google Sheets + Apps Script (0đ hosting)
// ============================================================

function uid_() { return Utilities.getUuid(); }
function fmtDate_(d) { return Utilities.formatDate(d || new Date(), 'Asia/Ho_Chi_Minh', 'yyyy-MM-dd'); }

function getSheet_(name, headers) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(name);
  if (!sheet) { sheet = ss.insertSheet(name); if (headers) sheet.appendRow(headers); }
  return sheet;
}

// === KHỞI TẠO =================================================

function initSheets_() {
  getSheet_('PortfolioAssets', ['id', 'symbol', 'name', 'type', 'exchange', 'currentPrice', 'priceUpdatedAt', 'active']);
  getSheet_('PortfolioTx', ['id', 'date', 'assetId', 'type', 'quantity', 'pricePerUnit', 'total', 'fees', 'notes', 'createdAt']);

  var sheet = getSheet_('PortfolioAssets');
  if (sheet.getLastRow() <= 1) {
    var assets = [
      [uid_(), 'BTC', 'Bitcoin', 'crypto', 'Binance', 0, '', 'true'],
      [uid_(), 'ETH', 'Ethereum', 'crypto', 'Binance', 0, '', 'true'],
      [uid_(), 'SOL', 'Solana', 'crypto', 'Binance', 0, '', 'true'],
      [uid_(), 'VNM', 'Vinamilk', 'stock', 'HOSE', 0, '', 'true'],
      [uid_(), 'FPT', 'FPT Corp', 'stock', 'HOSE', 0, '', 'true'],
      [uid_(), 'TCB', 'Techcombank', 'stock', 'HOSE', 0, '', 'true'],
      [uid_(), 'AAPL', 'Apple Inc', 'stock', 'NASDAQ', 0, '', 'true'],
      [uid_(), 'QQQ', 'Invesco QQQ ETF', 'stock', 'NASDAQ', 0, '', 'true']
    ];
    assets.forEach(function(a) { sheet.appendRow(a); });
  }
}

// === ASSETS ====================================================

function getAssets() {
  var data = getSheet_('PortfolioAssets').getDataRange().getValues();
  return data.slice(1).filter(function(r) { return r[7] === 'true'; }).map(function(r) {
    return { id: r[0], symbol: r[1], name: r[2], type: r[3], exchange: r[4], currentPrice: Number(r[5]), priceUpdatedAt: r[6] };
  });
}

function addAsset(asset) {
  getSheet_('PortfolioAssets').appendRow([uid_(), asset.symbol.toUpperCase(), asset.name, asset.type, asset.exchange || '', Number(asset.currentPrice) || 0, '', 'true']);
  return { success: true };
}

function updateAssetPrice(id, price) {
  var sheet = getSheet_('PortfolioAssets');
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === id) { sheet.getRange(i+1, 6).setValue(Number(price)); sheet.getRange(i+1, 7).setValue(new Date().toISOString()); return { success: true }; }
  }
  return { success: false };
}

function updateAllPrices(prices) {
  var sheet = getSheet_('PortfolioAssets');
  var data = sheet.getDataRange().getValues();
  var now = new Date().toISOString();
  for (var key in prices) {
    for (var i = 1; i < data.length; i++) {
      if (data[i][1] === key.toUpperCase()) { sheet.getRange(i+1, 6).setValue(Number(prices[key])); sheet.getRange(i+1, 7).setValue(now); break; }
    }
  }
  return { success: true };
}

// === TRANSACTIONS ==============================================

function addPortfolioTx(tx) {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var total = Number(tx.quantity) * Number(tx.pricePerUnit);
    getSheet_('PortfolioTx').appendRow([uid_(), tx.date || fmtDate_(new Date()), tx.assetId, tx.type, Number(tx.quantity), Number(tx.pricePerUnit), total, Number(tx.fees) || 0, tx.notes || '', new Date().toISOString()]);
    return { success: true };
  } finally { lock.releaseLock(); }
}

function getPortfolioTx(assetId) {
  var data = getSheet_('PortfolioTx').getDataRange().getValues();
  var result = [];
  for (var i = data.length - 1; i >= 1; i--) {
    if (assetId && data[i][2] !== assetId) continue;
    result.push({ id: data[i][0], date: data[i][1], assetId: data[i][2], type: data[i][3], quantity: Number(data[i][4]), pricePerUnit: Number(data[i][5]), total: Number(data[i][6]), fees: Number(data[i][7]), notes: data[i][8] });
  }
  return result;
}

function deletePortfolioTx(id) {
  var sheet = getSheet_('PortfolioTx');
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === id) { sheet.deleteRow(i+1); return { success: true }; }
  }
  return { success: false };
}

// === PORTFOLIO ANALYTICS (FIFO) ================================

function getPortfolioOverview() {
  initSheets_();
  var assets = getSheet_('PortfolioAssets').getDataRange().getValues().slice(1);
  var txs = getSheet_('PortfolioTx').getDataRange().getValues().slice(1);

  var holdings = {};
  var totalInvested = 0, totalCurrentValue = 0, totalRealizedPnl = 0;

  for (var i = 0; i < assets.length; i++) {
    if (assets[i][7] !== 'true') continue;
    var assetId = assets[i][0], symbol = assets[i][1], name = assets[i][2], type = assets[i][3], currentPrice = Number(assets[i][5]);

    var totalQty = 0, realizedPnl = 0;
    var buyQueue = [];
    var assetTxs = txs.filter(function(t) { return t[2] === assetId; }).sort(function(a, b) { return new Date(a[1]) - new Date(b[1]); });

    for (var j = 0; j < assetTxs.length; j++) {
      var tx = assetTxs[j];
      var qty = Number(tx[4]), price = Number(tx[5]), fees = Number(tx[7]);

      if (tx[3] === 'buy') {
        buyQueue.push({ qty: qty, price: price + (qty > 0 ? fees / qty : 0) });
        totalQty += qty;
      } else if (tx[3] === 'sell') {
        var sellQty = qty;
        while (sellQty > 0 && buyQueue.length > 0) {
          var batch = buyQueue[0];
          var matchedQty = Math.min(sellQty, batch.qty);
          realizedPnl += matchedQty * (price - batch.price) - (fees * matchedQty / qty);
          batch.qty -= matchedQty;
          sellQty -= matchedQty;
          if (batch.qty <= 0) buyQueue.shift();
        }
        totalQty -= qty;
      }
    }

    var avgCost = 0, remainingCost = 0;
    for (var k = 0; k < buyQueue.length; k++) {
      avgCost += buyQueue[k].qty * buyQueue[k].price;
      remainingCost += buyQueue[k].qty * buyQueue[k].price;
    }
    if (totalQty > 0) avgCost = avgCost / totalQty;

    var currentValue = totalQty * currentPrice;
    var unrealizedPnl = currentValue - remainingCost;
    var pnlPercent = remainingCost > 0 ? (unrealizedPnl / remainingCost * 100) : 0;

    holdings[assetId] = { assetId: assetId, symbol: symbol, name: name, type: type, quantity: totalQty, avgCost: avgCost, currentPrice: currentPrice, totalInvested: remainingCost, currentValue: currentValue, unrealizedPnl: unrealizedPnl, unrealizedPnlPercent: pnlPercent, realizedPnl: realizedPnl };

    totalInvested += remainingCost;
    totalCurrentValue += currentValue;
    totalRealizedPnl += realizedPnl;
  }

  var activeHoldings = Object.values(holdings).filter(function(h) { return h.quantity > 0; });
  var allocationByType = {}, allocationByAsset = [];
  activeHoldings.forEach(function(h) {
    if (!allocationByType[h.type]) allocationByType[h.type] = 0;
    allocationByType[h.type] += h.currentValue;
    allocationByAsset.push({ symbol: h.symbol, value: h.currentValue, percent: totalCurrentValue > 0 ? h.currentValue / totalCurrentValue * 100 : 0 });
  });
  activeHoldings.sort(function(a, b) { return b.currentValue - a.currentValue; });

  return {
    totalInvested: totalInvested, totalCurrentValue: totalCurrentValue,
    totalUnrealizedPnl: totalCurrentValue - totalInvested,
    totalUnrealizedPnlPercent: totalInvested > 0 ? ((totalCurrentValue - totalInvested) / totalInvested * 100) : 0,
    totalRealizedPnl: totalRealizedPnl, holdings: activeHoldings,
    allocationByType: allocationByType, allocationByAsset: allocationByAsset,
    holdingCount: activeHoldings.length
  };
}

// === WEB APP ===================================================

function doGet() {
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('Portfolio Tracker')
    .setFaviconUrl('https://cdn-icons-png.flaticon.com/512/893/893078.png')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
}

// === DỮ LIỆU MẪU ==============================================

function setupDemo() {
  initSheets_();
  var assets = getAssets();
  var today = new Date();
  var demoTxs = [];

  for (var a = 0; a < assets.length; a++) {
    var asset = assets[a];
    var basePrice = asset.type === 'crypto' ? [20000, 1500, 20, 0][a % 4] * 1000000 : [70000, 120000, 35000, 180, 400][a % 5] * 1000;
    if (basePrice === 0) basePrice = 500000;

    var numBuys = Math.floor(Math.random() * 3) + 2;
    for (var b = 0; b < numBuys; b++) {
      var date = new Date(today.getTime() - (90 - b * 20) * 86400000);
      var qty = asset.type === 'crypto' ? (Math.random() * 0.5 + 0.01).toFixed(4) : Math.floor(Math.random() * 500) + 10;
      var price = basePrice * (0.85 + Math.random() * 0.3);
      demoTxs.push([fmtDate_(date), asset.id, 'buy', qty, Math.round(price), 0, 0, 'Mua mẫu']);
    }
    if (Math.random() < 0.5) {
      var sellDate = new Date(today.getTime() - Math.floor(Math.random() * 30) * 86400000);
      var sellQty = asset.type === 'crypto' ? (Math.random() * 0.1).toFixed(4) : Math.floor(Math.random() * 200) + 5;
      var sellPrice = basePrice * (1.05 + Math.random() * 0.3);
      demoTxs.push([fmtDate_(sellDate), asset.id, 'sell', sellQty, Math.round(sellPrice), 0, Math.round(sellPrice * Number(sellQty) * 0.001), 'Bán mẫu']);
    }
  }

  demoTxs.forEach(function(tx) {
    var total = Number(tx[3]) * Number(tx[4]);
    getSheet_('PortfolioTx').appendRow([uid_(), tx[0], tx[1], tx[2], Number(tx[3]), Number(tx[4]), total, Number(tx[6]), tx[7], new Date().toISOString()]);
  });

  updateAllPrices({ BTC: 950000000, ETH: 55000000, SOL: 4200000, VNM: 72000, FPT: 135000, TCB: 42000, AAPL: 195, QQQ: 480 });
  return { success: true, message: 'Đã tạo ' + demoTxs.length + ' giao dịch mẫu cho ' + assets.length + ' tài sản' };
}
