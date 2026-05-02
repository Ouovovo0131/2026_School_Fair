/**
 * 攤位分類、排序與對照資料
 * 提供類似 Python dict 的查詢方式
 */

export const STALL_CATEGORIES = {
  vip: "貴賓",
  snack: "小吃",
  beverage: "飲料",
  game: "遊戲",
  craft: "手作",
  food: "美食",
  class: "班級",
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
  category: StallCategory;
  content: string;
}

// 攤位隨機名稱
const STALL_NAMES = {
  vip: ["貴賓攤位 A", "貴賓攤位 B"],
  snack: [
    "香脆鹹酥雞",
    "日式炸物屋",
    "黃金薄餅舖",
    "原汁牛肉麵",
    "起司馬鈴薯",
    "香辣滷味棧",
    "手工蚵仔煎",
    "日本大阪燒",
    "炸雞排天堂",
    "關東煮工房",
  ],
  beverage: [
    "冰淇淋天堂",
    "氣泡飲物廊",
    "鮮果果汁吧",
    "奶茶風味屋",
    "珍珠奶茶坊",
    "咖啡烘焙館",
    "冰沙果汁店",
    "手打檸檬茶",
    "草莓鮮奶坊",
    "抹茶甜品屋",
  ],
  game: [
    "射氣球遊戲場",
    "疊疊樂挑戰",
    "籃球投籃區",
    "套圈圈樂園",
    "夾娃娃機舖",
    "釣魚遊戲屋",
    "推金幣遊戲",
    "迷宮益智區",
    "投擲標靶站",
    "轉運獎品屋",
  ],
  craft: [
    "DIY手環工坊",
    "陶藝創意教室",
    "蠟燭手作屋",
    "布料編織工房",
    "木工創意坊",
    "黏土捏塑屋",
    "繪畫彩繪坊",
    "飾品DIY館",
    "手工皂製作",
    "拼貼藝術坊",
  ],
  food: [
    "正宗麵食館",
    "火鍋美食坊",
    "中式炒飯屋",
    "羹湯風味軒",
    "滷肉飯專賣",
    "咖喱飯食堂",
    "涼麵夏日屋",
    "湯麵料理屋",
    "飯糰便當坊",
    "粥品溫暖館",
  ],
  class: [
    "高三服務台",
    "高二服務台",
    "高一服務台",
    "文藝社活動區",
    "服務學習站",
    "班級商品舖",
    "校隊宣傳區",
    "社團招募處",
    "班級點心坊",
    "年度紀念品",
  ],
} as const;

// 攤位隨機內容
const STALL_CONTENTS = {
  vip: [
    "迎賓點心、精緻小蛋糕、限量試吃",
    "精品咖啡、花茶、手作餅乾",
  ],
  snack: [
    "香脆鹹酥雞、地瓜球、起司薯條",
    "日式炸蝦、炸章魚燒、炸豆皮",
    "手工現做薄餅、起司披薩薄餅",
    "正宗四川牛肉麵、蒜辣牛肉麵",
    "黑松露起司馬鈴薯、番茄起司薯",
    "麻辣臭豆腐、海帶卷、鴨血",
    "新鮮現做蚵仔煎、蝦仁煎",
    "大阪燒、章魚燒、廣島燒",
    "卡拉雞腿排、招牌雞排、起司雞排",
    "真味關東煮、起司關東煮",
  ],
  beverage: [
    "經典奶油冰淇淋、水果冰淇淋",
    "檸檬氣泡水、草莓氣泡飲",
    "新鮮柳丁汁、西瓜汁、葡萄汁",
    "經典奶茶、焦糖布丁奶茶",
    "黑珍珠奶茶、紅茶珍珠奶茶",
    "濃郁義式咖啡、美式咖啡",
    "芒果冰沙、草莓冰沙、綠茶冰沙",
    "自製檸檬茶、蜂蜜檸檬茶",
    "草莓鮮奶、牛奶草莓",
    "抹茶拿鐵、抹茶紅豆甜品",
  ],
  game: [
    "射氣球大賽、疊疊樂、套圈圈",
    "堆疊積木、疊疊樂、穩定性大考驗",
    "籃球投籃挑戰、三分球大賽",
    "套圈圈遊戲、多種獎品",
    "夾娃娃機、精選娃娃",
    "釣魚遊戲、玩法多樣",
    "推金幣機、獲獎豐富",
    "迷宮益智挑戰、獎品豐富",
    "投擲標靶、多層次挑戰",
    "轉盤轉運、驚喜獎品",
  ],
  craft: [
    "手繪手環、珠珠手環製作",
    "手工陶藝、輪盤陶藝體驗",
    "香氛蠟燭、造型蠟燭製作",
    "棉布編織、手工布藝品",
    "木製小物、雕刻創意",
    "黏土人偶、彩色黏土創作",
    "水彩繪畫、彩繪陶瓷",
    "手工飾品、串珠創意",
    "天然手工皂、香草皂製作",
    "拼貼藝術、廢料再利用",
  ],
  food: [
    "道地炸醬麵、牛肉麵、陽春麵",
    "火鍋湯底、各式丸類、新鮮蔬菜",
    "蛋炒飯、蝦仁炒飯、咖哩炒飯",
    "肉羹湯、魚羹湯、豬腳湯",
    "古早味滷肉飯、豆乾飯",
    "咖哩雞飯、咖哩豬肉飯",
    "涼麵、麻醬涼麵、辣油涼麵",
    "湯麵、牛肉湯麵、蛤蠣湯麵",
    "三角飯糰、便當、握壽司",
    "清粥配菜、蛋花粥、肉粥",
  ],
  class: [
    "班級特色商品、紀念品銷售",
    "班級T恤、限量周邊銷售",
    "班級點心、特製甜點銷售",
    "班級手工藝品、創意商品",
    "班級飲料、飲品販售",
    "班級小食堂、餐點販售",
    "班級遊戲區、互動遊戲",
    "班級主題活動、特色表演",
    "班級募款商品、愛心便當",
    "班級紀念品、限量珍藏",
  ],
} as const;

