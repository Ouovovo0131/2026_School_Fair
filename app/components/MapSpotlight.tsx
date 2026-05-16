"use client";

import { X } from "lucide-react";
import { STALL_CATEGORIES, type StallCategory } from "@/constants/stalls";

export interface SpotlightState {
  stallId: string;
  stallName: string;
  stallContent: string;
  stallCategory: StallCategory | StallCategory[];
  position: { x: number; y: number; w: number; h: number };
}

const BAUHAUS_COLORS = {
  red: "#D02020",
  blue: "#1040C0",
  yellow: "#F0C020",
  black: "#121212",
  white: "#FFFFFF",
};

const getCategoryColor = (category: StallCategory | StallCategory[]): string => {
  const cat = Array.isArray(category) ? category[0] : category;
  const categoryColors: Record<StallCategory, string> = {
    vip: BAUHAUS_COLORS.red,
    snack: "#F97316",
    beverage: "#0EA5E9",
    game: BAUHAUS_COLORS.yellow,
    bracelet: "#A78BFA",
    student: BAUHAUS_COLORS.black,
    other: BAUHAUS_COLORS.red,
  };
  return categoryColors[cat];
};

const getCategoryBadgeStyle = (category: StallCategory | StallCategory[]) => {
  const cat = Array.isArray(category) ? category[0] : category;

  if (cat === "student") {
            minHeight: "420px",
      borderColor: BAUHAUS_COLORS.yellow,
      color: BAUHAUS_COLORS.yellow,
    };
  }

  const backgroundColor = getCategoryColor(category);

  return {
    backgroundColor,
    borderColor: BAUHAUS_COLORS.black,
    color: backgroundColor === BAUHAUS_COLORS.yellow ? BAUHAUS_COLORS.black : BAUHAUS_COLORS.white,
  };
};

const getCategoryLabel = (category: StallCategory | StallCategory[]): string => {
  const cat = Array.isArray(category) ? category[0] : category;
  return STALL_CATEGORIES[cat];
};

const parseLibraryStallItems = (content: string) => {
  return content
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => /^\d+\./.test(line))
    .map((line) => {
      const match = line.match(/^(\d+)\.\s*(.+)$/);
      return {
        number: match?.[1] ?? "",
        name: match?.[2] ?? line,
      };
    });
};

/**
 * SVG聚光燈overlay - Bauhaus風格
 * 圓形聚光燈 + 硬邊框 + 暗化背景
 */
export function SpotlightOverlay({
  spotlight,
  svgWidth,
  svgHeight,
  viewBoxOffset,
}: {
  spotlight: SpotlightState;
  svgWidth: number;
  svgHeight: number;
            maxHeight: "70vh",
}) {
  const SPOTLIGHT_RADIUS = 70;
  const spotX = spotlight.position.x + spotlight.position.w / 2;
  const spotY = spotlight.position.y + spotlight.position.h / 2;

  // 計算SVG座標 -> 實際DOM座標的比例
  const viewBoxWidth = 950;
  const viewBoxHeight = 760;
  const scaleX = svgWidth / viewBoxWidth;
  const scaleY = svgHeight / viewBoxHeight;

  const domX = (spotX - viewBoxOffset) * scaleX;
  const domY = spotY * scaleY;
  const domRadius = SPOTLIGHT_RADIUS * scaleX;

  return (
    <>
      {/* 半透明暗化背景 */}
      <rect x={0} y={0} width={svgWidth} height={svgHeight} fill="#000000" opacity={0.65} />

      {/* 聚光燈圓形 - 使用mask */}
      <defs>
        <mask id="spotlight-mask">
          <rect x={0} y={0} width={svgWidth} height={svgHeight} fill="white" />
          <circle cx={domX} cy={domY} r={domRadius} fill="black" />
        </mask>
      </defs>

      {/* 應用mask的黑色矩形 */}
      <rect
        x={0}
        y={0}
        width={svgWidth}
        height={svgHeight}
        fill="#000000"
        opacity={0.65}
        mask="url(#spotlight-mask)"
      />

      {/* Bauhaus風格的聚光燈邊框 - 硬邊+ 紅色 */}
      <circle
        cx={domX}
        cy={domY}
        r={domRadius}
        fill="none"
        stroke={BAUHAUS_COLORS.red}
        strokeWidth={3}
        opacity={0.9}
      />

      {/* 內層邊框 - 細線 */}
      <circle
        cx={domX}
        cy={domY}
        r={domRadius - 6}
        fill="none"
        stroke={BAUHAUS_COLORS.red}
        strokeWidth={1}
        opacity={0.6}
      />
    </>
  );
}

/**
 * 下方詳情面板 - Bauhaus風格
 */
