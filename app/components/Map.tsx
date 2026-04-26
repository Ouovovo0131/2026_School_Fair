"use client";

import { ArrowLeft, Trash2, UtensilsCrossed } from "lucide-react";
import { useMemo, useState } from "react";

interface MapProps {
  onBack?: () => void;
  isModal?: boolean;
}

type FeatureKind = "stall" | "building" | "facility" | "zone";

interface RectFeature {
  id: string;
  label: string;
  kind: FeatureKind;
  x: number;
  y: number;
  w: number;
  h: number;
  fill: string;
  textColor?: string;
  verticalText?: boolean;
  rounded?: number;
}

interface StallInfo {
  id: string;
  name: string;
  product: string;
  unit: string;
}

interface BuildingInfo {
  id: string;
  name: string;
  restroomDetail: string;
}

interface FacilityInfo {
  id: string;
  name: string;
  detail: string;
}

interface SelectedInfo {
  id: string;
  title: string;
  body: React.ReactNode;
}

const COLORS = {
  mapBg: "#f2f2f2",
  grass: "#c9ddcb",
  building: "#efefef",
  buildingStroke: "#8e8e8e",
  stage: "#fbfbfb",
  stageStroke: "#3f3f3f",
  stallPink: "#f3dee5",
  stallBlue: "#dceaf8",
  stallPurple: "#e8d9f1",
  stallIvory: "#f8f5ea",
  text: "#2f2f2f",
};

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

const estimateCharUnits = (label: string) =>
  Array.from(label).reduce((sum, char) => sum + (/[0-9A-Za-z]/.test(char) ? 0.62 : 1), 0);

function getFittedFontSize(label: string, w: number, h: number, vertical = false) {
  const padding = 8;
  if (vertical) {
    const byHeight = ((h - padding * 2) / Math.max(label.length, 1)) * 0.95;
    const byWidth = w - padding * 2;
    return clamp(Math.floor(Math.min(byHeight, byWidth)), 11, 34);
  }
  const units = Math.max(estimateCharUnits(label), 1);
  const byWidth = ((w - padding * 2) / units) * 0.95;
  const byHeight = (h - padding * 2) * 0.8;
  return clamp(Math.floor(Math.min(byWidth, byHeight)), 11, 34);
}

const stallsData: StallInfo[] = [
  ...Array.from({ length: 21 }, (_, i) => ({
    id: String(i + 1),
    name: `攤位 ${i + 1}`,
    product: "販售內容待補充（例如：飲品、點心、遊戲）",
    unit: "班級/單位待補充",
  })),
  {
    id: "班",
    name: "班級服務台",
    product: "活動諮詢與班級導覽資訊（佔位文字）",
    unit: "班聯會 / 值班同學（待補充）",
  },
  {
    id: "貴A",
    name: "貴賓席 A",
    product: "貴賓休息座位（佔位文字）",
    unit: "接待組（待補充）",
  },
  {
    id: "貴B",
    name: "貴賓席 B",
    product: "貴賓休息座位（佔位文字）",
    unit: "接待組（待補充）",
  },
];

const buildingData: BuildingInfo[] = [
  {
    id: "xinyi",
    name: "信義樓",
    restroomDetail: "本樓層女廁位於左側走廊盡頭，男廁位於一樓入口右側。",
  },
  {
    id: "complex",
    name: "綜合大樓",
    restroomDetail: "本樓層女廁位於中段電梯旁，無障礙廁所在一樓服務台後方。",
  },
  {
    id: "student-affairs",
    name: "學務處",
    restroomDetail: "鄰近學務處左側有女廁，走廊直行到底可見指標。",
  },
  {
    id: "academic-affairs",
    name: "教務處",
    restroomDetail: "教務處右側走廊轉角有女廁，男廁在同層另一端。",
  },
  {
    id: "old-library",
    name: "舊圖書館",
    restroomDetail: "舊圖書館一樓入口旁設有洗手間，請依現場指示進入。",
  },
  {
    id: "library-building",
    name: "圖資大樓",
    restroomDetail: "圖資大樓廁所位於一樓東側，靠近回收區與樓梯口。",
  },
  {
    id: "office",
    name: "傳達室",
    restroomDetail: "傳達室旁無獨立廁所，請前往圖資大樓一樓使用。",
  },
  {
    id: "gate",
    name: "大門",
    restroomDetail: "大門區無廁所，最近廁所位於圖資大樓一樓。",
  },
];

