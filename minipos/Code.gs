// ============================================================
// MiniPOS - Google Apps Script Backend
// Point of Sale system chạy trên Google Sheets (0đ hosting)
// ============================================================

// === TIỆN ÍCH ================================================

function getSheet_(name) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    if (name === 'Products') {
      sheet.appendRow(['id', 'name', 'sku', 'category', 'purchasePrice', 'sellingPrice', 'stock', 'unit', 'barcode', 'imageUrl', 'active']);
    } else if (name === 'Orders') {
      sheet.appendRow(['id', 'orderNo', 'customerName', 'customerPhone', 'date', 'subtotal', 'discount', 'tax', 'total', 'paymentMethod', 'status', 'cashierName']);
    } else if (name === 'OrderItems') {
      sheet.appendRow(['id', 'orderId', 'productId', 'productName', 'qty', 'price', 'total']);
    } else if (name === 'StockIn') {
      sheet.appendRow(['id', 'date', 'productId', 'productName', 'qty', 'purchasePrice', 'total', 'supplier', 'note']);
    } else if (name === 'Expenses') {
      sheet.appendRow(['id', 'date', 'category', 'amount', 'note', 'cashierName']);
    } else if (name === 'Customers') {
      sheet.appendRow(['id', 'name', 'phone', 'address', 'totalPurchases', 'createdAt']);
    } else if (name === 'Users') {
      sheet.appendRow(['id', 'email', 'password', 'name', 'role', 'active']);
      // Tạo tài khoản admin mặc định
      sheet.appendRow([Utilities.getUuid(), 'admin@minipos.com', 'admin123', 'Admin', 'admin', 'true']);
    } else if (name === 'Settings') {
      sheet.appendRow(['key', 'value']);
      sheet.appendRow(['storeName', 'MiniPOS']);
      sheet.appendRow(['storePhone', '0900000000']);
      sheet.appendRow(['storeAddress', '']);
      sheet.appendRow(['currency', 'VND']);
      sheet.appendRow(['taxRate', '0']);
      sheet.appendRow(['lowStockAlert', '5']);
    }
  }
  return sheet;
}

function generateId_() {
  return Utilities.getUuid();
}

function generateOrderNo_() {
  var today = Utilities.formatDate(new Date(), 'Asia/Ho_Chi_Minh', 'yyyyMMdd');
  var sheet = getSheet_('Orders');
  var data = sheet.getDataRange().getValues();
  var todayCount = 0;
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][1]).indexOf('ORD-' + today) === 0) todayCount++;
  }
  return 'ORD-' + today + '-' + ('000' + (todayCount + 1)).slice(-3);
}

function getSetting_(key) {
  var data = getSheet_('Settings').getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === key) return data[i][1];
  }
  return '';
}

// === XÁC THỰC ================================================

function login(email, password) {
  var data = getSheet_('Users').getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][1] === email && data[i][2] === password && data[i][5] === 'true') {
      return {
        success: true,
        user: { id: data[i][0], name: data[i][3], role: data[i][4] }
      };
    }
  }
  return { success: false, message: 'Sai email hoặc mật khẩu' };
}

// === SẢN PHẨM =================================================

function getProducts(search) {
  var data = getSheet_('Products').getDataRange().getValues();
  var products = [];
  for (var i = 1; i < data.length; i++) {
    if (data[i][10] === 'false') continue;
    if (search && String(data[i][1]).toLowerCase().indexOf(search.toLowerCase()) === -1
        && String(data[i][2]).toLowerCase().indexOf(search.toLowerCase()) === -1
        && String(data[i][8]).indexOf(search) === -1) continue;
    products.push({
      id: data[i][0], name: data[i][1], sku: data[i][2], category: data[i][3],
      purchasePrice: Number(data[i][4]), sellingPrice: Number(data[i][5]),
      stock: Number(data[i][6]), unit: data[i][7], barcode: data[i][8], imageUrl: data[i][9]
    });
  }
  return products;
}

function findByBarcode(barcode) {
  var data = getSheet_('Products').getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][8]) === barcode && data[i][10] !== 'false') {
      return {
        id: data[i][0], name: data[i][1], sku: data[i][2],
        sellingPrice: Number(data[i][5]), stock: Number(data[i][6]), unit: data[i][7]
      };
    }
  }
  return null;
}

