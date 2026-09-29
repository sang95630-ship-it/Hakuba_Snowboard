# 費用數據核對清單

> 用途：人手核對 `data/resorts.json` 內所有費用數字
> 建立日期：2026-09-29　｜　核對人：＿＿＿＿　｜　核對日期：＿＿＿＿
> 排序：按對預設預算（2 人 × 5 日，總額 **¥359,000**）的影響由大到小

| 分類 | 預設金額 | 佔總額 | 優先 |
|---|---:|---:|:---:|
| 雪具租借 | ¥117,000 | 33% | 1 |
| 住宿 | ¥100,000 | 28% | 2 |
| 雪票 | ¥82,000 | 23% | 3 |
| 交通 | ¥60,000 | 17% | 4 |
| 匯率 | 影響全部 HKD 顯示 | — | 5 |

## 核對通則（每項都要看）

- [ ] **雪季**：頁面顯示的是 2025-26 還是 2026-27 季價格？本站目前全部用 **2025-26 季**，如 2026-27 季已公佈，記下新價
- [ ] **窗口價 vs 網購價 vs 早鳥價**：本站雪票用**窗口價**，另記網購 / 早鳥價
- [ ] **含稅**：日本價格應標示「税込」（含 10% 消費稅），確認不是未稅價
- [ ] **大人定義**：大人通常指中學生或 18 歲以上，各場不同
- [ ] **旺季日期**：記下旺季起訖日（例如八方 12/20–3/15），春季價通常較平
- [ ] **截圖存證**：每個來源截圖並記下日期，日後更新時方便比對

---

## 1. 雪具租借（`meta.costs.rental`）

| ✓ | 項目 | 本站數字 | JSON 路徑 | 核對重點 |
|:-:|---|---|---|---|
| [ ] | 雪板 + 雪靴（每日） | **¥6,500**（範圍 ¥5,500–8,600） | `rental.snowboardSet.perDayTypical` | 標準級（非 Premium / Demo）大人 1 日價 |
| [ ] | 雪板 + 雪靴（5 日） | ¥25,000–37,000 | `rental.snowboardSet.fiveDayRange` | 多日價通常有折扣；本站預算**未用**多日折扣，按日價 × 日數計 |
| [ ] | 雪衣 + 雪褲（每日） | **¥5,000** | `rental.wearSet.perDayTypical` | 成套價還是按件計（每件約 ¥3,800）？ |
| [ ] | 頭盔（每日） | **¥2,000**（範圍 ¥1,500–3,300） | `rental.helmet.perDayTypical` | — |
| [ ] | 損壞保障 | **¥1,000／次** | `rental.damageCover.perRental` | 按次還是按日收費？ |
| [ ] | 雪鏡、手套不出租 | — | `rental.notRentable` | 確認是否真的不設租借 |

**來源**
- Rhythm Japan 2025-26 價目表（PDF）：<https://www.skihakuba.com/hakuba_htm_files/Winter-Rental-Rates-25_26Rhythm.pdf>
- Rhythm Japan 租借頁：<https://rhythmjapan.com/winter-rentals-services>
- Hakuba.com Ski Hire：<https://hakuba.com/plan-your-trip/hakuba-ski-hire/>
- NBS Japan：<https://nbsjapan.com/hakuba/rentals/>
- Hakuba Powder Mountain：<https://hakubapowdermountain.com/ski-rental/>
- 比較文章（The Hakuba Collection）：<https://thehakubacollection.com/guest-services/ski-snowboard-hire>

> 💡 如果 5 日套票明顯比日價 × 5 便宜，告訴我，我可以把預算改為按多日價計算。

---

## 2. 住宿（`resorts[].lodging.priceRangePerRoomNight`）

本站數字屬**估算**，最需要人手核對。建議用**固定日期**搜尋，方便公平比較：

> 範例日期：**2027-02-15（一）入住 → 2027-02-20（六）退房，5 晚，2 位大人，1 房**
> 日期已避開 2027 年農曆新年（2 月 6 日）