const facilityData: FacilityInfo[] = [
  {
    id: "stage",
    name: "表演舞台",
    detail: "舞台活動區，節目表演與頒獎會在此進行。",
  },
  {
    id: "lawn-left",
    name: "草地區 A",
    detail: "中央左側草地區，請保持通道淨空並注意安全。",
  },
  {
    id: "lawn-right",
    name: "草地區 B",
    detail: "中央右側草地區，可供休憩與觀賞舞台活動。",
  },
  {
    id: "female-1",
    name: "女廁 A",
    detail: "女廁位置，請依現場動線排隊使用。",
  },
  {
    id: "female-2",
    name: "女廁 B",
    detail: "女廁位置，請依現場動線排隊使用。",
  },
  {
    id: "female-3",
    name: "女廁 C",
    detail: "女廁位置，請依現場動線排隊使用。",
  },
  {
    id: "female-4",
    name: "女廁 D",
    detail: "女廁位置，請依現場動線排隊使用。",
  },
  {
    id: "female-5",
    name: "女廁 E",
    detail: "女廁位置，請依現場動線排隊使用。",
  },
  {
    id: "audio-room",
    name: "音控室",
    detail: "音響設備與麥克風控制區，請勿任意進入。",
  },
  {
    id: "utensils",
    name: "餐具回收區",
    detail: "請先倒乾淨再分類回收，維護園遊會環境整潔。",
  },
  {
    id: "trash",
    name: "垃圾桶",
    detail: "一般垃圾投放處，請確實分類。",
  },
];

function Modal({
  title,
  body,
  onClose,
}: {
  title: string;
  body: React.ReactNode;
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
        <div className="text-sm leading-7 text-slate-700">{body}</div>
      </div>
    </div>
  );
}

function RectText({ feature }: { feature: RectFeature }) {
  if (feature.id === "stage") {
    const size = clamp(Math.floor(Math.min((feature.w - 16) / 2.1, (feature.h - 16) / 2.25)), 15, 34);
    return (
      <>
        <text
          x={feature.x + feature.w / 2}
          y={feature.y + feature.h / 2 - size * 0.15}
          textAnchor="middle"
          fill={feature.textColor ?? COLORS.text}
          fontSize={size}
          fontWeight={700}
          style={{ userSelect: "none", pointerEvents: "none" }}
        >
          表演
        </text>
        <text
          x={feature.x + feature.w / 2}
          y={feature.y + feature.h / 2 + size * 0.95}
          textAnchor="middle"
          fill={feature.textColor ?? COLORS.text}
          fontSize={size}
          fontWeight={700}
          style={{ userSelect: "none", pointerEvents: "none" }}
        >
          舞台
        </text>
      </>
    );
  }

  if (feature.verticalText) {
    const size = getFittedFontSize(feature.label, feature.w, feature.h, true);
    const lineHeight = size * 1.08;
    const totalHeight = feature.label.length * lineHeight;
    const startY = feature.y + (feature.h - totalHeight) / 2 + size;
    return (
      <text
        x={feature.x + feature.w / 2}
        y={startY}
        textAnchor="middle"
        fill={feature.textColor ?? COLORS.text}
        fontSize={size}
        fontWeight={700}
        style={{ userSelect: "none", pointerEvents: "none" }}
      >
        {feature.label.split("").map((char, idx) => (
          <tspan key={`${feature.id}-${idx}`} x={feature.x + feature.w / 2} dy={idx === 0 ? 0 : lineHeight}>
            {char}
          </tspan>
        ))}
      </text>
    );
  }

  const size = getFittedFontSize(feature.label, feature.w, feature.h, false);
  return (
    <text
      x={feature.x + feature.w / 2}
      y={feature.y + feature.h / 2 + size * 0.34}
      textAnchor="middle"
      fill={feature.textColor ?? COLORS.text}
      fontSize={size}
      fontWeight={700}
      style={{ userSelect: "none", pointerEvents: "none" }}
    >
      {feature.label}
    </text>
  );
}

