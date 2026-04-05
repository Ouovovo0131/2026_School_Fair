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
// row 分布：最左6、左花圃與舞台間6、右花圃與舞台間6、最右7
const tentIcons = [
  // far-left row (6)
  { key: "L1", x: 178, y: 180, stallId: 1 },
  { key: "L2", x: 178, y: 208, stallId: 2 },
  { key: "L3", x: 178, y: 236, stallId: 4 },
  { key: "L4", x: 178, y: 264 },
  { key: "L5", x: 178, y: 292 },
  { key: "L6", x: 178, y: 320 },

  // between left garden and stage (6)
  { key: "LC1", x: 338, y: 180, stallId: 5 },
  { key: "LC2", x: 338, y: 208, stallId: 3 },
  { key: "LC3", x: 338, y: 236 },
  { key: "LC4", x: 338, y: 264 },
  { key: "LC5", x: 338, y: 292 },
  { key: "LC6", x: 338, y: 320 },

  // between right garden and stage (6)
  { key: "RC1", x: 532, y: 180, stallId: 6 },
  { key: "RC2", x: 532, y: 208, stallId: 7 },
  { key: "RC3", x: 532, y: 236 },
  { key: "RC4", x: 532, y: 264 },
  { key: "RC5", x: 532, y: 292 },
  { key: "RC6", x: 532, y: 320 },

  // far-right row (7)
  { key: "R1", x: 664, y: 170 },
  { key: "R2", x: 664, y: 198, stallId: 8 },
  { key: "R3", x: 664, y: 226 },
  { key: "R4", x: 664, y: 254 },
  { key: "R5", x: 664, y: 282 },
  { key: "R6", x: 664, y: 310 },
  { key: "R7", x: 664, y: 338 },
];

