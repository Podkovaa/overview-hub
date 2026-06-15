// ============================================================
// MiniFinance — Quản lý Tài chính Cá nhân & Portfolio
// Google Sheets + Apps Script (0đ hosting)
// ============================================================

// === TIỆN ÍCH CHUNG ==========================================

function getSheet_(name, headers) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    if (headers) sheet.appendRow(headers);
  }
  return sheet;
}

function uid_() { return Utilities.getUuid(); }

function fmtDate_(d) {
  return Utilities.formatDate(d || new Date(), 'Asia/Ho_Chi_Minh', 'yyyy-MM-dd');
}

// =============================================================
// PHẦN 1: QUẢN LÝ TÀI CHÍNH CÁ NHÂN
// =============================================================

// === KHỞI TẠO SHEETS =========================================

function initFinanceSheets_() {
  getSheet_('TxCategories', ['id', 'name', 'type', 'icon', 'color', 'monthlyBudget']);
  getSheet_('Accounts', ['id', 'name', 'type', 'initialBalance', 'currentBalance', 'currency', 'active']);
  getSheet_('Transactions', ['id', 'date', 'type', 'category', 'amount', 'description', 'accountId', 'tags', 'createdAt']);
  getSheet_('SavingsGoals', ['id', 'name', 'targetAmount', 'currentAmount', 'startDate', 'deadline', 'icon', 'color', 'status']);
  getSheet_('BudgetMonths', ['id', 'month', 'category', 'budgetAmount', 'actualAmount', 'difference']);

  // Seed categories nếu trống
  var catSheet = getSheet_('TxCategories');
  if (catSheet.getLastRow() <= 1) {
    var cats = [
      [uid_(), 'Lương', 'income', '💰', '#10b981', 0],
      [uid_(), 'Thưởng', 'income', '🎁', '#10b981', 0],
      [uid_(), 'Freelance', 'income', '💻', '#10b981', 0],
      [uid_(), 'Đầu tư', 'income', '📈', '#10b981', 0],
      [uid_(), 'Khác (thu)', 'income', '📥', '#10b981', 0],
      [uid_(), 'Ăn uống', 'expense', '🍜', '#ef4444', 3000000],
      [uid_(), 'Di chuyển', 'expense', '🏍️', '#f59e0b', 1000000],
      [uid_(), 'Nhà ở & Điện nước', 'expense', '🏠', '#8b5cf6', 3000000],
      [uid_(), 'Mua sắm', 'expense', '🛍️', '#ec4899', 2000000],
      [uid_(), 'Giải trí', 'expense', '🎬', '#06b6d4', 1500000],
      [uid_(), 'Sức khỏe', 'expense', '💊', '#14b8a6', 500000],
      [uid_(), 'Học tập', 'expense', '📚', '#6366f1', 1000000],
      [uid_(), 'Khác (chi)', 'expense', '📤', '#6b7280', 2000000]
    ];
    cats.forEach(function(c) { catSheet.appendRow(c); });
  }

  // Seed accounts nếu trống
  var accSheet = getSheet_('Accounts');
  if (accSheet.getLastRow() <= 1) {
    var accs = [
      [uid_(), 'Tiền mặt', 'cash', 0, 0, 'VND', 'true'],
      [uid_(), 'Tài khoản ngân hàng', 'bank', 0, 0, 'VND', 'true'],
      [uid_(), 'Ví MoMo', 'ewallet', 0, 0, 'VND', 'true']
    ];
    accs.forEach(function(a) { accSheet.appendRow(a); });
  }
}

// === DANH MỤC ================================================

function getCategories() {
  var data = getSheet_('TxCategories').getDataRange().getValues();
  return data.slice(1).map(function(r) {
    return { id: r[0], name: r[1], type: r[2], icon: r[3], color: r[4], monthlyBudget: Number(r[5]) };
  });
}

function addCategory(cat) {
  getSheet_('TxCategories').appendRow([uid_(), cat.name, cat.type, cat.icon || '📌', cat.color || '#6b7280', Number(cat.monthlyBudget) || 0]);
  return { success: true };
}

