export const STALL_CATEGORIES = {
  vip: "貴賓",
  snack: "小吃",
  beverage: "飲料",
  game: "遊戲",
  bracelet: "編織手環",
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
  "女1",
  "女2",
  "女3",
  "女4",
  "女5",
  "班",
] as const;

export type StallId = (typeof STALL_ORDER)[number];

export interface StallInfo {
  id: StallId;
  displayName: string;
  category: StallCategory | StallCategory[];
  content: string;
  classLabel?: string;
  className?: string;
}

export const STALL_DIRECTORY: Record<StallId, StallInfo> = {
  貴A:   { id: "貴A", displayName: "貴賓攤位 A", category: "vip", content: "迎賓點心、精緻小蛋糕、限量試吃" },
  貴B:   { id: "貴B", displayName: "貴賓攤位 B", category: "vip", content: "精品咖啡、花茶、手作餅乾" },
  1:   { id: "1",   className: "107", displayName: "仁手一捲", category: ["snack", "beverage"], content: "越南正宗春捲 & 奇亞籽百香果椰果茶" },
  2:   { id: "2",   className: "103", displayName: "103爆炒無塑回", category: ["snack", "beverage", "game"], content: "炒泡麵 & 乾冰汽水(芬達、雪碧) & 抓棍機" },
  3:   { id: "3",   className: "203", displayName: "好火火熱狗~好窩", category: "snack", content: "熱狗堡" },
  4:   { id: "4",   className: "208", displayName: "仁者無素", category: ["snack", "game"], content: "杜拜巧克力 & 高爾夫球小遊戲" },
  5:   { id: "5",   className: "202", displayName: "塑度與基情9", category: ["snack", "beverage"], content: "冰品、飲料 & 人體打地鼠" },
  6:   { id: "6",   className: "109", displayName: "沁露珠園", category: ["snack", "beverage", "game"], content: "鬆餅 & 紅茶、冬瓜茶、珍珠奶茶 & 打彈珠" },
  7:   { id: "7",   className: "101", displayName: "雞渴男耐", category: ["snack", "beverage", "other"], content: "雞肉飯、滷豆干 & 紅茶、阿華田 & 女模裝服務員" },
  8:   { id: "8",   className: "205", displayName: "訂YO等雨停", category: ["snack", "beverage"], content: "香腸 & 冰淇淋、飲料" },
  9:   { id: "9",   className: "102", displayName: "糖絲三百手", category: ["snack", "beverage", "game"], content: "糖葫蘆 & 紅茶 & 轉輪盤" },
  10:  { id: "10",  className: "105", displayName: "九零花中 無塑有5", category: ["snack", "game", "other"], content: "香腸 & 「一擲千金」、許願池、贖罪卷" },
  11:  { id: "11",  className: "108", displayName: "熊男幫你烤", category: ["snack", "beverage"], content: "玉米、甜不辣、香腸、雞肉串、豆乾、貓舌餅 & 汽水、冬瓜茶、紅茶" },
  12:  { id: "12",  className: "111", displayName: "減塑分裂", category: ["beverage", "game"], content: "冰淇淋、冰飲 & 拉霸機(人力)" },
  13:  { id: "13",  className: "106", displayName: "六妻仙人", category: ["snack", "beverage", "other"], content: "手搓愛玉、炒麵麵包 & 紅茶 & 解壓玩具" },
  14:  { id: "14",  className: "210、211", displayName: "50藍", category: ["snack", "beverage", "game"], content: "瑪德蓮小蛋糕 & 咖啡 & 一番賞" },
  15:  { id: "15",  className: "110", displayName: "會員制度拜巧克力Q餅", category: "snack", content: "杜拜巧克力" },
  16:  { id: "16",  className: "207", displayName: "無塑啃TA雞", category: ["snack", "beverage", "game"], content: "印尼炒泡麵、熱狗 & 飲料 & 抽抽樂" },
  17:  { id: "17",  className: "209", displayName: "塑欲淨而瘋不止", category: ["snack", "beverage", "game", "other"], content: "玉里麵 & 紅茶、奶茶 & 空手接白刃、拉霸機(人力) & 免洗竹製餐具" },
  18:  { id: "18",  className: "201", displayName: "不塑哥們", category: ["snack", "beverage", "game"], content: "香腸 & 檸檬茶、紅茶 & 包你發老虎機" },
  19:  { id: "19",  className: "206", displayName: "樹速塑澍pernova", category: ["snack", "beverage", "other"], content: "巴斯克蛋糕、炒泡麵 & 飲料 & 男僕、吉祥物" },
  20:  { id: "20",  className: "104", displayName: "仁心遠揚，來呷煙腸", category: ["snack", "beverage", "game"], content: "大腸包小腸、糯米腸、香腸、小黃瓜 & 紅茶、奶茶、可樂 & 猜拳、套圈圈、推桿、乒乓球投杯" },
  21:  { id: "21",  className: "204", displayName: "貳零塑在必行", category: ["snack", "beverage", "other"], content: "炸物 & 冰飲 & 贖罪卷" },
  "女1": { id: "女1", displayName: "花女沒塑社", category: ["snack", "beverage"], content: "炒泡麵 & 冰品" },
  "女2": { id: "女2", displayName: "花女帆船社", category: ["bracelet", "game"], content: "蠟繩編織手環、猴拳結吊飾DIY & 繩結挑戰賽" },
  "女3": { id: "女3", displayName: "花女學生會", category: ["snack", "beverage", "student", "other"], content: "餅乾、小吃 & 冰飲 & 拍立得服務(消費達一定金額) & 一日制服體驗 " },
  "女4": { id: "女4", displayName: "仁不住一直吃", category: "snack", content: "餅乾" },
  "女5": { id: "女5", displayName: "幸福崴孟餅乾", category: "snack", content: "手做餅乾" },
  班: { id: "班", displayName: "服務台", category: "student", content: "學校主題商品、紀念小物、宣傳品" },
};

// 與地圖顯示一致的分類順序（顯示用）
export const STALL_CATEGORY_ORDER: StallCategory[] = [
  "vip",
  "snack",
  "beverage",
  "game",
  "bracelet",
  "student",
  "other",
];

/**
 * 取得 UI 用的分類選項（會按照地圖顯示順序回傳）
 */
export function getCategoryOptions(): Array<{ key: StallCategory; label: string }> {
  return STALL_CATEGORY_ORDER.map((key) => ({ key, label: STALL_CATEGORIES[key] }));
}

export function getStallInfo(stallId: StallId): StallInfo {
  return STALL_DIRECTORY[stallId];
}

export function getStallClassLabel(stall: StallInfo): string | undefined {
  if (stall.className) return `${stall.className} 班`;
  if (stall.classLabel) return stall.classLabel;

  const match = stall.displayName.match(/^(\d{2,3})(?=\D|$)/);
  if (match) {
    return `${match[1]} 班`;
  }

  return undefined;
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
  return STALL_CATEGORY_ORDER;
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