// Nhận barcode từ scanner (doPost từ Netlify)
function doPost(e) {
  try {
    var payload = JSON.parse(e.postData.contents);
    var barcode = payload.barcode;
    var product = findByBarcode(barcode);
    if (product) {
      return ContentService.createTextOutput(JSON.stringify({ success: true, product: product }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    return ContentService.createTextOutput(JSON.stringify({ success: false, message: 'Không tìm thấy sản phẩm' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function addProduct(product) {
  var sheet = getSheet_('Products');
  var id = generateId_();
  sheet.appendRow([
    id, product.name, product.sku || '', product.category || '',
    Number(product.purchasePrice) || 0, Number(product.sellingPrice) || 0,
    0, product.unit || 'cái', product.barcode || '', product.imageUrl || '', 'true'
  ]);
  return { success: true, id: id };
}

function updateProduct(id, product) {
  var sheet = getSheet_('Products');
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === id) {
      var row = i + 1;
      sheet.getRange(row, 2).setValue(product.name);
      sheet.getRange(row, 3).setValue(product.sku || '');
      sheet.getRange(row, 4).setValue(product.category || '');
      sheet.getRange(row, 5).setValue(Number(product.purchasePrice) || 0);
      sheet.getRange(row, 6).setValue(Number(product.sellingPrice) || 0);
      sheet.getRange(row, 8).setValue(product.unit || 'cái');
      sheet.getRange(row, 9).setValue(product.barcode || '');
      return { success: true };
    }
  }
  return { success: false, message: 'Không tìm thấy sản phẩm' };
}

function deleteProduct(id) {
  var sheet = getSheet_('Products');
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === id) {
      sheet.getRange(i + 1, 11).setValue('false');
      return { success: true };
    }
  }
  return { success: false, message: 'Không tìm thấy sản phẩm' };
}

// === ĐƠN HÀNG =================================================

function createOrder(orderData) {
  var lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    var orderId = generateId_();
    var orderNo = generateOrderNo_();
    var now = new Date().toISOString();
    var total = Math.round(Number(orderData.total));

    getSheet_('Orders').appendRow([
      orderId, orderNo, orderData.customerName || 'Khách lẻ', orderData.customerPhone || '',
      now, Math.round(Number(orderData.subtotal)), Math.round(Number(orderData.discount) || 0),
      Math.round(Number(orderData.tax) || 0), total,
      orderData.paymentMethod || 'cash', 'completed', orderData.cashierName || 'POS'
    ]);

    var itemsSheet = getSheet_('OrderItems');
    for (var j = 0; j < orderData.items.length; j++) {
      var item = orderData.items[j];
      itemsSheet.appendRow([
        generateId_(), orderId, item.productId, item.name,
        Number(item.qty), Math.round(Number(item.price)), Math.round(Number(item.qty) * Number(item.price))
      ]);
      // Trừ kho
      deductStock_(item.productId, Number(item.qty));
    }

    return { success: true, orderNo: orderNo, orderId: orderId };
  } finally {
    lock.releaseLock();
  }
}

function deductStock_(productId, qty) {
  var sheet = getSheet_('Products');
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === productId) {
      var currentStock = Number(data[i][6]);
      sheet.getRange(i + 1, 7).setValue(Math.max(0, currentStock - qty));
      return;
    }
  }
}

function addStock_(productId, qty) {
  var sheet = getSheet_('Products');
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === productId) {
      sheet.getRange(i + 1, 7).setValue(Number(data[i][6]) + qty);
      return;
    }
  }
}

function getOrders(dateFilter) {
  var data = getSheet_('Orders').getDataRange().getValues();
  var orders = [];
  for (var i = data.length - 1; i >= 1; i--) {
    if (dateFilter && String(data[i][4]).indexOf(dateFilter) !== 0) continue;
    orders.push({
      id: data[i][0], orderNo: data[i][1], customerName: data[i][2],
      customerPhone: data[i][3], date: data[i][4], subtotal: Number(data[i][5]),
      discount: Number(data[i][6]), tax: Number(data[i][7]), total: Number(data[i][8]),
      paymentMethod: data[i][9], status: data[i][10], cashierName: data[i][11]
    });
  }
  return orders;
}

