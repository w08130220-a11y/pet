# 甲蟲養成遊戲市場調研與技術架構報告

## 一、市面上類似遊戲分析

### 1. 甲蟲王者 Mushiking（甲虫王者ムシキング）
- **平台**：街機（Arcade）、GBA、DS、PSP
- **開發商**：SEGA
- **核心玩法**：
  - 實體卡片收集 + 街機掃描對戰
  - 猜拳式戰鬥系統（打擊/夾擊/投擲 = 剪刀石頭布）
  - 每張甲蟲卡有體力、攻擊力、必殺技等屬性
  - 稀有度分銅/銀/金三級（基礎戰力 160/180/200）
  - 支援 1v1 及 2v2 標籤對戰模式
- **成功因素**：截至 2008 年舉辦超過 10 萬場錦標賽、出貨 2000 萬張卡片，創下金氏世界紀錄。開創了「街機 + 實體卡收集」的遊戲模式
- **現況**：2018 年 8 月正式停止服務

### 2. むしいく系列（Mushiiku 蟲養成遊戲 1/2/3）
- **平台**：Android（Google Play）
- **開發商**：kkamedev / morimirai
- **核心玩法**：
  - 從幼蟲開始飼養，體驗完整的「變態發育」過程（幼蟲 → 蛹 → 成蟲）
  - 透過餵食、訓練等小遊戲養成昆蟲
  - 圖鑑收集系統，包含真實昆蟲知識小百科
  - むしいく2 加入了對戰功能
- **成功因素**：操作簡單（點擊為主）、教育性質強、畫面療癒、忠實還原真實昆蟲生態

### 3. 蟲＆對戰（虫＆バトル / Insects & Battle）
- **平台**：Android（Google Play）
- **開發商**：kkamedev
- **核心玩法**：
  - 真實昆蟲呈現，回合制策略戰鬥
  - 甲蟲、鍬形蟲、蝴蝶、螞蟻、蜜蜂等多種蟲類
  - 考慮蟲類相性與攻擊順序組隊策略
- **成功因素**：高策略性的回合制戰鬥 + 真實昆蟲生態知識

### 4. Beetle Elf（甲蟲精靈）
- **平台**：Steam（PC）
- **核心玩法**：
  - 開放世界日式城市場景，每個城市支援最多 4000 名玩家同時在線
  - 捕捉世界各地的甲蟲
  - 每隻甲蟲有三階段成長進化
  - 即時甲蟲對戰
- **成功因素**：MMO 元素結合甲蟲收集養成，具有社交性

### 5. Gacha Pets（轉蛋寵物）
- **平台**：Steam、Web 瀏覽器、即將推出 iOS/Android
- **開發商**：Digital Hokum
- **核心玩法**：
  - 轉蛋蛋孵化獲得新寵物（66 種寵物 + 6 種進化型態）
  - 收集、培養、升級、對戰
  - 召喚神殿多人 Boss 戰
  - 工坊合成系統
- **成功因素**：結合轉蛋(Gacha) + 養成 + 對戰的完整循環

### 6. 其他相關遊戲參考

| 遊戲名稱 | 類型 | 特色 |
|----------|------|------|
| Dragon City | 龍養成對戰 | 1500+ 龍種、繁殖系統、PvP |
| Monster Legends | 怪物養成 | 繁殖山、稀有度系統、PvP 競技場 |
| 電子雞 Tamagotchi | 虛擬寵物 | 經典養成模式、生命階段、進化分支 |

---

## 二、推薦技術架構

### 方案 A：Web-First（網頁優先，適合快速開發 MVP）⭐ 推薦

```
前端 (Frontend)
├── Next.js + React（應用框架）
├── Phaser 3/4（2D 遊戲引擎，嵌入 React）
├── TypeScript（型別安全）
├── TailwindCSS（UI 樣式）
├── Zustand / Jotai（狀態管理）
└── PWA（Progressive Web App，支援離線與安裝）

後端 (Backend)
├── Supabase（PostgreSQL + Realtime + Auth + Edge Functions）
│   ├── PostgreSQL：遊戲資料持久化
│   ├── Realtime：交易市場即時更新、玩家互動
│   ├── Auth：玩家帳號系統（OAuth/Email）
│   ├── Edge Functions：轉蛋邏輯、離線收益計算
│   └── Storage：圖片素材儲存
└── 備選：Firebase（Realtime DB + Cloud Functions）
```

