"use client";

import { ArrowLeft, Trash2, UtensilsCrossed } from "lucide-react";
import { useMemo, useState } from "react";

interface MapProps {
  onBack?: () => void;
  isModal?: boolean;
}

type FeatureType = "stall" | "building";

interface RectFeature {
  id: string;
  label: string;
  type: FeatureType;
  x: number;
  y: number;
  w: number;
  h: number;
  fill: string;
  textColor?: string;
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

function VerticalLabel({ text, x, y }: { text: string; x: number; y: number }) {
  return (
    <text x={x} y={y} textAnchor="middle" fill={COLORS.text} fontSize={20} fontWeight={700}>
      {text.split("").map((ch, idx) => (
        <tspan key={`${text}-${idx}`} x={x} dy={idx === 0 ? 0 : 32}>
          {ch}
        </tspan>
      ))}
    </text>
  );
}

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

export default function Map({ onBack, isModal = false }: MapProps) {
  const [selectedStallId, setSelectedStallId] = useState<string | null>(null);
  const [selectedBuildingId, setSelectedBuildingId] = useState<string | null>(null);

  const stalls = useMemo<RectFeature[]>(
    () => [
      { id: "1", label: "1", type: "stall", x: 860, y: 270, w: 42, h: 56, fill: COLORS.stallPink },
      { id: "2", label: "2", type: "stall", x: 860, y: 226, w: 42, h: 40, fill: COLORS.stallPink },
      { id: "3", label: "3", type: "stall", x: 860, y: 178, w: 42, h: 44, fill: COLORS.stallPink },
      { id: "4", label: "4", type: "stall", x: 860, y: 135, w: 42, h: 39, fill: COLORS.stallPink },
      { id: "5", label: "5", type: "stall", x: 860, y: 95, w: 42, h: 36, fill: COLORS.stallPink },
      { id: "班", label: "班", type: "stall", x: 860, y: 328, w: 42, h: 46, fill: COLORS.stallPink },

      { id: "6", label: "6", type: "stall", x: 690, y: 216, w: 38, h: 40, fill: COLORS.stallIvory },
      { id: "7", label: "7", type: "stall", x: 690, y: 174, w: 38, h: 38, fill: COLORS.stallIvory },
      { id: "8", label: "8", type: "stall", x: 690, y: 133, w: 38, h: 37, fill: COLORS.stallIvory },
      { id: "貴B", label: "貴", type: "stall", x: 690, y: 258, w: 38, h: 40, fill: "#ffffff" },

      { id: "9", label: "9", type: "stall", x: 607, y: 216, w: 38, h: 40, fill: COLORS.stallBlue },
      { id: "10", label: "10", type: "stall", x: 607, y: 174, w: 38, h: 38, fill: COLORS.stallBlue },
      { id: "11", label: "11", type: "stall", x: 607, y: 133, w: 38, h: 37, fill: COLORS.stallBlue },
      { id: "貴A", label: "貴", type: "stall", x: 607, y: 258, w: 38, h: 40, fill: "#ffffff" },

      { id: "12", label: "12", type: "stall", x: 378, y: 165, w: 42, h: 42, fill: COLORS.stallBlue },
      { id: "13", label: "13", type: "stall", x: 378, y: 120, w: 42, h: 41, fill: COLORS.stallBlue },

      { id: "14", label: "14", type: "stall", x: 284, y: 327, w: 42, h: 40, fill: COLORS.stallPurple },
      { id: "15", label: "15", type: "stall", x: 284, y: 284, w: 42, h: 39, fill: COLORS.stallPurple },
      { id: "16", label: "16", type: "stall", x: 284, y: 241, w: 42, h: 39, fill: COLORS.stallPurple },
      { id: "17", label: "17", type: "stall", x: 284, y: 198, w: 42, h: 39, fill: COLORS.stallPurple },
      { id: "18", label: "18", type: "stall", x: 284, y: 155, w: 42, h: 39, fill: COLORS.stallPurple },
      { id: "19", label: "19", type: "stall", x: 284, y: 112, w: 42, h: 39, fill: COLORS.stallPurple },
      { id: "20", label: "20", type: "stall", x: 284, y: 69, w: 42, h: 39, fill: COLORS.stallPurple },
      { id: "21", label: "21", type: "stall", x: 284, y: 26, w: 42, h: 39, fill: COLORS.stallPurple },
    ],
    []
  );

  const buildings = useMemo<RectFeature[]>(
    () => [
      {
        id: "student-affairs",
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
        label: "信義樓",
        type: "building",
        x: 210,
        y: 20,
        w: 62,
        h: 525,
        fill: COLORS.building,
      },
      {
        id: "complex",
        label: "綜合大樓",
        type: "building",
        x: 1008,
        y: 84,
        w: 64,
        h: 430,
        fill: COLORS.building,
      },
      {
        id: "old-library",
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
        label: "傳達室",
        type: "building",
        x: 980,
        y: 555,
        w: 80,
        h: 115,
        fill: COLORS.building,
      },
      {
        id: "gate",
        label: "大門",
        type: "building",
        x: 865,
        y: 670,
        w: 120,
        h: 60,
        fill: COLORS.building,
      },
    ],
    []
  );

  const selectedStall = useMemo(
    () => stallsData.find((stall) => stall.id === selectedStallId) ?? null,
    [selectedStallId]
  );

  const selectedBuilding = useMemo(
    () => buildingData.find((building) => building.id === selectedBuildingId) ?? null,
    [selectedBuildingId]
  );

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
            點擊攤位可查看攤位資訊，點擊建築可查看廁所位置詳細資訊。
          </p>

          <div className="rounded-2xl border border-slate-300 bg-white p-2 sm:p-4">
            <div className="relative mx-auto w-full max-w-[1100px]">
              <svg
                viewBox="160 0 950 750"
                role="img"
                aria-label="園遊會互動地圖"
                className="h-auto w-full"
                style={{ background: COLORS.mapBg, borderRadius: 12, touchAction: "manipulation" }}
              >
                <rect x={160} y={0} width={950} height={750} fill={COLORS.mapBg} />

                <rect x={430} y={110} width={205} height={300} rx={10} fill={COLORS.grass} stroke={COLORS.buildingStroke} />
                <rect x={735} y={110} width={205} height={300} rx={10} fill={COLORS.grass} stroke={COLORS.buildingStroke} />

                <rect x={600} y={395} width={150} height={150} rx={9} fill={COLORS.stage} stroke={COLORS.stageStroke} strokeWidth={2} />
                <text x={675} y={470} textAnchor="middle" fontSize={46} fontWeight={700} fill={COLORS.text}>
                  表演
                </text>
                <text x={675} y={520} textAnchor="middle" fontSize={46} fontWeight={700} fill={COLORS.text}>
                  舞台
                </text>

                <rect x={600} y={95} width={150} height={295} rx={6} fill="none" stroke={COLORS.buildingStroke} strokeDasharray="5 6" />

                <text x={1080} y={60} textAnchor="middle" fontSize={48} fontWeight={800} fill={COLORS.text}>
                  園遊會地圖
                </text>

                {buildings.map((building) => (
                  <g key={building.id}>
                    <rect
                      x={building.x}
                      y={building.y}
                      width={building.w}
                      height={building.h}
                      rx={10}
                      fill={building.fill}
                      stroke={COLORS.buildingStroke}
                      strokeWidth={selectedBuildingId === building.id ? 3 : 1.2}
                      className="cursor-pointer"
                      onClick={() => {
                        setSelectedBuildingId(building.id);
                        setSelectedStallId(null);
                      }}
                    />

                    {building.id === "xinyi" ? (
                      <VerticalLabel text={building.label} x={building.x + building.w / 2} y={220} />
                    ) : building.id === "complex" ? (
                      <VerticalLabel text={building.label} x={building.x + building.w / 2} y={280} />
                    ) : building.id === "office" ? (
                      <VerticalLabel text={building.label} x={building.x + building.w / 2} y={610} />
                    ) : (
                      <text
                        x={building.x + building.w / 2}
                        y={building.y + building.h / 2 + 8}
                        textAnchor="middle"
                        fill={COLORS.text}
                        fontSize={38}
                        fontWeight={700}
                      >
                        {building.label}
                      </text>
                    )}
                  </g>
                ))}

                <rect x={428} y={362} width={40} height={40} rx={8} fill={COLORS.stallPink} stroke={COLORS.buildingStroke} />
                <text x={448} y={390} textAnchor="middle" fontSize={34} fontWeight={700} fill={COLORS.text}>女</text>
                <rect x={470} y={362} width={40} height={40} rx={8} fill={COLORS.stallPink} stroke={COLORS.buildingStroke} />
                <text x={490} y={390} textAnchor="middle" fontSize={34} fontWeight={700} fill={COLORS.text}>女</text>
                <rect x={512} y={362} width={40} height={40} rx={8} fill={COLORS.stallPink} stroke={COLORS.buildingStroke} />
                <text x={532} y={390} textAnchor="middle" fontSize={34} fontWeight={700} fill={COLORS.text}>女</text>

                <rect x={378} y={252} width={42} height={46} rx={8} fill={COLORS.stallBlue} stroke={COLORS.buildingStroke} />
                <text x={399} y={283} textAnchor="middle" fontSize={34} fontWeight={700} fill={COLORS.text}>女</text>
                <rect x={378} y={299} width={42} height={46} rx={8} fill={COLORS.stallBlue} stroke={COLORS.buildingStroke} />
                <text x={399} y={330} textAnchor="middle" fontSize={34} fontWeight={700} fill={COLORS.text}>女</text>

                <rect x={760} y={530} width={34} height={40} rx={8} fill="#f7f7f7" stroke={COLORS.buildingStroke} />
                <text x={777} y={558} textAnchor="middle" fontSize={34} fontWeight={700} fill={COLORS.text}>音</text>

                {stalls.map((stall) => (
                  <g key={stall.id}>
                    <rect
                      x={stall.x}
                      y={stall.y}
                      width={stall.w}
                      height={stall.h}
                      rx={8}
                      fill={stall.fill}
                      stroke={COLORS.buildingStroke}
                      strokeWidth={selectedStallId === stall.id ? 3 : 1.2}
                      className="cursor-pointer"
                      onClick={() => {
                        setSelectedStallId(stall.id);
                        setSelectedBuildingId(null);
                      }}
                    />
                    <text
                      x={stall.x + stall.w / 2}
                      y={stall.y + stall.h / 2 + 9}
                      textAnchor="middle"
                      fill={stall.textColor ?? COLORS.text}
                      fontSize={stall.label.length > 1 ? 33 : 38}
                      fontWeight={700}
                      style={{ userSelect: "none", pointerEvents: "none" }}
                    >
                      {stall.label}
                    </text>
                  </g>
                ))}

                <text x={1060} y={740} textAnchor="middle" fontSize={56} fill={COLORS.text}>
                  ↑
                </text>
                <text x={1060} y={700} textAnchor="middle" fontSize={42} fontWeight={700} fill={COLORS.text}>
                  N
                </text>
              </svg>

              <div className="pointer-events-none absolute right-[18.5%] top-[72%] flex flex-col gap-2">
                <div className="pointer-events-auto flex h-11 w-11 items-center justify-center rounded-lg border border-slate-400 bg-white/95 shadow">
                  <UtensilsCrossed className="h-6 w-6 text-slate-700" />
                </div>
                <div className="pointer-events-auto flex h-11 w-11 items-center justify-center rounded-lg border border-slate-400 bg-white/95 shadow">
                  <Trash2 className="h-6 w-6 text-slate-700" />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 rounded-2xl border border-slate-300 bg-white p-4 text-sm text-slate-700 sm:grid-cols-3">
            <div>
              <div className="mb-1 text-xs font-bold text-slate-500">攤位互動</div>
              <div>1-21、班、貴皆可點擊，顯示攤位名稱、販售內容與班級/單位。</div>
            </div>
            <div>
              <div className="mb-1 text-xs font-bold text-slate-500">建築互動</div>
              <div>點擊學務處、信義樓、綜合大樓等建築，可查看廁所位置資訊。</div>
            </div>
            <div>
              <div className="mb-1 text-xs font-bold text-slate-500">圖示說明</div>
              <div className="flex items-center gap-2">
                <UtensilsCrossed className="h-4 w-4" /> 餐具回收區
                <Trash2 className="ml-2 h-4 w-4" /> 垃圾桶
              </div>
            </div>
          </div>
        </div>
      </div>

      {selectedStall && (
        <Modal
          title={selectedStall.name}
          onClose={() => setSelectedStallId(null)}
          body={
            <>
              <p>
                <span className="font-bold text-slate-800">攤位名稱：</span>
                {selectedStall.name}
              </p>
              <p>
                <span className="font-bold text-slate-800">販售內容：</span>
                {selectedStall.product}
              </p>
              <p>
                <span className="font-bold text-slate-800">班級/單位：</span>
                {selectedStall.unit}
              </p>
            </>
          }
        />
      )}

      {selectedBuilding && (
        <Modal
          title={selectedBuilding.name}
          onClose={() => setSelectedBuildingId(null)}
          body={
            <>
              <p>
                <span className="font-bold text-slate-800">廁所位置詳細資訊：</span>
                {selectedBuilding.restroomDetail}
              </p>
            </>
          }
        />
      )}
    </div>
  );
}