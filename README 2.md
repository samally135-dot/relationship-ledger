# 我的關係帳本｜正式線上版起始專案

這是一個可部署的多人共享網站起始專案。前端使用 React + Vite，雲端資料庫與匿名登入使用 Supabase。**下載專案不等於網站已經上線**；你仍需要建立自己的 Supabase 專案並部署到網站代管服務，完成後才會有可分享的網址。

## 已包含功能
- 匿名登入，不要求使用者提供姓名或電子郵件（Supabase Anonymous Sign-ins）
- 暱稱選填，留空顯示「匿名訪客」
- 親情、友情、愛情、其他分類
- 記錄付出、獲得的回饋、期待與想說的話
- 投稿者可選擇公開或私人
- 公開帳本牆與分類篩選
- RLS 資料庫政策：公開帳本可瀏覽；私人帳本只允許建立者讀取；建立者可管理自己的資料

## A. 建立 Supabase 資料庫
1. 到 https://supabase.com 建立帳號及新專案。
2. 進入專案的 **SQL Editor**，將 `supabase/schema.sql` 全文貼上並執行。
3. 進入 **Authentication → Sign In / Providers**，確認 Anonymous sign-ins 已啟用（若控制台提供此選項）。
4. 到 **Project Settings → API**，複製 Project URL 與 anon/public key。只使用 anon/public key；絕不可把 `service_role` key 放進前端。

## B. 設定環境變數
1. 將 `.env.example` 複製為 `.env`。
2. 填入：
   - `VITE_SUPABASE_URL`：Supabase Project URL
   - `VITE_SUPABASE_ANON_KEY`：Supabase anon/public key

## C. 本機測試
需要安裝 Node.js（建議 LTS）。在專案資料夾執行：
```bash
npm install
npm run dev
```
終端機會顯示本機測試網址。請用兩個不同瀏覽器或裝置測試投稿與公開帳本牆。

## D. 部署成公開網址（以 Vercel 為例）
1. 將此專案上傳到自己的 GitHub repository。
2. 到 https://vercel.com 匯入該 repository。
3. Framework 選 Vite，Build Command `npm run build`，Output Directory `dist`。
4. 在 Vercel 專案 Settings → Environment Variables 設定上述兩個 `VITE_` 變數。
5. 重新部署。Vercel 會提供正式網址，可分享給團體成員。

## 隱私與課堂使用提醒
- 這是匿名投稿，不是絕對匿名：網站服務商仍可能處理連線中繼資料；匿名登入也會產生內部使用者識別碼。
- 不要在帳本填入姓名、電話、地址、學號、診斷或其他可辨識個人身分的資訊。
- 公開帳本可能被其他參與者閱讀；請事先說明公開範圍、保存期間及刪除方式。
- 目前公開帳本牆僅顯示公開投稿。私人投稿不會出現在牆上；本起始版本尚未提供「我的私人帳本」管理頁面。
- 正式用於團體前，建議由帶領者先測試權限、刪除流程與手機版顯示，並訂定資料保存及清除時間。
- 若要用於正式研究或蒐集敏感資料，需另行檢視研究倫理、個資法及機構規範。

## 技術
React 18、Vite、Supabase JS v2、Supabase Auth（匿名登入）、Postgres Row Level Security。