export default function Map({ onBack, isModal = false }: MapProps) {
  const [selectedInfo, setSelectedInfo] = useState<SelectedInfo | null>(null);

  const stalls = useMemo<RectFeature[]>(
    () => [
      { id: "1", label: "1", kind: "stall", x: 860, y: 270, w: 42, h: 56, fill: COLORS.stallPink },
      { id: "2", label: "2", kind: "stall", x: 860, y: 226, w: 42, h: 40, fill: COLORS.stallPink },
      { id: "3", label: "3", kind: "stall", x: 860, y: 178, w: 42, h: 44, fill: COLORS.stallPink },
      { id: "4", label: "4", kind: "stall", x: 860, y: 135, w: 42, h: 39, fill: COLORS.stallPink },
      { id: "5", label: "5", kind: "stall", x: 860, y: 95, w: 42, h: 36, fill: COLORS.stallPink },
      { id: "班", label: "班", kind: "stall", x: 860, y: 328, w: 42, h: 46, fill: COLORS.stallPink },

      { id: "6", label: "6", kind: "stall", x: 690, y: 216, w: 38, h: 40, fill: COLORS.stallIvory },
      { id: "7", label: "7", kind: "stall", x: 690, y: 174, w: 38, h: 38, fill: COLORS.stallIvory },
      { id: "8", label: "8", kind: "stall", x: 690, y: 133, w: 38, h: 37, fill: COLORS.stallIvory },
      { id: "貴B", label: "貴", kind: "stall", x: 690, y: 258, w: 38, h: 40, fill: "#ffffff" },

      { id: "9", label: "9", kind: "stall", x: 607, y: 216, w: 38, h: 40, fill: COLORS.stallBlue },
      { id: "10", label: "10", kind: "stall", x: 607, y: 174, w: 38, h: 38, fill: COLORS.stallBlue },
      { id: "11", label: "11", kind: "stall", x: 607, y: 133, w: 38, h: 37, fill: COLORS.stallBlue },
      { id: "貴A", label: "貴", kind: "stall", x: 607, y: 258, w: 38, h: 40, fill: "#ffffff" },

      { id: "12", label: "12", kind: "stall", x: 378, y: 165, w: 42, h: 42, fill: COLORS.stallBlue },
      { id: "13", label: "13", kind: "stall", x: 378, y: 120, w: 42, h: 41, fill: COLORS.stallBlue },

      { id: "14", label: "14", kind: "stall", x: 284, y: 327, w: 42, h: 40, fill: COLORS.stallPurple },
      { id: "15", label: "15", kind: "stall", x: 284, y: 284, w: 42, h: 39, fill: COLORS.stallPurple },
      { id: "16", label: "16", kind: "stall", x: 284, y: 241, w: 42, h: 39, fill: COLORS.stallPurple },
      { id: "17", label: "17", kind: "stall", x: 284, y: 198, w: 42, h: 39, fill: COLORS.stallPurple },
      { id: "18", label: "18", kind: "stall", x: 284, y: 155, w: 42, h: 39, fill: COLORS.stallPurple },
      { id: "19", label: "19", kind: "stall", x: 284, y: 112, w: 42, h: 39, fill: COLORS.stallPurple },
      { id: "20", label: "20", kind: "stall", x: 284, y: 69, w: 42, h: 39, fill: COLORS.stallPurple },
      { id: "21", label: "21", kind: "stall", x: 284, y: 26, w: 42, h: 39, fill: COLORS.stallPurple },
    ],
    []
  );

  const buildings = useMemo<RectFeature[]>(
    () => [
      { id: "student-affairs", label: "學務處", kind: "building", x: 420, y: 18, w: 180, h: 44, fill: COLORS.building },
      { id: "academic-affairs", label: "教務處", kind: "building", x: 620, y: 18, w: 180, h: 44, fill: COLORS.building },
      { id: "xinyi", label: "信義樓", kind: "building", x: 210, y: 20, w: 62, h: 525, fill: COLORS.building, verticalText: true },
      { id: "complex", label: "綜合大樓", kind: "building", x: 1008, y: 84, w: 64, h: 430, fill: COLORS.building, verticalText: true },
      { id: "old-library", label: "舊圖書館", kind: "building", x: 275, y: 550, w: 188, h: 118, fill: COLORS.building },
      { id: "library-building", label: "圖資大樓", kind: "building", x: 520, y: 550, w: 308, h: 118, fill: COLORS.building },
      { id: "office", label: "傳達室", kind: "building", x: 980, y: 555, w: 80, h: 115, fill: COLORS.building, verticalText: true },
      { id: "gate", label: "大門", kind: "building", x: 865, y: 670, w: 120, h: 60, fill: COLORS.building },
    ],
    []
  );

  const facilities = useMemo<RectFeature[]>(
    () => [
      { id: "lawn-left", label: "", kind: "zone", x: 430, y: 110, w: 205, h: 300, fill: COLORS.grass, rounded: 10 },
      { id: "lawn-right", label: "", kind: "zone", x: 735, y: 110, w: 205, h: 300, fill: COLORS.grass, rounded: 10 },
      { id: "stage", label: "表演舞台", kind: "facility", x: 600, y: 395, w: 150, h: 150, fill: COLORS.stage, rounded: 9 },

      { id: "female-1", label: "女", kind: "facility", x: 428, y: 362, w: 40, h: 40, fill: COLORS.stallPink },
      { id: "female-2", label: "女", kind: "facility", x: 470, y: 362, w: 40, h: 40, fill: COLORS.stallPink },
      { id: "female-3", label: "女", kind: "facility", x: 512, y: 362, w: 40, h: 40, fill: COLORS.stallPink },
      { id: "female-4", label: "女", kind: "facility", x: 378, y: 252, w: 42, h: 46, fill: COLORS.stallBlue },
      { id: "female-5", label: "女", kind: "facility", x: 378, y: 299, w: 42, h: 46, fill: COLORS.stallBlue },
      { id: "audio-room", label: "音", kind: "facility", x: 760, y: 530, w: 34, h: 40, fill: "#f7f7f7" },
    ],
    []
  );

  const buildingMap = useMemo(() => new globalThis.Map(buildingData.map((item) => [item.id, item])), []);
  const stallMap = useMemo(() => new globalThis.Map(stallsData.map((item) => [item.id, item])), []);
  const facilityMap = useMemo(() => new globalThis.Map(facilityData.map((item) => [item.id, item])), []);

  const allClickable = [...facilities, ...buildings, ...stalls];

  const openFeatureModal = (feature: RectFeature) => {
    if (feature.kind === "stall") {
      const stall = stallMap.get(feature.id);
      if (!stall) return;
      setSelectedInfo({
        id: feature.id,
        title: stall.name,
        body: (
          <>
            <p>
              <span className="font-bold text-slate-800">攤位名稱：</span>
              {stall.name}
            </p>
            <p>
              <span className="font-bold text-slate-800">販售內容：</span>
              {stall.product}
            </p>
            <p>
              <span className="font-bold text-slate-800">班級/單位：</span>
              {stall.unit}
            </p>
          </>
        ),
      });
      return;
    }

    if (feature.kind === "building") {
      const building = buildingMap.get(feature.id);
      if (!building) return;
      setSelectedInfo({
        id: feature.id,
        title: building.name,
        body: (
          <p>
            <span className="font-bold text-slate-800">廁所位置詳細資訊：</span>
            {building.restroomDetail}
          </p>
        ),
      });
      return;
    }

    const facility = facilityMap.get(feature.id);
    if (!facility) return;
    setSelectedInfo({
      id: feature.id,
      title: facility.name,
      body: <p>{facility.detail}</p>,
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
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm"
            >
              <ArrowLeft className="h-4 w-4" />
              {isModal ? "關閉地圖" : "返回"}
            </button>
          </div>
        )}

        <div className={isModal ? "p-4 sm:p-6" : "mx-auto max-w-6xl p-4 sm:p-6"}>
          <h1 className="mb-2 text-center text-2xl font-black text-slate-800 sm:text-3xl">互動式園遊會地圖</h1>
          <p className="mb-4 text-center text-sm text-slate-600 sm:text-base">
            每個獨立物件皆可點擊，文字會依框尺寸自動縮放。
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

                <text x={1000} y={58} textAnchor="middle" fontSize={28} fontWeight={800} fill={COLORS.text}>
                  園遊會地圖
                </text>

                <rect x={600} y={95} width={150} height={295} rx={6} fill="none" stroke={COLORS.buildingStroke} strokeDasharray="5 6" />

                {allClickable.map((feature) => (
                  <g key={feature.id}>
                    <rect
                      x={feature.x}
                      y={feature.y}
                      width={feature.w}
                      height={feature.h}
                      rx={feature.rounded ?? 8}
                      fill={feature.fill}
                      stroke={feature.id === "stage" ? COLORS.stageStroke : COLORS.buildingStroke}
                      strokeWidth={selectedInfo?.id === feature.id ? 3 : 1.2}
                      className="cursor-pointer"
                      onClick={() => openFeatureModal(feature)}
                    />
                    {feature.label ? <RectText feature={feature} /> : null}
                  </g>
                ))}

                <text x={1075} y={742} textAnchor="middle" fontSize={52} fill={COLORS.text}>
                  ↑
                </text>
                <text x={1075} y={706} textAnchor="middle" fontSize={30} fontWeight={700} fill={COLORS.text}>
                  N
                </text>
              </svg>

              <div className="absolute right-[17.5%] top-[74.2%] flex flex-col gap-2">
                <button
                  type="button"
                  className="flex h-11 w-11 items-center justify-center rounded-lg border border-slate-400 bg-white/95 shadow"
                  onClick={() => {
                    const feature = facilities.find((item) => item.id === "utensils");
                    if (feature) openFeatureModal(feature);
                  }}
                  aria-label="餐具回收區"
                >
                  <UtensilsCrossed className="h-6 w-6 text-slate-700" />
                </button>
                <button
                  type="button"
                  className="flex h-11 w-11 items-center justify-center rounded-lg border border-slate-400 bg-white/95 shadow"
                  onClick={() => {
                    const feature = facilities.find((item) => item.id === "trash");
                    if (feature) openFeatureModal(feature);
                  }}
                  aria-label="垃圾桶"
                >
                  <Trash2 className="h-6 w-6 text-slate-700" />
                </button>
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-slate-300 bg-white p-4 text-sm text-slate-700">
            可點擊物件包含：草地區、舞台、建築、攤位、女廁、音控室、餐具回收與垃圾桶。
          </div>
        </div>
      </div>

      {selectedInfo && (
        <Modal title={selectedInfo.title} body={selectedInfo.body} onClose={() => setSelectedInfo(null)} />
      )}
    </div>
  );
}