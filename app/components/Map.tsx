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

// ─── 攤位框框在地圖 SVG 中的位置 ──────────────────────────────────────────────
// 參照圖片手動定位每個藍框，坐標以 viewBox="0 0 800 460" 為基準
// 每個物件：{ id (對應 stall.id), x, y, w, h }
const stallBoxes = [
  // 左側小花園左邊的細長框 (A1)
  { id: 1, x: 158, y: 178, w: 28, h: 118 },
  // 左側小花園右邊的細長框 (A2)
  { id: 2, x: 272, y: 178, w: 28, h: 118 },
  // 中段兩個細長框左 (B1)
  { id: 4, x: 322, y: 178, w: 28, h: 118 },
  // 中段兩個細長框右 (B2)
  { id: 5, x: 358, y: 178, w: 28, h: 118 },
  // 右側小花園左邊的細長框 (C1)
  { id: 6, x: 544, y: 178, w: 28, h: 118 },
  // 右側小花園右邊的細長框 (C2)
  { id: 7, x: 590, y: 178, w: 28, h: 118 },
  // 信義樓左側最右邊的細長框 上 (D1 上)
  { id: 8, x: 634, y: 178, w: 28,  h: 56  },
  // 信義樓左側最右邊的細長框 下 (A3)
  { id: 3, x: 634, y: 280, w: 28,  h: 56  },
];

