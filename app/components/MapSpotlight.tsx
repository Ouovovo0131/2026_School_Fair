"use client";

import { X } from "lucide-react";
import { STALL_CATEGORIES, type StallCategory, type StallId } from "@/constants/stalls";

export interface SpotlightState {
  stallId: StallId;
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
    craft: "#A78BFA",
    food: "#EC4899",
    class: BAUHAUS_COLORS.blue,
    student: BAUHAUS_COLORS.black,
    other: BAUHAUS_COLORS.red,
  };
  return categoryColors[cat];
};

const getCategoryBadgeStyle = (category: StallCategory | StallCategory[]) => {
  const cat = Array.isArray(category) ? category[0] : category;

  if (cat === "student") {
    return {
      backgroundColor: BAUHAUS_COLORS.black,
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
  viewBoxOffset: number;
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

        {/* 分割線 */}
        <div
          style={{
            height: "3px",
            background: "#121212",
            marginBottom: "1.25rem",
            borderRadius: 0,
          }}
        />

        {/* 內容描述 */}
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

        {/* 底部安全區域 */}
        <div style={{ height: "1rem" }} />
      </div>
    </div>
  );
}


