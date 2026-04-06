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

// 攤位資料 — 請依實際情況修改
const stalls: Stall[] = [
  { id: 1,  name: "攤位 A1", location: "中央走廊左側",  icon: "🍱", description: "美味餐點",           highlight: "人氣王",    category: 'food' },
  { id: 2,  name: "攤位 A2", location: "中央走廊左側",  icon: "🥤", description: "飲料冰品",           highlight: "消暑首選",  category: 'food' },
  { id: 3,  name: "攤位 A3", location: "中央走廊左側",  icon: "🍡", description: "古早味點心",         highlight: "IG打卡",    category: 'food' },
  { id: 4,  name: "攤位 B1", location: "中央走廊中段",  icon: "🎮", description: "趣味小遊戲",         highlight: "親子同樂", category: 'game' },
  { id: 5,  name: "攤位 B2", location: "中央走廊中段",  icon: "🎨", description: "手作 DIY 工坊",      highlight: "必買伴手禮", category: 'craft' },
  { id: 6,  name: "攤位 C1", location: "中央走廊右段",  icon: "🍖", description: "烤肉燒烤",           highlight: "香噴噴",    category: 'food' },
  { id: 7,  name: "攤位 C2", location: "中央走廊右段",  icon: "📚", description: "文創紀念品",         highlight: "時尚新貨",  category: 'craft' },
  { id: 8,  name: "攤位 D1", location: "信義樓側走廊",  icon: "💪", description: "健身體驗 & 示範",    highlight: "增進健康", category: 'other' },
];