const MAP_COLORS = {
  building: "#1E4463",
  buildingText: "#FFFFFF",
  garden: "#FCF2CC",
  road: "#F8FAFC",
  roadAlt: "#E5E7EB",
  stall: "#FF8A26",
  stallHover: "#FFB00D",
  stage: "#BD2D19",
  stageBorder: "#000000",
  campusBorder: "#1E4463",
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
                點擊橘色攤位框可查看詳情 ✨
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
                    <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#1E4463" floodOpacity="0.18" />
                  </filter>
                </defs>

                <rect x="80" y="10" width="700" height="440" rx="8" fill="transparent" stroke={MAP_COLORS.campusBorder} strokeWidth="3" />

                <rect x="150" y="92" width="590" height="44" rx="18" fill={MAP_COLORS.roadAlt} opacity="0.7" pointerEvents="none" />
                <rect x="150" y="150" width="580" height="152" rx="20" fill={MAP_COLORS.road} opacity="0.95" pointerEvents="none" />
                <rect x="188" y="304" width="440" height="56" rx="16" fill={MAP_COLORS.roadAlt} opacity="0.92" pointerEvents="none" />

                <rect
                  x="10"
                  y="10"
                  width="62"
                  height="80"
                  rx="8"
                  fill={MAP_COLORS.building}
                  stroke={hoveredBuilding === "science" ? MAP_COLORS.stallHover : MAP_COLORS.building}
                  strokeWidth="3"
                  onMouseEnter={() => setHoveredBuilding("science")}
                  onMouseLeave={() => setHoveredBuilding(null)}
                  style={{ cursor: "pointer", transition: "stroke 0.15s ease, transform 0.15s ease" }}
                />
                <text x="41" y="58" textAnchor="middle" fontSize="13" fill={MAP_COLORS.buildingText} fontWeight="700">科學館</text>

                <rect
                  x="160"
                  y="10"
                  width="80"
                  height="46"
                  rx="8"
                  fill={MAP_COLORS.building}
                  stroke={hoveredBuilding === "gate" ? MAP_COLORS.stallHover : MAP_COLORS.building}
                  strokeWidth="3"
                  onMouseEnter={() => setHoveredBuilding("gate")}
                  onMouseLeave={() => setHoveredBuilding(null)}
                  style={{ cursor: "pointer", transition: "stroke 0.15s ease, transform 0.15s ease" }}
                />
                <text x="200" y="38" textAnchor="middle" fontSize="13" fill={MAP_COLORS.buildingText} fontWeight="700">大門</text>

                <rect
                  x="300"
                  y="10"
                  width="230"
                  height="70"
                  rx="8"
                  fill={MAP_COLORS.building}
                  stroke={hoveredBuilding === "library-new" ? MAP_COLORS.stallHover : MAP_COLORS.building}
                  strokeWidth="3"
                  onMouseEnter={() => setHoveredBuilding("library-new")}
                  onMouseLeave={() => setHoveredBuilding(null)}
                  style={{ cursor: "pointer", transition: "stroke 0.15s ease, transform 0.15s ease" }}
                />
                <text x="415" y="51" textAnchor="middle" fontSize="16" fill={MAP_COLORS.buildingText} fontWeight="700">新圖書館</text>

                <rect
                  x="590"
                  y="10"
                  width="140"
                  height="70"
                  rx="8"
                  fill={MAP_COLORS.building}
                  stroke={hoveredBuilding === "library-old" ? MAP_COLORS.stallHover : MAP_COLORS.building}
                  strokeWidth="3"
                  onMouseEnter={() => setHoveredBuilding("library-old")}
                  onMouseLeave={() => setHoveredBuilding(null)}
                  style={{ cursor: "pointer", transition: "stroke 0.15s ease, transform 0.15s ease" }}
                />
                <text x="660" y="51" textAnchor="middle" fontSize="15" fill={MAP_COLORS.buildingText} fontWeight="700">舊圖書館</text>

                <rect
                  x="80"
                  y="10"
                  width="68"
                  height="440"
                  rx="8"
                  fill={MAP_COLORS.building}
                  stroke={hoveredBuilding === "complex" ? MAP_COLORS.stallHover : MAP_COLORS.building}
                  strokeWidth="3"
                  onMouseEnter={() => setHoveredBuilding("complex")}
                  onMouseLeave={() => setHoveredBuilding(null)}
                  style={{ cursor: "pointer", transition: "stroke 0.15s ease, transform 0.15s ease" }}
                />
                <text x="114" y="220" textAnchor="middle" fontSize="13" fill={MAP_COLORS.buildingText} fontWeight="700" transform="rotate(-90 114 220)">綜合大樓</text>

                <rect
                  x="730"
                  y="160"
                  width="50"
                  height="260"
                  rx="8"
                  fill={MAP_COLORS.building}
                  stroke={hoveredBuilding === "xinyi" ? MAP_COLORS.stallHover : MAP_COLORS.building}
                  strokeWidth="3"
                  onMouseEnter={() => setHoveredBuilding("xinyi")}
                  onMouseLeave={() => setHoveredBuilding(null)}
                  style={{ cursor: "pointer", transition: "stroke 0.15s ease, transform 0.15s ease" }}
                />
                <text x="755" y="298" textAnchor="middle" fontSize="13" fill={MAP_COLORS.buildingText} fontWeight="700" transform="rotate(-90 755 298)">信義樓</text>

                <rect
                  x="188"
                  y="168"
                  width="116"
                  height="138"
                  rx="10"
                  fill={MAP_COLORS.garden}
                  stroke={hoveredBuilding === "garden-left" ? MAP_COLORS.stallHover : MAP_COLORS.campusBorder}
                  strokeWidth="2.5"
                  onMouseEnter={() => setHoveredBuilding("garden-left")}
                  onMouseLeave={() => setHoveredBuilding(null)}
                  style={{ cursor: "pointer", transition: "stroke 0.15s ease, transform 0.15s ease" }}
                />
                <text x="246" y="243" textAnchor="middle" fontSize="14" fill={MAP_COLORS.building} fontWeight="700">小花園</text>

                <rect
                  x="388"
                  y="168"
                  width="148"
                  height="138"
                  rx="10"
                  fill={MAP_COLORS.garden}
                  stroke={hoveredBuilding === "garden-right" ? MAP_COLORS.stallHover : MAP_COLORS.campusBorder}
                  strokeWidth="2.5"
                  onMouseEnter={() => setHoveredBuilding("garden-right")}
                  onMouseLeave={() => setHoveredBuilding(null)}
                  style={{ cursor: "pointer", transition: "stroke 0.15s ease, transform 0.15s ease" }}
                />
                <text x="462" y="243" textAnchor="middle" fontSize="14" fill={MAP_COLORS.building} fontWeight="700">小花園</text>

                <rect
                  x="334"
                  y="134"
                  width="132"
                  height="86"
                  rx="8"
                  fill={MAP_COLORS.stage}
                  stroke={MAP_COLORS.stageBorder}
                  strokeWidth="3"
                  onMouseEnter={() => setHoveredBuilding("stage")}
                  onMouseLeave={() => setHoveredBuilding(null)}
                  style={{ cursor: "pointer", transition: "stroke 0.15s ease, transform 0.15s ease" }}
                />
                <text x="400" y="183" textAnchor="middle" fontSize="18" fill={MAP_COLORS.buildingText} fontWeight="800">舞台</text>

                <rect
                  x="188"
                  y="360"
                  width="440"
                  height="82"
                  rx="8"
                  fill={MAP_COLORS.building}
                  stroke={hoveredBuilding === "zhongxiao" ? MAP_COLORS.stallHover : MAP_COLORS.building}
                  strokeWidth="3"
                  onMouseEnter={() => setHoveredBuilding("zhongxiao")}
                  onMouseLeave={() => setHoveredBuilding(null)}
                  style={{ cursor: "pointer", transition: "stroke 0.15s ease, transform 0.15s ease" }}
                />
                <text x="408" y="408" textAnchor="middle" fontSize="16" fill={MAP_COLORS.buildingText} fontWeight="700">忠孝樓</text>

                <g
                  onMouseEnter={() => setHoveredArrow("a")}
                  onMouseLeave={() => setHoveredArrow(null)}
                  style={{ cursor: "pointer" }}
                >
                  <path d="M 262 236 H 320" fill="none" stroke={hoveredArrow === "a" ? MAP_COLORS.stallHover : MAP_COLORS.building} strokeWidth="4" strokeLinecap="round" />
                  <path d="M 320 236 L 304 228 M 320 236 L 304 244" fill="none" stroke={hoveredArrow === "a" ? MAP_COLORS.stallHover : MAP_COLORS.building} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M 448 236 H 520" fill="none" stroke={hoveredArrow === "a" ? MAP_COLORS.stallHover : MAP_COLORS.building} strokeWidth="4" strokeLinecap="round" />
                  <path d="M 520 236 L 504 228 M 520 236 L 504 244" fill="none" stroke={hoveredArrow === "a" ? MAP_COLORS.stallHover : MAP_COLORS.building} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M 180 382 H 648" fill="none" stroke={hoveredArrow === "a" ? MAP_COLORS.stallHover : MAP_COLORS.building} strokeWidth="4" strokeLinecap="round" />
                  <path d="M 648 382 L 632 374 M 648 382 L 632 390" fill="none" stroke={hoveredArrow === "a" ? MAP_COLORS.stallHover : MAP_COLORS.building} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                </g>

                {/* ── 攤位框框 ── */}
                {stallBoxes.map(box => {
                  const isHovered = hoveredId === box.id;
                  const isSelected = selectedStall?.id === box.id;
                  const scale = isHovered ? 1.1 : isSelected ? 1.06 : 1;
                  return (
                    <g
                      key={box.id}
                      onClick={() => handleBoxClick(box.id)}
                      onMouseEnter={() => setHoveredId(box.id)}
                      onMouseLeave={() => setHoveredId(null)}
                      style={{
                        cursor: "pointer",
                        transition: "transform 0.15s ease, filter 0.15s ease",
                        transformBox: "fill-box",
                        transformOrigin: "center",
                        transform: `scale(${scale})`,
                        filter: isHovered || isSelected ? "url(#map-shadow)" : "none",
                      }}
                    >
                      <rect
                        x={box.x}
                        y={box.y + 8}
                        width={box.w}
                        height={box.h - 8}
                        rx="6"
                        fill={isHovered || isSelected ? MAP_COLORS.stallHover : MAP_COLORS.stall}
                        stroke={isSelected ? MAP_COLORS.building : MAP_COLORS.campusBorder}
                        strokeWidth={isSelected ? 3.5 : 2.5}
                      />
                      <polygon
                        points={`${box.x + 2},${box.y + 10} ${box.x + box.w / 2},${box.y} ${box.x + box.w - 2},${box.y + 10}`}
                        fill={isHovered || isSelected ? MAP_COLORS.stallHover : MAP_COLORS.stall}
                        stroke={isSelected ? MAP_COLORS.building : MAP_COLORS.campusBorder}
                        strokeWidth={isSelected ? 3.5 : 2.5}
                        strokeLinejoin="round"
                      />
                      <rect
                        x={box.x + 4}
                        y={box.y + 18}
                        width={box.w - 8}
                        height={Math.max(18, box.h - 26)}
                        rx="5"
                        fill={isHovered || isSelected ? MAP_COLORS.stallHover : MAP_COLORS.stall}
                        stroke="none"
                      />
                      {/* 攤位編號小標 */}
                      <text
                        x={box.x + box.w / 2}
                        y={box.y + box.h / 2 + 3}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fontSize="10"
                        fontWeight="800"
                        fill={MAP_COLORS.building}
                        style={{ cursor: "pointer", pointerEvents: "none" }}
                      >
                        {box.id}
                      </text>
                    </g>
                  );
                })}

                {/* 圖例 */}
                <rect x="86" y="420" width="16" height="16" rx="3" fill={MAP_COLORS.stall} stroke={MAP_COLORS.campusBorder} strokeWidth="2.5" />
                <text x="108" y="432" fontSize="12" fill={MAP_COLORS.building}>攤位（可點擊）</text>
                <rect x="205" y="420" width="16" height="16" rx="3" fill={MAP_COLORS.garden} stroke={MAP_COLORS.campusBorder} strokeWidth="2.5" />
                <text x="227" y="432" fontSize="12" fill={MAP_COLORS.building}>花園 / 空地</text>
                <rect x="320" y="420" width="16" height="16" rx="3" fill={MAP_COLORS.road} stroke={MAP_COLORS.roadAlt} strokeWidth="1.5" />
                <text x="342" y="432" fontSize="12" fill={MAP_COLORS.building}>道路</text>
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