function updateCategory(id, cat) {
  var sheet = getSheet_('TxCategories');
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === id) {
      sheet.getRange(i+1, 2).setValue(cat.name);
      sheet.getRange(i+1, 3).setValue(cat.type);
      sheet.getRange(i+1, 4).setValue(cat.icon || '📌');
      sheet.getRange(i+1, 5).setValue(cat.color || '#6b7280');
      sheet.getRange(i+1, 6).setValue(Number(cat.monthlyBudget) || 0);
      return { success: true };
    }
  }
  return { success: false };
}

// === TÀI KHOẢN ===============================================

function getAccounts() {
  var data = getSheet_('Accounts').getDataRange().getValues();
  return data.slice(1).filter(function(r) { return r[6] === 'true'; }).map(function(r) {
    return { id: r[0], name: r[1], type: r[2], initialBalance: Number(r[3]), currentBalance: Number(r[4]), currency: r[5] };
  });
}

function addAccount(acc) {
  getSheet_('Accounts').appendRow([uid_(), acc.name, acc.type, Number(acc.initialBalance) || 0, Number(acc.initialBalance) || 0, acc.currency || 'VND', 'true']);
  return { success: true };
}

// === GIAO DỊCH ===============================================

function addTransaction(tx) {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var id = uid_();
    var now = new Date().toISOString();
    var date = tx.date || fmtDate_(new Date());
    getSheet_('Transactions').appendRow([id, date, tx.type, tx.category, Number(tx.amount), tx.description || '', tx.accountId || '', tx.tags || '', now]);

    // Cập nhật số dư tài khoản
    if (tx.accountId) {
      var accSheet = getSheet_('Accounts');
      var accData = accSheet.getDataRange().getValues();
      for (var i = 1; i < accData.length; i++) {
        if (accData[i][0] === tx.accountId) {
          var newBalance = Number(accData[i][4]) + (tx.type === 'income' ? Number(tx.amount) : -Number(tx.amount));
          accSheet.getRange(i+1, 5).setValue(newBalance);
          break;
        }
      }
    }
    return { success: true, id: id };
  } finally { lock.releaseLock(); }
}

function getTransactions(filters) {
  filters = filters || {};
  var data = getSheet_('Transactions').getDataRange().getValues();
  var result = [];
  for (var i = data.length - 1; i >= 1; i--) {
    var r = data[i];
    if (filters.type && r[2] !== filters.type) continue;
    if (filters.month) {
      var txMonth = String(r[1]).substring(0, 7);
      if (txMonth !== filters.month) continue;
    }
    if (filters.category && r[3] !== filters.category) continue;
    if (filters.accountId && r[6] !== filters.accountId) continue;
    result.push({ id: r[0], date: r[1], type: r[2], category: r[3], amount: Number(r[4]), description: r[5], accountId: r[6], tags: r[7] });
    if (filters.limit && result.length >= filters.limit) break;
  }
  return result;
}

function deleteTransaction(id) {
  var sheet = getSheet_('Transactions');
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === id) {
      // Hoàn lại số dư
      if (data[i][6]) {
        var accSheet = getSheet_('Accounts');
        var accData = accSheet.getDataRange().getValues();
        for (var j = 1; j < accData.length; j++) {
          if (accData[j][0] === data[i][6]) {
            var revert = data[i][2] === 'income' ? -Number(data[i][4]) : Number(data[i][4]);
            accSheet.getRange(j+1, 5).setValue(Number(accData[j][4]) + revert);
            break;
          }
        }
      }
      sheet.deleteRow(i+1);
      return { success: true };
    }
  }
  return { success: false };
}

// === MỤC TIÊU TIẾT KIỆM ======================================

function getSavingsGoals() {
  var data = getSheet_('SavingsGoals').getDataRange().getValues();
  return data.slice(1).map(function(r) {
    return { id: r[0], name: r[1], targetAmount: Number(r[2]), currentAmount: Number(r[3]), startDate: r[4], deadline: r[5], icon: r[6], color: r[7], status: r[8] };
  });
}

function addSavingsGoal(goal) {
  getSheet_('SavingsGoals').appendRow([uid_(), goal.name, Number(goal.targetAmount), Number(goal.currentAmount) || 0, fmtDate_(new Date()), goal.deadline || '', goal.icon || '🎯', goal.color || '#6366f1', 'active']);
  return { success: true };
}

