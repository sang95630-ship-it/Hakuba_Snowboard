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
| 每日行程 timeline（day-card） | `#itinerary` | **總覽比較表**（新增元件）：可按雪票、雪道長度、初中級 %、白馬站車程排序 | `#compare` | 全部欄位 |
| 景點詳情 flip card（正面相簿 + 背面交通訂票） | `#spots` | **雪場卡**：正面 = 標高、索道、雪道比例條、summary、地圖；背面 = 雪票、交通、住宿、官網 / skiresort 連結 | `#resorts` | `resorts[]` 每一筆一張卡 |
| 預算試算（勾選門票 + 住宿 / 人數，CNY/HKD） | `#budget` | **滑雪預算試算**：選雪場 × 日數 × 人數，比較單場票 vs 全山通票；**只顯示 JPY 與 HKD** | `#budget` | `ticket.adult1Day`、`meta.valleyPass`、`lodging.priceRangePerRoomNight`、`meta.exchangeRate` |
| 住宿推介 hotel-card | `#stay` | 住宿區比較：按雪場列出住宿區、距索道步程、價格區間、Booking / Google Hotels 連結 | `#stay` | `resorts[].lodging` |
| 注意事項 warn-card | `#notes` | 注意事項：雪季、裝備、全山通票、數據狀態說明（verified / estimate） | `#notes` | `meta.notes` |
| footer | — | 資料更新日期 + 來源 | — | `meta.compiled` |

## 3. 需新增的元件（ZhangJiaJie 沒有）

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
- 輸入：人數、滑雪日數、每日雪場（或全山通票）、住宿晚數、每房每晚價格（預設取該雪場 `priceRangePerRoomNight` 中位數，可手動修改）
- 輸出：雪票小計、住宿小計、總額、每人平均；每項同時顯示 `¥xx,xxx` 與 `HK$x,xxx`
- 額外提示：當「全山通票總額 − 單場票總額」< 0 時提示改買全山通票