| ✓ | 雪場 | 本站範圍（每房每晚） | 預算預設（中位數） | 核對連結（已帶入範例日期） |
|:-:|---|---|---:|---|
| [ ] | 栂池高原 | ¥10,000–30,000 | ¥20,000 | [Booking](https://www.booking.com/searchresults.html?ss=Tsugaike+Kogen&checkin=2027-02-15&checkout=2027-02-20&group_adults=2&no_rooms=1) |
| [ ] | 白馬八方尾根 | ¥12,000–60,000 | ¥36,000 | [Booking](https://www.booking.com/searchresults.html?ss=Happo%2C+Hakuba&checkin=2027-02-15&checkout=2027-02-20&group_adults=2&no_rooms=1) |
| [ ] | 白馬五竜 & 47 | ¥12,000–35,000 | ¥24,000 | [Booking](https://www.booking.com/searchresults.html?ss=Kamishiro%2C+Hakuba&checkin=2027-02-15&checkout=2027-02-20&group_adults=2&no_rooms=1) |
| [ ] | 白馬岩岳 | ¥10,000–30,000 | ¥20,000 | [Booking](https://www.booking.com/searchresults.html?ss=Iwatake%2C+Hakuba&checkin=2027-02-15&checkout=2027-02-20&group_adults=2&no_rooms=1) |
| [ ] | 鹿島槍 | ¥10,000–28,000 | ¥19,000 | [Booking](https://www.booking.com/searchresults.html?ss=Kashimayari&checkin=2027-02-15&checkout=2027-02-20&group_adults=2&no_rooms=1) |

**核對方法**
- [ ] 記下搜尋結果中**最平 3 間**和**中位價位**（排序：價格由低至高）
- [ ] 分清**每房每晚**還是**每人每晚**：日本民宿（ペンション）常按每人計，而且可能含早晚餐
- [ ] 確認顯示價已含稅及服務費；設溫泉的住宿可能另收入湯稅（每人每晚約 ¥150）
- [ ] 用地圖檢視確認酒店真的在該雪場附近（例如「Happo」搜尋結果可能混入 Echoland）
- [ ] 旁證：Google Hotels 連結見 `data/resorts.json` 的 `lodging.links.googleHotels`

---

## 3. 雪票（`resorts[].ticket.adult1Day`）

| ✓ | 雪場 | 本站數字（2025-26 大人 1 日） | 另記 | 官方連結 |
|:-:|---|---:|---|---|
| [ ] | 白馬八方尾根 | **¥8,400**（旺季） | 春季 ¥5,500 | <https://www.happo-one.jp/en/ticket/> |
| [ ] | 白馬五竜 & 47 | **¥9,500**（窗口） | 網購 ¥9,000；淡季 ¥7,000 起 | <https://www.hakubaescal.com/winter-en/tickets/lift/>・<https://www.hakuba47.co.jp/winter/en/tickets/lift_tickets_info/entry-110.html> |
| [ ] | 白馬岩岳 | **¥7,000** | 早鳥 ¥5,700 | <https://iwatake-mountain-resort.com/winter/rates> |
| [ ] | 栂池高原 | **¥8,200** | 早鳥 ¥5,900 | <https://www.tsugaike.gr.jp/>・早鳥頁 <https://tsugaike.nippon-ski.com/en/1day_early_adult.html> |
| [ ] | 鹿島槍 | **¥5,900** | 家庭套票 | <https://www.kashimayari.net/snow/> |
| [ ] | 全山通票 2025-26 | **¥10,400** | 預算比較用這個價 | <https://www.hakubavalley.com/en/ticket_en/> |
| [ ] | 全山通票 2026-27 | **¥11,100** | 首頁顯示這個價 | 網購：<https://webshop.hakubavalley.com/en/hv.html> |

**特別留意**
- [ ] **岩岳 ¥7,000** 有另一個來源寫 ¥9,700，兩者相差很大，請優先核對
- [ ] 五竜與 Hakuba47 是否共用同一張票、同一價錢
- [ ] 全山通票是否包括谷內接駁巴士（影響預算中接駁巴士是否免費）

---

## 4. 交通（`meta.costs.transport` / `localTransport`）

| ✓ | 路線 | 本站數字（每人單程） | 核對重點 | 連結 |
|:-:|---|---:|---|---|
| [ ] | **Nagano Snow Shuttle 成田 / 羽田 → 白馬**（預算預設） | **¥11,000** | 成田與羽田同價嗎？2026-27 季營運日期？何時開放預約？ | <https://naganosnowshuttle.com/destinations/hakuba-valley/> |
| [ ] | Alpico 成田機場 → 白馬 | 本站寫 **2025-26 停辦** | 2026-27 季有否復辦 | <https://visit-nagano.alpico.co.jp/timetable/hakuba-narita-airport> |
| [ ] | 北陸新幹線 東京 → 長野（指定席） | **¥8,500**（範圍 ¥8,000–9,500） | 旺季有否附加費 | <https://www.eki-net.com/>・票價說明 <https://ekitan.com/en/article/tokyo-to-nagano-shinkansen> |
| [ ] | Alpico 特急巴士 長野 → 白馬 | **¥2,300**（範圍 ¥2,200–2,400） | 到八方 / 五竜 / 栂池票價是否不同 | <https://visit-nagano.alpico.co.jp/timetable/hakuba-nagano-winter-reserved> |
| [ ] | 高速巴士 新宿 → 白馬 | **¥7,000**（範圍 ¥6,400–7,800，動態票價） | 1–2 月平日的實際票價 | <https://visit-nagano.alpico.co.jp/timetable/hakuba-shinjuku-winter> |
| [ ] | Hakuba Valley 谷內接駁巴士 | **¥800／程**（小童 ¥400） | 持**單場雪票**可否免費乘搭？（本站目前按收費計） | <https://www.hakubavalley.com/en/access_en/shuttlebus_en/> |

**本站未計入的費用（如選「經長野」路線要留意）**
- [ ] 成田 / 羽田 → 東京站（成田特快、京成、機場巴士），約 ¥1,500–3,000，本站**未計**

---

## 5. 匯率（`meta.exchangeRate.rate`）

| ✓ | 項目 | 本站數字 | 連結 |
|:-:|---|---:|---|
| [ ] | 後備匯率 1 JPY = ? HKD | **0.052**（2025 參考值） | Google Finance <https://www.google.com/finance/quote/JPY-HKD>・XE <https://www.xe.com/currencyconverter/convert/?Amount=10000&From=JPY&To=HKD> |
| [ ] | 你實際換錢的匯率（銀行 / 找換店） | — | 通常比市場中間價差 1–3% |

---

## 核對後如何更新

1. 在上表剔選，並在旁邊寫上**新數字 + 來源截圖日期**
2. 把新數字交給我，或直接修改 `data/resorts.json`（路徑已列在表中）
3. 重跑測試：`python3 -m http.server 8765` → `node tests/site.test.js`

> ⚠ 測試腳本寫死了預設預算的預期結果（例如總額 ¥359,000、HK$18,668、八方房價中位數 ¥36,000）。**改價後這些測試失敗屬正常**，代表數字已變，需要同步更新 `tests/site.test.js` 的預期值。交給我處理的話，我會一併更新。
