/*
 * 白馬雪場比較網站 — 端對端測試（Playwright）
 * 用法：
 *   1. python3 -m http.server 8765          （在專案根目錄）
 *   2. npm i -D playwright-core && npx playwright install chromium   （首次）
 *   3. node tests/site.test.js               （可用 BASE_URL / CHROME_PATH / SHOTS_DIR 覆寫）
 */
const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');
const BASE = process.env.BASE_URL || 'http://localhost:8765/';
const REPO = path.resolve(__dirname, '..');
const SHOTS = process.env.SHOTS_DIR || path.join(require('os').tmpdir(), 'hakuba-shots');
fs.mkdirSync(SHOTS, { recursive: true });
const data = JSON.parse(fs.readFileSync(path.join(REPO, 'data/resorts.json'), 'utf8'));

let pass = 0, fail = 0;
const ok = (cond, msg) => { if (cond) { pass++; console.log('  ✓', msg); } else { fail++; console.log('  ✗ FAIL:', msg); } };
const eq = (a, b, msg) => ok(a === b, `${msg} (got ${JSON.stringify(a)}, want ${JSON.stringify(b)})`);
const yen = n => '¥' + Math.round(n).toLocaleString('en-US');

(async () => {
  const browser = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {});

  async function newPage(opts = {}) {
    const ctx = await browser.newContext({ viewport: { width: 1366, height: 900 }, ...opts });
    const page = await ctx.newPage();
    page.errors = [];
    page.on('pageerror', e => page.errors.push('pageerror: ' + e.message));
    page.on('console', m => { if (m.type() === 'error' && !/Failed to load resource|net::ERR/.test(m.text())) page.errors.push('console: ' + m.text()); });
    page.failed404 = [];
    page.on('response', r => { if (r.url().startsWith(BASE) && r.status() >= 400) page.failed404.push(r.status() + ' ' + r.url()); });
    return { ctx, page };
  }

  // ---------- 1. Desktop load ----------
  console.log('\n[1] 載入與渲染');
  let { ctx, page } = await newPage();
  await page.goto(BASE, { waitUntil: 'load' });
  await page.waitForSelector('#compareTable tbody tr');
  await page.waitForTimeout(800);
  eq(await page.locator('#compareTable tbody tr').count(), 5, '比較表 5 行');
  eq(await page.locator('.flip').count(), 5, '雪場卡 5 張');
  eq(await page.locator('.loc-item').count(), 5, '位置清單 5 項');
  eq(await page.locator('.carousel-slide').count(), 5, '輪播 5 張');
  eq(await page.locator('.leaflet-marker-icon').count(), 5, 'Leaflet 標記 5 個');
  eq(await page.locator('.stay-card').count(), 5, '住宿卡 5 張');
  for (const id of ['overview', 'location', 'compare', 'resorts', 'budget', 'stay', 'notes'])
    ok(await page.locator('#' + id).count() === 1, `版塊 #${id} 存在`);
  eq(await page.title(), '白馬雪場比較', '頁面標題');

  // ---------- 2. Data fidelity ----------
  console.log('\n[2] 數據核對（表格 vs JSON）');
  const rows = await page.$$eval('#compareTable tbody tr', trs => trs.map(tr => [...tr.children].map(td => td.textContent.trim())));
  data.resorts.forEach((r, i) => {
    const row = rows[i];
    eq(row[0], r.name, `第 ${i + 1} 行名稱`);
    eq(row[1].replace(/\s*✓$/, ''), yen(r.ticket.adult1Day), `${r.name} 1 日券`);
    eq(row[1].endsWith('✓'), r.ticket.status === 'verified', `${r.name} 已核實標記`);
    eq(row[2], r.slopes.totalKm + ' km', `${r.name} 雪道長度`);
    eq(row[3], String(r.slopes.runs), `${r.name} 雪道數`);
    eq(row[4], (r.slopes.ratio.beginner + r.slopes.ratio.intermediate) + '%', `${r.name} 初+中`);
    eq(row[6], r.elevation.vertical.toLocaleString('en-US') + ' m', `${r.name} 垂直落差`);
    eq(row[7], String(r.lifts.total), `${r.name} 索道數`);
    const capText = r.lifts.capacityPerHour == null ? '未公開' : r.lifts.capacityPerHour.toLocaleString('en-US') + (r.lifts.capacityStatus === 'estimate' ? '估算' : '');
    eq(row[8], capText, `${r.name} 總運力`);
    eq(row[9], r.access.fromHakubaStationMin + ' 分', `${r.name} 白馬站車程`);
    eq(row[10].length, r.beginnerScore, `${r.name} 星數`);
  });
  // ratio sums
  data.resorts.forEach(r => { const s = r.slopes.ratio; eq(s.beginner + s.intermediate + s.advanced, 100, `${r.name} 比例合計 100`); });
  data.resorts.forEach(r => { const k = r.slopes.km; ok(Math.abs(k.beginner + k.intermediate + k.advanced - r.slopes.totalKm) < 0.15, `${r.name} 分級 km 合計 ≈ 總長 (${(k.beginner + k.intermediate + k.advanced).toFixed(1)} vs ${r.slopes.totalKm})`); });
  data.resorts.forEach(r => eq(r.elevation.top - r.elevation.base, r.elevation.vertical, `${r.name} 落差 = 頂 − 底`));
  // hero stats
  const heroKm = await page.locator('.stat-card').nth(0).locator('strong').textContent();
  eq(heroKm, data.resorts.reduce((s, r) => s + r.slopes.totalKm, 0).toFixed(1) + ' km', 'Hero 雪道總長');
  eq(await page.locator('.stat-card').nth(1).locator('strong').textContent(), yen(data.meta.valleyPass.adult1Day_2026_27), 'Hero 全山通票');
  eq(await page.locator('.stat-card').nth(3).locator('strong').textContent(), yen(5900), 'Hero 最平 1 日券');
  // best highlights
  const bestTicket = await page.$$eval('#compareTable tbody tr td:nth-child(2).best', n => n.map(x => x.textContent));
  eq(JSON.stringify(bestTicket), JSON.stringify(['¥5,900']), '最平雪票高亮只有鹿島槍');

  // ---------- 3. Sorting ----------
  console.log('\n[3] 表格排序');
  const colVals = async n => page.$$eval(`#compareTable tbody tr > :nth-child(${n})`, c => c.map(x => x.textContent.replace(/\s*✓$/, '').trim()));
  await page.click('[data-sort="ticket"]');
  eq(JSON.stringify(await colVals(2)), JSON.stringify(['¥5,900', '¥6,500', '¥7,000', '¥8,400', '¥9,500']), '1 日券升序（栂池早鳥 ¥6,500）');
  eq(await page.getAttribute('th:has([data-sort="ticket"])', 'aria-sort'), 'ascending', 'aria-sort ascending');
  await page.click('[data-sort="ticket"]');
  eq((await colVals(2))[0], '¥9,500', '再按變降序');
  await page.click('[data-sort="cap"]');
  const caps = await colVals(9);
  eq(caps[0], '43,800', '總運力降序首位 = 栂池');
  ok(caps[3] === '未公開' && caps[4] === '未公開', '無數據排最後（降序）');
  await page.click('[data-sort="cap"]');
  const caps2 = await colVals(9);
  ok(caps2[3] === '未公開' && caps2[4] === '未公開', '無數據排最後（升序）');
  await page.click('[data-sort="name"]');
  eq((await colVals(1)).length, 5, '名稱排序後仍 5 行');

  // ---------- 4. Budget ----------
  console.log('\n[4] 預算試算');
  const total = async () => (await page.textContent('#totalJpy')).trim();
  eq(await page.inputValue('#bRoute'), 'narita-rail', '預設路線 = 成田鐵路（已核實）');
  eq(await page.inputValue('#bRate'), '0.0498', '預設匯率 0.0498');
  eq(await page.inputValue('#bRoomPrice'), '32000', '預設房價 = 栂池核實範圍中位數');
  // default: 65,000 + 160,000 + (60,400 + 16,000) + 117,000 = 418,400
  eq(await total(), '¥418,400', '預設總額');
  eq((await page.textContent('#totalHkd')).trim(), 'HK$20,836', '預設總額 HKD（0.0498）');
  ok((await page.textContent('#passAdvice')).includes('¥23,000'), '全山通票比較：目前便宜 ¥23,000');
  ok((await page.textContent('#dayList')).includes('¥6,500 早鳥'), '每日選單標示栂池早鳥價');
  const resText = await page.textContent('#resultRows');
  ok(resText.includes('¥65,000') && resText.includes('¥160,000') && resText.includes('¥76,400') && resText.includes('¥117,000'), '四項小計正確');
  ok(resText.includes('每人平均 ¥209,200'), '每人平均');
  ok(resText.includes('每人 ¥32,500'), '雪票每人 ¥6,500 × 5');
  ok(resText.includes('往返 ¥15,100 × 2 程'), '交通按成田鐵路 ¥15,100／程');
  eq(await page.locator('#legList li').count(), 3, '交通分段 3 段');
  const legTxt = await page.textContent('#legList');
  ok(legTxt.includes('¥2,600') && legTxt.includes('¥9,000') && legTxt.includes('¥3,500'), '分段價錢 2,600 / 9,000 / 3,500');
  eq(await page.locator('#legList a').count(), 3, '分段均有來源連結');
  await page.selectOption('#bRoute', 'airport');
  ok((await page.textContent('#resultRows')).includes('往返 ¥11,000 × 2 程'), '切換機場接駁');
  await page.selectOption('#bRoute', 'narita-rail');

  await page.fill('#bPeople', '3'); await page.dispatchEvent('#bPeople', 'input');
  eq(await page.inputValue('#bRooms'), '2', '3 人自動 2 房');
  eq(await page.inputValue('#bRentPeople'), '3', '租借人數跟隨');
  // ticket 8200*5*3; lodging 32000*2*5; transport 15100*2*3 + 800*2*5*3; rental (57500+1000)*3
  eq(await total(), yen(97500 + 320000 + 90600 + 24000 + 175500), '3 人總額');

  await page.click('[data-fill="valley"]');
  eq(await total(), yen(156000 + 320000 + 90600 + 175500), '全山通票總額（接駁免費）');
  ok((await page.textContent('#passAdvice')).includes('已全部使用全山通票'), '全山通票提示');

  await page.fill('#bDays', '3'); await page.dispatchEvent('#bDays', 'input');
  eq(await page.locator('#dayList select').count(), 3, '日數 3 → 3 個選單');
  await page.fill('#bDays', '7'); await page.dispatchEvent('#bDays', 'input');
  eq(await page.locator('#dayList select').count(), 7, '日數 7 → 7 個選單');
  eq(await page.inputValue('#dayList select[data-day="6"]'), 'valley', '新增日子沿用最後選擇');

  await page.selectOption('#dayList select[data-day="0"]', 'kashimayari');
  ok((await page.textContent('#resultRows')).includes('每人 ' + yen(10400 * 6 + 5900)), '單日改雪場後雪票重算');

  await page.click('[data-fill="happo-one"]');
  eq(await page.inputValue('#bBase'), 'happo-one', '快速設定同步住宿區');
  eq(await page.inputValue('#bRoomPrice'), '36000', '八方房價中位數 36,000');

  // rental toggles
  await page.uncheck('#rBoard'); await page.uncheck('#rWear'); await page.uncheck('#rHelmet');
  ok((await page.textContent('#resultRows')).includes('不租借'), '全部不租 → 不租借');
  const noRent = await total();
  await page.check('#rHelmet');
  // 7 days * 2000 + 1000 cover per person *3 = 45000
  const withHelmet = await total();
  const toNum = s => +s.replace(/[^\d]/g, '');
  eq(toNum(withHelmet) - toNum(noRent), (2000 * 7 + 1000) * 3, '只租頭盔增加額正確（含保障）');
  await page.uncheck('#rCover');
  eq(toNum(await total()) - toNum(noRent), 2000 * 7 * 3, '取消保障');

  // invalid inputs
  await page.fill('#bPeople', ''); await page.dispatchEvent('#bPeople', 'input');
  ok(!/NaN|undefined|Infinity/.test(await page.textContent('#budgetResult')), '人數留空不出 NaN');
  await page.fill('#bPeople', '-5'); await page.dispatchEvent('#bPeople', 'change');
  eq(await page.inputValue('#bPeople'), '1', '負數人數修正為 1');
  await page.fill('#bDays', '99'); await page.dispatchEvent('#bDays', 'change');
  eq(await page.locator('#dayList select').count(), 14, '日數上限 14');
  await page.fill('#bRate', '0'); await page.dispatchEvent('#bRate', 'input');
  ok((await page.textContent('#passAdvice')).includes('匯率輸入無效'), '匯率 0 顯示警告');
  ok(!/NaN|undefined|Infinity/.test(await page.textContent('#budgetResult')), '匯率 0 不出 NaN');
  await page.fill('#bRate', '0.05'); await page.dispatchEvent('#bRate', 'input');
  await page.fill('#bRoomPrice', 'abc').catch(() => {});
  ok(!/NaN/.test(await page.textContent('#budgetResult')), '房價非數字不出 NaN');
  await page.fill('#bNights', '0'); await page.dispatchEvent('#bNights', 'input');
  ok((await page.textContent('#resultRows')).includes('× 0 晚'), '0 晚住宿');
  ok((await page.textContent('#rateHint')).includes('未能取得即時匯率'), '匯率 API 失敗時提示後備匯率');

  // ---------- 5. Flip cards ----------
  console.log('\n[5] 翻轉卡');
  const card = page.locator('.flip').first();
  await card.locator('[data-flip="open"]').click();
  ok(await card.evaluate(el => el.classList.contains('is-flipped')), '翻到背面');
  ok(await card.locator('.face.front').evaluate(el => el.inert), '正面 inert');
  ok(!(await card.locator('.face.back').evaluate(el => el.inert)), '背面可操作');
  await page.waitForTimeout(800);
  await card.screenshot({ path: path.join(SHOTS, 'card-back.png') });
  ok(await card.locator('.face.back a[href*="google.com/maps"]').isVisible(), '背面 Google Maps 連結可見');
  await card.locator('[data-flip="close"]').click();
  ok(!(await card.evaluate(el => el.classList.contains('is-flipped'))), '翻回正面');
  // back face fully within card height (no clipping)
  const clip = await page.$$eval('.flip', cards => cards.map(c => { const i = c.querySelector('.flip-inner'); const b = c.querySelector('.face.back'); return b.scrollHeight <= i.clientHeight + 1; }));
  ok(clip.every(Boolean), '背面內容不被裁切');

  // ---------- 5b. Checked prices on card back ----------
  console.log('\n[5b] 卡背「已核實價格」');
  for (const r of data.resorts) {
    const cardEl = page.locator('#card-' + r.id);
    const items = cardEl.locator('.face.back .checked-list li');
    eq(await items.count(), (r.checkedPrices || []).length, `${r.name} 已核實項目數`);
    for (let k = 0; k < (r.checkedPrices || []).length; k++) {
      const it = r.checkedPrices[k];
      const li = items.nth(k);
      const txt = await li.textContent();
      ok(txt.includes(it.item), `${r.name}：${it.item}`);
      const priceTxt = it.currency === 'HKD' ? 'HK$' + it.price.toLocaleString('en-US') : yen(it.price);
      ok(txt.includes(priceTxt), `  價格 ${priceTxt}`);
      const conv = it.currency === 'HKD' ? yen(it.price / data.meta.exchangeRate.rate) : 'HK$' + Math.round(it.price * data.meta.exchangeRate.rate).toLocaleString('en-US');
      ok(txt.includes(conv), `  換算 ${conv}`);
      if (it.url) eq(await li.locator('a').getAttribute('href'), it.url, '  來源連結');
      else ok(txt.includes('無連結'), '  無連結標示');
      if (it.purchaseBy) ok(txt.includes(it.purchaseBy), '  截止日期');
    }
  }
  ok((await page.locator('#card-tsugaike .face.front .pill').first().textContent()).includes('早鳥 1 日券 ¥6,500'), '栂池卡正面顯示早鳥 ¥6,500');
  const tsBack = page.locator('#card-tsugaike .face.back');
  ok((await tsBack.locator('.info-box').first().textContent()).includes('2026-11-30'), '栂池卡背雪票註明截止日');
  ok((await tsBack.textContent()).includes('2022-23'), '栂池租借標示 2022-23 舊價目表');
  ok((await page.locator('#card-iwatake .face.back').textContent()).includes('可能已含裝備租借'), '岩岳 KKday 標示可能含租借');
  ok((await page.locator('#card-goryu-47 .face.back .info-box').first().textContent()).includes('已核實'), '五竜雪票標示已核實');
  await page.locator('#card-tsugaike [data-flip="open"]').click();
  await page.waitForTimeout(800);
  await page.locator('#card-tsugaike').screenshot({ path: path.join(SHOTS, 'tsugaike-back.png') });
  const tsClip = await page.$eval('#card-tsugaike', c => c.querySelector('.face.back').scrollHeight <= c.querySelector('.flip-inner').clientHeight + 1);
  ok(tsClip, '栂池卡背內容完整不被裁切');
  await page.locator('#card-tsugaike [data-flip="close"]').click();

  // ---------- 6. Lightbox ----------
  console.log('\n[6] 燈箱放大');
  await page.locator('.flip').nth(3).locator('.thumb-btn').click();
  await page.waitForFunction(() => window.__lb.state().natW > 0, null, { timeout: 8000 });
  let st = await page.evaluate(() => window.__lb.state());
  eq(st.natW, data.resorts[3].trailMap.width, '燈箱載入全清版（原解像度）');
  eq(st.idx, 3, '打開對應雪場（栂池）');
  ok((await page.textContent('#lbCaption')).includes('栂池'), '標題 = 栂池');
  const src = await page.getAttribute('#lbImg', 'src');
  ok(src.endsWith('tsugaike.webp') && !src.includes('thumb'), '燈箱用 full 圖而非 thumb');
  await page.click('#lbZoomIn');
  const s1 = (await page.evaluate(() => window.__lb.state())).scale;
  ok(s1 > st.scale, '＋ 按鈕放大');
  const stage = await page.locator('#lbStage').boundingBox();
  await page.mouse.move(stage.x + stage.width / 2, stage.y + stage.height / 2);
  await page.mouse.wheel(0, -600);
  const s2 = (await page.evaluate(() => window.__lb.state())).scale;
  ok(s2 > s1, '滾輪放大');
  for (let k = 0; k < 20; k++) await page.mouse.wheel(0, -800);
  eq((await page.evaluate(() => window.__lb.state())).scale, 4, '放大上限 400%');
  const before = await page.evaluate(() => window.__lb.state());
  await page.mouse.down(); await page.mouse.move(stage.x + stage.width / 2 - 200, stage.y + stage.height / 2 - 100, { steps: 5 }); await page.mouse.up();
  const after = await page.evaluate(() => window.__lb.state());
  ok(after.tx < before.tx && after.ty < before.ty, '拖曳平移');
  // drag far beyond bounds → clamped
  await page.mouse.down(); await page.mouse.move(stage.x + 5000, stage.y + 5000, { steps: 3 }); await page.mouse.up();
  const cl = await page.evaluate(() => window.__lb.state());
  ok(cl.tx <= 0 && cl.ty <= 0, '拖曳不超出邊界');
  await page.screenshot({ path: path.join(SHOTS, 'lightbox-zoom.png') });
  await page.click('#lbReset');
  st = await page.evaluate(() => window.__lb.state());
  ok(Math.abs(st.scale - st.minScale) < 1e-9, '重設回適合大小');
  await page.keyboard.press('ArrowRight');
  await page.waitForFunction(() => window.__lb.state().natW > 0);
  eq((await page.evaluate(() => window.__lb.state())).idx, 4, '→ 下一張');
  await page.keyboard.press('ArrowRight');
  await page.waitForFunction(() => window.__lb.state().natW > 0);
  eq((await page.evaluate(() => window.__lb.state())).idx, 0, '最後一張 → 回到第一張');
  await page.keyboard.press('Escape');
  ok(!(await page.locator('#lightbox').evaluate(el => el.classList.contains('open'))), 'Esc 關閉');
  eq(await page.evaluate(() => document.body.style.overflow), '', '關閉後恢復頁面捲動');

  // ---------- 7. Carousel ----------
  console.log('\n[7] 地圖輪播');
  await page.locator('#carousel').scrollIntoViewIfNeeded();
  ok((await page.textContent('#carCaption')).startsWith(data.resorts[0].name), '輪播第 1 張');
  await page.click('#carNext');
  ok((await page.textContent('#carCaption')).startsWith(data.resorts[1].name), '下一張');
  await page.click('#carPrev'); await page.click('#carPrev');
  ok((await page.textContent('#carCaption')).startsWith(data.resorts[4].name), '第 1 張按上一張 → 最後一張');
  eq((await page.textContent('#carCounter')).trim(), '5 / 5', '計數器');
  await page.waitForTimeout(500);
  await page.locator('.carousel-slide').nth(4).click();
  await page.waitForFunction(() => window.__lb.state().natW > 0);
  eq((await page.evaluate(() => window.__lb.state())).idx, 4, '點擊輪播開啟對應燈箱');
  await page.keyboard.press('Escape');

  // ---------- 8. Location map ----------
  console.log('\n[8] 雪場位置地圖');
  const locNames = await page.$$eval('.loc-body strong', n => n.map(x => x.textContent));
  const north = [...data.resorts].sort((a, b) => b.location.lat - a.location.lat).map(r => r.name);
  eq(JSON.stringify(locNames), JSON.stringify(north), '清單由北至南');
  eq(locNames[0], '栂池高原', '最北 = 栂池');
  eq(locNames[4], '鹿島槍', '最南 = 鹿島槍');
  const gmLinks = await page.$$eval('.loc-actions a', a => a.map(x => ({ href: x.href, t: x.target, rel: x.rel })));
  ok(gmLinks.every(l => l.href.startsWith('https://www.google.com/maps/search/?api=1&query=') && l.t === '_blank' && l.rel.includes('noopener')), 'Google Maps 連結格式正確、新分頁、noopener');
  const expectQ = [...data.resorts].sort((a, b) => b.location.lat - a.location.lat).map(r => r.location.googleMapsUrl);
  eq(JSON.stringify(gmLinks.map(l => l.href)), JSON.stringify(expectQ), 'Google Maps 連結與 JSON 一致');
  await page.locator('.leaflet-marker-icon').nth(2).click();
  await page.waitForSelector('.leaflet-popup-content');
  const pop = await page.textContent('.leaflet-popup-content');
  ok(pop.includes('3.') && pop.includes('在 Google Maps 開啟'), '點擊標記出現 popup + Google Maps 按鈕');
  const popHref = await page.getAttribute('.leaflet-popup-content a', 'href');
  eq(popHref, expectQ[2], 'popup 連結對應第 3 個雪場');
  await page.locator('[data-focus-marker="kashimayari"]').click();
  await page.waitForTimeout(600);
  ok((await page.textContent('.leaflet-popup-content')).includes('鹿島槍'), '「地圖」按鈕打開對應 popup');
  // new tab opens google maps
  const [popupPage] = await Promise.all([ctx.waitForEvent('page'), page.locator('.leaflet-popup-content a').click()]);
  ok(!!popupPage, '點擊 popup 按鈕開新分頁（測試環境封鎖 Google，只驗證新分頁 + href）');
  await popupPage.close();

  // ---------- 9. Links & assets ----------
  console.log('\n[9] 連結與資源');
  const ext = await page.$$eval('a[href^="http"]', as => as.map(a => ({ h: a.href, t: a.target, r: a.rel })));
  ok(ext.every(a => a.t === '_blank' && a.r.includes('noopener')), `全部 ${ext.length} 個外部連結新分頁 + noopener`);
  ok(!(await page.$$eval('a', as => as.some(a => a.getAttribute('href') === '#' && !a.closest('.leaflet-control-zoom')))), '沒有無效 # 連結（Leaflet 縮放按鈕除外）');
  const inner = await page.$$eval('a[href^="#"]', as => as.filter(a => !a.closest('.leaflet-container')).map(a => a.getAttribute('href')));
  for (const h of new Set(inner)) ok(await page.locator(h).count() === 1, `錨點 ${h} 有目標`);
  for (const r of data.resorts) for (const f of [r.trailMap.thumb, r.trailMap.full]) {
    const res = await page.request.get(BASE + f); eq(res.status(), 200, `資源 ${f}`);
  }
  eq(page.failed404.length, 0, '無本地 404：' + page.failed404.join(', '));
  eq(page.errors.length, 0, 'JS 無錯誤：' + page.errors.join(' | '));
  await page.evaluate(() => document.getElementById('bPeople').scrollIntoView({ block: 'center' }));
  await page.waitForTimeout(400);
  ok(!(await page.locator('#budgetSticky').isVisible()), '桌面版不顯示底部總額列');
  await page.screenshot({ path: path.join(SHOTS, 'desktop-light.png'), fullPage: true });

  // ---------- 10. Theme persistence ----------
  console.log('\n[10] 深色模式');
  const t0 = await page.getAttribute('html', 'data-theme');
  await page.click('#themeToggle');
  const t1 = await page.getAttribute('html', 'data-theme');
  ok(t0 !== t1, '切換主題');
  await page.reload(); await page.waitForSelector('#compareTable tbody tr');
  eq(await page.getAttribute('html', 'data-theme'), t1, '重新整理後記住主題');
  await page.screenshot({ path: path.join(SHOTS, 'desktop-dark.png'), fullPage: true });
  eq(page.errors.length, 0, '深色模式重載無 JS 錯誤');
  await ctx.close();

  // ---------- 11. Mobile ----------
  console.log('\n[11] 手機版 375px');
  ({ ctx, page } = await newPage({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 }));
  await page.goto(BASE); await page.waitForSelector('#compareTable tbody tr'); await page.waitForTimeout(600);
  const ov = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth, iw: window.innerWidth }));
  ok(ov.sw <= 375 && ov.cw === 375 && ov.iw === 375, `無水平捲動（scroll ${ov.sw} / client ${ov.cw} / inner ${ov.iw} 皆 = 375）`);
  ok(!(await page.locator('#siteNav').isVisible()), '導覽預設收起');
  await page.click('#navToggle');
  ok(await page.locator('#siteNav').isVisible(), '漢堡選單展開');
  eq(await page.getAttribute('#navToggle', 'aria-expanded'), 'true', 'aria-expanded=true');
  await page.click('#siteNav a[href="#budget"]');
  await page.waitForTimeout(900);
  ok(!(await page.locator('#siteNav').isVisible()), '點選後自動收起');
  const tw = await page.$eval('.table-wrap', el => ({ sw: el.scrollWidth, cw: el.clientWidth }));
  ok(tw.sw > tw.cw, '比較表可在容器內橫向捲動');
  // wide elements overflow check
  const wide = await page.evaluate(() => [...document.querySelectorAll('body *')].filter(el => {
    if (el.closest('.table-wrap,.carousel-track,.leaflet-container,.lightbox,.skip-link')) return false;
    const r = el.getBoundingClientRect(); return r.width > 0 && (r.right > 376 || r.left < -1);
  }).map(el => el.tagName + '.' + el.className).slice(0, 5));
  eq(wide.length, 0, '沒有元素超出畫面：' + wide.join(', '));
  // tap target sizes for main buttons
  const small = await page.$$eval('.btn,.flip-btn,.icon-btn', bs => bs.filter(b => b.offsetParent && b.getBoundingClientRect().height < 32).length);
  eq(small, 0, '按鈕高度 ≥ 32px');
  // swipe carousel
  await page.locator('#carousel').scrollIntoViewIfNeeded();
  const box = await page.locator('#carouselTrack').boundingBox();
  const cdp = await ctx.newCDPSession(page);
  const touch = async (type, x, y) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x, y }] });
  await touch('touchStart', box.x + box.width * 0.8, box.y + box.height / 2);
  await touch('touchMove', box.x + box.width * 0.5, box.y + box.height / 2);
  await touch('touchMove', box.x + box.width * 0.2, box.y + box.height / 2);
  await touch('touchEnd');
  await page.waitForTimeout(500);
  ok((await page.textContent('#carCaption')).startsWith(data.resorts[1].name), '手機左滑切換輪播');
  // pinch zoom in lightbox
  await page.locator('.flip').first().locator('.thumb-btn').scrollIntoViewIfNeeded();
  await page.locator('.flip').first().locator('.thumb-btn').click();
  await page.waitForFunction(() => window.__lb.state().natW > 0);
  const s0 = (await page.evaluate(() => window.__lb.state())).scale;
  const sb = await page.locator('#lbStage').boundingBox();
  const cx = sb.x + sb.width / 2, cy = sb.y + sb.height / 2;
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: cx - 20, y: cy, id: 1 }, { x: cx + 20, y: cy, id: 2 }] });
  for (let d = 30; d <= 120; d += 15) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: cx - d, y: cy, id: 1 }, { x: cx + d, y: cy, id: 2 }] });
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  const sPinch = (await page.evaluate(() => window.__lb.state())).scale;
  ok(sPinch > s0 * 2, `雙指放大（${s0.toFixed(3)} → ${sPinch.toFixed(3)}）`);
  eq(await page.evaluate(() => visualViewport.scale), 1, '雙指縮放只放大地圖，瀏覽器頁面不跟著縮放');
  const closeBox = await page.locator('#lbClose').boundingBox();
  ok(closeBox && closeBox.x + closeBox.width <= 375 && closeBox.x >= 0, '關閉按鈕完整在畫面內');
  await page.screenshot({ path: path.join(SHOTS, 'mobile-lightbox.png') });
  await page.click('#lbClose');
  // 底部總額列
  await page.addStyleTag({ content: 'html{scroll-behavior:auto!important}' });
  await page.evaluate(() => document.getElementById('bPeople').scrollIntoView({ block: 'center' }));
  await page.waitForTimeout(400);
  ok(await page.locator('#budgetSticky').isVisible(), '手機填表時顯示底部總額列');
  eq((await page.textContent('#stickyJpy')).trim(), (await page.textContent('#totalJpy')).trim(), '底部總額 = 結果總額');
  await page.fill('#bPeople', '4'); await page.dispatchEvent('#bPeople', 'input');
  eq((await page.textContent('#stickyJpy')).trim(), (await page.textContent('#totalJpy')).trim(), '修改人數後底部總額同步');
  await page.evaluate(() => document.getElementById('budgetResult').scrollIntoView({ block: 'center' }));
  await page.waitForTimeout(400);
  ok(!(await page.locator('#budgetSticky').isVisible()), '看到結果卡時隱藏底部總額列');
  await page.evaluate(() => document.getElementById('overview').scrollIntoView());
  await page.waitForTimeout(400);
  ok(!(await page.locator('#budgetSticky').isVisible()), '離開預算版塊時隱藏');
  await page.locator('.flip').first().locator('.thumb-btn').click();
  await page.waitForFunction(() => window.__lb.state().natW > 0);
  await page.click('#lbClose');
  await page.screenshot({ path: path.join(SHOTS, 'mobile-full.png'), fullPage: true });
  eq(page.errors.length, 0, '手機版無 JS 錯誤：' + page.errors.join(' | '));
  await ctx.close();

  // ---------- 12. Leaflet fallback ----------
  console.log('\n[12] Leaflet 載入失敗後備');
  ({ ctx, page } = await newPage());
  await page.route('**/leaflet.js', r => r.abort());
  await page.goto(BASE); await page.waitForSelector('#compareTable tbody tr');
  eq(await page.locator('.map-fallback a').count(), 5, 'SVG 後備圖 5 個可點擊標記');
  const fbHrefs = await page.$$eval('.map-fallback a', a => a.map(x => x.getAttribute('href')));
  ok(fbHrefs.every(h => h.startsWith('https://www.google.com/maps/')), '後備標記連 Google Maps');
  eq(page.errors.length, 0, '後備模式無 JS 錯誤：' + page.errors.join(' | '));
  await page.locator('#location').screenshot({ path: path.join(SHOTS, 'fallback-map.png') });
  await ctx.close();

  // ---------- 13. Live exchange rate path ----------
  console.log('\n[13] 即時匯率成功路徑');
  ({ ctx, page } = await newPage());
  await page.route('https://open.er-api.com/**', r => r.fulfill({ contentType: 'application/json', body: JSON.stringify({ result: 'success', time_last_update_utc: 'Mon, 28 Sep 2026 00:00:01 +0000', rates: { HKD: 0.0531 } }) }));
  await page.goto(BASE); await page.waitForSelector('#compareTable tbody tr');
  await page.waitForFunction(() => document.getElementById('rateHint').textContent.includes('即時匯率'));
  eq(await page.inputValue('#bRate'), '0.0531', '即時匯率填入');
  const jpyNow = +(await page.textContent('#totalJpy')).replace(/[^\d]/g, '');
  eq((await page.textContent('#totalHkd')).trim(), 'HK$' + Math.round(jpyNow * 0.0531).toLocaleString('en-US'), 'HKD 按即時匯率重算');
  await page.route('https://open.er-api.com/**', r => r.fulfill({ contentType: 'application/json', body: '{"rates":{"HKD":"bad"}}' }));
  await page.reload(); await page.waitForSelector('#compareTable tbody tr');
  await page.waitForFunction(() => document.getElementById('rateHint').textContent.includes('未能'));
  eq(await page.inputValue('#bRate'), String(data.meta.exchangeRate.rate), '異常匯率回應 → 保留後備值');
  eq(page.errors.length, 0, '匯率測試無 JS 錯誤');
  await ctx.close();

  // ---------- 14. file:// ----------
  console.log('\n[14] 直接開啟檔案（file://）');
  ({ ctx, page } = await newPage());
  await page.goto('file://' + REPO + '/index.html'); await page.waitForTimeout(1200);
  ok((await page.textContent('#app')).includes('無法載入雪場數據'), 'file:// 顯示清楚的錯誤指引');
  await ctx.close();

  // ---------- 15. Keyboard a11y ----------
  console.log('\n[15] 鍵盤操作');
  ({ ctx, page } = await newPage());
  await page.goto(BASE); await page.waitForSelector('#compareTable tbody tr');
  await page.locator('.carousel-slide').first().focus();
  await page.keyboard.press('Enter');
  await page.waitForFunction(() => document.getElementById('lightbox').classList.contains('open'));
  eq(await page.evaluate(() => document.activeElement.id), 'lbClose', '開燈箱後焦點在關閉鍵');
  for (let k = 0; k < 10; k++) await page.keyboard.press('Tab');
  ok(await page.evaluate(() => !!document.activeElement.closest('#lightbox')), 'Tab 焦點鎖在燈箱內');
  await page.keyboard.press('Escape');
  ok(await page.evaluate(() => document.activeElement.classList.contains('carousel-slide')), '關閉後焦點回到觸發元素');
  const card0 = page.locator('.flip').first();
  await card0.locator('[data-flip="open"]').focus(); await page.keyboard.press('Enter');
  await page.waitForTimeout(150);
  ok(await page.evaluate(() => document.activeElement.dataset.flip === 'close'), '翻卡後焦點移到返回鍵');
  eq(page.errors.length, 0, '鍵盤測試無 JS 錯誤');
  await ctx.close();

  await browser.close();
  console.log(`\n結果：${pass} 通過，${fail} 失敗`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('TEST CRASH', e); process.exit(2); });