function getOrderDetail(orderId) {
  var itemsData = getSheet_('OrderItems').getDataRange().getValues();
  var items = [];
  for (var i = 1; i < itemsData.length; i++) {
    if (itemsData[i][1] === orderId) {
      items.push({ id: itemsData[i][0], productName: itemsData[i][3], qty: Number(itemsData[i][4]), price: Number(itemsData[i][5]), total: Number(itemsData[i][6]) });
    }
  }
  return items;
}

// === NHẬP KHO ==================================================

function stockIn(stockData) {
  for (var i = 0; i < stockData.items.length; i++) {
    var item = stockData.items[i];
    getSheet_('StockIn').appendRow([
      generateId_(), new Date().toISOString(), item.productId, item.productName,
      Number(item.qty), Math.round(Number(item.purchasePrice) || 0),
      Math.round(Number(item.qty) * Number(item.purchasePrice || 0)),
      stockData.supplier || '', stockData.note || ''
    ]);
    addStock_(item.productId, Number(item.qty));
  }
  return { success: true };
}

function getStockInHistory() {
  var data = getSheet_('StockIn').getDataRange().getValues();
  var result = [];
  for (var i = data.length - 1; i >= 1; i--) {
    result.push({
      id: data[i][0], date: data[i][1], productName: data[i][3],
      qty: Number(data[i][4]), purchasePrice: Number(data[i][5]),
      total: Number(data[i][6]), supplier: data[i][7], note: data[i][8]
    });
  }
  return result;
}

// === CHI PHÍ ===================================================

function addExpense(expense) {
  getSheet_('Expenses').appendRow([
    generateId_(), expense.date || new Date().toISOString(),
    expense.category, Math.round(Number(expense.amount)),
    expense.note || '', expense.cashierName || 'POS'
  ]);
  return { success: true };
}

function getExpenses(dateFilter) {
  var data = getSheet_('Expenses').getDataRange().getValues();
  var result = [];
  for (var i = data.length - 1; i >= 1; i--) {
    if (dateFilter && String(data[i][1]).indexOf(dateFilter) !== 0) continue;
    result.push({
      id: data[i][0], date: data[i][1], category: data[i][2],
      amount: Number(data[i][3]), note: data[i][4]
    });
  }
  return result;
}

// === KHÁCH HÀNG ===============================================

function getCustomers() {
  var data = getSheet_('Customers').getDataRange().getValues();
  var result = [];
  for (var i = 1; i < data.length; i++) {
    result.push({
      id: data[i][0], name: data[i][1], phone: data[i][2],
      address: data[i][3], totalPurchases: Number(data[i][4]), createdAt: data[i][5]
    });
  }
  return result;
}

function addCustomer(customer) {
  getSheet_('Customers').appendRow([
    generateId_(), customer.name, customer.phone || '',
    customer.address || '', 0, new Date().toISOString()
  ]);
  return { success: true };
}

// === DASHBOARD =================================================

