'use client';

interface TimelineItem {
  id: number;
  time: string;
  title: string;
  description?: string;
  icon: string;
}

const TIMELINE_EVENTS: TimelineItem[] = [
  {
    id: 1,
    time: '09:00',
    title: '活動開始',
    description: '校園各處開始營運',
    icon: '🎪'
  },
  {
    id: 2,
    time: '10:00',
    title: '校長致詞',
    description: '大禮堂進行開幕式',
    icon: '🎤'
  },
  {
    id: 3,
    time: '11:00',
    title: '特色表演',
    description: '舞蹈隊、樂隊精彩演出',
    icon: '🎭'
  },
  {
    id: 4,
    time: '12:00',
    title: '攤位高峰期',
    description: '美食、手作、遊戲攤位大開放',
    icon: '🍔'
  },
  {
    id: 5,
    time: '14:00',
    title: '摸彩抽獎',
    description: '大獎、小獎輪流抽取',
    icon: '🎁'
  },
  {
    id: 6,
    time: '16:00',
    title: '大隊接力',
    description: '班級競賽，精彩刺激',
    icon: '🏃'
  },
  {
    id: 7,
    time: '17:00',
    title: '晚會演出',
    description: '學生表演及頒獎典禮',
    icon: '✨'
  },
  {
    id: 8,
    time: '18:30',
    title: '活動結束',
    description: '感謝大家參與',
    icon: '👋'
  }
];

export default function Timeline() {
  return (
    <div className="w-full px-4 py-8">
      <h2 className="text-2xl font-bold mb-8 text-center" style={{ color: '#3d3d3d' }}>
        📅 活動時程表
      </h2>

      <div className="relative">
        {/* 中央時間線 */}
        <div
          className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full"
          style={{ background: 'linear-gradient(180deg, #e60012, #ffd600, #3b8edb)' }}
        />

        {/* 時程項目 */}
        <div className="space-y-8">
          {TIMELINE_EVENTS.map((event, idx) => (
            <div key={event.id} className="relative">
              {/* 時間點圓圈 */}
              <div className="absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2 top-6">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold bg-white border-4"
                  style={{
                    borderColor: idx % 2 === 0 ? '#e60012' : '#3b8edb',
                    boxShadow: '0 0 0 8px rgba(255, 247, 230, 0.8)'
                  }}
                >
                  {event.icon}
                </div>
              </div>

              {/* 交替排列的卡片 */}
              <div className={`w-full flex ${idx % 2 === 0 ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className="w-1/2" />
                <div className="w-1/2 px-4">
                  <div
                    className="premium-card clay-shadow-sm p-4 rounded-xl"
                    style={{
                      background: idx % 2 === 0
                        ? 'linear-gradient(135deg, rgba(230, 0, 18, 0.08), rgba(255, 214, 0, 0.08))'
                        : 'linear-gradient(135deg, rgba(59, 142, 219, 0.08), rgba(162, 89, 217, 0.08))'
                    }}
                  >
                    <p
                      className="text-sm font-bold mb-1"
                      style={{
                        color: idx % 2 === 0 ? '#e60012' : '#3b8edb'
                      }}
                    >
                      {event.time}
                    </p>
                    <p className="font-bold text-base" style={{ color: '#3d3d3d' }}>
                      {event.title}
                    </p>
                    {event.description && (
                      <p className="text-xs mt-1" style={{ color: '#6b6b6b' }}>
                        {event.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
