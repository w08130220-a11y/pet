# 技術棧評估：React Native vs 原生開發（Swift / Kotlin）

> PetLife 寵物社交 — 行動端技術選型分析
> 評估日期：2026-02-25

---

## 1. 背景與目標

PetLife 是一款結合寵物社交、AI 虛擬寵物、健康追蹤與生活服務的行動平台。在技術選型上需要同時考量：

- **初期人力有限**，需要最大化單人/小團隊的產出效率
- **產品擴展性**，未來需支援 O2O 服務、AR 互動、電商等功能
- **效能需求**，包含 3D 寵物渲染、即時 AI 聊天、大量圖片社交動態

---

## 2. 現有技術架構

目前專案已基於 **React Native + Expo** 建立完整原型：

| 層級 | 技術 |
|------|------|
| 前端框架 | React Native + Expo |
| 路由 | Expo Router（檔案式路由） |
| 狀態管理 | React Context + useReducer |
| 樣式 | NativeWind（Tailwind CSS for RN） |
| 動畫 | react-native-reanimated |
| 本地儲存 | AsyncStorage |
| 後端 | Node.js + tRPC |
| 資料庫 | MySQL + Drizzle ORM |
| AI 整合 | LLM（Claude/GPT-4）寵物對話 + Whisper 語音轉文字 |

已完成的功能模組：社交動態牆、3D 寵物世界、健康追蹤、AI 寵物聊天、訂閱制付費牆。

---

## 3. 比較分析

### 3.1 開發效率與人力成本

| 面向 | React Native (Expo) | 原生 Swift + Kotlin |
|------|---------------------|---------------------|
| 雙平台產出 | 一套代碼，1-2 人可維護 | 需分別維護 iOS/Android，至少 2 組人 |
| 開發速度 | 快，Hot Reload + 豐富生態系 | 較慢，需分別開發測試 |
| 學習曲線 | JavaScript/TypeScript 通用技能 | 需精通 Swift + Kotlin 兩種語言 |
| 現有投入 | 已有完整原型，重寫成本高 | 需從零開始，估計 3-4 個月重建 |

**結論**：初期人力不足的情況下，React Native 的效率優勢極為顯著。

### 3.2 效能與渲染能力

| 面向 | React Native (Expo) | 原生 Swift + Kotlin |
|------|---------------------|---------------------|
| UI 渲染 | 接近原生，New Architecture 後差距更小 | 原生最佳效能 |
| 3D 渲染 | 受限（Three.js 與 Metro 不相容），需用替代方案 | SceneKit / OpenGL ES / Metal 完整支援 |
| 大量圖片滾動 | FlatList 優化後表現良好 | UICollectionView / RecyclerView 最佳 |
| 動畫流暢度 | Reanimated 在 UI Thread 執行，接近 60fps | 完全原生，穩定 60fps |
| 啟動速度 | 較慢（JS Bundle 載入） | 最快 |

**結論**：對 PetLife 的核心功能（社交動態、健康追蹤、AI 聊天），React Native 效能完全足夠。唯一瓶頸在 3D 寵物渲染，但可透過原生模組橋接解決。

### 3.3 功能擴展性

| 未來功能 | React Native 可行性 | 需要原生橋接？ |
|----------|---------------------|----------------|
| O2O 服務（美容預約/遛狗） | 完全可行 | 否 |
| 支付整合（IAP） | expo-in-app-purchases / RevenueCat | 否 |
| 推播通知 | expo-notifications | 否 |
| AR 寵物互動 | 需橋接 ARKit/ARCore | 是 |
| 即時通訊 | WebSocket / Socket.io 完全支援 | 否 |
| 地圖與定位 | react-native-maps | 否 |
| 相機 AI 辨識 | 需橋接 Core ML / ML Kit | 是 |
| NFT / 區塊鏈 | Web3 library 支援 | 否 |

**結論**：約 80% 的擴展功能無需原生代碼，剩餘 20% 可透過 Expo Modules API 橋接。

### 3.4 長期維護風險

| 風險 | React Native | 原生 |
|------|-------------|------|
| 框架升級 | 依賴 Meta 維護，有重大版本變更風險 | Apple/Google 向後相容性佳 |
| 第三方套件 | 生態系龐大但品質參差 | 官方 SDK 品質穩定 |
| 人才招募 | RN 開發者多，但資深人才較少 | 原生開發者經驗豐富者多 |
| 技術債 | 跨平台 workaround 可能累積 | 代碼直覺，技術債較少 |

**結論**：React Native 有一定的長期風險，但 Expo 的持續投入和 New Architecture 的成熟大幅降低了這個風險。

---

## 4. 評估結論

### 建議：維持 React Native + Expo，對關鍵模組做原生橋接

基於以下理由：

1. **已有完整原型**：推翻重寫的機會成本太高，估計延遲上市 3-4 個月
2. **核心價值在功能而非效能**：PetLife 的競爭力來自 AI 互動、社交體驗和服務整合，不是圖形渲染
3. **人力現實**：1-2 人團隊維護雙平台原生代碼不切實際
4. **漸進式優化可行**：真正需要原生效能的模組（3D、AR）可獨立橋接，不需全面重寫

### 不建議使用原生的理由

- PetLife **不是重度圖形/遊戲類型** app
- 不需要**極端低延遲**的硬體互動
- 目前**沒有充足的雙平台開發人力**

---

## 5. 執行路線圖

### Phase 1：MVP 上架（現階段）

維持 React Native + Expo，專注功能完整度。

- 繼續使用現有 codebase
- 用 `react-native-skia` 升級 3D 寵物渲染效果
- 接入真實後端（tRPC client + MySQL）
- 完成支付整合，上架 App Store / Google Play

### Phase 2：針對性優化（用戶驗證後）

根據真實用戶回饋，優化效能瓶頸。

- 使用 Expo Modules API 寫原生模組（相機 AI 辨識、AR 互動）
- 啟用 New Architecture（Fabric + TurboModules）提升渲染效能
- 效能 profiling，只優化真正的瓶頸而非預設性優化
- 社交動態牆圖片載入優化（預載、快取策略）

### Phase 3：規模化擴展（融資後）

視產品需求決定是否漸進式原生化。

- 若 React Native 確實成為瓶頸，逐步替換關鍵頁面為原生實作
- 評估 Kotlin Multiplatform 共享商業邏輯層的可能性
- 或維持 React Native 架構，持續透過原生模組補強

---

## 6. 3D 渲染的具體解法

目前專案已知 Three.js 與 Metro bundler 不相容。建議的替代方案優先序：

| 方案 | 優點 | 缺點 | 推薦度 |
|------|------|------|--------|
| **react-native-skia** | 高效能 2D/3D 渲染、Skia 引擎、支援 shader | 學習曲線、3D 能力有限 | 高 |
| **Expo GL + Three.js fork** | 接近 Three.js 開發體驗 | 社群維護不穩定 | 中 |
| **原生 Native Module** | 效能最佳、完整 3D 能力 | 需分別寫 Swift/Kotlin | 中（Phase 2） |
| **Lottie 動畫** | 簡單、設計師友好 | 不是真正的 3D | 低 |

---

## 7. 總結

> **先活下來、驗證市場，再談優化。**
>
> 以 PetLife 目前的階段、人力和產品特性，React Native 是正確的選擇。不要為了「未來可能需要的效能」犧牲現在的開發速度。技術選型應服務於商業目標，而非追求技術完美。
