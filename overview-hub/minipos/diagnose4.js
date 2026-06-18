const { chromium } = require('C:/Users/Ninh Quang Thanh/AppData/Local/Temp/node_modules/playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('file:///C:/Workspace/OPC/minipos/index.html', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(3000);

  const diag = await page.evaluate(() => {
    const icon = document.querySelector('.sidebar .nav-item.active .material-symbols-outlined');
    if (!icon) return { error: 'NO ICON FOUND' };

    const cs = window.getComputedStyle(icon);
    const parent = icon.parentElement;
    const parentCS = window.getComputedStyle(parent);

    // Check inheritance chain for text-transform
    let el = icon;
    const chain = [];
    while (el) {
      const s = window.getComputedStyle(el);
      if (s.textTransform !== 'none') {
        chain.push({ tag: el.tagName, class: el.className?.substring(0,60), textTransform: s.textTransform });
      }
      el = el.parentElement;
    }

    return {
      iconText: icon.textContent,
      iconTextContentExact: JSON.stringify(icon.textContent),
      computedFontFamily: cs.fontFamily,
      computedDisplay: cs.display,
      computedTextTransform: cs.textTransform,
      computedColor: cs.color,
      computedFontSize: cs.fontSize,
      parentTextTransform: parentCS.textTransform,
      parentColor: parentCS.color,
      anyUppercaseInChain: chain,
      fontCheck24: document.fonts.check('24px Material Symbols Outlined'),
      fontCheck18: document.fonts.check('18px Material Symbols Outlined'),
      fontCheck16: document.fonts.check('16px Material Symbols Outlined'),
      // Check all stylesheets targeting this element
      matchedDisplayRules: (() => {
        const rules = [];
        try {
          for (const sheet of document.styleSheets) {
            try {
              for (const rule of sheet.cssRules) {
                try {
                  if (rule.selectorText && icon.matches(rule.selectorText) && rule.style.display) {
                    rules.push({ selector: rule.selectorText.substring(0,100), display: rule.style.display, important: rule.style.getPropertyPriority('display') });
                  }
                } catch(e) {}
              }
            } catch(e) {}
          }
        } catch(e) {}
        return rules;
      })()
    };
  });

  console.log(JSON.stringify(diag, null, 2));
  await browser.close();
})();
