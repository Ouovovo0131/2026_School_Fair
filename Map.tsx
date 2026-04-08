"use client";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";

interface MapProps {
  onBack?: () => void;
  isModal?: boolean;
}

interface Stall {
  id: number;
  name: string;
  location: string;
  icon: string;
  description: string;
  highlight: string;
  category: 'food' | 'game' | 'craft' | 'other';
}

type ZoneId = 'A' | 'B' | 'C' | 'D' | 'E';

// 攤位資料（帳棚數與位置對齊地圖圖面）
const stalls: Stall[] = [
  { id: 1, name: "A1 蜜香紅茶鋪", location: "左側第一列（綜合大樓旁）", icon: "🧋", description: "手搖紅茶、珍珠奶茶與冬瓜檸檬，現點現搖。", highlight: "清涼解渴", category: 'food' },
  { id: 2, name: "A2 熱壓吐司站", location: "左側第一列（綜合大樓旁）", icon: "🥪", description: "起司火腿、玉米鮪魚等鹹甜口味熱壓吐司。", highlight: "現烤酥脆", category: 'food' },
  { id: 3, name: "A3 古早味甜點", location: "左側第一列（綜合大樓旁）", icon: "🍮", description: "黑糖粉粿、奶酪與小蛋糕，甜度剛剛好。", highlight: "下午茶首選", category: 'food' },
  { id: 4, name: "A4 炸物總動員", location: "左側第一列（綜合大樓旁）", icon: "🍟", description: "雞塊、薯條與甜不辣，多種醬料自由搭配。", highlight: "香氣滿分", category: 'food' },
  { id: 5, name: "A5 異國小點", location: "左側第一列（綜合大樓旁）", icon: "🌮", description: "墨西哥捲與香料小點，提供微辣與不辣版本。", highlight: "人氣新品", category: 'food' },
  { id: 6, name: "A6 水果氣泡吧", location: "左側第一列（綜合大樓旁）", icon: "🍹", description: "季節水果氣泡飲與無糖果香茶，清爽不膩口。", highlight: "拍照必喝", category: 'food' },

  { id: 7, name: "B3 射擊挑戰", location: "左花圃與舞台間", icon: "🎯", description: "限時射擊闖關，累積分數可兌換小禮。", highlight: "高手對決", category: 'game' },
  { id: 8, name: "B4 套圈圈樂園", location: "左花圃與舞台間", icon: "⭕", description: "經典套圈圈遊戲，大小獎品等你帶回家。", highlight: "闖關必玩", category: 'game' },
  { id: 9, name: "B5 手作吊飾", location: "左花圃與舞台間", icon: "🪡", description: "可自選顏色與字母，現場完成專屬吊飾。", highlight: "客製限定", category: 'craft' },
  { id: 10, name: "B6 明信片工坊", location: "左花圃與舞台間", icon: "✉️", description: "手繪與拼貼明信片，幫你蓋上校慶紀念章。", highlight: "紀念收藏", category: 'craft' },

  { id: 11, name: "C3 幸運抽抽樂", location: "右花圃與舞台間", icon: "🎁", description: "憑代幣抽獎，有機會抽中大型驚喜禮。", highlight: "大獎等你", category: 'game' },
  { id: 12, name: "C4 猜謎問答站", location: "右花圃與舞台間", icon: "🧠", description: "校史、生活與趣味題，答對即可拿點數。", highlight: "腦力激盪", category: 'game' },
  { id: 13, name: "C5 香氛擴香石", location: "右花圃與舞台間", icon: "🕯️", description: "挑選香味與模具，做出屬於自己的擴香石。", highlight: "療癒手作", category: 'craft' },
  { id: 14, name: "C6 彩繪扇子", location: "右花圃與舞台間", icon: "🪭", description: "提供模板與顏料，完成獨一無二的彩繪扇。", highlight: "夏日必備", category: 'craft' },

  { id: 15, name: "D1 校刊紀念攤", location: "右側第二列（信義樓旁）", icon: "📚", description: "歷年校刊精選與限量紀念小冊免費翻閱。", highlight: "校史回顧", category: 'other' },
  { id: 16, name: "D2 二手好物市集", location: "右側第二列（信義樓旁）", icon: "♻️", description: "書籍、文具與小物交流，推廣循環再利用。", highlight: "環保愛地球", category: 'other' },
  { id: 17, name: "D3 公益義賣攤", location: "右側第二列（信義樓旁）", icon: "❤️", description: "義賣所得捐助公益團體，歡迎一起做善事。", highlight: "愛心滿滿", category: 'other' },
  { id: 18, name: "D4 班級攝影棚", location: "右側第二列（信義樓旁）", icon: "📸", description: "提供拍照道具與即時沖印，留下校慶回憶。", highlight: "限定合影", category: 'other' },
  { id: 19, name: "D5 樂團周邊店", location: "右側第二列（信義樓旁）", icon: "🎸", description: "學生樂團貼紙、徽章與應援卡限量發售。", highlight: "粉絲必收", category: 'other' },
  { id: 20, name: "D6 社團招募站", location: "右側第二列（信義樓旁）", icon: "📣", description: "各社團成果展示與入社資訊一次看齊。", highlight: "找到同好", category: 'other' },
  { id: 21, name: "D7 打卡任務區", location: "右側第二列（信義樓旁）", icon: "🗺️", description: "完成地圖打卡任務可兌換校慶限定小禮。", highlight: "全場串聯", category: 'other' },
  { id: 22, name: "D8 休憩補給站", location: "右側第二列（信義樓旁）", icon: "🧃", description: "提供飲水與短暫休息空間，補充體力再出發。", highlight: "能量補給", category: 'other' },

  { id: 23, name: "E1 經典雞蛋糕", location: "後排 E 區", icon: "🧇", description: "現烤雞蛋糕，原味與巧克力口味熱騰騰出爐。", highlight: "香甜現烤", category: 'food' },
  { id: 24, name: "E2 鐵板炒麵屋", location: "後排 E 區", icon: "🍜", description: "鐵板現炒麵食，提供加蛋與起司加料。", highlight: "熱炒人氣", category: 'food' },
  { id: 25, name: "E3 迷你籃球賽", location: "後排 E 區", icon: "🏀", description: "限時投籃挑戰，累計命中可兌換小禮品。", highlight: "手感爆發", category: 'game' },
  { id: 26, name: "E4 立體拼豆坊", location: "後排 E 區", icon: "🧩", description: "挑選模板製作拼豆作品，完成後可帶回收藏。", highlight: "創意滿點", category: 'craft' },
  { id: 27, name: "E5 文創貼紙舖", location: "後排 E 區", icon: "🧷", description: "原創貼紙與小卡販售，支持學生文創設計。", highlight: "限定設計", category: 'other' },
  { id: 28, name: "E6 終章集章站", location: "後排 E 區", icon: "🏁", description: "完成 E 區任務可蓋章，蒐集章點兌換紀念品。", highlight: "集章衝刺", category: 'other' },
];