**優點**：
- 開發速度快，一人團隊也能運作
- Supabase 免費方案足以支撐 MVP
- PWA 可直接安裝在手機桌面，免上架 App Store
- Phaser 官方提供 React 整合模板，支援熱更新
- 後期可用 Capacitor/WebView 封裝成原生 App

### 方案 B：Mobile-Native（原生行動應用，適合正式產品）

```
前端 (Frontend)
├── Flutter + Flame 引擎（跨平台 iOS/Android/Web）
└── 或 Unity 2D（C#，更強大的遊戲功能）

後端 (Backend)
├── Node.js + Colyseus（遊戲伺服器框架）
├── PostgreSQL / MongoDB（資料庫）
├── Redis（快取、排行榜）
└── Docker + Kubernetes（部署擴展）
```

### 2D 遊戲引擎比較

| 特性 | Phaser 3/4 | Flutter + Flame | Unity 2D | Cocos Creator |
|------|-----------|----------------|----------|---------------|
| 語言 | TypeScript/JS | Dart | C# | TypeScript/JS |
| 視覺編輯器 | 無 | 無 | 有 | 有 |
| 最佳平台 | Web 瀏覽器 | 行動裝置+Web | 全平台 | 行動裝置+Web |
| 學習曲線 | 低 | 中 | 中 | 中 |
| 社群資源 | 大(37.8K GitHub stars) | 中等成長中 | 最大 | 中文資源豐富 |
| 適合場景 | 休閒Web遊戲/PWA | 應用+遊戲混合 | 專業遊戲開發 | 中國市場遊戲 |

---

## 三、遊戲系統設計建議

### 1. 轉蛋（Gacha）系統

```
甲蟲稀有度設計：
├── SSR（傳說級）2% — 赫克力士長戟大兜蟲、高加索南洋大兜蟲
├── SR（稀有級）8% — 毛象大兜蟲、巨扁鍬形蟲
├── R（精良級）25% — 獨角仙、鬼艷鍬形蟲
├── N（普通級）65% — 金龜子、天牛、瓢蟲
│
├── 每 50 抽保底 SR 以上
├── 每 100 抽保底 SSR（天井機制）
└── 重複甲蟲可轉換為「養成素材」
```

建議採用「RNG + 保底機制（Pity System）」：
- 基礎隨機數生成決定稀有度
- 天井計數器確保保底
- UP池限時提升特定甲蟲機率
- 所有轉蛋邏輯在伺服器端執行，防止作弊

### 2. 時間加速系統（1 現實日 = 10 遊戲日）

#### 甲蟲生命週期時間設計

| 階段 | 真實時間 | 遊戲時間 |
|------|---------|---------|
| 卵期（Egg） | ～6小時 | ～2.5天 |
| 幼蟲期（Larva） | ～3天 | ～30天（1個月） |
| 蛹期（Pupa） | ～1天 | ～10天 |
| 成蟲期（Adult） | ～5天 | ～50天 |
| 繁殖期（Breeding） | ～2天 | ～20天 |
| 總生命週期 | **約 21 現實天** | **約 210 遊戲天（7個月）** |

#### 關鍵技術要點
- 模擬時間與真實時間完全解耦
- 使用整數計時器 + 固定時間步長，避免浮點精度問題
- 設定更新迭代上限，防止「死亡螺旋」
- 離線時記錄斷線時間，重新連線時計算離線進度

### 3. 成長/進化狀態機

```
[卵] ──孵化完成──→ [幼蟲] ──餵食達標──→ [蛹] ──羽化完成──→ [成蟲]
                      │                                    │
                   餵食不足                          ┌──────┴──────┐
                      ↓                          配對成功       老化
                   [生病] ──治療──→ 回到[幼蟲]      ↓              ↓
                                               [繁殖]→產卵    [死亡]
                                                  ↓
                                               回到[卵]
```

#### 進化分支系統
- 養成優良 → 大型成蟲（SSR 級）
- 養成普通 → 普通成蟲（SR 級）
- 養成不良 → 小型成蟲（R 級）

影響進化方向的因素：餵食品質、環境溫濕度、訓練成績、基因遺傳、隨機因子

### 4. 交易市場系統

