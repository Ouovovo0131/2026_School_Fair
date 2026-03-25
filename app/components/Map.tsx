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

export default function Map({ onBack, isModal = false }: MapProps) {
  const [selectedStall, setSelectedStall] = useState<Stall | null>(null);
  const [hoveredId, setHoveredId] = useState<number | null>(null);
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
              <h1 className="text-3xl font-bold" style={{ color: "var(--text)" }}>
                🗺️ 校慶攤位地圖
              </h1>
              <p className="mt-1 text-base font-medium" style={{ color: "var(--primary)" }}>
                點擊藍色攤位框可查看詳情 ✨
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
                {/* ── 建築牆體填色 (淺灰) ── */}
                {/* 校園外框 */}
                <rect x="80" y="10" width="700" height="440" rx="4" fill="var(--surface)" stroke="var(--border)" strokeWidth="3" />

                {/* 科學館 */}
                <rect x="10" y="10" width="62" height="80" rx="3" fill="var(--surface-soft)" stroke="var(--border)" strokeWidth="2" />
                <text x="41" y="58" textAnchor="middle" fontSize="13" fill="var(--text)" fontWeight="600">科學館</text>

                {/* 大門 */}
                <rect x="160" y="10" width="80" height="46" rx="3" fill="var(--surface-soft)" stroke="var(--border)" strokeWidth="2" />
                <text x="200" y="38" textAnchor="middle" fontSize="13" fill="var(--text)" fontWeight="600">大門</text>

                {/* 新圖書館 */}
                <rect x="300" y="10" width="230" height="70" rx="3" fill="var(--surface-soft)" stroke="var(--border)" strokeWidth="2" />
                <text x="415" y="51" textAnchor="middle" fontSize="16" fill="var(--text)" fontWeight="600">新圖書館</text>

                {/* 舊圖書館 */}
                <rect x="590" y="10" width="140" height="70" rx="3" fill="var(--surface-soft)" stroke="var(--border)" strokeWidth="2" />
                <text x="660" y="51" textAnchor="middle" fontSize="15" fill="var(--text)" fontWeight="600">舊圖書館</text>

                {/* 綜合大樓 */}
                <rect x="80" y="10" width="68" height="440" rx="3" fill="var(--surface-soft)" stroke="var(--border)" strokeWidth="2" />
                <text x="114" y="220" textAnchor="middle" fontSize="13" fill="var(--text)" fontWeight="600"
                  transform="rotate(-90 114 220)">綜合大樓</text>

                {/* 信義樓 */}
                <rect x="730" y="160" width="50" height="260" rx="3" fill="var(--surface-soft)" stroke="var(--border)" strokeWidth="2" />
                <text x="755" y="298" textAnchor="middle" fontSize="13" fill="var(--text)" fontWeight="600"
                  transform="rotate(-90 755 298)">信義樓</text>

                {/* 左側小花園 */}
                <rect x="188" y="168" width="116" height="138" rx="3" fill="var(--surface)" stroke="var(--border)" strokeWidth="2" />
                <text x="246" y="243" textAnchor="middle" fontSize="14" fill="var(--primary)" fontWeight="600">小花園</text>

                {/* 右側小花園 */}
                <rect x="388" y="168" width="148" height="138" rx="3" fill="var(--surface)" stroke="var(--border)" strokeWidth="2" />
                <text x="462" y="243" textAnchor="middle" fontSize="14" fill="var(--primary)" fontWeight="600">小花園</text>

                {/* 忠孝樓 */}
                <rect x="188" y="360" width="440" height="82" rx="3" fill="var(--surface-soft)" stroke="var(--border)" strokeWidth="2" />
                <text x="408" y="408" textAnchor="middle" fontSize="16" fill="var(--text)" fontWeight="600">忠孝樓</text>

                {/* ── 攤位框框 (藍/紫色) ── */}
                {stallBoxes.map(box => {
                  const isHovered = hoveredId === box.id;
                  const isSelected = selectedStall?.id === box.id;
                  return (
                    <g key={box.id}>
                      <rect
                        x={box.x}
                        y={box.y}
                        width={box.w}
                        height={box.h}
                        rx="3"
                        fill={isSelected ? "rgba(255,140,0,0.55)" : isHovered ? "rgba(255,215,0,0.35)" : "rgba(255,255,255,0.7)"}
                        stroke={isSelected ? "var(--primary)" : "var(--secondary)"}
                        strokeWidth={isSelected ? 3.5 : 2.5}
                        style={{ cursor: "pointer", transition: "all 0.15s" }}
                        onClick={() => handleBoxClick(box.id)}
                        onMouseEnter={() => setHoveredId(box.id)}
                        onMouseLeave={() => setHoveredId(null)}
                      />
                      {/* 攤位編號小標 */}
                      <text
                        x={box.x + box.w / 2}
                        y={box.y + box.h / 2}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fontSize="11"
                        fontWeight="700"
                        fill={isSelected ? "var(--primary-hover)" : "var(--primary)"}
                        style={{ cursor: "pointer", pointerEvents: "none" }}
                      >
                        {box.id}
                      </text>
                    </g>
                  );
                })}

                {/* 圖例 */}
                <rect x="86" y="420" width="16" height="16" rx="2" fill="rgba(255,255,255,0.7)" stroke="var(--secondary)" strokeWidth="2.5" />
                <text x="108" y="432" fontSize="12" fill="var(--text)">攤位（可點擊）</text>
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
                    className="px-4 py-2 rounded-full font-bold text-sm transition-all"
                    style={{
                      background: filterCategory === cat.id 
                        ? 'linear-gradient(135deg, var(--primary), var(--primary-hover))'
                        : 'var(--surface-soft)',
                      color: filterCategory === cat.id ? 'white' : 'var(--text)',
                      border: filterCategory === cat.id 
                        ? '2px solid var(--primary-hover)'
                        : '1px solid var(--border)',
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
                      border: selectedStall?.id === stall.id ? "2.5px solid var(--primary)" : "1.5px solid var(--border)",
                      background: selectedStall?.id === stall.id
                        ? "linear-gradient(135deg,var(--primary-soft),var(--surface))"
                        : 'var(--surface)',
                    }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-2xl">{stall.icon}</span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: "var(--primary)", color: "white" }}>
                        {stall.highlight}
                      </span>
                    </div>
                    <p className="font-bold text-sm mt-1" style={{ color: "var(--text)" }}>{stall.name}</p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--primary)" }}>📍 {stall.location}</p>
                  </button>
                ))}
              </div>

              {filteredStalls.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-lg font-bold" style={{ color: 'var(--primary)' }}>
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
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 font-bold text-lg"
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