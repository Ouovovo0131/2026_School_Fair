# 🎮 校慶拾光地圖 - 校園互動遊戲平台

一個為校園陸運會/校慶設計的互動式掃描遊玩平台，融合 QR Code、圖片上傳、問答挑戰等功能，讓學生在校園各處完成任務、蒐集徽章、領取獎品。

## 🎯 功能特色

- 🎯 **20 關任務挑戰** - 問答題 + 照片挑戰混合模式
- 📱 **QR Code 掃描解鎖** - 每個任務位置配有獨特二維碼
- 📸 **圖片自動上傳** - 上傳至 Firebase，支援自動壓縮
- 🏆 **分級獎品兌換** - 完成 10 關 / 20 關即可兌換不同獎品
- 🔴 **完成印章視覺** - 遊戲式的紅色印章設計
- 🎨 **漫畫風格美術** - 粗邊框、編號牌、遊戲感十足
- 👤 **Google 登入** - 便捷的玩家身份認證
- 📊 **管理後台** - 清除數據、查看進度等功能
- 🎬 **大螢幕展播** - 上傳的圖片可在活動現場播放
- 💾 **永久紀念** - 團隊頭像+完成照片作為校慶回憶

## 📋 系統需求

- Node.js 18.17 或更新版本
- npm 9 或以上
- Firebase 項目（免費方案即可）
- 現代瀏覽器（Chrome、Safari、Edge 等）

## 🚀 快速開始

### 1. 安裝依賴

```bash
cd D:\園遊會專案\hlhs-90th-main\hlhs-90th-main
npm install
```

### 2. 配置 Firebase 和敏感信息

**從 `.env.example` 複製並建立 `.env.local`**：

```bash
cp .env.example .env.local
```

編輯 `.env.local` 填入您的配置：

```env
# Firebase 配置（從 Firebase Console 取得）
NEXT_PUBLIC_FIREBASE_API_KEY=YOUR_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=YOUR_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID=YOUR_APP_ID

# 管理員密碼（強烈建議改為複雜密碼）
NEXT_PUBLIC_ADMIN_PASSWORD=your-secure-admin-password
NEXT_PUBLIC_STAFF_SMALL_PASSWORD=your-secure-staff-small-password
NEXT_PUBLIC_STAFF_BIG_PASSWORD=your-secure-staff-big-password
```

⚠️ **安全提示**：`NEXT_PUBLIC_` 前綴的變數會被公開到客戶端，請勿在此存儲敏感密鑰。此項目的密碼機制適用於校園內部使用。

### 3. 本地運行

**本機開發**：
```bash
npm run dev
# 訪問 http://localhost:3000
```

**局域網分享**（校園活動推薦）：
```bash
npm run dev -- -H 0.0.0.0
# 其他設備訪問 http://<YOUR_IP>:3000
# 獲取 IP：ipconfig 找 IPv4 address
```

### 4. 生產構建

```bash
npm run build
npm run start
```

## 🎮 使用指南

### 玩家流程

1. **登入** - 使用 Google 帳號登入
2. **設置暱稱** - 輸入遊戲內顯示的暱稱
3. **隱私同意** - 確認圖片播放和保存的說明
4. **掃描 QR Code** - 在校園各處找到任務點，掃描解鎖
5. **完成任務**
   - 問答題：選擇正確答案
   - 照片挑戰：拍照上傳
6. **蒐集徽章** - 完成關卡後自動領取
7. **兌換獎品**
   - 10 關完成 → 兌換小獎品（需工作人員確認碼）
   - 20 關完成 → 兌換大獎品（需工作人員確認碼）

### 工作人員密碼

| 功能 | 密碼 |
|------|------|
| 🎁 小獎品兌換 | `STAFF10` |
| 👑 大獎品兌換 | `STAFF20` |
| 🗑️ 清除所有數據 | `ADMIN2025` |

### 管理員操作

1. 點擊右上角 **⚙️ 設定按鈕**
2. 輸入 `ADMIN2025` 密碼
3. 確認清除 - 所有用戶數據、完成狀態、解鎖狀態全部恢復初始

## 📁 項目結構

```
hlhs-90th-main/
├── app/
│   ├── components/
│   │   ├── Home.tsx           # 主遊戲界面
│   │   └── tasks.ts           # 任務名稱配置
│   ├── scan/
│   │   └── [id]/page.tsx      # 掃描任務頁面
│   ├── globals.css            # 全局樣式 + 漫畫風格設計
│   ├── layout.tsx             # 頁面佈局
│   └── page.tsx               # 首頁
├── lib/
│   └── firebase.ts            # Firebase 配置
├── constants/
│   └── quests.ts              # 20 個任務定義
├── public/
│   └── tasks/                 # 任務範例圖片
└── package.json
```

## 🔧 技術棧

- **前端框架**：Next.js 15 + React 19
- **樣式**：Tailwind CSS + 自定義 CSS
- **後端服務**：Firebase (Auth + Firestore + Storage)
- **語言**：TypeScript
- **圖片優化**：browser-image-compression
- **圖標**：lucide-react
- **驗證**：Google OAuth 2.0