function getDashboardData() {
  var today = Utilities.formatDate(new Date(), 'Asia/Ho_Chi_Minh', 'yyyy-MM-dd');
  var month = today.substring(0, 7);
  var yesterday = Utilities.formatDate(new Date(Date.now() - 86400000), 'Asia/Ho_Chi_Minh', 'yyyy-MM-dd');

  var orderData = getSheet_('Orders').getDataRange().getValues();
  var productData = getSheet_('Products').getDataRange().getValues();
  var expenseData = getSheet_('Expenses').getDataRange().getValues();

  var todayOrders = [], monthOrders = [], yesterdayOrders = [];
  var todayRevenue = 0, monthRevenue = 0, yesterdayRevenue = 0;
  var todayCost = 0, monthCost = 0;

  for (var i = 1; i < orderData.length; i++) {
    var dateStr = String(orderData[i][4]).substring(0, 10);
    var total = Number(orderData[i][8]);
    if (dateStr === today) { todayOrders.push(orderData[i]); todayRevenue += total; }
    if (dateStr === yesterday) { yesterdayOrders.push(orderData[i]); yesterdayRevenue += total; }
    if (dateStr.substring(0, 7) === month) { monthOrders.push(orderData[i]); monthRevenue += total; }
  }

  // Tính giá vốn hàng đã bán hôm nay (COGS)
  var itemsData = getSheet_('OrderItems').getDataRange().getValues();
  for (var j = 1; j < itemsData.length; j++) {
    for (var k = 0; k < productData.length; k++) {
      if (productData[k][0] === itemsData[j][2]) {
        var cogs = Number(productData[k][4]) * Number(itemsData[j][4]);
        var itemDate = '';
        for (var oi = 1; oi < orderData.length; oi++) {
          if (orderData[oi][0] === itemsData[j][1]) { itemDate = String(orderData[oi][4]).substring(0, 10); break; }
        }
        if (itemDate === today) todayCost += cogs;
        if (itemDate.substring(0, 7) === month) monthCost += cogs;
        break;
      }
    }
  }

  for (var e = 1; e < expenseData.length; e++) {
    var expDate = String(expenseData[e][1]).substring(0, 10);
    if (expDate === today) todayCost += Number(expenseData[e][3]);
    if (expDate.substring(0, 7) === month) monthCost += Number(expenseData[e][3]);
  }

  var lowStockCount = 0;
  var alertThreshold = Number(getSetting_('lowStockAlert')) || 5;
  for (var p = 1; p < productData.length; p++) {
    if (productData[p][10] !== 'false' && Number(productData[p][6]) <= alertThreshold) lowStockCount++;
  }

  var recentOrders = [];
  for (var r = Math.max(1, orderData.length - 10); r < orderData.length; r++) {
    recentOrders.push({
      orderNo: orderData[r][1], date: String(orderData[r][4]).substring(11, 19),
      total: Number(orderData[r][8]), method: orderData[r][9], customerName: orderData[r][2]
    });
  }

  return {
    todayRevenue: todayRevenue,
    todayOrders: todayOrders.length,
    yesterdayRevenue: yesterdayRevenue,
    monthRevenue: monthRevenue,
    monthOrders: monthOrders.length,
    todayProfit: todayRevenue - todayCost,
    monthProfit: monthRevenue - monthCost,
    totalProducts: productData.length - 1,
    lowStock: lowStockCount,
    recentOrders: recentOrders.reverse()
  };
}

function getSalesReport(startDate, endDate) {
  var ordersData = getSheet_('Orders').getDataRange().getValues();
  var dailySales = {};
  var totalRevenue = 0, totalOrders = 0;
  var byPayment = { cash: 0, transfer: 0, momo: 0 };

  for (var i = 1; i < ordersData.length; i++) {
    var date = String(ordersData[i][4]).substring(0, 10);
    if (startDate && date < startDate) continue;
    if (endDate && date > endDate) continue;

    var total = Number(ordersData[i][8]);
    totalRevenue += total;
    totalOrders++;

    if (!dailySales[date]) dailySales[date] = { revenue: 0, orders: 0 };
    dailySales[date].revenue += total;
    dailySales[date].orders++;

    var method = ordersData[i][9];
    if (byPayment[method] !== undefined) byPayment[method] += total;
  }

  return {
    totalRevenue: totalRevenue, totalOrders: totalOrders,
    avgOrderValue: totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0,
    dailySales: dailySales, byPayment: byPayment
  };
}

// === CÀI ĐẶT ==================================================

function getSettings() {
  var data = getSheet_('Settings').getDataRange().getValues();
  var settings = {};
  for (var i = 1; i < data.length; i++) { settings[data[i][0]] = data[i][1]; }
  return settings;
}

function updateSettings(settings) {
  var sheet = getSheet_('Settings');
  var data = sheet.getDataRange().getValues();
  for (var key in settings) {
    for (var i = 1; i < data.length; i++) {
      if (data[i][0] === key) { sheet.getRange(i + 1, 2).setValue(settings[key]); break; }
    }
  }
  return { success: true };
}

// === WEB APP ENTRY POINT =====================================

function doGet() {
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('MiniPOS')
    .setFaviconUrl('https://cdn-icons-png.flaticon.com/512/1046/1046784.png')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
}

// === KHỞI TẠO DỮ LIỆU MẪU ====================================

