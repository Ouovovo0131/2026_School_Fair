"use client";
import { MapPin, ArrowLeft, Navigation } from "lucide-react";
import { useState } from "react";

interface MapProps {
  onBack?: () => void;
  isModal?: boolean;
}

export default function Map({ onBack, isModal = false }: MapProps) {
  const [selectedStall, setSelectedStall] = useState<number | null>(null);

  // 園遊會攤位數據
  const stalls = [
    { id: 1, name: "愛心便當區", location: "校園南邊", icon: "🍱", description: "提供美味的手作便當", highlight: "銷售冠軍" },
    { id: 2, name: "創意手工藝", location: "教室A棟", icon: "🎨", description: "DIY工作坊和手工品販售", highlight: "必買伴手禮" },
    { id: 3, name: "飲料吧台", location: "校園中心", icon: "🥤", description: "各式飲料和冰品", highlight: "解渴必選" },
    { id: 4, name: "烤肉燒烤", location: "操場邊", icon: "🍖", description: "現烤香噴噴的烤肉", highlight: "人氣王" },
    { id: 5, name: "遊戲區", location: "體育館", icon: "🎮", description: "各式室內小遊戲和競賽", highlight: "親子同樂" },
    { id: 6, name: "文創商品", location: "圖書館旁", icon: "📚", description: "校慶紀念品和文創商品", highlight: "時尚新貨" },
    { id: 7, name: "古早味點心", location: "宿舍區", icon: "🍡", description: "懷舊古早味小食", highlight: "IG打卡" },
    { id: 8, name: "健身運動", location: "校園東邊", icon: "💪", description: "運動器材體驗和示範", highlight: "增進健康" },
  ];

  const zones = [
    { id: 1, name: "校園南邊", color: "from-yellow-200 to-yellow-100", stallIds: [1] },
    { id: 2, name: "教室A棟", color: "from-blue-200 to-blue-100", stallIds: [2] },
    { id: 3, name: "校園中心", color: "from-pink-200 to-pink-100", stallIds: [3] },
    { id: 4, name: "操場邊", color: "from-green-200 to-green-100", stallIds: [4] },
    { id: 5, name: "體育館", color: "from-purple-200 to-purple-100", stallIds: [5] },
    { id: 6, name: "圖書館旁", color: "from-rose-200 to-rose-100", stallIds: [6] },
    { id: 7, name: "宿舍區", color: "from-amber-200 to-amber-100", stallIds: [7] },
    { id: 8, name: "校園東邊", color: "from-cyan-200 to-cyan-100", stallIds: [8] },
  ];

  return (
    <div
      className={
        isModal
          ? "fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto"
          : "min-h-screen"
      }
      style={
        !isModal ? { background: "linear-gradient(180deg, #d4e5f0 0%, #f5ede0 50%, #e8dcc8 100%)" } : {}
      }
    >
      <div className={isModal ? "w-full max-w-4xl bg-white rounded-2xl shadow-xl" : ""}>
        {/* 返回按鈕 */}
        {onBack && (
          <div className={isModal ? "p-4 border-b" : "p-6"}>
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-lg font-bold clay-button clay-button-blue"
            >
              <ArrowLeft className="w-5 h-5" />
              {isModal ? "關閉地圖" : "返回"}
            </button>
          </div>
        )}

        <div className={isModal ? "p-6" : "w-full px-4 py-6"}>
          <div className={isModal ? "" : "max-w-6xl mx-auto"}>
            {/* 標題 */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <MapPin className="w-8 h-8" style={{ color: "#a8d8e8" }} />
                <h1 className="text-4xl font-bold" style={{ color: "#3d3d3d" }}>
                  校慶攤位地圖
                </h1>
              </div>
              <p className="text-lg" style={{ color: "#6b6b6b", fontWeight: "500" }}>
                點擊攤位了解詳情 ✨
              </p>
            </div>

            {/* 地圖視圖 - 網格布局 */}
            <div className="premium-card clay-shadow-md p-8 mb-8">
              <h2 className="text-2xl font-bold mb-6" style={{ color: "#3d3d3d" }}>
                📍 攤位分佈
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {zones.map((zone) => (
                  <div
                    key={zone.id}
                    className={`bg-gradient-to-br ${zone.color} rounded-2xl p-6 cursor-pointer transition-all clay-float`}
                    onClick={() => setSelectedStall(zone.stallIds[0])}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <Navigation
                        className="w-6 h-6"
                        style={{ color: "#3d3d3d" }}
                      />
                      <span
                        className="text-sm font-bold px-2 py-1 rounded-full"
                        style={{
                          background: "rgba(255,255,255,0.7)",
                          color: "#3d3d3d",
                        }}
                      >
                        區域 {zone.id}
                      </span>
                    </div>
                    <h3 className="font-bold text-lg" style={{ color: "#3d3d3d" }}>
                      {zone.name}
                    </h3>
                    <p className="text-sm mt-2" style={{ color: "#6b6b6b" }}>
                      {stalls.filter((s) => zone.stallIds.includes(s.id)).length}{" "}
                      個攤位
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* 攤位列表 */}
            <div className="premium-card clay-shadow-md p-8">
              <h2 className="text-2xl font-bold mb-6" style={{ color: "#3d3d3d" }}>
                🏪 全部攤位
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {stalls.map((stall) => (
                  <div
                    key={stall.id}
                    className="premium-card clay-shadow-sm p-6 cursor-pointer transition-all hover:shadow-lg"
                    onClick={() => setSelectedStall(stall.id)}
                    style={{
                      border:
                        selectedStall === stall.id
                          ? "3px solid #f5a3c7"
                          : "1px solid rgba(0,0,0,0.1)",
                    }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="text-5xl">{stall.icon}</div>
                      <span
                        className="text-xs font-bold px-3 py-1 rounded-full"
                        style={{
                          background: "#f5a3c7",
                          color: "white",
                        }}
                      >
                        {stall.highlight}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold mb-2" style={{ color: "#3d3d3d" }}>
                      {stall.name}
                    </h3>
                    <p
                      className="text-sm mb-3"
                      style={{ color: "#6b6b6b", fontWeight: "500" }}
                    >
                      📍 {stall.location}
                    </p>
                    <p style={{ color: "#6b6b6b", fontSize: "14px" }}>
                      {stall.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* 詳情模態 */}
            {selectedStall && (
              <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 animate-bounce-in">
                  {(() => {
                    const stall = stalls.find((s) => s.id === selectedStall);
                    return (
                      <>
                        <button
                          onClick={() => setSelectedStall(null)}
                          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full"
                        >
                          ✕
                        </button>
                        <div className="text-6xl text-center mb-4">
                          {stall?.icon}
                        </div>
                        <h3
                          className="text-2xl font-bold text-center mb-2"
                          style={{ color: "#3d3d3d" }}
                        >
                          {stall?.name}
                        </h3>
                        <p
                          className="text-center text-sm mb-4"
                          style={{
                            background: "linear-gradient(90deg, #f5a3c7, #a8d8e8)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            fontWeight: "bold",
                          }}
                        >
                          ⭐ {stall?.highlight}
                        </p>
                        <div className="space-y-3 mb-6">
                          <div>
                            <p
                              className="text-xs font-bold mb-1"
                              style={{ color: "#a68080" }}
                            >
                              位置
                            </p>
                            <p style={{ color: "#3d3d3d", fontWeight: "500" }}>
                              📍 {stall?.location}
                            </p>
                          </div>
                          <div>
                            <p
                              className="text-xs font-bold mb-1"
                              style={{ color: "#a68080" }}
                            >
                              介紹
                            </p>
                            <p style={{ color: "#3d3d3d", fontWeight: "500" }}>
                              {stall?.description}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => setSelectedStall(null)}
                          className="w-full clay-button clay-button-blue py-3 font-bold"
                        >
                          關閉
                        </button>
                      </>
                    );
                  })()}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
