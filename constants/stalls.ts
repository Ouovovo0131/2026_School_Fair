/**
 * 攤位分類、排序與對照資料
 * 提供類似 Python dict 的查詢方式
 */

export const STALL_CATEGORIES = {
  vip: "貴賓",
  snack: "小吃",
  beverage: "飲料",
  game: "遊戲",
  student: "學生組織",
  other: "其他",
} as const;

export type StallCategory = keyof typeof STALL_CATEGORIES;

export const STALL_ORDER = [
  "貴A",
  "貴B",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "11",
  "12",
  "13",
  "14",
  "15",
  "16",
  "17",
  "18",
  "19",
  "20",
  "21",
  "flower-girl-left-1",
  "flower-girl-left-2",
  "flower-girl-1",
  "flower-girl-2",
  "flower-girl-3",
  "班",
] as const;

export type StallId = (typeof STALL_ORDER)[number];

export interface StallInfo {
  id: StallId;
  displayName: string;
  category: StallCategory | StallCategory[];
  content: string;
}

export const STALL_DIRECTORY: Record<StallId, StallInfo> = {
  貴A: { id: "貴A", displayName: "貴賓攤位 A", category: "vip", content: "迎賓點心、精緻小蛋糕、限量試吃" },
  貴B: { id: "貴B", displayName: "貴賓攤位 B", category: "vip", content: "精品咖啡、花茶、手作餅乾" },
  1:   { id: "1",   displayName: "仁手一捲", category: ["snack", "beverage"], content: "越南正宗春捲 & 奇亞籽百香果椰果茶" },
  2:   { id: "2",   displayName: "103爆炒無塑回", category: ["snack", "beverage", "game"], content: "炒泡麵 & 乾冰汽水(芬達、雪碧) & 抓棍機" },
  3:   { id: "3",   displayName: "好大大熱狗~好窩", category: "snack", content: "熱狗堡" },
  4:   { id: "4",   displayName: "仁者無素", category: ["snack", "game"], content: "杜拜巧克力 & 高爾夫球小遊戲" },
  5:   { id: "5",   displayName: "塑度與基情9", category: ["snack", "beverage"], content: "冰品、飲料 & 人體打地鼠" },
  6:   {  id: "6",  displayName: "沁露珠園", category: ["snack", "beverage", "game"], content: "鬆餅 & 紅茶、冬瓜茶、珍珠奶茶 & 打彈珠" },
  7:   { id: "7",   displayName: "雞渴男耐", category: ["snack", "beverage", "other"], content: "雞肉飯、滷豆干 & 紅茶、阿華田 & 女模裝服務員" },
  8:   { id: "8",   displayName: "訂YO等雨停", category: ["snack", "beverage"], content: "香腸 & 冰淇淋、飲料" },
  9:   { id: "9",   displayName: "糖絲三百手", category: ["snack", "beverage", "game"], content: "糖葫蘆 & 紅茶 & 轉輪盤" },
  10:  { id: "10",  displayName: "九零花中 無塑有5", category: ["snack", "game", "other"], content: "香腸 & 「一擲千金」、許願池、贖罪卷" },
  11:  { id: "11",  displayName: "熊男幫你烤", category: ["snack", "beverage"], content: "玉米、甜不辣、香腸、雞肉串、豆乾、貓舌餅 & 汽水、冬瓜茶、紅茶" },
  12:  { id: "12",  displayName: "減塑分裂", category: ["beverage", "game"], content: "冰淇淋、冰飲 & 拉霸機(人力)" },
  13:  { id: "13",  displayName: "六妻仙人", category: ["snack", "beverage", "other"], content: "手搓愛玉、炒麵麵包 & 紅茶 & 解壓玩具" },
  14:  { id: "14",  displayName: "211", category: "snack", content: "缺" },
  15:  { id: "15",  displayName: "會員制度拜巧克力Q餅", category: "snack", content: "杜拜巧克力" },
  16:  { id: "16",  displayName: "無塑啃TA雞", category: ["snack", "beverage", "game"], content: "印尼炒泡麵、熱狗 & 飲料 & 抽抽樂" },
  17:  { id: "17",  displayName: "福成大奶罐", category: ["snack", "beverage", "game", "other"], content: "玉里麵 & 紅茶、奶茶 & 空手接白刃、拉霸機(人力) & 免洗竹製餐具" },
  18:  { id: "18",  displayName: "「包」在我身上", category: ["snack", "beverage", "game"], content: "香腸 & 檸檬茶、紅茶 & 包你發老虎機" },
  19:  { id: "19",  displayName: "樹速塑澍pernovaova", category: ["snack", "beverage", "other"], content: "巴斯克蛋糕、炒泡麵 & 飲料 & 男僕、吉祥物" },
20:  { id: "20",  displayName: "仁心遠揚 來呷煙腸", category: ["snack", "beverage", "game"], content: "大腸包小腸、糯米腸、香腸、小黃瓜 & 紅茶、奶茶、可樂 & 猜拳、套圈圈、推桿、乒乓球投杯" },
  21:  { id: "21",  displayName: "貳零塑在必行", category: ["snack", "beverage", "other"], content: "炸物 & 冰飲 & 贖罪卷" },
  "flower-girl-left-1": { id: "flower-girl-left-1", displayName: "花蓮女中 1", category: "student", content: "女中特色商品、服裝展示、宣傳品" },
  "flower-girl-left-2": { id: "flower-girl-left-2", displayName: "花蓮女中 2", category: "student", content: "女中紀念品、手工藝品、限量周邊" },
  "flower-girl-1": { id: "flower-girl-1", displayName: "花蓮女中 3", category: "student", content: "女中點心、手作美食、特色小食" },
  "flower-girl-2": { id: "flower-girl-2", displayName: "花蓮女中 4", category: "student", content: "女中飲品、冰品、涼飲展售" },
  "flower-girl-3": { id: "flower-girl-3", displayName: "花蓮女中 5", category: "student", content: "女中遊戲區、互動活動、獎品抽獎" },
  班: { id: "班", displayName: "花蓮高中班聯會", category: "student", content: "學校主題商品、紀念小物、宣傳品" },
};