- PostgreSQL 交易表（上架商品、交易記錄、價格歷史）
- Supabase Realtime 即時推送新商品/價格變動
- 防作弊：伺服器端驗證、原子性交易、Row-Level Security
- 經濟平衡：交易手續費、上架數量限制、價格區間限制、稀有物品冷卻期

### 5. 整體系統架構圖

```
┌─────────────────────────────────────────────────────┐
│                    客戶端 (Client)                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐  │
│  │ React UI │  │ Phaser   │  │ Service Worker   │  │
│  │ (養成介面 │  │ (動畫渲染 │  │ (PWA 離線快取)   │  │
│  │  市場UI  │  │  戰鬥場景 │  │                  │  │
│  │  轉蛋UI) │  │  轉蛋特效)│  │                  │  │
│  └────┬─────┘  └────┬─────┘  └──────────────────┘  │
│       └──────┬───────┘                               │
│              │ Event Bridge                          │
│              ↓                                       │
│  ┌──────────────────┐                                │
│  │  Zustand Store   │ ← 本地遊戲狀態                 │
│  └────────┬─────────┘                                │
└───────────│─────────────────────────────────────────┘
            │ HTTPS / WebSocket
            ↓
┌─────────────────────────────────────────────────────┐
│                  Supabase 後端                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐  │
│  │PostgreSQL│  │ Realtime │  │  Edge Functions   │  │
│  │ ·玩家資料│  │ ·市場更新│  │ ·轉蛋邏輯        │  │
│  │ ·甲蟲資料│  │ ·對戰配對│  │ ·離線進度計算     │  │
│  │ ·交易記錄│  │ ·即時通知│  │ ·交易驗證         │  │
│  │ ·排行榜  │  │          │  │ ·防作弊檢查       │  │
│  └──────────┘  └──────────┘  └──────────────────┘  │
│  ┌──────────┐  ┌──────────────────────────────────┐ │
│  │   Auth   │  │         Storage (圖片素材)        │ │
│  └──────────┘  └──────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

---

## 四、總結與建議

### 市場機會
1. **甲蟲養成遊戲在中文市場存在明顯空缺** — 目前主要來自日本，繁體中文市場幾乎沒有
2. 甲蟲王者的歷史成功證明了甲蟲題材的市場潛力（2018 年停服後留下市場空白）
3. 「養成 + 轉蛋 + 交易」的複合玩法已被 Dragon City、Monster Legends 等遊戲反覆驗證

### 技術建議
1. **MVP 階段建議 Web-First**（Next.js + Phaser + Supabase + PWA），2-3 個月完成原型
2. 驗證市場反應後，再考慮 Flutter 或 Unity 開發原生 App
3. 轉蛋採用「RNG + 保底機制」，實作簡單且體驗好
4. 時間系統用整數計時器搭配固定倍率，確保穩定性
5. 交易市場從 MVP 就要設計好經濟模型，避免後期通膨

### 差異化方向
1. **教育性** — 融入真實甲蟲生態知識
2. **收集深度** — 涵蓋全球甲蟲品種，建立詳細圖鑑
3. **養成策略性** — 不同飼養方式影響進化結果
4. **社交性** — 交易市場 + 甲蟲對戰 + 繁殖配對

---

## 參考資料
- [Mushiking - Wikipedia](https://en.wikipedia.org/wiki/Mushiking)
- [Mushiiku 3 - Google Play](https://play.google.com/store/apps/details?id=jp.co.morimirai.mushiikusei3)
- [Beetle Elf - Steam](https://steamcommunity.com/app/1000800)
- [Gacha Pets - Steam](https://store.steampowered.com/app/1146570/Gacha_Pets/)
- [How To Design A Gacha System](https://mobilefreetoplay.com/design-gacha-system/)
- [Game Loop Pattern](https://gameprogrammingpatterns.com/game-loop.html)
- [State Pattern](https://gameprogrammingpatterns.com/state.html)
- [Phaser + React Template](https://phaser.io/news/2024/02/official-phaser-3-and-react-template)
- [Colyseus Game Server](https://docs.colyseus.io/)
- [Supabase + Next.js Multiplayer Game](https://dev.to/iakabu/i-built-a-real-time-multiplayer-browser-game-with-supabase-nextjs-no-backend-server-required-h28)