function setupDemoData() {
  var products = [
    ['Sting dâu 330ml', 'STING330', 'Nước giải khát', 6000, 10000, 100, 'lon', '8934588000010', ''],
    ['Red Bull 250ml', 'RB250', 'Nước giải khát', 10000, 15000, 80, 'lon', '9002490200011', ''],
    ['Trà xanh C2 360ml', 'C2360', 'Nước giải khát', 5500, 10000, 120, 'chai', '8935025700012', ''],
    ['Mì tôm Hảo Hảo', 'MIHAO', 'Thực phẩm khô', 3500, 7000, 200, 'gói', '8934567800013', ''],
    ['Bánh Oreo 137g', 'OREO137', 'Bánh kẹo', 12000, 20000, 50, 'hộp', '7622210700014', ''],
    ['Snack Khoai tây 56g', 'SNACK56', 'Bánh kẹo', 8000, 13000, 60, 'gói', '8935006000015', ''],
    ['Nước suối 500ml', 'WATER500', 'Nước giải khát', 2500, 5000, 150, 'chai', '8934003000016', ''],
    ['Dầu gội Clear 180ml', 'CLEAR180', 'Chăm sóc cá nhân', 35000, 55000, 25, 'chai', '8934867000017', ''],
    ['Kem đánh răng P/S 100g', 'PS100', 'Chăm sóc cá nhân', 18000, 28000, 40, 'tuýp', '8934567800018', ''],
    ['Bút bi Thiên Long TL-027', 'TL027', 'Văn phòng phẩm', 2500, 5000, 300, 'cây', '8935006000019', ''],
    ['Tập vở 100 trang', 'TAP100', 'Văn phòng phẩm', 6000, 10000, 150, 'cuốn', '8934003000020', ''],
    ['Pin AA 2 viên', 'PINAA2', 'Đồ gia dụng', 8000, 15000, 70, 'vỉ', '8934867000021', ''],
    ['Bao lì xì Tết (10 cái)', 'LIXI10', 'Tạp hóa', 5000, 12000, 40, 'bộ', '', ''],
    ['Nước tương Chin-su 250ml', 'CHINSU250', 'Gia vị', 9000, 15000, 45, 'chai', '8934567800022', ''],
    ['Bột ngọt Ajinomoto 100g', 'AJI100', 'Gia vị', 12000, 20000, 35, 'gói', '8935006000023', '']
  ];

  var sheet = getSheet_('Products');
  for (var i = 0; i < products.length; i++) {
    sheet.appendRow([generateId_()].concat(products[i]).concat(['true']));
  }

  // Tạo vài đơn hàng mẫu
  var today = Utilities.formatDate(new Date(), 'Asia/Ho_Chi_Minh', 'yyyy-MM-dd');
  var orderSheet = getSheet_('Orders');
  var itemsSheet = getSheet_('OrderItems');
  var productData = sheet.getDataRange().getValues();

  for (var d = 0; d < 7; d++) {
    var date = new Date(Date.now() - d * 86400000);
    var dateStr = Utilities.formatDate(date, 'Asia/Ho_Chi_Minh', 'yyyy-MM-dd');
    var numOrders = Math.floor(Math.random() * 5) + 2;

    for (var o = 0; o < numOrders; o++) {
      var orderId = generateId_();
      var orderNo = 'ORD-' + dateStr.replace(/-/g, '') + '-' + ('000' + (o + 1)).slice(-3);
      var numItems = Math.floor(Math.random() * 3) + 1;
      var subtotal = 0;
      for (var it = 0; it < numItems; it++) {
        var pIdx = 1 + Math.floor(Math.random() * (productData.length - 1));
        var qty = Math.floor(Math.random() * 3) + 1;
        var price = Number(productData[pIdx][5]);
        itemsSheet.appendRow([generateId_(), orderId, productData[pIdx][0], productData[pIdx][1], qty, price, qty * price]);
        subtotal += qty * price;
      }
      var methods = ['cash', 'transfer', 'momo'];
      orderSheet.appendRow([orderId, orderNo, 'Khách mẫu', '0900000000', dateStr + 'T' + ('0' + (8 + o)).slice(-2) + ':00:00.000Z', subtotal, 0, 0, subtotal, methods[Math.floor(Math.random() * 3)], 'completed', 'Admin']);
    }
  }

  return { success: true, message: 'Đã tạo ' + products.length + ' sản phẩm mẫu và đơn hàng 7 ngày' };
}
