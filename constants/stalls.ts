/**
 * 攤位分類、名稱和內容定義
 * 用於在地圖下方隨機生成攤位總覽
 */

export const STALL_CATEGORIES = {
  snack: "🍗 小吃",
  beverage: "🥤 飲料",
  game: "🎮 遊戲",
  craft: "🎨 手作",
  food: "🍜 美食",
  class: "📚 班級",
};

export type StallCategory = keyof typeof STALL_CATEGORIES;

// 攤位隨機名稱
const STALL_NAMES = {
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
};

// 攤位隨機內容
const STALL_CONTENTS = {
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
    "古早味滷肉飯、 豆乾飯",
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
};

// 隨機生成函數
const getRandomItem = <T,>(array: T[]): T => array[Math.floor(Math.random() * array.length)];

/**
 * 根據分類隨機生成攤位資訊
 * @param category 攤位分類
 * @param stallId 攤位編號（用於種子生成相同的內容）
 */
export function generateStallInfo(
  category: StallCategory,
  stallId: string
) {
  // 使用 stallId 作為種子讓同個攤位每次生成相同內容
  const seed = stallId
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);

  const names = STALL_NAMES[category];
  const contents = STALL_CONTENTS[category];

  // 簡單的確定性隨機選擇（基於 seed）
  const nameIndex = seed % names.length;
  const contentIndex = (seed * 7) % contents.length; // 用不同的乘數確保多樣性

  return {
    name: names[nameIndex],
    content: contents[contentIndex],
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
  return stallIds.map((id) => {
    const info = generateStallInfo(category, id);
    return {
      id,
      name: info.name,
      content: info.content,
      category,
    };
  });
}
