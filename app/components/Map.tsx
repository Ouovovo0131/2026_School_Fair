"use client";

import { ArrowLeft, Trash2, UtensilsCrossed } from "lucide-react";
import { useMemo, useState } from "react";

interface MapProps {
  onBack?: () => void;
  isModal?: boolean;
}

type FeatureType = "stall" | "building" | "facility" | "zone";

interface RectFeature {
  id: string;
  domId: string;
  label: string;
  type: FeatureType;
  x: number;
  y: number;
  w: number;
  h: number;
  fill: string;
  verticalText?: boolean;
  rounded?: number;
}

interface ModalState {
  title: string;
  message: string;
  id: string;
}

const COLORS = {
  mapBg: "#f2f2f2",
  grass: "#c9ddcb",
  building: "#efefef",
  stroke: "#8e8e8e",
  stage: "#fbfbfb",
  stallBlue: "#dceaf8",
  stallPink: "#f3dee5",
  stallIvory: "#f8f5ea",
  text: "#2f2f2f",
};

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

const estimateCharUnits = (label: string) =>
  Array.from(label).reduce((sum, ch) => sum + (/[0-9A-Za-z]/.test(ch) ? 0.62 : 1), 0);

const fittedFontSize = (label: string, w: number, h: number, vertical = false) => {
  const pad = 8;
  if (vertical) {
    const byHeight = ((h - pad * 2) / Math.max(label.length, 1)) * 0.95;
    const byWidth = w - pad * 2;
    return clamp(Math.floor(Math.min(byHeight, byWidth)), 11, 34);
  }

  const units = Math.max(estimateCharUnits(label), 1);
  const byWidth = ((w - pad * 2) / units) * 0.95;
  const byHeight = (h - pad * 2) * 0.78;
  return clamp(Math.floor(Math.min(byWidth, byHeight)), 11, 34);
};

function Modal({
  title,
  message,
  onClose,
}: {
  title: string;
  message: string;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-3 flex items-start justify-between gap-3">
          <h3 className="text-xl font-extrabold text-slate-800">{title}</h3>
          <button
            type="button"
            className="rounded-full border border-slate-300 px-3 py-1 text-sm font-bold text-slate-600"
            onClick={onClose}
          >
            關閉
          </button>
        </div>
        <p className="text-sm leading-7 text-slate-700">{message}</p>
      </div>
    </div>
  );
}

function FeatureText({ feature }: { feature: RectFeature }) {
  if (feature.id === "stage") {
    const size = clamp(Math.floor(Math.min((feature.w - 16) / 2.1, (feature.h - 16) / 2.2)), 15, 34);
    return (
      <>
        <text
          x={feature.x + feature.w / 2}
          y={feature.y + feature.h / 2 - size * 0.15}
          textAnchor="middle"
          fill={COLORS.text}
          fontSize={size}
          fontWeight={700}
          style={{ pointerEvents: "none", userSelect: "none" }}
        >
          表演
        </text>
        <text
          x={feature.x + feature.w / 2}
          y={feature.y + feature.h / 2 + size * 0.95}
          textAnchor="middle"
          fill={COLORS.text}
          fontSize={size}
          fontWeight={700}
          style={{ pointerEvents: "none", userSelect: "none" }}
        >
          舞台
        </text>
      </>
    );
  }

  if (feature.verticalText) {
    const size = fittedFontSize(feature.label, feature.w, feature.h, true);
    const lineHeight = size * 1.08;
    const totalHeight = feature.label.length * lineHeight;
    const startY = feature.y + (feature.h - totalHeight) / 2 + size;

    return (
      <text
        x={feature.x + feature.w / 2}
        y={startY}
        textAnchor="middle"
        fill={COLORS.text}
        fontSize={size}
        fontWeight={700}
        style={{ pointerEvents: "none", userSelect: "none" }}
      >
        {feature.label.split("").map((char, idx) => (
          <tspan key={`${feature.id}-${idx}`} x={feature.x + feature.w / 2} dy={idx === 0 ? 0 : lineHeight}>
            {char}
          </tspan>
        ))}
      </text>
    );
  }

  const size = fittedFontSize(feature.label, feature.w, feature.h, false);
  return (
    <text
      x={feature.x + feature.w / 2}
      y={feature.y + feature.h / 2 + size * 0.34}
      textAnchor="middle"
      fill={COLORS.text}
      fontSize={size}
      fontWeight={700}
      style={{ pointerEvents: "none", userSelect: "none" }}
    >
      {feature.label}
    </text>
  );
}

