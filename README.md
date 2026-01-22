# 專注力數字比較

這是一個使用 Vite + React 製作的數字比較遊戲，在限定時間內盡可能快速回答。

## 功能
- 可調整測驗時長（10/30/60 秒）
- 結果統計（分數、正確率、平均反應、本次秒數）
- 結果趨勢圖與分享圖片產生

## 快速開始
```bash
npm install
npm run dev
```

## 指令
- `npm run dev` 啟動開發伺服器
- `npm run build` 建置正式版
- `npm run preview` 預覽正式版

## 專案結構
- `src/` 程式碼
- `src/App.jsx` 主畫面與遊戲流程
- `src/components/Results.jsx` 結果頁與分享圖產生
- `src/assets/` 分享背景與素材
- `public/` 靜態檔案

## 備註
- 分享圖片使用 1200x675（16:9）畫布輸出。
- UI 調整請保持既有的 inline style 風格。