export function getStallInfo(stallId: StallId): StallInfo {
  return STALL_DIRECTORY[stallId];
}

export function getOrderedStalls(): StallInfo[] {
  return STALL_ORDER.map((stallId) => STALL_DIRECTORY[stallId]);
}

export function getStallsByCategory(category: StallCategory | "all"): StallInfo[] {
  const stalls = getOrderedStalls();
  if (category === "all") return stalls;
  return stalls.filter((stall) => {
    if (Array.isArray(stall.category)) {
      return stall.category.includes(category);
    }
    return stall.category === category;
  });
}

// 相容舊 API：保留名稱，但實際改為固定字典查詢
export function generateStallInfo(
  category: StallCategory,
  stallId: string
) {
  const stall = STALL_DIRECTORY[stallId as StallId];
  if (stall) {
    return {
      name: stall.displayName,
      content: stall.content,
      category: Array.isArray(stall.category) ? stall.category[0] : stall.category,
    };
  }

  return {
    name: stallId,
    content: "",
    category,
  };
}

/**
 * 獲取所有攤位分類
 */
export function getAllCategories(): StallCategory[] {
  return Object.keys(STALL_CATEGORIES) as StallCategory[];
}

/**
 * 根據分類篩選攤位
 * @param stallIds 攤位ID陣列
 * @param category 分類
 */
export function filterStallsByCategory(
  stallIds: string[],
  category: StallCategory
): Array<{ id: string; name: string; content: string; category: StallCategory }> {
  return stallIds
    .map((id) => {
      const info = STALL_DIRECTORY[id as StallId];
      if (info) {
        const hasCategory = Array.isArray(info.category)
          ? info.category.includes(category)
          : info.category === category;

        if (hasCategory) {
          const primaryCategory = Array.isArray(info.category) ? info.category[0] : info.category;
          return {
            id,
            name: info.displayName,
            content: info.content,
            category: primaryCategory,
          };
        }
      }

      if (!info) {
        const fallback = generateStallInfo(category, id);
        return {
          id,
          name: fallback.name,
          content: fallback.content,
          category: fallback.category,
        };
      }

      return null;
    })
    .filter((stall): stall is { id: string; name: string; content: string; category: StallCategory } => stall !== null);
}