const MAP_COLORS = {
  building: "#B58963",
  buildingText: "#FFF7EE",
  ground: "#D7D7DC",
  road: "#A1764F",
  roadAlt: "#BA8C66",
  stall: "#E95A8B",
  stallHover: "#FF8FB5",
  stallTent: "#E95A8B",
  stallTentStripe: "#FFF7FA",
  stage: "#C6463E",
  stageBorder: "#000000",
  campusBorder: "#8B694C",
  garden: "#D6C09B",
  gardenPlant: "#4C8E4C",
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
                viewBox="0 0 800 460"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full"
                style={{ minWidth: "340px", maxWidth: "900px", display: "block", margin: "0 auto" }}
              >
                <defs>
                  <filter id="map-shadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#6E4F35" floodOpacity="0.2" />
                  </filter>
                </defs>

                <rect x="80" y="10" width="700" height="440" rx="8" fill="transparent" stroke={MAP_COLORS.campusBorder} strokeWidth="3" />
                <rect x="83" y="13" width="694" height="434" rx="6" fill={MAP_COLORS.ground} />

                <rect x="80" y="10" width="700" height="44" fill={MAP_COLORS.roadAlt} opacity="0.95" />
                <text x="430" y="40" textAnchor="middle" fontSize="34" fill="#FFFFFF" fontWeight="700">民權路</text>

                <rect
                  x="92"
                  y="66"
                  width="78"
                  height="62"
                  rx="4"
                  fill={MAP_COLORS.building}
                  stroke={hoveredBuilding === "gate" ? MAP_COLORS.stallHover : MAP_COLORS.building}
                  strokeWidth="2.5"
                  onMouseEnter={() => setHoveredBuilding("gate")}
                  onMouseLeave={() => setHoveredBuilding(null)}
                  style={{ cursor: "pointer", transition: "stroke 0.15s ease" }}
                />
                <text x="131" y="102" textAnchor="middle" fontSize="11" fill={MAP_COLORS.buildingText} fontWeight="700">校門</text>

                <rect
                  x="92"
                  y="136"
                  width="54"
                  height="64"
                  rx="4"
                  fill={MAP_COLORS.building}
                  stroke={hoveredBuilding === "office" ? MAP_COLORS.stallHover : MAP_COLORS.building}
                  strokeWidth="2.5"
                  onMouseEnter={() => setHoveredBuilding("office")}
                  onMouseLeave={() => setHoveredBuilding(null)}
                  style={{ cursor: "pointer", transition: "stroke 0.15s ease" }}
                />
                <text x="119" y="173" textAnchor="middle" fontSize="11" fill={MAP_COLORS.buildingText} fontWeight="700">傳達室</text>

                <rect
                  x="200"
                  y="66"
                  width="400"
                  height="72"
                  rx="8"
                  fill={MAP_COLORS.building}
                  stroke={hoveredBuilding === "library" ? MAP_COLORS.stallHover : MAP_COLORS.building}
                  strokeWidth="3"
                  onMouseEnter={() => setHoveredBuilding("library")}
                  onMouseLeave={() => setHoveredBuilding(null)}
                  style={{ cursor: "pointer", transition: "stroke 0.15s ease" }}
                />
                <text x="400" y="109" textAnchor="middle" fontSize="20" fill={MAP_COLORS.buildingText} fontWeight="700">圖資大樓</text>

                <rect
                  x="92"
                  y="155"
                  width="92"
                  height="250"
                  rx="8"
                  fill={MAP_COLORS.building}
                  stroke={hoveredBuilding === "complex" ? MAP_COLORS.stallHover : MAP_COLORS.building}
                  strokeWidth="3"
                  onMouseEnter={() => setHoveredBuilding("complex")}
                  onMouseLeave={() => setHoveredBuilding(null)}
                  style={{ cursor: "pointer", transition: "stroke 0.15s ease" }}
                />
                <text x="138" y="282" textAnchor="middle" fontSize="22" fill={MAP_COLORS.buildingText} fontWeight="700" transform="rotate(-90 138 282)">綜合大樓</text>

                <rect
                  x="678"
                  y="155"
                  width="92"
                  height="250"
                  rx="8"
                  fill={MAP_COLORS.building}
                  stroke={hoveredBuilding === "xinyi" ? MAP_COLORS.stallHover : MAP_COLORS.building}
                  strokeWidth="3"
                  onMouseEnter={() => setHoveredBuilding("xinyi")}
                  onMouseLeave={() => setHoveredBuilding(null)}
                  style={{ cursor: "pointer", transition: "stroke 0.15s ease" }}
                />
                <text x="724" y="282" textAnchor="middle" fontSize="22" fill={MAP_COLORS.buildingText} fontWeight="700" transform="rotate(-90 724 282)">信義樓</text>

                <rect
                  x="200"
                  y="350"
                  width="210"
                  height="90"
                  rx="8"
                  fill={MAP_COLORS.building}
                  stroke={hoveredBuilding === "academic" ? MAP_COLORS.stallHover : MAP_COLORS.building}
                  strokeWidth="3"
                  onMouseEnter={() => setHoveredBuilding("academic")}
                  onMouseLeave={() => setHoveredBuilding(null)}
                  style={{ cursor: "pointer", transition: "stroke 0.15s ease" }}
                />
                <text x="305" y="402" textAnchor="middle" fontSize="16" fill={MAP_COLORS.buildingText} fontWeight="700">教務處</text>

                <rect
                  x="430"
                  y="350"
                  width="240"
                  height="90"
                  rx="8"
                  fill={MAP_COLORS.building}
                  stroke={hoveredBuilding === "student" ? MAP_COLORS.stallHover : MAP_COLORS.building}
                  strokeWidth="3"
                  onMouseEnter={() => setHoveredBuilding("student")}
                  onMouseLeave={() => setHoveredBuilding(null)}
                  style={{ cursor: "pointer", transition: "stroke 0.15s ease" }}
                />
                <text x="550" y="402" textAnchor="middle" fontSize="16" fill={MAP_COLORS.buildingText} fontWeight="700">學務處</text>

                <rect
                  x="200"
                  y="178"
                  width="130"
                  height="130"
                  rx="4"
                  fill={MAP_COLORS.garden}
                  stroke={hoveredBuilding === "garden-left" ? MAP_COLORS.stallHover : MAP_COLORS.campusBorder}
                  strokeWidth="2.5"
                  onMouseEnter={() => setHoveredBuilding("garden-left")}
                  onMouseLeave={() => setHoveredBuilding(null)}
                  style={{ cursor: "pointer", transition: "stroke 0.15s ease" }}
                />
                <circle cx="236" cy="216" r="10" fill={MAP_COLORS.gardenPlant} />
                <circle cx="292" cy="216" r="9" fill={MAP_COLORS.gardenPlant} />
                <circle cx="262" cy="252" r="12" fill={MAP_COLORS.gardenPlant} />
                <text x="265" y="268" textAnchor="middle" fontSize="14" fill={MAP_COLORS.buildingText} fontWeight="700">花圃</text>

                <rect
                  x="550"
                  y="178"
                  width="130"
                  height="130"
                  rx="4"
                  fill={MAP_COLORS.garden}
                  stroke={hoveredBuilding === "garden-right" ? MAP_COLORS.stallHover : MAP_COLORS.campusBorder}
                  strokeWidth="2.5"
                  onMouseEnter={() => setHoveredBuilding("garden-right")}
                  onMouseLeave={() => setHoveredBuilding(null)}
                  style={{ cursor: "pointer", transition: "stroke 0.15s ease" }}
                />
                <circle cx="586" cy="216" r="10" fill={MAP_COLORS.gardenPlant} />
                <circle cx="642" cy="216" r="9" fill={MAP_COLORS.gardenPlant} />
                <circle cx="612" cy="252" r="12" fill={MAP_COLORS.gardenPlant} />
                <text x="615" y="268" textAnchor="middle" fontSize="14" fill={MAP_COLORS.buildingText} fontWeight="700">花圃</text>

                <rect
                  x="360"
                  y="156"
                  width="160"
                  height="86"
                  rx="8"
                  fill={MAP_COLORS.stage}
                  stroke={MAP_COLORS.stageBorder}
                  strokeWidth="3"
                  onMouseEnter={() => setHoveredBuilding("stage")}
                  onMouseLeave={() => setHoveredBuilding(null)}
                  style={{ cursor: "pointer", transition: "stroke 0.15s ease" }}
                />
                <text x="440" y="208" textAnchor="middle" fontSize="30" fill={MAP_COLORS.buildingText} fontWeight="800">舞台</text>

                <g
                  onMouseEnter={() => setHoveredArrow("a")}
                  onMouseLeave={() => setHoveredArrow(null)}
                  style={{ cursor: "pointer" }}
                >
                  <path d="M 188 334 H 650" fill="none" stroke={hoveredArrow === "a" ? MAP_COLORS.stallHover : MAP_COLORS.road} strokeWidth="5" strokeLinecap="round" />
                  <path d="M 650 334 L 636 326 M 650 334 L 636 342" fill="none" stroke={hoveredArrow === "a" ? MAP_COLORS.stallHover : MAP_COLORS.road} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M 186 148 V 312" fill="none" stroke={hoveredArrow === "a" ? MAP_COLORS.stallHover : MAP_COLORS.road} strokeWidth="5" strokeLinecap="round" />
                  <path d="M 186 312 L 178 298 M 186 312 L 194 298" fill="none" stroke={hoveredArrow === "a" ? MAP_COLORS.stallHover : MAP_COLORS.road} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M 664 148 V 334" fill="none" stroke={hoveredArrow === "a" ? MAP_COLORS.stallHover : MAP_COLORS.road} strokeWidth="5" strokeLinecap="round" />
                  <path d="M 664 334 L 656 320 M 664 334 L 672 320" fill="none" stroke={hoveredArrow === "a" ? MAP_COLORS.stallHover : MAP_COLORS.road} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M 560 168 H 640" fill="none" stroke={hoveredArrow === "a" ? MAP_COLORS.stallHover : MAP_COLORS.road} strokeWidth="5" strokeLinecap="round" />
                  <path d="M 640 168 L 626 160 M 640 168 L 626 176" fill="none" stroke={hoveredArrow === "a" ? MAP_COLORS.stallHover : MAP_COLORS.road} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
                </g>

                {/* ── 獨立帳篷攤位 ── */}
                {tentIcons.map(tent => {
                  const isInteractive = typeof tent.stallId === "number";
                  const isHovered = isInteractive && hoveredId === tent.stallId;
                  const isSelected = isInteractive && selectedStall?.id === tent.stallId;
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
                        filter: isHovered || isSelected ? "url(#map-shadow)" : "none",
                      }}
                    >
                      <rect
                        x={tent.x + 2}
                        y={tent.y + 12}
                        width={20}
                        height={18}
                        rx="4"
                        fill={isHovered || isSelected ? MAP_COLORS.stallHover : MAP_COLORS.stallTent}
                        stroke={MAP_COLORS.campusBorder}
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
                        stroke={MAP_COLORS.campusBorder}
                        strokeWidth="1.8"
                        strokeLinejoin="round"
                      />
                      {isInteractive && (
                        <text
                          x={tent.x + 12}
                          y={tent.y + 25}
                          textAnchor="middle"
                          fontSize="9"
                          fontWeight="800"
                          fill="#6E2C47"
                          style={{ pointerEvents: "none" }}
                        >
                          {tent.stallId}
                        </text>
                      )}
                    </g>
                  );
                })}

                {/* 圖例 */}
                <rect x="86" y="420" width="16" height="16" rx="3" fill={MAP_COLORS.stallTent} stroke={MAP_COLORS.campusBorder} strokeWidth="2.5" />
                <text x="108" y="432" fontSize="12" fill={MAP_COLORS.road}>攤位（可點擊）</text>
                <rect x="205" y="420" width="16" height="16" rx="3" fill={MAP_COLORS.garden} stroke={MAP_COLORS.campusBorder} strokeWidth="2.5" />
                <text x="227" y="432" fontSize="12" fill={MAP_COLORS.road}>花圃</text>
                <rect x="320" y="420" width="16" height="16" rx="3" fill={MAP_COLORS.road} stroke={MAP_COLORS.roadAlt} strokeWidth="1.5" />
                <text x="342" y="432" fontSize="12" fill={MAP_COLORS.road}>動線</text>
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