function SvgRectButton({
  feature,
  selected,
  onActivate,
}: {
  feature: RectFeature;
  selected: boolean;
  onActivate: () => void;
}) {
  return (
    <a
      id={feature.domId}
      href="#"
      role="button"
      tabIndex={0}
      aria-label={feature.label || feature.id}
      onClick={(event) => {
        event.preventDefault();
        onActivate();
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onActivate();
        }
      }}
      style={{ cursor: "pointer" }}
    >
      <rect
        x={feature.x}
        y={feature.y}
        width={feature.w}
        height={feature.h}
        rx={feature.rounded ?? 8}
        fill={feature.fill}
        stroke={COLORS.stroke}
        strokeWidth={selected ? 3 : 1.2}
      />
      {feature.label ? <FeatureText feature={feature} /> : null}
    </a>
  );
}

export default function Map({ onBack, isModal = false }: MapProps) {
  const [modalState, setModalState] = useState<ModalState | null>(null);

  const stallFeatures = useMemo<RectFeature[]>(
    () => [
      { id: "21", domId: "stall_21", label: "21", type: "stall", x: 284, y: 26, w: 42, h: 39, fill: COLORS.stallBlue },
      { id: "20", domId: "stall_20", label: "20", type: "stall", x: 284, y: 69, w: 42, h: 39, fill: COLORS.stallBlue },
      { id: "19", domId: "stall_19", label: "19", type: "stall", x: 284, y: 112, w: 42, h: 39, fill: COLORS.stallBlue },
      { id: "18", domId: "stall_18", label: "18", type: "stall", x: 284, y: 155, w: 42, h: 39, fill: COLORS.stallBlue },
      { id: "17", domId: "stall_17", label: "17", type: "stall", x: 284, y: 198, w: 42, h: 39, fill: COLORS.stallBlue },
      { id: "16", domId: "stall_16", label: "16", type: "stall", x: 284, y: 241, w: 42, h: 39, fill: COLORS.stallBlue },
      { id: "15", domId: "stall_15", label: "15", type: "stall", x: 284, y: 284, w: 42, h: 39, fill: COLORS.stallBlue },
      { id: "14", domId: "stall_14", label: "14", type: "stall", x: 284, y: 327, w: 42, h: 40, fill: COLORS.stallBlue },

      { id: "13", domId: "stall_13", label: "13", type: "stall", x: 378, y: 120, w: 42, h: 41, fill: COLORS.stallBlue },
      { id: "12", domId: "stall_12", label: "12", type: "stall", x: 378, y: 165, w: 42, h: 42, fill: COLORS.stallBlue },

      { id: "11", domId: "stall_11", label: "11", type: "stall", x: 642, y: 133, w: 38, h: 37, fill: COLORS.stallBlue },
      { id: "10", domId: "stall_10", label: "10", type: "stall", x: 642, y: 174, w: 38, h: 38, fill: COLORS.stallBlue },
      { id: "9", domId: "stall_9", label: "9", type: "stall", x: 642, y: 216, w: 38, h: 40, fill: COLORS.stallBlue },

      { id: "8", domId: "stall_8", label: "8", type: "stall", x: 686, y: 133, w: 38, h: 37, fill: COLORS.stallBlue },
      { id: "7", domId: "stall_7", label: "7", type: "stall", x: 686, y: 174, w: 38, h: 38, fill: COLORS.stallBlue },
      { id: "6", domId: "stall_6", label: "6", type: "stall", x: 686, y: 216, w: 38, h: 40, fill: COLORS.stallBlue },

      { id: "5", domId: "stall_5", label: "5", type: "stall", x: 860, y: 95, w: 42, h: 36, fill: COLORS.stallBlue },
      { id: "4", domId: "stall_4", label: "4", type: "stall", x: 860, y: 135, w: 42, h: 39, fill: COLORS.stallBlue },
      { id: "3", domId: "stall_3", label: "3", type: "stall", x: 860, y: 178, w: 42, h: 44, fill: COLORS.stallBlue },
      { id: "2", domId: "stall_2", label: "2", type: "stall", x: 860, y: 226, w: 42, h: 40, fill: COLORS.stallBlue },
      { id: "1", domId: "stall_1", label: "1", type: "stall", x: 860, y: 270, w: 42, h: 56, fill: COLORS.stallPink },
      { id: "班", domId: "stall_class", label: "班", type: "stall", x: 860, y: 328, w: 42, h: 46, fill: COLORS.stallPink },

      { id: "貴A", domId: "stall_vip_1", label: "貴", type: "stall", x: 642, y: 258, w: 38, h: 40, fill: COLORS.stallBlue },
      { id: "貴B", domId: "stall_vip_2", label: "貴", type: "stall", x: 686, y: 258, w: 38, h: 40, fill: COLORS.stallBlue },
    ],
    []
  );

  const buildingFeatures = useMemo<RectFeature[]>(
    () => [
      {
        id: "student-affairs",
        domId: "building_student_affairs",
        label: "學務處",
        type: "building",
        x: 420,
        y: 18,
        w: 180,
        h: 44,
        fill: COLORS.building,
      },
      {
        id: "academic-affairs",
        domId: "building_academic_affairs",
        label: "教務處",
        type: "building",
        x: 620,
        y: 18,
        w: 180,
        h: 44,
        fill: COLORS.building,
      },
      {
        id: "xinyi",
        domId: "building_xinyi",
        label: "信義樓",
        type: "building",
        x: 210,
        y: 20,
        w: 62,
        h: 525,
        fill: COLORS.building,
        verticalText: true,
      },
      {
        id: "complex",
        domId: "building_complex",
        label: "綜合大樓",
        type: "building",
        x: 1008,
        y: 84,
        w: 64,
        h: 430,
        fill: COLORS.building,
        verticalText: true,
      },
      {
        id: "old-library",
        domId: "building_old_library",
        label: "舊圖書館",
        type: "building",
        x: 275,
        y: 550,
        w: 188,
        h: 118,
        fill: COLORS.building,
      },
      {
        id: "library-building",
        domId: "building_library_building",
        label: "圖資大樓",
        type: "building",
        x: 520,
        y: 550,
        w: 308,
        h: 118,
        fill: COLORS.building,
      },
      {
        id: "office",
        domId: "building_office",
        label: "傳達室",
        type: "building",
        x: 980,
        y: 555,
        w: 80,
        h: 115,
        fill: COLORS.building,
        verticalText: true,
      },
      {
        id: "gate",
        domId: "building_gate",
        label: "大門",
        type: "building",
        x: 865,
        y: 670,
        w: 120,
        h: 60,
        fill: COLORS.building,
      },
      {
        id: "stage",
        domId: "building_stage",
        label: "表演舞台",
        type: "building",
        x: 600,
        y: 400,
        w: 150,
        h: 150,
        fill: COLORS.stage,
        rounded: 9,
      },
    ],
    []
  );

  const otherFeatures = useMemo<RectFeature[]>(
    () => [
      {
        id: "lawn-left",
        domId: "zone_lawn_left",
        label: "",
        type: "zone",
        x: 430,
        y: 62,
        w: 205,
        h: 320,
        fill: COLORS.grass,
        rounded: 10,
      },
      {
        id: "lawn-right",
        domId: "zone_lawn_right",
        label: "",
        type: "zone",
        x: 735,
        y: 62,
        w: 205,
        h: 320,
        fill: COLORS.grass,
        rounded: 10,
      },

      {
        id: "female-left-1",
        domId: "facility_female_left_1",
        label: "女",
        type: "facility",
        x: 378,
        y: 212,
        w: 42,
        h: 46,
        fill: COLORS.stallBlue,
      },
      {
        id: "female-left-2",
        domId: "facility_female_left_2",
        label: "女",
        type: "facility",
        x: 378,
        y: 262,
        w: 42,
        h: 46,
        fill: COLORS.stallBlue,
      },

      {
        id: "female-center-1",
        domId: "facility_female_center_1",
        label: "女",
        type: "facility",
        x: 434,
        y: 366,
        w: 40,
        h: 40,
        fill: COLORS.stallPink,
      },
      {
        id: "female-center-2",
        domId: "facility_female_center_2",
        label: "女",
        type: "facility",
        x: 476,
        y: 366,
        w: 40,
        h: 40,
        fill: COLORS.stallPink,
      },
      {
        id: "female-center-3",
        domId: "facility_female_center_3",
        label: "女",
        type: "facility",
        x: 518,
        y: 366,
        w: 40,
        h: 40,
        fill: COLORS.stallPink,
      },

      {
        id: "audio-room",
        domId: "facility_audio_room",
        label: "音",
        type: "facility",
        x: 760,
        y: 556,
        w: 36,
        h: 34,
        fill: "#ececec",
      },
    ],
    []
  );

  const selectedId = modalState?.id;

  const onStallClick = (feature: RectFeature) => {
    setModalState({
      id: feature.id,
      title: feature.label === "班" ? "班級服務台" : `攤位 ${feature.label}`,
      message: `[攤位名稱]販售：[販售內容]`,
    });
  };

  const onBuildingClick = (feature: RectFeature) => {
    const buildingName = feature.id === "stage" ? "表演舞台" : feature.label;
    setModalState({
      id: feature.id,
      title: buildingName,
      message: `[建築名稱] 廁所資訊：[廁所位置描述]`,
    });
  };

  const onFacilityClick = (feature: RectFeature) => {
    setModalState({
      id: feature.id,
      title: feature.id === "audio-room" ? "音控室" : feature.label === "女" ? "女廁" : "場域資訊",
      message: "此區域資訊可於後續功能中設定。",
    });
  };

  return (
    <div
      className={
        isModal
          ? "fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/45 p-4"
          : "min-h-screen"
      }
      style={!isModal ? { background: "var(--bg)" } : undefined}
    >
      <div className={isModal ? "w-full max-w-6xl rounded-2xl bg-white" : "w-full"}>
        {onBack && (
          <div className={isModal ? "border-b p-4" : "mx-auto max-w-6xl px-4 pt-4"}>
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700"
            >
              <ArrowLeft className="h-4 w-4" />
              {isModal ? "關閉地圖" : "返回"}
            </button>
          </div>
        )}

        <div className={isModal ? "p-4 sm:p-6" : "mx-auto max-w-6xl p-4 sm:p-6"}>
          <h1 className="mb-2 text-center text-2xl font-black text-slate-800 sm:text-3xl">互動式園遊會地圖</h1>
          <p className="mb-4 text-center text-sm text-slate-600 sm:text-base">
            點擊攤位可查看攤位資訊，點擊建築可查看廁所資訊。
          </p>

          <div className="rounded-2xl border border-slate-300 bg-white p-2 sm:p-4">
            <div className="relative mx-auto w-full max-w-[1100px]">
              <svg
                viewBox="180 0 950 760"
                role="img"
                aria-label="園遊會互動地圖"
                className="h-auto w-full"
                style={{ background: COLORS.mapBg, borderRadius: 12, touchAction: "manipulation" }}
              >
                <rect x={180} y={0} width={950} height={760} fill={COLORS.mapBg} />

                {otherFeatures
                  .filter((feature) => feature.type === "zone")
                  .map((feature) => (
                    <SvgRectButton
                      key={feature.id}
                      feature={feature}
                      selected={selectedId === feature.id}
                      onActivate={() => onFacilityClick(feature)}
                    />
                  ))}

                <rect x={638} y={95} width={90} height={295} rx={6} fill="none" stroke={COLORS.stroke} strokeDasharray="5 6" />

                {buildingFeatures.map((feature) => (
                  <SvgRectButton
                    key={feature.id}
                    feature={feature}
                    selected={selectedId === feature.id}
                    onActivate={() => onBuildingClick(feature)}
                  />
                ))}

                {otherFeatures
                  .filter((feature) => feature.type === "facility")
                  .map((feature) => (
                    <SvgRectButton
                      key={feature.id}
                      feature={feature}
                      selected={selectedId === feature.id}
                      onActivate={() => onFacilityClick(feature)}
                    />
                  ))}

                {stallFeatures.map((feature) => (
                  <SvgRectButton
                    key={feature.id}
                    feature={feature}
                    selected={selectedId === feature.id}
                    onActivate={() => onStallClick(feature)}
                  />
                ))}

                <foreignObject x={866} y={588} width={44} height={44}>
                  <button
                    id="facility_utensils"
                    type="button"
                    className="flex h-11 w-11 items-center justify-center rounded-lg border border-slate-400 bg-white"
                    onClick={() =>
                      setModalState({
                        id: "utensils",
                        title: "餐具回收區",
                        message: "此區域資訊可於後續功能中設定。",
                      })
                    }
                  >
                    <UtensilsCrossed className="h-5 w-5 text-slate-700" strokeWidth={1.8} />
                  </button>
                </foreignObject>

                <foreignObject x={918} y={588} width={44} height={44}>
                  <button
                    id="facility_trash"
                    type="button"
                    className="flex h-11 w-11 items-center justify-center rounded-lg border border-slate-400 bg-white"
                    onClick={() =>
                      setModalState({
                        id: "trash",
                        title: "垃圾桶",
                        message: "此區域資訊可於後續功能中設定。",
                      })
                    }
                  >
                    <Trash2 className="h-5 w-5 text-slate-700" strokeWidth={1.8} />
                  </button>
                </foreignObject>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {modalState && (
        <Modal title={modalState.title} message={modalState.message} onClose={() => setModalState(null)} />
      )}
    </div>
  );
}
