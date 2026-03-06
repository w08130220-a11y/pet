# BeautyBook 美容整合平台設計文件

## 設計概述

BeautyBook 是一款美容服務整合平台，讓使用者能瀏覽美容師作品、線上預約服務、管理預約紀錄，並探索最新美容趨勢。整體設計採用 Figma Style Guideline 的橄欖綠色系，營造自然質感的高端美容體驗。

---

## 螢幕列表

### 主要頁面（Tab Bar）

| 螢幕名稱 | 功能描述 |
|---------|---------|
| **探索 (Explore)** | 瀏覽美容師作品牆、熱門服務推薦 |
| **預約 (Booking)** | 搜尋美容師、選擇服務、預約時段 |
| **我的預約 (My Bookings)** | 預約紀錄管理、狀態追蹤 |
| **我的 (Profile)** | 個人資料、收藏、評價紀錄 |

### 次要頁面

| 螢幕名稱 | 功能描述 |
|---------|---------|
| **美容師詳情 (Stylist Detail)** | 美容師完整資訊、作品集、評價 |
| **服務詳情 (Service Detail)** | 服務項目介紹、價格、所需時間 |
| **預約確認 (Booking Confirm)** | 確認預約資訊、備註 |
| **評價 (Review)** | 完成服務後給予評價 |

---

## 主要內容與功能

### 1. 探索 (Explore)

**內容：**
- 搜尋欄
- 熱門服務分類（剪髮、染髮、護髮、美甲、美睫、臉部保養）
- 精選作品牆（瀑布流圖片）
- 附近推薦美容師

**功能：**
- 依服務類別篩選
- 點擊作品查看美容師詳情
- 收藏喜歡的作品

### 2. 預約 (Booking)

**內容：**
- 美容師列表（含評分、距離、價格範圍）
- 篩選條件（服務類型、價格、評分、距離）
- 可用時段日曆

**功能：**
- 搜尋美容師或服務
- 選擇服務項目
- 選擇日期與時段
- 填寫備註、確認預約

### 3. 我的預約 (My Bookings)

**內容：**
- 預約狀態分類（即將到來、已完成、已取消）
- 預約卡片（服務、美容師、時間、狀態）

**功能：**
- 查看預約詳情
- 取消或改期預約
- 完成後給予評價
- 預約提醒通知

### 4. 我的 (Profile)

**內容：**
- 用戶頭像與名稱
- 收藏的美容師/作品
- 評價紀錄
- 設定選單

**功能：**
- 編輯個人資料
- 管理收藏
- 查看消費紀錄
- 應用程式設定

---

## 關鍵用戶流程

### 流程 1：瀏覽並預約服務

```
探索 → 點擊作品 → 美容師詳情 → 選擇服務 → 選擇時段 → 確認預約 → 預約成功
```

### 流程 2：管理預約

```
我的預約 → 選擇預約 → 查看詳情 → 取消/改期 → 確認
```

### 流程 3：評價服務

```
我的預約 → 已完成 → 點擊評價 → 給予星等與文字評價 → 送出
```

---

## 資料結構

### Stylist（美容師）

```typescript
interface Stylist {
  id: string;
  name: string;
  avatar: string;
  salon: string;
  rating: number;
  reviewCount: number;
  specialties: string[];
  distance?: string;
}
```

### Service（服務項目）

```typescript
interface Service {
  id: string;
  name: string;
  category: 'haircut' | 'coloring' | 'treatment' | 'nails' | 'lashes' | 'facial';
  price: number;
  duration: number; // minutes
  description: string;
}
```

### Booking（預約）

```typescript
interface Booking {
  id: string;
  stylistId: string;
  stylistName: string;
  serviceName: string;
  date: string;
  time: string;
  duration: number;
  price: number;
  status: 'upcoming' | 'completed' | 'cancelled';
  note?: string;
  rating?: number;
}
```

### PortfolioItem（作品）

```typescript
interface PortfolioItem {
  id: string;
  stylistId: string;
  stylistName: string;
  imageUri: string;
  category: string;
  caption: string;
  likes: number;
  liked: boolean;
}
```

---

## 導航結構

```
App
├── (tabs)
│   ├── index.tsx (探索)
│   ├── booking.tsx (預約)
│   ├── my-bookings.tsx (我的預約)
│   └── profile.tsx (我的)
├── stylist/[id].tsx (美容師詳情)
├── service/[id].tsx (服務詳情)
├── booking-confirm.tsx (預約確認)
└── review/[bookingId].tsx (評價)
```