// ─── 帳篷圖示在地圖 SVG 中的位置 ───────────────────────────────────────────────
// row 分布：左花圃左側6、兩花圃中間左右各4、右花圃右側6、右花圃右上2
const tentIcons = [
  { key: "A1", label: "A1", x: 220, y: 250, stallId: 1, zone: "general-adjacent" },
  { key: "A2", label: "A2", x: 220, y: 278, stallId: 2, zone: "general-adjacent" },
  { key: "A3", label: "A3", x: 220, y: 306, stallId: 3, zone: "general-adjacent" },
  { key: "A4", label: "A4", x: 220, y: 334, zone: "general-adjacent" },
  { key: "A5", label: "A5", x: 220, y: 362, zone: "general-adjacent" },
  { key: "A6", label: "A6", x: 220, y: 390, zone: "general-adjacent" },

  { key: "B1", label: "B1", x: 402, y: 306, stallId: 4, zone: "left-inner" },
  { key: "B2", label: "B2", x: 402, y: 334, stallId: 5, zone: "left-inner" },
  { key: "B3", label: "B3", x: 402, y: 362, zone: "left-inner" },
  { key: "B4", label: "B4", x: 402, y: 390, zone: "left-inner" },

  { key: "C1", label: "C1", x: 548, y: 306, stallId: 6, zone: "right-inner" },
  { key: "C2", label: "C2", x: 548, y: 334, stallId: 7, zone: "right-inner" },
  { key: "C3", label: "C3", x: 548, y: 362, zone: "right-inner" },
  { key: "C4", label: "C4", x: 548, y: 390, zone: "right-inner" },

  { key: "D1", label: "D1", x: 744, y: 250, stallId: 8, zone: "xinyi-adjacent" },
  { key: "D2", label: "D2", x: 744, y: 278, zone: "xinyi-adjacent" },
  { key: "D3", label: "D3", x: 744, y: 306, zone: "xinyi-adjacent" },
  { key: "D4", label: "D4", x: 744, y: 334, zone: "xinyi-adjacent" },
  { key: "D5", label: "D5", x: 744, y: 362, zone: "xinyi-adjacent" },
  { key: "D6", label: "D6", x: 744, y: 390, zone: "xinyi-adjacent" },

  { key: "E1", label: "E1", x: 650, y: 236, zone: "right-upper" },
  { key: "E2", label: "E2", x: 692, y: 236, zone: "right-upper" },
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

export default function Map({ onBack, isModal = false }: MapProps) {
  const [selectedStall, setSelectedStall] = useState<Stall | null>(null);
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [hoveredBuilding, setHoveredBuilding] = useState<string | null>(null);
  const [hoveredArrow, setHoveredArrow] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<'all' | 'food' | 'game' | 'craft' | 'other'>('all');

  const handleBoxClick = (stallId: number) => {
    const stall = stalls.find(s => s.id === stallId) ?? null;
    setSelectedStall(stall);
  };

  // 篩選攤位
  const filteredStalls = filterCategory === 'all' 
    ? stalls 
    : stalls.filter(s => s.category === filterCategory);

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
                點擊粉紅帳篷可查看攤位詳情 ✨
              </p>
            </div>

            {/* ── 校園平面圖 SVG ── */}
            <div className="premium-card clay-shadow-md p-4 mb-6 overflow-x-auto">
              <svg
                viewBox="0 0 960 540"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full"
                style={{ minWidth: "520px", maxWidth: "1080px", display: "block", margin: "0 auto" }}
              >
                <defs>
                  <filter id="map-shadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#6E4F35" floodOpacity="0.2" />
                  </filter>
                </defs>

                <rect x="40" y="10" width="880" height="520" rx="10" fill={MAP_COLORS.ground} stroke={MAP_COLORS.campusBorder} strokeWidth="3" />

                <rect x="40" y="10" width="880" height="64" fill={MAP_COLORS.roadAlt} opacity="0.96" />
                <text x="480" y="53" textAnchor="middle" fontSize="40" fill="#FFFFFF" fontWeight="700">民權路</text>

                <rect
                  x="86"
                  y="92"
                  width="96"
                  height="56"
                  rx="4"
                  fill={MAP_COLORS.building}
                  stroke={hoveredBuilding === "gate" ? MAP_COLORS.stallHover : MAP_COLORS.building}
                  strokeWidth="2.5"
                  onMouseEnter={() => setHoveredBuilding("gate")}
                  onMouseLeave={() => setHoveredBuilding(null)}
                  style={{ cursor: "pointer", transition: "stroke 0.15s ease" }}
                />
                <text x="134" y="126" textAnchor="middle" fontSize="18" fill={MAP_COLORS.buildingText} fontWeight="700">校門</text>

                <rect
                  x="54"
                  y="94"
                  width="28"
                  height="92"
                  rx="4"
                  fill={MAP_COLORS.building}
                  stroke={hoveredBuilding === "office" ? MAP_COLORS.stallHover : MAP_COLORS.building}
                  strokeWidth="2.5"
                  onMouseEnter={() => setHoveredBuilding("office")}
                  onMouseLeave={() => setHoveredBuilding(null)}
                  style={{ cursor: "pointer", transition: "stroke 0.15s ease" }}
                />
                <text x="68" y="141" textAnchor="middle" fontSize="10" fill={MAP_COLORS.buildingText} fontWeight="700" transform="rotate(-90 68 141)">傳達室</text>

                <rect
                  x="250"
                  y="116"
                  width="460"
                  height="92"
                  rx="8"
                  fill={MAP_COLORS.building}
                  stroke={hoveredBuilding === "library" ? MAP_COLORS.stallHover : MAP_COLORS.building}
                  strokeWidth="3"
                  onMouseEnter={() => setHoveredBuilding("library")}
                  onMouseLeave={() => setHoveredBuilding(null)}
                  style={{ cursor: "pointer", transition: "stroke 0.15s ease" }}
                />
                <text x="480" y="170" textAnchor="middle" fontSize="34" fill={MAP_COLORS.buildingText} fontWeight="700">圖資大樓</text>

                <g>
                  <text x="232" y="114" fontSize="22">🗑️</text>
                  <text x="232" y="146" fontSize="22">🍴</text>
                  <text x="210" y="112" textAnchor="end" fontSize="12" fill={MAP_COLORS.road} fontWeight="700">垃圾分類區</text>
                  <text x="210" y="144" textAnchor="end" fontSize="12" fill={MAP_COLORS.road} fontWeight="700">餐具借用車</text>
                </g>

                <rect
                  x="76"
                  y="210"
                  width="120"
                  height="252"
                  rx="8"
                  fill={MAP_COLORS.building}
                  stroke={hoveredBuilding === "general" ? MAP_COLORS.stallHover : MAP_COLORS.building}
                  strokeWidth="3"
                  onMouseEnter={() => setHoveredBuilding("general")}
                  onMouseLeave={() => setHoveredBuilding(null)}
                  style={{ cursor: "pointer", transition: "stroke 0.15s ease" }}
                />
                <text x="136" y="336" textAnchor="middle" fontSize="34" fill={MAP_COLORS.buildingText} fontWeight="700" transform="rotate(-90 136 336)">綜合大樓</text>

                <rect
                  x="760"
                  y="210"
                  width="120"
                  height="252"
                  rx="8"
                  fill={MAP_COLORS.building}
                  stroke={hoveredBuilding === "xinyi" ? MAP_COLORS.stallHover : MAP_COLORS.building}
                  strokeWidth="3"
                  onMouseEnter={() => setHoveredBuilding("xinyi")}
                  onMouseLeave={() => setHoveredBuilding(null)}
                  style={{ cursor: "pointer", transition: "stroke 0.15s ease" }}
                />
                <text x="820" y="336" textAnchor="middle" fontSize="34" fill={MAP_COLORS.buildingText} fontWeight="700" transform="rotate(-90 820 336)">信義樓</text>

                <rect
                  x="230"
                  y="430"
                  width="250"
                  height="82"
                  rx="8"
                  fill={MAP_COLORS.building}
                  stroke={hoveredBuilding === "academic" ? MAP_COLORS.stallHover : MAP_COLORS.building}
                  strokeWidth="3"
                  onMouseEnter={() => setHoveredBuilding("academic")}
                  onMouseLeave={() => setHoveredBuilding(null)}
                  style={{ cursor: "pointer", transition: "stroke 0.15s ease" }}
                />
                <text x="355" y="478" textAnchor="middle" fontSize="22" fill={MAP_COLORS.buildingText} fontWeight="700">教務處</text>

                <rect
                  x="500"
                  y="430"
                  width="250"
                  height="82"
                  rx="8"
                  fill={MAP_COLORS.building}
                  stroke={hoveredBuilding === "student" ? MAP_COLORS.stallHover : MAP_COLORS.building}
                  strokeWidth="3"
                  onMouseEnter={() => setHoveredBuilding("student")}
                  onMouseLeave={() => setHoveredBuilding(null)}
                  style={{ cursor: "pointer", transition: "stroke 0.15s ease" }}
                />
                <text x="625" y="478" textAnchor="middle" fontSize="22" fill={MAP_COLORS.buildingText} fontWeight="700">學務處</text>

                <rect
                  x="238"
                  y="236"
                  width="156"
                  height="170"
                  rx="4"
                  fill={MAP_COLORS.building}
                  stroke={hoveredBuilding === "garden-left" ? MAP_COLORS.stallHover : MAP_COLORS.campusBorder}
                  strokeWidth="2.5"
                  onMouseEnter={() => setHoveredBuilding("garden-left")}
                  onMouseLeave={() => setHoveredBuilding(null)}
                  style={{ cursor: "pointer", transition: "stroke 0.15s ease" }}
                />
                <text x="316" y="344" textAnchor="middle" fontSize="30" fill={MAP_COLORS.buildingText} fontWeight="700">花圃</text>

                <rect
                  x="556"
                  y="236"
                  width="156"
                  height="170"
                  rx="4"
                  fill={MAP_COLORS.building}
                  stroke={hoveredBuilding === "garden-right" ? MAP_COLORS.stallHover : MAP_COLORS.campusBorder}
                  strokeWidth="2.5"
                  onMouseEnter={() => setHoveredBuilding("garden-right")}
                  onMouseLeave={() => setHoveredBuilding(null)}
                  style={{ cursor: "pointer", transition: "stroke 0.15s ease" }}
                />
                <text x="634" y="344" textAnchor="middle" fontSize="30" fill={MAP_COLORS.buildingText} fontWeight="700">花圃</text>

                <rect
                  x="424"
                  y="236"
                  width="104"
                  height="130"
                  rx="8"
                  fill={MAP_COLORS.ground}
                  stroke={MAP_COLORS.stageBorder}
                  strokeWidth="3"
                  onMouseEnter={() => setHoveredBuilding("stage")}
                  onMouseLeave={() => setHoveredBuilding(null)}
                  style={{ cursor: "pointer", transition: "stroke 0.15s ease" }}
                />
                <rect x="424" y="236" width="104" height="66" rx="8" fill={MAP_COLORS.stage} />
                <text x="476" y="272" textAnchor="middle" fontSize="44" fill={MAP_COLORS.buildingText} fontWeight="800">舞台</text>

                <g
                  onMouseEnter={() => setHoveredArrow("a")}
                  onMouseLeave={() => setHoveredArrow(null)}
                  style={{ cursor: "pointer" }}
                >
                  <path d="M 210 418 H 736" fill="none" stroke={hoveredArrow === "a" ? MAP_COLORS.stallHover : MAP_COLORS.road} strokeWidth="6" strokeLinecap="round" />
                  <path d="M 736 418 L 718 408 M 736 418 L 718 428" fill="none" stroke={hoveredArrow === "a" ? MAP_COLORS.stallHover : MAP_COLORS.road} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M 736 442 H 210" fill="none" stroke={hoveredArrow === "a" ? MAP_COLORS.stallHover : MAP_COLORS.road} strokeWidth="6" strokeLinecap="round" />
                  <path d="M 210 442 L 228 432 M 210 442 L 228 452" fill="none" stroke={hoveredArrow === "a" ? MAP_COLORS.stallHover : MAP_COLORS.road} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M 210 192 V 406" fill="none" stroke={hoveredArrow === "a" ? MAP_COLORS.stallHover : MAP_COLORS.road} strokeWidth="6" strokeLinecap="round" />
                  <path d="M 210 192 L 200 210 M 210 192 L 220 210" fill="none" stroke={hoveredArrow === "a" ? MAP_COLORS.stallHover : MAP_COLORS.road} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M 742 206 V 418" fill="none" stroke={hoveredArrow === "a" ? MAP_COLORS.stallHover : MAP_COLORS.road} strokeWidth="6" strokeLinecap="round" />
                  <path d="M 742 418 L 732 400 M 742 418 L 752 400" fill="none" stroke={hoveredArrow === "a" ? MAP_COLORS.stallHover : MAP_COLORS.road} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M 644 224 H 742" fill="none" stroke={hoveredArrow === "a" ? MAP_COLORS.stallHover : MAP_COLORS.road} strokeWidth="6" strokeLinecap="round" />
                  <path d="M 742 224 L 724 214 M 742 224 L 724 234" fill="none" stroke={hoveredArrow === "a" ? MAP_COLORS.stallHover : MAP_COLORS.road} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M 742 260 H 640" fill="none" stroke={hoveredArrow === "a" ? MAP_COLORS.stallHover : MAP_COLORS.road} strokeWidth="6" strokeLinecap="round" />
                  <path d="M 640 260 L 658 250 M 640 260 L 658 270" fill="none" stroke={hoveredArrow === "a" ? MAP_COLORS.stallHover : MAP_COLORS.road} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
                </g>

                {/* ── 獨立帳篷攤位 ── */}
                {tentIcons.map(tent => {
                  const isInteractive = typeof tent.stallId === "number";
                  const isHovered = isInteractive && hoveredId === tent.stallId;
                  const isSelected = isInteractive && selectedStall?.id === tent.stallId;
                  const isGeneralLinked = hoveredBuilding === "general" && tent.zone === "general-adjacent";
                  const scale = isHovered ? 1.1 : isSelected ? 1.06 : 1;
                  return (
                    <g
                      key={tent.key}
                      onClick={() => isInteractive && handleBoxClick(tent.stallId!)}
                      onMouseEnter={() => isInteractive && setHoveredId(tent.stallId!)}
                      onMouseLeave={() => isInteractive && setHoveredId(null)}
                      style={{
                        cursor: isInteractive ? "pointer" : "default",
                        transition: "transform 0.15s ease, filter 0.15s ease",
                        transformBox: "fill-box",
                        transformOrigin: "center",
                        transform: `scale(${scale})`,
                        filter: isHovered || isSelected || isGeneralLinked ? "url(#map-shadow)" : "none",
                      }}
                    >
                      <rect
                        x={tent.x + 2}
                        y={tent.y + 12}
                        width={20}
                        height={18}
                        rx="4"
                        fill={isHovered || isSelected ? MAP_COLORS.stallHover : MAP_COLORS.stallTent}
                        stroke={isGeneralLinked ? MAP_COLORS.glow : MAP_COLORS.campusBorder}
                        strokeWidth="1.8"
                      />
                      <rect
                        x={tent.x + 4}
                        y={tent.y + 14}
                        width={4}
                        height={14}
                        fill={MAP_COLORS.stallTentStripe}
                      />
                      <rect
                        x={tent.x + 11}
                        y={tent.y + 14}
                        width={4}
                        height={14}
                        fill={MAP_COLORS.stallTentStripe}
                      />
                      <rect
                        x={tent.x + 18}
                        y={tent.y + 14}
                        width={4}
                        height={14}
                        fill={MAP_COLORS.stallTentStripe}
                      />
                      <polygon
                        points={`${tent.x + 1},${tent.y + 13} ${tent.x + 12},${tent.y + 2} ${tent.x + 23},${tent.y + 13}`}
                        fill={isHovered || isSelected ? MAP_COLORS.stallHover : MAP_COLORS.stallTent}
                        stroke={isGeneralLinked ? MAP_COLORS.glow : MAP_COLORS.campusBorder}
                        strokeWidth="1.8"
                        strokeLinejoin="round"
                      />
                      <text
                        x={tent.x + 12}
                        y={tent.y + 25}
                        textAnchor="middle"
                        fontSize="9"
                        fontWeight="800"
                        fill="#6E2C47"
                        style={{ pointerEvents: "none" }}
                      >
                        {tent.label}
                      </text>
                    </g>
                  );
                })}

                <g transform="translate(66 472)">
                  <rect x="0" y="0" width="172" height="40" rx="10" fill="#FFFFFF" opacity="0.9" stroke={MAP_COLORS.campusBorder} strokeWidth="2" />
                  <circle cx="20" cy="20" r="9" fill={MAP_COLORS.stallTent} />
                  <text x="36" y="26" fontSize="17" fill={MAP_COLORS.road} fontWeight="700">2026 School Fair</text>
                </g>

                {/* 圖例 */}
                <rect x="262" y="478" width="16" height="16" rx="3" fill={MAP_COLORS.stallTent} stroke={MAP_COLORS.campusBorder} strokeWidth="2.5" />
                <text x="284" y="490" fontSize="12" fill={MAP_COLORS.road}>攤位（可點擊）</text>
                <rect x="386" y="478" width="16" height="16" rx="3" fill={MAP_COLORS.garden} stroke={MAP_COLORS.campusBorder} strokeWidth="2.5" />
                <text x="408" y="490" fontSize="12" fill={MAP_COLORS.road}>花圃</text>
                <rect x="468" y="478" width="16" height="16" rx="3" fill={MAP_COLORS.road} stroke={MAP_COLORS.roadAlt} strokeWidth="1.5" />
                <text x="490" y="490" fontSize="12" fill={MAP_COLORS.road}>動線</text>
              </svg>
            </div>

            {/* ── 攤位列表 ── */}
            <div className="premium-card clay-shadow-md p-6">
              <h2 className="text-xl font-bold mb-4" style={{ color: "var(--text)" }}>🏪 全部攤位</h2>
              
              {/* 篩選按鈕 */}
              <div className="flex gap-2 mb-4 flex-wrap">
                {[
                  { id: 'all' as const, label: '全部', emoji: '🎪' },
                  { id: 'food' as const, label: '美食', emoji: '🍱' },
                  { id: 'game' as const, label: '遊戲', emoji: '🎮' },
                  { id: 'craft' as const, label: '手作', emoji: '🎨' },
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
                    onClick={() => setSelectedStall(stall)}
                    className="premium-card clay-shadow-sm p-4 text-left transition-all hover:shadow-md hover:-translate-y-1"
                    style={{
                      border: selectedStall?.id === stall.id ? `2.5px solid ${MAP_COLORS.stallHover}` : `1.5px solid ${MAP_COLORS.campusBorder}`,
                      background: selectedStall?.id === stall.id
                        ? `linear-gradient(135deg, ${MAP_COLORS.garden}, #FFFFFF)`
                        : '#FFFFFF',
                    }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-full text-xl" style={{ background: 'rgba(255, 138, 38, 0.14)', color: MAP_COLORS.stall }}>
                        {stall.icon}
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
            <div className="text-5xl text-center mb-3">{selectedStall.icon}</div>
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