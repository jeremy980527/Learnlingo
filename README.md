# DuoLearn

把你的講義、筆記、截圖上傳，AI 自動幫你生成一套多鄰國式的遊戲化學習地圖 —— 單元、關卡、生命值、經驗值、連續學習天數一應俱全。

## 技術棧

- **框架**：Next.js 16（App Router）+ React 19 + TypeScript
- **樣式 / 動畫**：Tailwind CSS v4、Framer Motion
- **狀態管理**：Zustand（生命值/XP/連續天數，client 端）、TanStack Query（非同步狀態）
- **後端**：Supabase（Auth + Postgres + Storage）
- **ORM**：Prisma 7（driver adapter：`@prisma/adapter-pg`）
- **AI**：Anthropic Claude API（未設定 Key 時自動改用內建離線規則式引擎）
- **檔案解析**：`pdfjs-dist`（PDF 文字擷取）、`tesseract.js`（圖片 OCR）

## 快速開始

```bash
npm install
cp .env.example .env.local   # 填入下方所需的環境變數
npx prisma migrate dev       # 首次建立資料表（需要 DATABASE_URL）
npm run dev
```

打開 [http://localhost:3000](http://localhost:3000)。

### 不想馬上設定 Supabase / Claude API？

直接前往 **`/demo`** —— 這是一個完全在瀏覽器端運作的展示模式，使用內建的範例教材與離線規則式引擎，
不需要任何環境變數就能體驗完整的上傳→生成→學習地圖→關卡遊戲→結算的完整流程。

## 環境變數

複製 `.env.example` 為 `.env.local` 並填入：

| 變數 | 說明 |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 專案設定 → API |
| `SUPABASE_SERVICE_ROLE_KEY` | 僅伺服器端使用，用於背景處理教材上傳後的解析工作 |
| `DATABASE_URL` | Supabase Postgres 連線字串（建議使用 connection pooling URI） |
| `ANTHROPIC_API_KEY` | 你的 Claude API Key。**未設定時系統會自動 fallback 到內建的離線規則式引擎**，仍可完整運作，只是產生的題目品質較陽春 |
| `ANTHROPIC_MODEL` | 預設 `claude-sonnet-5`，可自行覆寫 |

沒有設定 Supabase 時，登入/上傳/地圖等頁面會顯示清楚的提示並導向 `/demo`，不會噴出未處理的錯誤。

## 系統架構

```
使用者上傳教材 (PDF/圖片/純文字)
        │
        ▼
Supabase Storage（儲存原始檔案）
        │
        ▼
文字擷取層 (pdfjs-dist / tesseract.js)
        │
        ▼
AI 生成引擎 (Claude API，或離線 mock provider)
    → 拆解成 單元(Unit) → 關卡(Lesson) → 題目(Question)
        │
        ▼
寫入 Postgres（Prisma），並建立初始 UserProgress
        │
        ▼
學習地圖 UI → 關卡遊戲引擎 → 結算頁（XP / 星級 / 連續天數）
```

### 資料模型（`prisma/schema.prisma`）

`User` → `Material` → `Unit` → `Lesson` → `Question`，另外 `UserProgress` 記錄每位使用者在每個關卡的完成狀態、星級與最佳成績，`XpLog` 記錄經驗值變化歷史。

### AI Provider 抽象層（`src/lib/ai`）

`getLearningMapProvider()` 會依 `ANTHROPIC_API_KEY` 是否存在，自動選擇：

- `claude-provider.ts`：透過 Anthropic SDK 的 Tool Use 強制模型回傳符合 Zod schema 的結構化 JSON，並在驗證失敗時自動夾帶錯誤訊息重試一次。
- `mock-provider.ts`：純規則式的本地引擎，將文字切句、抽取關鍵詞，產生選擇題／填空題／配對題／重組題，供 `/demo` 與尚未設定 API Key 的環境使用。

## 遊戲化系統設計

- **生命值 (Hearts)**：純 client 端（Zustand + localStorage），答錯扣血、隨時間自動恢復，避免跨裝置同步的額外複雜度。
- **經驗值 / 連續天數 (XP / Streak)**：以伺服器（Postgres `User` 表）為單一事實來源，每次完成關卡呼叫 `/api/lessons/[id]/complete` 更新，前端在每次讀取頁面時透過 `GameStateSync` 同步。
- **星級評分**：依關卡內答錯次數計算（0 次錯 = 3 星，≤2 次 = 2 星，其餘 1 星）。

## 專案結構

```
src/
  app/                    Next.js App Router 頁面與 API Routes
  components/
    ui/                   共用設計系統元件 (Button, Card, Modal, ProgressBar...)
    map/                  學習地圖（蜿蜒路徑、關卡節點）
    lesson/               關卡遊戲引擎（題型元件、答題回饋、生命值 Modal）
    upload/               上傳與處理中動畫
    landing/ auth/ dashboard/ profile/ layout/ providers/
  lib/
    ai/                   AI Provider 抽象層（Claude + Mock）
    parsing/              PDF / OCR 文字擷取
    materials/            教材處理 pipeline、Map/Lesson 資料組裝
    game/                 Zustand store、答案驗證、連續天數計算
    supabase/              Supabase client（browser/server/admin/middleware）
    validations/          Zod schema（學習地圖／題目結構）
  types/                  View model 型別（Map/Lesson 呈現用）
prisma/schema.prisma       資料庫 schema
prisma.config.ts           Prisma 7 設定（datasource url 由此提供）
```

## 開發指令

```bash
npm run dev      # 開發伺服器（Turbopack）
npm run build    # 正式建置
npm run lint     # ESLint
npx tsc --noEmit # TypeScript 型別檢查
npx prisma studio # 瀏覽資料庫內容
```