function updateSavingsGoal(id, amount) {
  var sheet = getSheet_('SavingsGoals');
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === id) {
      var newAmount = Number(data[i][3]) + Number(amount);
      sheet.getRange(i+1, 4).setValue(newAmount);
      if (newAmount >= Number(data[i][2])) sheet.getRange(i+1, 9).setValue('completed');
      return { success: true, newAmount: newAmount };
    }
  }
  return { success: false };
}

// === DASHBOARD TÀI CHÍNH =====================================

function getFinanceDashboard() {
  initFinanceSheets_();
  var month = fmtDate_(new Date()).substring(0, 7);
  var prevMonth = new Date();
  prevMonth.setMonth(prevMonth.getMonth() - 1);
  var prevMonthStr = Utilities.formatDate(prevMonth, 'Asia/Ho_Chi_Minh', 'yyyy-MM');

  var txData = getSheet_('Transactions').getDataRange().getValues();
  var catData = getSheet_('TxCategories').getDataRange().getValues();
  var accData = getSheet_('Accounts').getDataRange().getValues();
  var goalData = getSheet_('SavingsGoals').getDataRange().getValues();

  // Thu nhập tháng
  var monthIncome = 0, monthExpense = 0, prevMonthIncome = 0, prevMonthExpense = 0;
  var categoryBreakdown = {};
  var dailyCashflow = {};

  for (var i = 1; i < txData.length; i++) {
    var txMonth = String(txData[i][1]).substring(0, 7);
    var txDate = String(txData[i][1]).substring(0, 10);
    var txType = txData[i][2];
    var txCat = txData[i][3];
    var txAmount = Number(txData[i][4]);

    if (txMonth === month) {
      if (txType === 'income') monthIncome += txAmount;
      else monthExpense += txAmount;

      if (!categoryBreakdown[txCat]) categoryBreakdown[txCat] = { category: txCat, type: txType, amount: 0 };
      categoryBreakdown[txCat].amount += txAmount;

      if (!dailyCashflow[txDate]) dailyCashflow[txDate] = { income: 0, expense: 0 };
      if (txType === 'income') dailyCashflow[txDate].income += txAmount;
      else dailyCashflow[txDate].expense += txAmount;
    }
    if (txMonth === prevMonthStr) {
      if (txType === 'income') prevMonthIncome += txAmount;
      else prevMonthExpense += txAmount;
    }
  }

  // Tổng tài sản
  var totalBalance = 0;
  for (var a = 1; a < accData.length; a++) {
    if (accData[a][6] === 'true') totalBalance += Number(accData[a][4]);
  }

  // Mục tiêu tiết kiệm
  var goals = [];
  for (var g = 1; g < goalData.length; g++) {
    goals.push({ name: goalData[g][1], target: Number(goalData[g][2]), current: Number(goalData[g][3]), status: goalData[g][8] });
  }

  // Budget vs actual
  var budgetComparison = [];
  for (var c = 1; c < catData.length; c++) {
    if (catData[c][2] === 'expense' && Number(catData[c][5]) > 0) {
      var catName = catData[c][1];
      var budget = Number(catData[c][5]);
      var actual = (categoryBreakdown[catName] || {}).amount || 0;
      budgetComparison.push({ category: catName, icon: catData[c][3], color: catData[c][4], budget: budget, actual: actual, remaining: budget - actual });
    }
  }

  // Dòng tiền 30 ngày gần nhất
  var cashflowDays = Object.keys(dailyCashflow).sort();
  var cfData = cashflowDays.map(function(d) { return { date: d, income: dailyCashflow[d].income, expense: dailyCashflow[d].expense }; });

  return {
    month: month,
    totalBalance: totalBalance,
    monthIncome: monthIncome,
    monthExpense: monthExpense,
    monthNet: monthIncome - monthExpense,
    savingsRate: monthIncome > 0 ? Math.round((monthIncome - monthExpense) / monthIncome * 100) : 0,
    prevMonthIncome: prevMonthIncome,
    prevMonthExpense: prevMonthExpense,
    incomeChange: prevMonthIncome > 0 ? Math.round((monthIncome - prevMonthIncome) / prevMonthIncome * 100) : 0,
    expenseChange: prevMonthExpense > 0 ? Math.round((monthExpense - prevMonthExpense) / prevMonthExpense * 100) : 0,
    categoryBreakdown: Object.values(categoryBreakdown),
    budgetComparison: budgetComparison,
    cashflow: cfData.slice(-30),
    goals: goals
  };
}