export const STALL_DIRECTORY: Record<StallId, StallInfo> = {
  貴A: { id: "貴A", displayName: "貴賓攤位 A", category: "vip", content: "迎賓點心、精緻小蛋糕、限量試吃" },
  貴B: { id: "貴B", displayName: "貴賓攤位 B", category: "vip", content: "精品咖啡、花茶、手作餅乾" },
  1: { id: "1", displayName: "1 號攤位", category: "snack", content: "鹹酥雞、地瓜球、脆薯" },
  2: { id: "2", displayName: "2 號攤位", category: "beverage", content: "奶茶、冬瓜茶、檸檬紅茶" },
  3: { id: "3", displayName: "3 號攤位", category: "game", content: "投球挑戰、射氣球、獎品抽抽樂" },
  4: { id: "4", displayName: "4 號攤位", category: "craft", content: "串珠手環、黏土小物、彩繪鑰匙圈" },
  5: { id: "5", displayName: "5 號攤位", category: "food", content: "雞排、炒麵、熱狗堡" },
  6: { id: "6", displayName: "6 號攤位", category: "snack", content: "炸雞翅、薯條、起司球" },
  7: { id: "7", displayName: "7 號攤位", category: "beverage", content: "氣泡飲、果汁、冰沙" },
  8: { id: "8", displayName: "8 號攤位", category: "game", content: "套圈圈、夾娃娃體驗、闖關遊戲" },
  9: { id: "9", displayName: "9 號攤位", category: "craft", content: "香氛蠟燭、手工皂、創意貼紙" },
  10: { id: "10", displayName: "10 號攤位", category: "food", content: "炒飯、咖喱飯、湯麵" },
  11: { id: "11", displayName: "11 號攤位", category: "snack", content: "章魚燒、雞蛋糕、地瓜條" },
  12: { id: "12", displayName: "12 號攤位", category: "beverage", content: "紅茶、奶綠、鮮奶茶" },
  13: { id: "13", displayName: "13 號攤位", category: "game", content: "桌遊挑戰、骰子遊戲、幸運轉盤" },
  14: { id: "14", displayName: "14 號攤位", category: "craft", content: "木作小卡、吊飾、彩繪杯墊" },
  15: { id: "15", displayName: "15 號攤位", category: "food", content: "滷肉飯、涼麵、關東煮" },
  16: { id: "16", displayName: "16 號攤位", category: "snack", content: "炸物拼盤、甜不辣、薯球" },
  17: { id: "17", displayName: "17 號攤位", category: "beverage", content: "檸檬水、奶昔、特調飲品" },
  18: { id: "18", displayName: "18 號攤位", category: "game", content: "投籃機、飛鏢、幸運摸彩" },
  19: { id: "19", displayName: "19 號攤位", category: "craft", content: "編織手環、明信片、壓花書籤" },
  20: { id: "20", displayName: "20 號攤位", category: "food", content: "漢堡、飯糰、熱壓吐司" },
  21: { id: "21", displayName: "21 號攤位", category: "class", content: "班級限定商品、紀念品、特色販售" },  "flower-girl-left-1": { id: "flower-girl-left-1", displayName: "花蓮女中左 1", category: "class", content: "女中特色商品、服裝展示、宣傳品" },
  "flower-girl-left-2": { id: "flower-girl-left-2", displayName: "花蓮女中左 2", category: "class", content: "女中紀念品、手工藝品、限量周邊" },
  "flower-girl-1": { id: "flower-girl-1", displayName: "花蓮女中 1", category: "class", content: "女中點心、手作美食、特色小食" },
  "flower-girl-2": { id: "flower-girl-2", displayName: "花蓮女中 2", category: "class", content: "女中飲品、冰品、涼飲展售" },
  "flower-girl-3": { id: "flower-girl-3", displayName: "花蓮女中 3", category: "class", content: "女中遊戲區、互動活動、獎品抽獎" },  班: { id: "班", displayName: "花蓮高中班聯會", category: "class", content: "學校主題商品、紀念小物、宣傳品" },
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
  return stalls.filter((stall) => stall.category === category);
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
      category: stall.category,
    };
  }

  const names = STALL_NAMES[category];
  const contents = STALL_CONTENTS[category];
  const seed = stallId
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);

  return {
    name: names[seed % names.length],
    content: contents[(seed * 7) % contents.length],
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
      if (info && info.category === category) {
        return {
          id,
          name: info.displayName,
          content: info.content,
          category: info.category,
        };
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
