# 網站結構規劃（參考 ZhangJiaJie project）

> 參考來源：[sang95630-ship-it/ZhangJiaJie](https://github.com/sang95630-ship-it/ZhangJiaJie) `index.html`
> 狀態：規劃階段，網站暫緩製作；數據先落在 `data/resorts.json`

## 1. 沿用 ZhangJiaJie 的技術框架

| 項目 | ZhangJiaJie 做法 | Hakuba 網站沿用方式 |
|---|---|---|
| 檔案結構 | 單一 `index.html`（CSS + JS inline），GitHub Pages 直接部署 | 同樣用單一 `index.html`，但數據改為 `fetch('data/resorts.json')` 讀取，更新數據不用改 HTML |
| 字型 | Noto Serif TC（標題）+ Manrope（內文） | 沿用 |
| 設計 tokens | `:root` 定義 `--text-*`、`--space-*`、`--color-*`、`--radius-*` | 沿用全套 token 命名，配色改為**雪地藍系**（見第 6 節） |
| 深色模式 | `[data-theme="dark"]` + `data-theme-toggle` 按鈕 | 沿用 |
| Header | sticky + blur、brand mark SVG、錨點導覽、手機漢堡選單、scroll-spy | 沿用，brand mark 改為山 + 雪板圖示 |
| RWD 斷點 | 1600+ / 1280+ / 769–1279 / ≤960 / ≤600 | 沿用 |
| 燈箱 | `#lightbox` 支援左右切換、手機滑動 | 沿用；頁面只載入 `trailMap.thumb`，點擊地圖後燈箱才載入 `trailMap.full`（原解像度），並支援雙指 / 滾輪縮放與拖曳 |

## 2. 版塊對應（Section mapping）

| ZhangJiaJie 版塊 | id | Hakuba 對應版塊 | 新 id | 數據來源（resorts.json） |
|---|---|---|---|---|
| Hero：標題 + 4 張 stat-card + 設計邏輯 aside | `#overview` | Hero：「白馬 5 大雪場比較」+ stat-card（雪場數、雪道總長、全山通票價、最佳初學雪場）+「選場邏輯」aside | `#overview` | `meta.valleyPass`、`resorts[].slopes.totalKm` |
| Hero 右側：地圖輪播 `mapSlides` | `#mapCarousel` | 5 張雪場地圖輪播（thumb），點擊開燈箱看全清版（full） | `#mapCarousel` | `resorts[].trailMap.thumb` / `.full` |
| （新增） | — | **雪場位置地圖**：5 個雪場標記，點擊標記開 Google Maps | `#location` | `resorts[].location` |
| 每日行程 timeline（day-card） | `#itinerary` | **總覽比較表**（新增元件）：可按雪票、雪道長度、初中級 %、白馬站車程排序 | `#compare` | 全部欄位 |
| 景點詳情 flip card（正面相簿 + 背面交通訂票） | `#spots` | **雪場卡**：正面 = 標高、索道、雪道比例條、summary、地圖；背面 = 雪票、交通、住宿、官網 / skiresort 連結 | `#resorts` | `resorts[]` 每一筆一張卡 |
| 預算試算（勾選門票 + 住宿 / 人數，CNY/HKD） | `#budget` | **滑雪預算試算**：選雪場 × 日數 × 人數，比較單場票 vs 全山通票；**只顯示 JPY 與 HKD** | `#budget` | `ticket.adult1Day`、`meta.valleyPass`、`lodging.priceRangePerRoomNight`、`meta.exchangeRate` |
| 住宿推介 hotel-card | `#stay` | 住宿區比較：按雪場列出住宿區、距索道步程、價格區間、Booking / Google Hotels 連結 | `#stay` | `resorts[].lodging` |
| 注意事項 warn-card | `#notes` | 注意事項：雪季、裝備、全山通票、數據狀態說明（verified / estimate） | `#notes` | `meta.notes` |
| footer | — | 資料更新日期 + 來源 | — | `meta.compiled` |

## 3. 需新增的元件（ZhangJiaJie 沒有）

- **雪場位置地圖**：見第 8 節
- **比較表**：`<table>` + 表頭點擊排序；手機版改為橫向捲動或卡片列表
- **程度比例條**：一條橫條分三段（初 / 中 / 高，綠 / 紅 / 黑，對應雪場地圖的顏色慣例）
- **初學友善度星級**：`beginnerScore` 1–5
- **數據狀態標籤**：`estimate` / `unknown` 以淡色小 pill 標示，避免估算值被當成官方數字

## 4. 不建議照搬的地方

- ZhangJiaJie 的主題切換讀取了 `localStorage` 卻沒有使用（固定 `light`），新網站應真正記住使用者選擇，並用 try/catch 包住
- 相簿圖片為外部熱鏈（Klook、tripcdn 等），隨時可能失效；Hakuba 網站圖片放 `assets/` 自行託管
- 內容全部寫死在 HTML，改一個價錢要找幾個地方；新網站改為由 JSON 渲染卡片與表格

## 5. 目錄結構（預計）

```text
Hakuba_Snowboard/
├── index.html          # 單頁網站（沿用 ZhangJiaJie 框架）
├── data/resorts.json   # 唯一數據來源
├── assets/maps/*.webp  # 雪場地圖：<id>-thumb.webp（1200px）+ <id>.webp（1917px 全清）
├── docs/site-plan.md   # 本文件
└── README.md           # 比較數據（Markdown 版）
```

## 6. 雪地藍系配色（Design tokens）

```css
:root,[data-theme="light"]{
  --color-bg:#eef3f8;          /* 雪地淺藍白 */
  --color-surface:#f5f8fb;
  --color-surface-2:#fbfcfe;
  --color-surface-offset:#dde7f0;
  --color-surface-dynamic:#cfdce8;
  --color-divider:#cbd8e4;
  --color-border:#b8c9d9;
  --color-text:#1f2d3d;        /* 深藍灰，對比度 > 12:1 */
  --color-text-muted:#546a80;
  --color-text-faint:#8a9db0;
  --color-text-inverse:#f8fbff;
  --color-primary:#2f6fa8;     /* 冰川藍 */
  --color-primary-hover:#245a8a;
  --color-primary-highlight:#d6e6f5;
}
[data-theme="dark"]{
  --color-bg:#0f1824;          /* 夜滑深藍 */
  --color-surface:#152131;
  --color-surface-2:#1b293b;
  --color-surface-offset:#223246;
  --color-surface-dynamic:#2b3e55;
  --color-divider:#2e4259;
  --color-border:#3a526d;
  --color-text:#e6eef6;
  --color-text-muted:#a9bccf;
  --color-text-faint:#7890a8;
  --color-text-inverse:#0f1824;
  --color-primary:#7fb6e6;
  --color-primary-hover:#a3cbef;
  --color-primary-highlight:#1e3a57;
}
/* 雪道程度色：跟隨日本雪場地圖慣例 */
:root{--lv-beginner:#2e9d5b;--lv-intermediate:#d9443a;--lv-advanced:#1f2d3d}
[data-theme="dark"]{--lv-advanced:#e6eef6}
```

## 7. 預算試算規格（JPY & HKD）

- 所有價格以 **JPY** 為基準儲存（`resorts.json`），HKD 為換算顯示
- 匯率：頁面載入時由免費匯率 API 取得 JPY→HKD；失敗時使用 `meta.exchangeRate.rate` 作後備值，並在畫面標示「後備匯率」及日期
- 額外提示：當「全山通票總額 − 單場票總額」< 0 時提示改買全山通票

**輸入欄位**

| 分類 | 欄位 | 預設值 | 數據來源 |
|---|---|---|---|
| 基本 | 人數、滑雪日數、住宿晚數 | 2 人 / 5 日 / 5 晚 | — |
| 雪票 | 每日雪場或全山通票 | 各雪場 1 日券 | `ticket.adult1Day`、`meta.valleyPass` |
| 住宿 | 每房每晚價格 | 該雪場 `priceRangePerRoomNight` 中位數（可手改） | `lodging` |
| 交通（往返） | 路線：**機場接駁（預設）** / 經長野 / 新宿直達巴士 | 成田 / 羽田 → 白馬 Nagano Snow Shuttle ¥11,000 × 2 程 = ¥22,000 / 人 | `meta.costs.transportPackages`（`defaultTransportPackage: "airport"`） |
| 谷內交通 | 接駁巴士每日程數 | 2 程 × ¥800（勾選全山通票時自動 = ¥0） | `meta.costs.localTransport` |
| 雪具租借 | 雪板 + 雪靴 / 雪衣褲 / 頭盔（逐項勾選） | ¥6,500 / ¥5,000 / ¥2,000 每日；損壞保障 ¥1,000 一次 | `meta.costs.rental` |

**輸出**：雪票、住宿、交通、雪具四個小計 + 總額 + 每人平均；每項同時顯示 `¥xx,xxx` 與 `HK$x,xxx`

**提示文字**：雪鏡、手套多數店舖不出租，需自備（列在預算卡底部）

## 8. 雪場位置地圖

**功能**
- 一張白馬谷地圖，標出 5 個雪場（由北至南：栂池 → 岩岳 → 八方 → 五竜&47 → 鹿島槍）
- 點擊標記 → 彈出小卡（雪場名、1 日券、白馬站車程）+「在 Google Maps 開啟」按鈕 → 新分頁打開 `location.googleMapsUrl`
- 手機版一按即開 Google Maps App（`https://www.google.com/maps/search/?api=1&query=` 格式會自動喚起 App）
- 地圖下方同時列出 5 個文字連結，方便不想操作地圖的用戶

**實作方案（建議 A）**

| 方案 | 做法 | 優點 | 缺點 |
|---|---|---|---|
| **A. Leaflet + OpenStreetMap** | cdnjs 載入 Leaflet（約 40 KB），OSM 圖磚 | 真實地圖、可縮放、免 API Key、免費 | 依賴外部圖磚；深色模式需加 CSS filter |
| B. 內嵌 SVG 示意圖 | 自繪白馬谷南北走向示意圖 + 5 個標記 | 零依賴、完全配合雪地藍系、載入最快 | 非真實比例，不能縮放 |
| C. Google Maps Embed API | iframe 嵌入 | 與 Google Maps 一致 | 需 API Key，多標記要用 JS API 並可能收費 |

**數據**：`resorts[].location` = `{ mapQuery, address, lat, lng, coordStatus, googleMapsUrl }`
- `googleMapsUrl` 以日文正式名稱搜尋（例：`エイブル白馬五竜`），**不依賴座標，必定定位準確**
- `lat/lng` 目前為估算值（`coordStatus: "estimate"`），只影響標記在地圖上的位置；上線前在 Google Maps 右鍵複製座標替換