export function StallDetailPanel({
  spotlight,
  onClose,
}: {
  spotlight: SpotlightState;
  onClose: () => void;
}) {
  const categoryBadgeStyle = getCategoryBadgeStyle(spotlight.stallCategory);
  const categoryLabel = getCategoryLabel(spotlight.stallCategory);
  const isLibraryBuilding = spotlight.stallId === "library-building";
  const libraryItems = parseLibraryStallItems(spotlight.stallContent);

  const mapCellStyle = (active?: boolean) => ({
    position: "absolute" as const,
    border: "2px solid #111111",
    background: active ? "#F0C020" : "#FFFFFF",
    boxShadow: "2px 2px 0 rgba(0,0,0,0.18)",
    color: "#111111",
    fontWeight: 900,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    lineHeight: 1,
  });

  const LibraryMiniMap = () => (
    <div
      style={{
        border: "4px solid #111111",
        borderRadius: 0,
        height: "100%",
        minHeight: 0,
        background: "#fafafa",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div style={{ position: "absolute", inset: "10px", border: "2px solid #111111", background: "#fcfcfc" }} />

      <div style={{ position: "absolute", top: "12px", left: "16px", right: "16px", display: "flex", justifyContent: "space-between", alignItems: "baseline", zIndex: 2 }}>
        <div style={{ fontSize: "clamp(22px, 3.3vw, 36px)", fontWeight: 900, color: "#111111", lineHeight: 1 }}>圖資</div>
        <div style={{ fontSize: "clamp(18px, 2.8vw, 30px)", fontWeight: 900, color: "#111111", lineHeight: 1 }}>大樓</div>
      </div>

      <div style={{ position: "absolute", left: "16px", top: "54px", right: "16px", bottom: "16px" }}>
        <div style={{ position: "absolute", left: "10px", right: "10px", top: "14%", height: "28%", border: "2px solid #111111", background: "#FFFFFF" }}>
          <div style={{ position: "absolute", left: "14px", top: "10px", fontSize: "clamp(12px, 1.8vw, 18px)", fontWeight: 900, color: "#111827" }}>室內</div>
          <div style={{ position: "absolute", left: "14px", top: "36px", fontSize: "clamp(20px, 3.2vw, 30px)", fontWeight: 900, color: "#111827" }}>表演團體休息區</div>
          <div style={{ position: "absolute", left: "14px", bottom: "10px", fontSize: "clamp(11px, 1.6vw, 14px)", fontWeight: 700, color: "#4b5563" }}>室內提供表演團體休息與整理空間</div>
        </div>

        <div style={{ position: "absolute", left: 0, right: 0, top: "48%", borderTop: "2px solid #111111" }} />
        <div style={{ position: "absolute", left: "12px", top: "49%", fontSize: "clamp(12px, 1.8vw, 16px)", fontWeight: 900, color: "#111111" }}>南門</div>
        <div style={{ position: "absolute", left: "12px", top: "52%", fontSize: "clamp(12px, 1.8vw, 16px)", fontWeight: 900, color: "#111111" }}>室外小涼亭</div>

        <div style={{ position: "absolute", left: "12px", right: "12px", top: "56%", bottom: "12px", border: "2px solid #111111", background: "#fcfcfc" }}>
          <div style={{ position: "absolute", left: "12px", top: "10px", fontWeight: 900, fontSize: "clamp(12px, 1.8vw, 18px)", color: "#111827" }}>L 型攤位區</div>

          <div style={{ position: "absolute", left: "12px", right: "12px", top: "36px", bottom: "12px" }}>
            <div style={{ ...mapCellStyle(true), left: "4%", top: "8%", width: "15%", height: "22%" }}>1</div>
            <div style={{ ...mapCellStyle(), left: "22%", top: "8%", width: "15%", height: "22%" }}>2</div>
            <div style={{ ...mapCellStyle(), left: "40%", top: "8%", width: "15%", height: "22%" }}>3</div>
            <div style={{ ...mapCellStyle(), left: "4%", top: "34%", width: "15%", height: "22%" }}>4</div>
            <div style={{ ...mapCellStyle(), left: "4%", top: "60%", width: "15%", height: "22%" }}>5</div>
            <div style={{ ...mapCellStyle(), left: "22%", top: "60%", width: "15%", height: "22%" }}>6</div>
            <div style={{ position: "absolute", right: "7%", bottom: "8%", fontSize: "clamp(11px, 1.7vw, 14px)", fontWeight: 900, color: "#6b7280" }}>L 型排列</div>
          </div>
        </div>
      </div>
    </div>
  );

  const LibraryDetails = () => (
    <div
      style={{
        height: "100%",
        minHeight: 0,
        border: "4px solid #111111",
        background: "#FFFFFF",
        boxShadow: "4px 4px 0 rgba(0,0,0,0.14)",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <div style={{ position: "absolute", inset: 0, display: "grid", gridTemplateColumns: "minmax(300px, 1.05fr) minmax(240px, 0.95fr)" }}>
        <div style={{ padding: "0.9rem", minHeight: 0 }}>
          <LibraryMiniMap />
        </div>

        <div style={{ borderLeft: "4px solid #111111", padding: "0.95rem 1rem", minHeight: 0, overflowY: "auto", background: "#fcfcfc" }}>
          <div style={{ fontSize: "clamp(28px, 4vw, 46px)", fontWeight: 900, lineHeight: 1, color: "#111111" }}>圖資大樓</div>
          <div style={{ marginTop: "0.45rem", fontSize: "clamp(14px, 2vw, 18px)", fontWeight: 800, color: "#4b5563" }}>室內：表演團體休息區</div>
          <div style={{ marginTop: "0.2rem", fontSize: "clamp(14px, 2vw, 18px)", fontWeight: 800, color: "#4b5563" }}>室外：L 型小涼亭攤位區</div>

          <div style={{ height: "2px", background: "#111111", margin: "0.9rem 0" }} />

          <div style={{ fontSize: "clamp(18px, 2.8vw, 24px)", fontWeight: 900, marginBottom: "0.65rem", color: "#111111" }}>攤位簡介</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.55rem" }}>
            {libraryItems.map((item, index) => (
              <div key={item.number} style={{ paddingBottom: index === libraryItems.length - 1 ? 0 : "0.55rem", borderBottom: index === libraryItems.length - 1 ? "none" : "1px dashed #9ca3af" }}>
                <div style={{ display: "flex", gap: "0.4rem", alignItems: "baseline", flexWrap: "wrap" }}>
                  <span style={{ fontSize: "clamp(15px, 2.3vw, 19px)", fontWeight: 900, color: "#111111" }}>{item.number}.</span>
                  <span style={{ fontSize: "clamp(15px, 2.3vw, 19px)", fontWeight: 900, color: "#111111" }}>{item.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        background: "#FFFFFF",
        borderTop: "4px solid #121212",
        boxShadow: "0 -6px 0 rgba(0,0,0,0.15)",
        zIndex: 90,
        maxHeight: "45vh",
        overflowY: "auto",
        animation: "slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
      }}
    >
      <style>{`
        @keyframes slideUp {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>

      <div style={{ padding: "1.5rem 1rem" }}>
        {/* 頭部：關閉按鈕 + 分類徽章 */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
          <div style={{ flex: 1, paddingRight: "1rem" }}>
            <h2
              style={{
                margin: 0,
                fontSize: "clamp(20px, 5vw, 28px)",
                fontWeight: 800,
                color: "#121212",
                fontFamily: "Outfit, sans-serif",
                lineHeight: 1.1,
                letterSpacing: "-0.02em",
              }}
            >
              {spotlight.stallName}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: BAUHAUS_COLORS.black,
              border: "none",
              borderRadius: 0,
              color: "#FFFFFF",
              width: "40px",
              height: "40px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              flexShrink: 0,
              boxShadow: "3px 3px 0 rgba(0,0,0,0.2)",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.transform = "translate(-1px, -1px)";
              (e.currentTarget as HTMLElement).style.boxShadow = "4px 4px 0 rgba(0,0,0,0.3)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.transform = "translate(0, 0)";
              (e.currentTarget as HTMLElement).style.boxShadow = "3px 3px 0 rgba(0,0,0,0.2)";
            }}
          >
            <X size={20} strokeWidth={3} />
          </button>
        </div>

        {/* 分類徽章 */}
        {!isLibraryBuilding && (
          <div
            style={{
              display: "inline-block",
              backgroundColor: categoryBadgeStyle.backgroundColor,
              color: categoryBadgeStyle.color,
              padding: "0.5rem 1rem",
              fontSize: "12px",
              fontWeight: 700,
              border: `2px solid ${categoryBadgeStyle.borderColor}`,
              borderRadius: 0,
              marginBottom: "1.25rem",
              fontFamily: "Outfit, sans-serif",
              letterSpacing: "0.05em",
              boxShadow: `3px 3px 0 ${categoryBadgeStyle.borderColor}`,
            }}
          >
            {categoryLabel}
          </div>
        )}

        {/* 分割線 */}
        <div
          style={{
            height: "3px",
            background: "#121212",
            marginBottom: "1.25rem",
            borderRadius: 0,
          }}
        />

        {/* 內容描述（支援特殊建築樣式） */}
        {isLibraryBuilding ? (
          <LibraryDetails />
        ) : (
          <p
            style={{
              margin: 0,
              fontSize: "clamp(14px, 4vw, 16px)",
              lineHeight: 1.7,
              color: "#334155",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              fontFamily: "system-ui, -apple-system, sans-serif",
            }}
          >
            {spotlight.stallContent}
          </p>
        )}

        {/* 底部安全區域 */}
        <div style={{ height: "1rem" }} />
      </div>
    </div>
  );
}