// =============================================================
// PHẦN 2: QUẢN LÝ PORTFOLIO (COIN + STOCK)
// =============================================================

function initPortfolioSheets_() {
  getSheet_('PortfolioAssets', ['id', 'symbol', 'name', 'type', 'exchange', 'currentPrice', 'priceUpdatedAt', 'active']);
  getSheet_('PortfolioTx', ['id', 'date', 'assetId', 'type', 'quantity', 'pricePerUnit', 'total', 'fees', 'notes', 'createdAt']);

  // Seed vài asset mẫu nếu trống
  var assetSheet = getSheet_('PortfolioAssets');
  if (assetSheet.getLastRow() <= 1) {
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
    assets.forEach(function(a) { assetSheet.appendRow(a); });
  }
}

// === ASSETS ===================================================

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
    if (data[i][0] === id) {
      sheet.getRange(i+1, 6).setValue(Number(price));
      sheet.getRange(i+1, 7).setValue(new Date().toISOString());
      return { success: true };
    }
  }
  return { success: false };
}

function updateAllPrices(prices) {
  var sheet = getSheet_('PortfolioAssets');
  var data = sheet.getDataRange().getValues();
  var now = new Date().toISOString();
  for (var key in prices) {
    for (var i = 1; i < data.length; i++) {
      if (data[i][1] === key.toUpperCase()) {
        sheet.getRange(i+1, 6).setValue(Number(prices[key]));
        sheet.getRange(i+1, 7).setValue(now);
        break;
      }
    }
  }
  return { success: true };
}

// === PORTFOLIO TRANSACTIONS ===================================

function addPortfolioTx(tx) {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var total = Number(tx.quantity) * Number(tx.pricePerUnit);
    var fees = Number(tx.fees) || 0;
    getSheet_('PortfolioTx').appendRow([
      uid_(), tx.date || fmtDate_(new Date()), tx.assetId, tx.type,
      Number(tx.quantity), Number(tx.pricePerUnit), total, fees,
      tx.notes || '', new Date().toISOString()
    ]);
    return { success: true };
  } finally { lock.releaseLock(); }
}