## 📸 圖片上傳說明

### 存儲位置
```
uploads/{玩家信箱}/{關卡號碼}.jpg
# 例如：uploads/student@gmail.com/2.jpg
```

### 自動壓縮設定
- 最大大小：0.3 MB
- 最大尺寸：1024px
- 格式：JPG

### 在 Firebase 查看
1. 登入 [Firebase Console](https://console.firebase.google.com)
2. 選擇您的項目
3. 進入 **Storage** 分頁
4. 瀏覽 `uploads/` 資料夾

## 🌍 部署指南

### Vercel 部署（推薦）

1. **推送到 GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/hlhs-90th-main.git
   git push -u origin main
   ```

2. **在 Vercel 部署**
   - 訪問 [Vercel.com](https://vercel.com)
   - 點擊「New Project」
   - 選擇您的 GitHub repo
   - 配置環境變數（如需要）
   - 點擊「Deploy」

3. **自動部署**
   - 每次 push 到 main 分支時自動部署

### Firebase Hosting 部署

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

### Docker 部署

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "start"]
```

## 🔐 安全建議

### 本地開發

- ✅ 使用 `.env.local` 存儲敏感信息
- ✅ `.env.local` 已被加入 `.gitignore`，不會被上傳到 GitHub
- ✅ 定期檢查 .gitignore 確保敏感文件不被提交

### GitHub 部署

**永遠不要 commit 敏感信息！** 已被忽略的文件：
- `.env.local` - 本地開發配置 ✅ 已忽略
- 所有 `.env` 文件 ✅ 已忽略
- `node_modules/` ✅ 已忽略
- `.next/` ✅ 已忽略

### Vercel 部署

1. **設置環境變數**
   - 進入 Vercel 項目 → Settings → Environment Variables
   - 添加所有 `.env.local` 中的變數
   - 勾選「Preview」和「Production」

2. **確保安全**
   - 只有項目成員能看到環境變數
   - 環境變數不會被包含在部署日誌中

### Firebase 安全

- ✅ 定期檢查 Firebase 安全規則
- ✅ 監控 Storage 成本（每月免費 5GB）
- ✅ 定期備份 Firestore 數據
- ✅ 啟用雙因素認證

### 密碼管理

- ✅ 改為複雜密碼（不要使用默認值）
- ✅ 定期更換密碼
- ✅ 不要在代碼中硬編碼密碼
- ✅ 使用環境變數管理所有敏感信息

## 📝 準備 GitHub 上傳

### 清單

- [ ] 已複製 `.env.example` 建立 `.env.local`
- [ ] 已填入實際的 Firebase 和密碼配置
- [ ] 已確認 `.env.local` 在 `.gitignore` 中
- [ ] 已運行測試確保功能正常
- [ ] 已更新 README 中的特定信息

### 上傳步驟

```bash
# 初始化 Git
git init
git add .
git commit -m "Initial commit: School celebration hunt game"
git remote add origin https://github.com/YOUR_USERNAME/hlhs-90th-main.git
git push -u origin main
```

### 驗證

上傳後請檢查：
1. GitHub 上沒有 `.env.local` 文件 ✅
2. `lib/firebase.ts` 使用環境變數 ✅
3. `.env.example` 清楚標記為示例 ✅

## 🔐 將敏感信息改為複雜密碼

強烈建議改變默認密碼。例如：

```env
NEXT_PUBLIC_ADMIN_PASSWORD=MyS3cur3AdminP@ss2026!
NEXT_PUBLIC_STAFF_SMALL_PASSWORD=Staff10_Secure#2026
NEXT_PUBLIC_STAFF_BIG_PASSWORD=Staff20_Secure#2026
```

## 📞 配置常見問題

**Q: 如何改變任務內容？**
A: 編輯 `constants/quests.ts` 修改 20 個任務的標題、描述、答案等

**Q: 如何改變關卡解鎖邏輯？**
A: 編輯 `app/page.tsx` 中的 localStorage 邏輯，或改為後端驗證

**Q: 如何加入更多任務？**
A: 修改 `TOTAL_QUESTS` 常數，並在 `quests.ts` 中添加新任務

**Q: 圖片上傳失敗怎麼辦？**
A: 檢查 Firebase Storage 安全規則是否允許上傳

## 🧪 測試建議

- 在多台設備上測試 QR Code 掃描
- 測試不同網絡環境（WiFi 5G、4G）
- 測試圖片上傳的不同文件大小
- 模擬管理員清除數據的流程
- 檢查大螢幕展播的圖片顯示效果

## 📝 更新日誌

### v1.0.0 (2026-03-17)
- ✨ 初始版本發布
- 🎨 漫畫風格設計完成
- 🔴 完成印章系統實現
- 📸 圖片上傳功能
- 🎁 獎品兌換系統
- 👤 隱私說明同意機制

## 📄 授權

此專案為校園活動專用。使用前請確認您有相應授權。

## 👨‍💻 貢獻

歡迎提交 Issue 和 Pull Request！

## 💬 支援

如有問題或建議，請聯繫開發團隊。

---

**祝校慶圓滿成功！🎉**