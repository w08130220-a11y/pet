# PetLife 寵物社交 APP 設計文件

## 設計概述

PetLife 是一款專為寵物主人設計的社交應用程式，結合社交分享、AI 虛擬寵物、健康追蹤與醫療紀錄等功能。整體設計遵循 Apple Human Interface Guidelines，確保在 iOS 設備上提供原生般的使用體驗。

---

## 螢幕列表

### 主要頁面（Tab Bar）

| 螢幕名稱 | 功能描述 |
|---------|---------|
| **首頁 (Home)** | 社交動態牆，顯示好友與自己的寵物圖文貼文 |
| **寵物世界 (Pet World)** | AI 寵物虛擬場景，寵物可自由活動與互動 |
| **健康 (Health)** | 飲食追蹤、熱量計算與 AI 健康建議 |
| **我的 (Profile)** | 個人資料、寵物管理與醫療紀錄 |

### 次要頁面

| 螢幕名稱 | 功能描述 |
|---------|---------|
| **發布貼文 (Create Post)** | 拍照/選擇照片並發布圖文 |
| **寵物詳情 (Pet Detail)** | 單一寵物的完整資訊與管理 |
| **新增寵物 (Add Pet)** | 上傳寵物照片並建立寵物檔案 |
| **飲食紀錄 (Meal Log)** | 記錄每餐用餐量與時間 |
| **醫療紀錄 (Medical Records)** | 預防針與醫療歷史紀錄 |
| **場景選擇 (Scene Picker)** | 選擇寵物活動的虛擬場景 |

---

## 主要內容與功能

### 1. 首頁 (Home)

**內容：**
- 垂直捲動的貼文列表（FlatList）
- 每則貼文包含：用戶頭像、寵物名稱、照片、文字描述、時間戳記、按讚與留言數

**功能：**
- 下拉刷新載入最新貼文
- 點擊貼文查看詳情
- 按讚與留言互動
- 右上角發布按鈕進入發布頁面

### 2. 寵物世界 (Pet World)

**內容：**
- 全螢幕虛擬場景背景
- 寵物角色（基於用戶上傳的照片）
- 場景切換按鈕
- 動作控制面板

**功能：**
- 寵物自動執行隨機動畫（走路、坐下、睡覺、玩耍）
- 點擊寵物觸發特殊動作
- 切換不同場景（公園、客廳、海灘、森林）
- 多寵物同時顯示

### 3. 健康 (Health)

**內容：**
- 今日飲食摘要卡片
- 熱量進度環形圖
- AI 建議區塊
- 飲食紀錄列表

**功能：**
- 新增飲食紀錄（食物類型、份量、時間）
- 查看每日/每週熱量統計
- AI 根據寵物體重、年齡計算建議熱量
- AI 運動建議

### 4. 我的 (Profile)

**內容：**
- 用戶頭像與名稱
- 寵物列表（水平捲動卡片）
- 功能選單（醫療紀錄、設定等）

**功能：**
- 新增/編輯寵物資料
- 查看寵物詳細資訊
- 管理醫療預防針紀錄
- 應用程式設定

---

## 關鍵用戶流程

### 流程 1：發布寵物貼文

```
首頁 → 點擊發布按鈕 → 拍照/選擇照片 → 輸入文字描述 → 選擇寵物標籤 → 發布 → 返回首頁看到新貼文
```

### 流程 2：新增寵物

```
我的 → 點擊新增寵物 → 拍照/上傳寵物照片 → 填寫寵物資料（名稱、品種、年齡、體重）→ 儲存 → 寵物出現在列表與寵物世界
```

### 流程 3：記錄飲食

```
健康 → 點擊新增飲食 → 選擇食物類型 → 輸入份量 → 儲存 → 查看更新後的熱量統計與 AI 建議
```

### 流程 4：新增醫療紀錄

```
我的 → 選擇寵物 → 醫療紀錄 → 新增紀錄 → 選擇類型（預防針/健檢/其他）→ 填寫詳情與日期 → 儲存
```

### 流程 5：與 AI 寵物互動

```
寵物世界 → 觀看寵物自動活動 → 點擊寵物觸發動作 → 切換場景 → 寵物在新場景繼續活動
```

---

## 色彩設計

| 色彩名稱 | 用途 | 淺色模式 | 深色模式 |
|---------|------|---------|---------|
| **Primary** | 主要強調色、按鈕 | #FF6B6B (珊瑚紅) | #FF8585 |
| **Secondary** | 次要強調、標籤 | #4ECDC4 (青綠色) | #5FDDD4 |
| **Background** | 頁面背景 | #FFFFFF | #1A1A2E |
| **Surface** | 卡片、容器背景 | #F8F9FA | #252542 |
| **Foreground** | 主要文字 | #2D3436 | #EAEAEA |
| **Muted** | 次要文字、提示 | #636E72 | #9BA1A6 |
| **Border** | 邊框、分隔線 | #E9ECEF | #3D3D5C |
| **Success** | 成功狀態 | #00B894 | #55EFC4 |
| **Warning** | 警告狀態 | #FDCB6E | #FFE066 |
| **Error** | 錯誤狀態 | #E17055 | #FF7675 |

---

## 資料結構

### Pet（寵物）

```typescript
interface Pet {
  id: string;
  name: string;
  species: 'dog' | 'cat' | 'bird' | 'rabbit' | 'other';
  breed: string;
  birthDate: string;
  weight: number; // kg
  photoUri: string;
  createdAt: string;
}
```

### Post（貼文）

```typescript
interface Post {
  id: string;
  petId: string;
  imageUri: string;
  caption: string;
  likes: number;
  comments: number;
  createdAt: string;
}
```

### MealRecord（飲食紀錄）

```typescript
interface MealRecord {
  id: string;
  petId: string;
  foodType: string;
  amount: number; // grams
  calories: number;
  mealTime: string;
  createdAt: string;
}
```

### MedicalRecord（醫療紀錄）

```typescript
interface MedicalRecord {
  id: string;
  petId: string;
  type: 'vaccine' | 'checkup' | 'treatment' | 'other';
  title: string;
  description: string;
  date: string;
  nextDueDate?: string;
  veterinarian?: string;
  createdAt: string;
}
```

---

## 技術實現重點

### AI 寵物動畫系統

- 使用 `react-native-reanimated` 實現流暢動畫
- 寵物圖片透過 AI 處理生成不同姿態
- 預設動畫狀態：idle（待機）、walk（走路）、sit（坐下）、sleep（睡覺）、play（玩耍）
- 動畫透過 Lottie 或自定義 Animated 組件實現

### 場景系統

- 預設場景：公園、客廳、海灘、森林
- 場景以全螢幕背景圖呈現
- 寵物位置可隨機或手動調整

### 健康追蹤 AI

- 根據寵物種類、體重、年齡計算每日建議熱量
- 運動建議基於品種特性與當前攝取熱量
- 本地計算，無需網路連線

---

## 導航結構

```
App
├── (tabs)
│   ├── index.tsx (首頁)
│   ├── pet-world.tsx (寵物世界)
│   ├── health.tsx (健康)
│   └── profile.tsx (我的)
├── create-post.tsx (發布貼文)
├── add-pet.tsx (新增寵物)
├── pet/[id].tsx (寵物詳情)
├── meal-log.tsx (飲食紀錄)
└── medical-records/[petId].tsx (醫療紀錄)
```