const MAP_COLORS = {
  building: "#B88A61",
  buildingText: "#FFF8F0",
  ground: "#D8D8DE",
  road: "#9D734D",
  roadAlt: "#B48660",
  stall: "#EB5F93",
  stallHover: "#FF95BC",
  stallTent: "#EB5F93",
  stallTentStripe: "#FFF7FA",
  stage: "#C94643",
  stageBorder: "#000000",
  campusBorder: "#876548",
  garden: "#DCCFAF",
  gardenPlant: "#5A9C58",
  glow: "#FFD37B",
};

const getZoneFromStall = (stall: Stall): ZoneId => stall.name.charAt(0) as ZoneId;

const getSpotlightConfig = (zone: ZoneId) => {

  switch (zone) {
    case "A":
      return { left: "11%", top: "40%", size: "30%" };
    case "B":
      return { left: "34%", top: "55%", size: "25%" };
    case "C":
      return { left: "66%", top: "55%", size: "25%" };
    case "D":
      return { left: "91%", top: "42%", size: "22%" };
    case "E":
      return { left: "66%", top: "88%", size: "22%" };
    default:
      return { left: "50%", top: "50%", size: "22%" };
  }
};

export default function Map({ onBack, isModal = false }: MapProps) {
  const [selectedStall, setSelectedStall] = useState<Stall | null>(null);
  const [filterCategory, setFilterCategory] = useState<'all' | 'food' | 'game' | 'craft' | 'other'>('all');
  const [activeZone, setActiveZone] = useState<'all' | ZoneId>('all');

  const spotlightZone = selectedStall ? getZoneFromStall(selectedStall) : activeZone === 'all' ? null : activeZone;
  const spotlight = spotlightZone ? getSpotlightConfig(spotlightZone) : null;

  // 篩選攤位
  const filteredStalls = stalls.filter(stall => {
    const matchesCategory = filterCategory === 'all' || stall.category === filterCategory;
    const matchesZone = activeZone === 'all' || getZoneFromStall(stall) === activeZone;
    return matchesCategory && matchesZone;
  });

  return (
    <div
      className={
        isModal
          ? "fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto"
          : "min-h-screen"
      }
      style={!isModal ? { background: "var(--bg)" } : {}}
    >
      <div className={isModal ? "w-full max-w-5xl premium-card overflow-hidden" : ""}>

        {/* 返回按鈕 */}
        {onBack && (
          <div className={isModal ? "p-4 border-b" : "p-6 pb-2"}>
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-lg font-bold clay-button clay-button-blue"
            >
              <ArrowLeft className="w-5 h-5" />
              {isModal ? "關閉地圖" : "返回"}
            </button>
          </div>
        )}

        <div className={isModal ? "p-6" : "w-full px-4 py-4"}>
          <div className={isModal ? "" : "max-w-5xl mx-auto"}>

            {/* 標題 */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold" style={{ color: MAP_COLORS.building }}>
                🗺️ 校慶攤位地圖
              </h1>
              <p className="mt-1 text-base font-medium" style={{ color: MAP_COLORS.stall }}>
                點擊下方攤位卡片可查看各帳棚詳情 ✨
              </p>
            </div>

            {/* ── 校園平面圖 ── */}
            <div className="premium-card clay-shadow-md p-4 mb-6 overflow-x-auto relative">
              <div className="relative mx-auto" style={{ maxWidth: "1080px" }}>
                <img
                  src="/Map.png"
                  alt="校慶地圖"
                  className={`w-full h-auto rounded-xl border transition-all duration-300 ${spotlightZone ? "brightness-60 saturate-75" : ""}`}
                  style={{ display: "block", borderColor: MAP_COLORS.campusBorder }}
                />
                {spotlight && (
                  <div
                    className="pointer-events-none absolute inset-4 rounded-xl"
                    style={{
                      background: `radial-gradient(circle ${spotlight.size} at ${spotlight.left} ${spotlight.top}, rgba(255,255,255,0.96) 0%, rgba(255,255,255,0.72) 18%, rgba(255,255,255,0.2) 32%, rgba(0,0,0,0.18) 44%, rgba(0,0,0,0.74) 72%, rgba(0,0,0,0.92) 100%)`,
                      boxShadow: `inset 0 0 0 2px rgba(255,255,255,0.18), inset 0 0 80px rgba(255,255,255,0.08)`,
                    }}
                  />
                )}
              </div>
            </div>

            <div
              className="premium-card clay-shadow-sm px-4 py-3 mb-6"
              style={{
                border: `1.5px solid ${MAP_COLORS.campusBorder}`,
                background: "#FFFFFF",
              }}
            >
              <p className="text-sm font-bold" style={{ color: MAP_COLORS.building }}>
                🧭 地圖備註：右側為北方，箭頭方向為建議路徑。
              </p>
            </div>

            {/* ── 攤位列表 ── */}
            <div className="premium-card clay-shadow-md p-6">
              <h2 className="text-xl font-bold mb-4" style={{ color: "var(--text)" }}>🏪 帳棚攤位總覽（共 {stalls.length} 攤）</h2>
              
              {/* 篩選按鈕 */}
              <div className="flex gap-2 mb-4 flex-wrap">
                {[
                  { id: 'all' as const, label: '全部', emoji: '🎪' },
                  { id: 'food' as const, label: '美食', emoji: '🍱' },
                  { id: 'game' as const, label: '遊戲', emoji: '🎮' },
                  { id: 'craft' as const, label: '手作', emoji: '🎨' },
                  { id: 'other' as const, label: '其他', emoji: '✨' },
                ].map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setFilterCategory(cat.id)}
                    className="px-4 py-2 rounded-full font-bold text-sm transition-all hover:-translate-y-0.5"
                    style={{
                      background: filterCategory === cat.id 
                        ? MAP_COLORS.building
                        : MAP_COLORS.road,
                      color: filterCategory === cat.id ? '#FFFFFF' : MAP_COLORS.building,
                      border: filterCategory === cat.id 
                        ? `2px solid ${MAP_COLORS.stallHover}`
                        : `1px solid ${MAP_COLORS.campusBorder}`,
                      transform: filterCategory === cat.id ? 'scale(1.05)' : 'scale(1)'
                    }}
                  >
                    {cat.emoji} {cat.label}
                  </button>
                ))}
              </div>

              {/* 攤位卡片 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {filteredStalls.map(stall => (
                  <button
                    key={stall.id}
                    onClick={() => {
                      setActiveZone(getZoneFromStall(stall));
                      setSelectedStall(stall);
                    }}
                    className="premium-card clay-shadow-sm p-4 text-left transition-all hover:shadow-md hover:-translate-y-1"
                    style={{
                      border: selectedStall?.id === stall.id ? `2.5px solid ${MAP_COLORS.stallHover}` : `1.5px solid ${MAP_COLORS.campusBorder}`,
                      background: selectedStall?.id === stall.id
                        ? `linear-gradient(135deg, ${MAP_COLORS.garden}, #FFFFFF)`
                        : '#FFFFFF',
                    }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-full" style={{ background: 'rgba(255, 138, 38, 0.14)' }}>
                        <img src="/Map_icon.png" alt={`${stall.name} icon`} className="h-6 w-6 object-contain" />
                      </span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: MAP_COLORS.stallHover, color: MAP_COLORS.building }}>
                        {stall.highlight}
                      </span>
                    </div>
                    <p className="font-bold text-sm mt-1" style={{ color: MAP_COLORS.building }}>{stall.name}</p>
                    <p className="text-xs mt-0.5" style={{ color: MAP_COLORS.building }}>📍 {stall.location}</p>
                  </button>
                ))}
              </div>

              {filteredStalls.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-lg font-bold" style={{ color: MAP_COLORS.building }}>
                    🔍 此分類暫無攤位
                  </p>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* ── 攤位詳情彈出視窗 ── */}
      {selectedStall && (
        <div
          className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4"
          onClick={() => setSelectedStall(null)}
        >
          <div
            className="premium-card clay-shadow-lg max-w-sm w-full p-8 relative"
            style={{ animation: "modal-pop 0.35s cubic-bezier(0.34,1.56,0.64,1)" }}
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedStall(null)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full font-bold text-lg"
              style={{color: 'var(--text-muted)', background: 'transparent'}}
            >
              ✕
            </button>
            <div className="flex justify-center mb-3">
              <img src="/Map_icon.png" alt={`${selectedStall.name} icon`} className="h-14 w-14 object-contain" />
            </div>
            <h3 className="text-2xl font-bold text-center mb-1" style={{ color: "var(--text)" }}>
              {selectedStall.name}
            </h3>
            <p
              className="text-center text-sm font-bold mb-4"
              style={{
                background: "linear-gradient(90deg,var(--primary),var(--secondary))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              ⭐ {selectedStall.highlight}
            </p>
            <div className="space-y-3 mb-6">
              <div>
                <p className="text-xs font-bold mb-0.5" style={{ color: "var(--primary)" }}>位置</p>
                <p className="font-medium" style={{ color: "var(--text)" }}>📍 {selectedStall.location}</p>
              </div>
              <div>
                <p className="text-xs font-bold mb-0.5" style={{ color: "var(--primary)" }}>介紹</p>
                <p className="font-medium" style={{ color: "var(--text)" }}>{selectedStall.description}</p>
              </div>
            </div>
            <button
              onClick={() => setSelectedStall(null)}
              className="w-full clay-button clay-button-blue py-3 font-bold"
            >
              關閉
            </button>
          </div>
        </div>
      )}
    </div>
  );
}