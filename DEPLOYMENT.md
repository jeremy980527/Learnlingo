# 讓 DuoLearn 真正上線（Vercel + Supabase）

這份文件帶你把專案部署成一個「打開網址、註冊/登入就能用」的真實網站。
全程約 15-20 分鐘，主要在 Supabase 與 Vercel 的網頁介面上操作（這兩步需要你自己的帳號，我沒辦法代替你點擊）。

## 第一步：建立 Supabase 專案

1. 到 [supabase.com](https://supabase.com) 註冊/登入，點「New Project」建立一個新專案（選離你近的 Region 即可）。
2. 專案建立完成後，進入 **Project Settings → API**，記下：
   - `Project URL` → 對應 `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → 對應 `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → 對應 `SUPABASE_SERVICE_ROLE_KEY`（**絕對不要**外流或加到前端）
3. 進入 **Project Settings → Database → Connection string**：
   - 複製 **Transaction pooler**（通常是 port 6543）那組連線字串 → 對應 `DATABASE_URL`，這組會給 Vercel 上的伺服器用。
   - 記得把字串裡的 `[YOUR-PASSWORD]` 換成你設定的資料庫密碼。

## 第二步：建立資料表

在你自己的電腦上（或任何能連上網路的終端機）：

```bash
git clone <你的 repo>
cd Learnlingo
npm install
cp .env.example .env.local
# 把上一步拿到的三組 Supabase 值 + DATABASE_URL 填進 .env.local
npx prisma migrate deploy
```

這會依照 `prisma/schema.prisma` 在你的 Supabase Postgres 建立所有資料表
（users / materials / units / lessons / questions / user_progress / xp_logs）。

## 第三步：建立 Storage bucket

打開 Supabase 專案的 **SQL Editor**，貼上並執行 repo 裡的
[`supabase/setup.sql`](./supabase/setup.sql)。
這會建立一個叫 `materials` 的私有 bucket，並設定「使用者只能存取自己資料夾」的權限。

## 第四步：（可選）設定 Email 驗證行為

Supabase 預設註冊後需要「點信箱裡的驗證連結」才能登入。測試期間如果想跳過這步：
**Authentication → Providers → Email → 關閉 "Confirm email"**。
正式上線建議保持開啟，並在 **Authentication → URL Configuration** 把
`Site URL` 設成你的正式網址（例如 `https://your-app.vercel.app`），
否則驗證信裡的連結會導回 `localhost`。

## 第五步：部署到 Vercel

1. 到 [vercel.com](https://vercel.com)，用 GitHub 帳號登入。
2. 「Add New → Project」，選擇這個 GitHub repo（`jeremy980527/learnlingo`）並 Import。
3. 在 Vercel 的 **Environment Variables** 設定畫面，把 `.env.local` 裡的每一個值都貼上去：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `DATABASE_URL`
   - `ANTHROPIC_API_KEY`（沒有的話先留空，系統會自動用內建的離線引擎產生學習地圖）
4. 點 Deploy，等它跑完（大約 1-2 分鐘）。
5. 完成後 Vercel 會給你一個網址，例如 `https://learnlingo.vercel.app` —— 打開它，
   註冊帳號、上傳教材、就是完整可用的網站了。

## 之後每次更新程式碼

只要 `git push` 到這個分支，Vercel 會自動重新部署，不需要每次手動操作。

## 常見狀況

| 狀況 | 原因 / 處理方式 |
| --- | --- |
| 登入後一直被導回 `/login` | 檢查 `NEXT_PUBLIC_SUPABASE_URL` / `ANON_KEY` 有沒有貼對、Vercel 環境變數是否已套用（改變數後需要重新 Deploy 一次） |
| 上傳教材後卡在「處理中」不會完成 | 確認 `DATABASE_URL`、`SUPABASE_SERVICE_ROLE_KEY` 都正確；沒有設定 `ANTHROPIC_API_KEY` 也沒關係，會自動 fallback |
| 註冊後收不到驗證信 | 檢查垃圾郵件夾；或依「第四步」暫時關閉 Confirm email 加速測試 |
| 想用 Google 登入 | 到 **Authentication → Providers → Google** 依畫面指示設定 Google OAuth Client ID/Secret |