function getPortfolioTx(assetId) {
  var data = getSheet_('PortfolioTx').getDataRange().getValues();
  var result = [];
  for (var i = data.length - 1; i >= 1; i--) {
    if (assetId && data[i][2] !== assetId) continue;
    result.push({
      id: data[i][0], date: data[i][1], assetId: data[i][2], type: data[i][3],
      quantity: Number(data[i][4]), pricePerUnit: Number(data[i][5]),
      total: Number(data[i][6]), fees: Number(data[i][7]), notes: data[i][8]
    });
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

// === PORTFOLIO ANALYTICS ======================================

function getPortfolioOverview() {
  initPortfolioSheets_();
  var assets = getSheet_('PortfolioAssets').getDataRange().getValues().slice(1);
  var txs = getSheet_('PortfolioTx').getDataRange().getValues().slice(1);

  var holdings = {};
  var totalInvested = 0;
  var totalCurrentValue = 0;
  var totalRealizedPnl = 0;

  // Tính toán holding cho từng asset
  for (var i = 0; i < assets.length; i++) {
    if (assets[i][7] !== 'true') continue;
    var assetId = assets[i][0];
    var symbol = assets[i][1];
    var name = assets[i][2];
    var type = assets[i][3];
    var currentPrice = Number(assets[i][5]);

    var totalQty = 0;
    var totalCost = 0;
    var realizedPnl = 0;

    // FIFO calculation
    var buyQueue = []; // [{qty, price}]
    var assetTxs = txs.filter(function(t) { return t[2] === assetId; }).sort(function(a, b) {
      return new Date(a[1]) - new Date(b[1]);
    });

    for (var j = 0; j < assetTxs.length; j++) {
      var tx = assetTxs[j];
      var qty = Number(tx[4]);
      var price = Number(tx[5]);
      var txTotal = Number(tx[6]);
      var fees = Number(tx[7]);

      if (tx[3] === 'buy') {
        buyQueue.push({ qty: qty, price: price + (fees / qty) }); // Giá vốn bao gồm phí
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

    // Tính giá vốn trung bình (weighted avg cost)
    var avgCost = 0;
    var remainingCost = 0;
    for (var k = 0; k < buyQueue.length; k++) {
      avgCost += buyQueue[k].qty * buyQueue[k].price;
      remainingCost += buyQueue[k].qty * buyQueue[k].price;
    }
    if (totalQty > 0) avgCost = avgCost / totalQty;

    var currentValue = totalQty * currentPrice;
    var unrealizedPnl = currentValue - remainingCost;
    var pnlPercent = remainingCost > 0 ? (unrealizedPnl / remainingCost * 100) : 0;

    holdings[assetId] = {
      assetId: assetId, symbol: symbol, name: name, type: type,
      quantity: totalQty, avgCost: avgCost, currentPrice: currentPrice,
      totalInvested: remainingCost, currentValue: currentValue,
      unrealizedPnl: unrealizedPnl, unrealizedPnlPercent: pnlPercent,
      realizedPnl: realizedPnl
    };

    totalInvested += remainingCost;
    totalCurrentValue += currentValue;
    totalRealizedPnl += realizedPnl;
  }

  // Chỉ hiển thị assets có quantity > 0 hoặc có realized PnL
  var activeHoldings = Object.values(holdings).filter(function(h) { return h.quantity > 0; });
  var inactiveHoldings = Object.values(holdings).filter(function(h) { return h.quantity <= 0 && h.realizedPnl !== 0; });

  // Phân bổ theo loại tài sản
  var allocationByType = {};
  var allocationByAsset = [];
  activeHoldings.forEach(function(h) {
    if (!allocationByType[h.type]) allocationByType[h.type] = 0;
    allocationByType[h.type] += h.currentValue;
    allocationByAsset.push({ symbol: h.symbol, value: h.currentValue, percent: totalCurrentValue > 0 ? h.currentValue / totalCurrentValue * 100 : 0 });
  });

  // Sắp xếp theo giá trị
  activeHoldings.sort(function(a, b) { return b.currentValue - a.currentValue; });

  return {
    totalInvested: totalInvested,
    totalCurrentValue: totalCurrentValue,
    totalUnrealizedPnl: totalCurrentValue - totalInvested,
    totalUnrealizedPnlPercent: totalInvested > 0 ? ((totalCurrentValue - totalInvested) / totalInvested * 100) : 0,
    totalRealizedPnl: totalRealizedPnl,
    holdings: activeHoldings,
    allocationByType: allocationByType,
    allocationByAsset: allocationByAsset,
    holdingCount: activeHoldings.length
  };
}

// === WEB APP ENTRY POINTS ====================================

function doGet(e) {
  var page = (e && e.parameter && e.parameter.page) || 'finance';
  var file = page === 'portfolio' ? 'portfolio' : 'index';
  return HtmlService.createHtmlOutputFromFile(file)
    .setTitle(page === 'portfolio' ? 'Portfolio Tracker' : 'MiniFinance')
    .setFaviconUrl('https://cdn-icons-png.flaticon.com/512/893/893078.png')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
}

// === KHỞI TẠO DỮ LIỆU MẪU ====================================

function setupFinanceDemo() {
  initFinanceSheets_();
  var cats = getCategories();
  var accs = getAccounts();
  var today = new Date();
  var month = fmtDate_(today).substring(0, 7);

  // Tạo 60 giao dịch mẫu trong 3 tháng
  var demoTxs = [];
  var incomeCats = cats.filter(function(c) { return c.type === 'income'; });
  var expenseCats = cats.filter(function(c) { return c.type === 'expense'; });

  for (var d = 0; d < 90; d++) {
    var date = new Date(today.getTime() - d * 86400000);
    var dateStr = fmtDate_(date);
    var numTx = Math.floor(Math.random() * 2) + 1;

    for (var t = 0; t < numTx; t++) {
      if (Math.random() < 0.35) {
        var ic = incomeCats[Math.floor(Math.random() * incomeCats.length)];
        var amount = [500000, 1000000, 1500000, 2000000, 3000000, 5000000, 15000000, 20000000][Math.floor(Math.random() * 8)];
        demoTxs.push([dateStr, 'income', ic.name, amount, '', accs[Math.floor(Math.random() * accs.length)].id, '', '']);
      } else {
        var ec = expenseCats[Math.floor(Math.random() * expenseCats.length)];
        var amount = Math.floor(Math.random() * 500000) + 20000;
        demoTxs.push([dateStr, 'expense', ec.name, amount, 'Chi tiêu mẫu', accs[Math.floor(Math.random() * accs.length)].id, '', '']);
      }
    }
  }

  demoTxs.forEach(function(tx) {
    getSheet_('Transactions').appendRow([uid_()].concat(tx).concat([new Date().toISOString()]));
  });

  // Goal mẫu
  var goalSheet = getSheet_('SavingsGoals');
  if (goalSheet.getLastRow() <= 1) {
    goalSheet.appendRow([uid_(), 'Quỹ khẩn cấp 6 tháng', 30000000, 5000000, fmtDate_(new Date(today.getTime() - 180*86400000)), fmtDate_(new Date(today.getTime() + 180*86400000)), '🛡️', '#ef4444', 'active']);
    goalSheet.appendRow([uid_(), 'Du lịch Nhật Bản', 50000000, 15000000, fmtDate_(new Date(today.getTime() - 90*86400000)), fmtDate_(new Date(today.getTime() + 180*86400000)), '✈️', '#06b6d4', 'active']);
    goalSheet.appendRow([uid_(), 'Mua xe máy mới', 40000000, 32000000, fmtDate_(new Date(today.getTime() - 365*86400000)), fmtDate_(new Date(today.getTime() + 60*86400000)), '🏍️', '#10b981', 'active']);
  }

  return { success: true, message: 'Đã tạo dữ liệu mẫu: ' + demoTxs.length + ' giao dịch, 3 mục tiêu tiết kiệm' };
}

function setupPortfolioDemo() {
  initPortfolioSheets_();
  var assets = getAssets();
  var today = new Date();

  var demoTxs = [];
  for (var a = 0; a < assets.length; a++) {
    var asset = assets[a];
    var basePrice = asset.type === 'crypto' ? [20000, 1500, 20, 0][a % 4] * 1000000 : [70000, 120000, 35000, 180, 400][a % 5] * 1000;
    if (basePrice === 0) basePrice = 500000;

    // 3-5 lần mua
    var numBuys = Math.floor(Math.random() * 3) + 2;
    for (var b = 0; b < numBuys; b++) {
      var date = new Date(today.getTime() - (90 - b * 20) * 86400000);
      var qty = asset.type === 'crypto' ? (Math.random() * 0.5 + 0.01).toFixed(4) : Math.floor(Math.random() * 500) + 10;
      var price = basePrice * (0.85 + Math.random() * 0.3);
      demoTxs.push([fmtDate_(date), asset.id, 'buy', qty, Math.round(price), 0, 0, 'Mua mẫu']);
    }

    // 1-2 lần bán (chỉ 50% asset)
    if (Math.random() < 0.5) {
      var sellDate = new Date(today.getTime() - Math.floor(Math.random() * 30) * 86400000);
      var sellQty = asset.type === 'crypto' ? (Math.random() * 0.1).toFixed(4) : Math.floor(Math.random() * 200) + 5;
      var sellPrice = basePrice * (1.05 + Math.random() * 0.3);
      demoTxs.push([fmtDate_(sellDate), asset.id, 'sell', sellQty, Math.round(sellPrice), 0, Math.round(sellPrice * Number(sellQty) * 0.001), 'Bán mẫu']);
    }
  }

  demoTxs.forEach(function(tx) {
    var total = Number(tx[4]) * Number(tx[5]);
    getSheet_('PortfolioTx').appendRow([uid_(), tx[0], tx[1], tx[2], Number(tx[3]), Number(tx[4]), total, Number(tx[6]), tx[7], new Date().toISOString()]);
  });

  // Cập nhật giá hiện tại
  updateAllPrices({
    BTC: 950000000, ETH: 55000000, SOL: 4200000,
    VNM: 72000, FPT: 135000, TCB: 42000, AAPL: 195, QQQ: 480
  });

  return { success: true, message: 'Đã tạo ' + demoTxs.length + ' giao dịch mẫu cho ' + assets.length + ' tài sản' };
}
