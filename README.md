# Hakuba Snowboard — 白馬 5 大雪場比較

> 目標：整合白馬谷（Hakuba Valley）五個雪場的索道、雪道、雪票、交通及住宿數據，之後製作成 GitHub Pages 比較網站。
> 結構化數據：[`data/resorts.json`](data/resorts.json)　｜　雪場地圖：[`assets/maps/`](assets/maps/)　｜　網站規劃：[`docs/site-plan.md`](docs/site-plan.md)（結構參考 [ZhangJiaJie](https://github.com/sang95630-ship-it/ZhangJiaJie)）
> 資料整理日期：2026-09-29（雪票為 2025-26 季價格，2026-27 季公佈後需更新）

## 網站

單頁比較網站：[`index.html`](index.html)（數據來自 `data/resorts.json`，結構參考 ZhangJiaJie）

- **功能**：雪場地圖輪播與全清放大（滾輪／雙指縮放、拖曳）、雪場位置地圖（點擊開 Google Maps）、可排序比較表、雪場翻轉卡、JPY/HKD 預算試算（雪票、住宿、交通、雪具租借）、深色模式
- **本地預覽**：在專案資料夾執行 `python3 -m http.server`，開啟 <http://localhost:8000>（直接雙擊 `index.html` 會因瀏覽器安全限制讀不到 JSON）
- **上線**：GitHub → Settings → Pages → 選擇分支與 `/ (root)`
- **更新數據**：只需修改 `data/resorts.json`，網頁自動更新
- **核對費用**：[`docs/cost-fact-check.md`](docs/cost-fact-check.md)（逐項清單 + 官方連結）
- **測試**：`node tests/site.test.js`（Playwright，216 項：數據核對、排序、預算計算、燈箱縮放、手機版、深色模式、後備地圖等），用法見檔案開頭

| 雪場 | skiresort | 官網 | 地圖 |
|---|---|---|---|
| 白馬八方尾根 Happo-One | [link](https://www.skiresort.com/en/ski-resort/happo-one-hakuba/) | [happo-one.jp](https://www.happo-one.jp/en/) | [map](assets/maps/happo-one.webp) |
| 白馬五竜 & Hakuba47 | [link](https://www.skiresort.com/en/ski-resort/hakuba-47-goryu/) | [hakubaescal.com](https://www.hakubaescal.com/winter-en/) | [map](assets/maps/goryu-47.webp) |
| 白馬岩岳 Iwatake | [link](https://www.skiresort.com/en/ski-resort/hakuba-iwatake-mountain-resort/) | [iwatake-mountain-resort.com](https://iwatake-mountain-resort.com/) | [map](assets/maps/iwatake.webp) |
| 栂池高原 Tsugaike | [link](https://www.skiresort.com/en/ski-resort/tsugaike-kogen/) | [tsugaike.gr.jp](https://www.tsugaike.gr.jp/) | [map](assets/maps/tsugaike.webp) |
| 鹿島槍 Kashimayari | [link](https://www.skiresort.com/en/ski-resort/sun-alpina-kashimayari/) | [kashimayari.net](https://www.kashimayari.net/snow/) | [map](assets/maps/kashimayari.webp) |

---

## 1. 索道比較（運輸長度 / 數量 / 容客量）

| 雪場 | 索道總數 | 纜車 | 總運力（人/時） | 主力索道 | 主力長度 | 主力運力 |
|---|---:|---:|---:|---|---:|---:|
| 八方尾根 | **23** | 1 | **29,500** | Gondola Adam（6 人） | 2,064 m | 1,350 |
| 五竜 & 47 | 20 | 2 | 未公開 | 五竜 Telecabin（8 人） | 2,000 m | 2,400 |
| 岩岳 | 12 | 1 | ≈11,100 *(估算)* | Gondola Noah（10 人，2024 新建） | 2,183 m | 2,400 |
| 栂池 | 20 | 1 | **43,800** | Gondola Eve（6 人） | **4,120 m** | 1,350 |
| 鹿島槍 | 8（地圖顯示營運 5 條） | 0 | 未公開 | 第 6 四人吊椅 | 960 m | — |

- 八方 Adam 纜車預計 **2027-12** 更新為 10 人座，運力升至 **2,400 人/時**。
- 栂池 Eve 是日本第二長普通索道，單程約 20 分鐘。

## 2. 雪道比較（長度 / 數量 / 程度分佈）

| 雪場 | 標高（底–頂） | 垂直落差 | 雪道總長 | 雪道數 | 初 / 中 / 高 | 初+中佔比 | 最長滑道 |
|---|---|---:|---:|---:|---|---:|---:|
| 八方尾根 | 760–1,831 m | **1,071 m** | **52 km** | 16 | 30 / 50 / 20 % | 80% | — |
| 五竜 & 47 | 768–1,676 m | 908 m | 22.7 km | 23 | 30 / 40 / 30 % | 70% | — |
| 岩岳 | 750–1,289 m | 539 m | 50 km* | 26 | 30 / 50 / 20 % | 80% | 3.3 km |
| 栂池 | 800–1,704 m | 904 m | 25 km | 11 | 40 / 40 / 20 % | 80% | 4.6 km |
| 鹿島槍 | 830–1,550 m | 720 m | 15.9 km | 12 | 40 / 45 / 15 % | **85%** | 4.1 km |

\* 岩岳 50 km 為 skiresort 數字，但滑雪面積僅 125 ha，實際可能偏高，建議再核對。

**按公里推算（總長 × 比例）**

| 雪場 | 初級 km | 中級 km | 高級 km |
|---|---:|---:|---:|
| 八方尾根 | 15.6 | 26.0 | 10.4 |
| 五竜 & 47 | 6.8 | 9.1 | 6.8 |
| 岩岳 | 15.0 | 25.0 | 10.0 |
| 栂池 | 10.0 | 10.0 | 5.0 |
| 鹿島槍 | 6.4 | 7.2 | 2.4 |

### 初中級友善度排名

1. **栂池高原 ★★★★★** — 山腳「鐘の鳴る丘」坡度約 8°、闊度為白馬之冠，初學首選。
2. **鹿島槍 ★★★★★** — 初中級佔 85%，雪票最平、人流少，家庭首選；缺點是位置偏南。
3. **白馬岩岳 ★★★★** — 中級滑手最舒服，人少景靚。
4. **五竜 & 47 ★★★** — 五竜 Toomi 區有寬闊初級坡 + 夜滑；47 側偏進階。
5. **八方尾根 ★★★** — 雪道最多，但初級區只集中在咲花 / 名木山，上半山偏中高級。

## 3. 雪票價格（2025-26 季，大人 1 日券）

| 雪場 | 1 日券 | 備註 |
|---|---:|---|
| 八方尾根 | ¥8,400 | 旺季 12/20–3/15；春季 ¥5,500 |
| 五竜 & 47 | **¥9,500** | 窗口價；網購 ¥9,000；淡季 ¥7,000 起 |
| 岩岳 | ¥7,000 | 早鳥 ¥5,700 |
| 栂池 | ¥8,200 | 早鳥 ¥5,900 |
| 鹿島槍 | **¥5,900** | 另有家庭套票 |
| Hakuba Valley 全山通票 | ¥10,400 → **¥11,100（2026-27）** | 10 個雪場通用 + 當日接駁巴士 |

- 結論：只滑單一雪場時買單場票較划算；**計劃每天轉場或 3 日內去 2 個以上雪場**才值得買全山通票（溢價約 ¥1,600–5,200/日）。
- 購票：[Hakuba Valley 官方網購](https://www.hakubavalley.com/en/ticket_en/onlinewebshop_en/)

## 4. 交通時間

**東京 → 白馬**

| 路線 | 時間 | 參考票價 |
|---|---|---|
| 北陸新幹線 東京 → 長野 | 約 80–100 分鐘 | 約 ¥8,000 |
| Alpico 特急巴士 長野 → 白馬 | 60–90 分鐘（見下表） | ¥2,200–2,400 |
| 新宿 → 白馬 高速巴士（直達） | 約 4.5–5 小時 | — |

**長野站 → 各雪場 / 白馬站 → 各雪場**

| 雪場 | 長野巴士（Alpico） | 白馬站車程 | 備註 |
|---|---:|---:|---|
| 五竜 & 47 | **約 60 分** | 約 10 分 | JR 神城站步行 10–15 分 |
| 八方尾根 | 約 70 分 | **約 5 分** | 八方巴士總站即山腳 |
| 岩岳 | 無直達 | 約 10 分 | 谷內接駁巴士 |
| 栂池 | 約 90 分（終點站） | 約 20 分 | 白馬谷最北 |
| 鹿島槍 | 無直達 | 約 30 分 | JR 大糸線簗場站 / 自駕，白馬谷最南 |

- 巴士時刻表：[Alpico 長野 ⇆ 白馬](https://visit-nagano.alpico.co.jp/timetable/hakuba-nagano-winter-reserved)（2026-27 冬季時刻表未公佈時可參考上季）

## 5. 住宿（價格 + 與雪場距離）

> 價格為旺季（1–2 月）**每房每晚參考區間**，屬估算；實際以訂房網站報價為準。

| 雪場 | 主要住宿區 | 與索道距離 | 參考價格 / 晚 | 搜尋連結 |
|---|---|---|---|---|
| 八方尾根 | 八方村、和田野、Echoland | 步行 0–15 分；Echoland 車程 5 分 | ¥12,000–60,000+ | [Booking](https://www.booking.com/searchresults.html?ss=Happo%2C+Hakuba) ・ [Google Hotels](https://www.google.com/travel/search?q=Hakuba%20Happo%20hotels) |
| 五竜 & 47 | 神城 / Escal Plaza 周邊 | 步行 0–10 分 | ¥12,000–35,000 | [Booking](https://www.booking.com/searchresults.html?ss=Kamishiro%2C+Hakuba) ・ [Google Hotels](https://www.google.com/travel/search?q=Hakuba%20Goryu%20hotels) |
| 岩岳 | 岩岳山腳、白馬站周邊 | 步行 0–10 分 | ¥10,000–30,000 | [Booking](https://www.booking.com/searchresults.html?ss=Iwatake%2C+Hakuba) ・ [Google Hotels](https://www.google.com/travel/search?q=Hakuba%20Iwatake%20hotels) |
| 栂池 | 栂池高原村落 | 步行 0–10 分（ski-in/out 多） | ¥10,000–30,000 | [Booking](https://www.booking.com/searchresults.html?ss=Tsugaike+Kogen) ・ [Google Hotels](https://www.google.com/travel/search?q=Tsugaike%20Kogen%20hotels) |
| 鹿島槍 | 山腳 Alpen Inn、中綱湖 B&B | 山腳酒店 ski-in/out | ¥10,000–28,000 | [Booking](https://www.booking.com/searchresults.html?ss=Kashimayari) ・ [Google Hotels](https://www.google.com/travel/search?q=Kashimayari%20hotels) |

- 想「一次住、多場滑」：住 **八方 / Echoland**（交通樞紐，接駁巴士最密集）。
- 以初學為主：住 **栂池**（ski-in/out + 最佳初級坡 + 價格較低）。

## 6. 交通費（每人單程，2025-26 參考）

| 路線 | 票價 | 時間 |
|---|---:|---|
| 北陸新幹線 東京 → 長野（指定席） | ¥8,000–9,500 | 80–100 分 |
| Alpico 特急巴士 長野 → 白馬 | ¥2,200–2,400 | 60–90 分 |
| **小計：經長野** | **≈ ¥10,800** | 約 2.5–3 小時 |
| 高速巴士 新宿 → 白馬（直達，動態票價） | ¥6,400–7,800 | 4.5–5 小時 |
| Nagano Snow Shuttle 成田 / 羽田 → 白馬 | ≈ ¥11,000 | 約 5 小時 |
| Hakuba Valley 谷內接駁巴士 | ¥800 / 程（持全山通票免費） | — |

- Alpico 2025-26 季**停辦**成田機場直達巴士，機場直達只剩 Nagano Snow Shuttle 或包車。

## 7. 雪具租借（每人每日，2025-26 參考）

| 項目 | 每日價格 | 備註 |
|---|---:|---|
| 雪板 + 雪靴 | ¥5,500–8,600（常見 ¥6,500） | 5 日套票 ¥25,000–37,000 |
| 雪衣 + 雪褲 | ≈ ¥5,000 | 部分店按件計，每件約 ¥3,800 |
| 頭盔 | ¥1,500–3,300 | — |
| 損壞保障 | ¥1,000 / 次 | 不論日數 |
| 雪鏡、手套 | **不設租借** | 多數店舖基於衞生理由不出租，需自備 |

- 租借店：[Rhythm Japan](https://rhythmjapan.com/winter-rentals-services) ・ [Hakuba.com Ski Hire](https://hakuba.com/plan-your-trip/hakuba-ski-hire/) ・ [NBS Japan](https://nbsjapan.com/hakuba/rentals/)
- **5 日全套估算（板 + 衣 + 頭盔）**：≈ ¥13,500 / 日 × 5 = **¥67,500 / 人**

## 8. 雪場位置（Google Maps）

| 雪場 | 地址 | Google Maps |
|---|---|---|
| 栂池高原 | 長野県北安曇郡小谷村栂池高原12840-1 | [開啟](https://www.google.com/maps/search/?api=1&query=%E6%A0%82%E6%B1%A0%E9%AB%98%E5%8E%9F%E3%82%B9%E3%82%AD%E3%83%BC%E5%A0%B4) |
| 白馬岩岳 | 長野県北安曇郡白馬村北城12056 | [開啟](https://www.google.com/maps/search/?api=1&query=%E7%99%BD%E9%A6%AC%E5%B2%A9%E5%B2%B3%E3%83%9E%E3%82%A6%E3%83%B3%E3%83%86%E3%83%B3%E3%83%AA%E3%82%BE%E3%83%BC%E3%83%88) |
| 白馬八方尾根 | 長野県北安曇郡白馬村北城八方 | [開啟](https://www.google.com/maps/search/?api=1&query=%E7%99%BD%E9%A6%AC%E5%85%AB%E6%96%B9%E5%B0%BE%E6%A0%B9%E3%82%B9%E3%82%AD%E3%83%BC%E5%A0%B4) |
| 五竜 & 47 | 長野県北安曇郡白馬村神城22184-8 | [開啟](https://www.google.com/maps/search/?api=1&query=%E3%82%A8%E3%82%A4%E3%83%96%E3%83%AB%E7%99%BD%E9%A6%AC%E4%BA%94%E7%AB%9C) |
| 鹿島槍 | 長野県大町市平黒沢高原 | [開啟](https://www.google.com/maps/search/?api=1&query=%E9%B9%BF%E5%B3%B6%E6%A7%8D%E3%82%B9%E3%82%AD%E3%83%BC%E5%A0%B4%E3%83%95%E3%82%A1%E3%83%9F%E3%83%AA%E3%83%BC%E3%83%91%E3%83%BC%E3%82%AF) |

---

## 資料來源

- skiresort.info / skiresort.com（標高、雪道長度、索道數量、總運力）
- 各雪場官網與 [Hakuba Valley 官方](https://www.hakubavalley.com/en/ticket_en/)（雪票）
- Alpico Group 時刻表（交通）
- 纜車規格：日經新聞（八方 Adam 更新計劃）、岩岳官方 PR（Noah 10 人座）、栂池 Eve 相關資料
- 雪道比例：SamuraiSnow、Powderhounds、hakuba.com 等引用之官方比例

## 待辦

- [ ] 2026-27 季各雪場 1 日券公佈後更新
- [ ] 補齊五竜 & 47、鹿島槍的總運力
- [ ] 核對 5 個雪場的經緯度（`location.lat/lng` 現為估算）
- [ ] 核對岩岳雪道總長（50 km vs 125 ha）
- [ ] 以 `data/resorts.json` 建立 GitHub Pages 比較網站（沿用 ZhangJiaJie 單頁框架，見 `docs/site-plan.md`）
