'use client';

interface TimelineItem {
  id: number;
  time: string;
  title: string;
  description?: string;
  icon: string;
}

const TIMELINE_EVENTS: TimelineItem[] = [
  { id: 1, time: '09:00', title: '活動開始', description: '校園各處開始營運', icon: '🎪' },
  { id: 2, time: '10:00', title: '校長致詞', description: '大禮堂進行開幕式', icon: '🎤' },
  { id: 3, time: '11:00', title: '特色表演', description: '舞蹈隊、樂隊精彩演出', icon: '🎭' },
  { id: 4, time: '12:00', title: '攤位高峰期', description: '美食、手作、遊戲攤位大開放', icon: '🍔' },
  { id: 5, time: '14:00', title: '摸彩抽獎', description: '大獎、小獎輪流抽取', icon: '🎁' },
  { id: 6, time: '16:00', title: '大隊接力', description: '班級競賽，精彩刺激', icon: '🏃' },
  { id: 7, time: '17:00', title: '晚會演出', description: '學生表演及頒獎典禮', icon: '✨' },
  { id: 8, time: '18:30', title: '活動結束', description: '感謝大家參與', icon: '👋' },
];

export default function Timeline() {
  return (
    <section className="premium-card clay-shadow-sm p-5 sm:p-6">
      <div className="mb-5 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold" style={{ color: 'var(--text)' }}>
          活動時程
        </h2>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          掌握每個時段，不錯過任何精彩內容
        </p>
      </div>

      <div className="relative pl-4 sm:pl-5">
        <div className="absolute left-[11px] sm:left-[13px] top-0 bottom-0 w-px" style={{ background: 'var(--border)' }} />

        <div className="space-y-3">
          {TIMELINE_EVENTS.map((event) => (
            <div key={event.id} className="relative pl-8 sm:pl-10">
              <div
                className="absolute left-0 top-3 w-6 h-6 rounded-full flex items-center justify-center text-xs"
                style={{ background: 'var(--primary-soft)', border: '1px solid var(--primary)' }}
              >
                {event.icon}
              </div>

              <article className="rounded-xl p-3 sm:p-4" style={{ background: 'var(--surface-soft)', border: '1px solid var(--border)' }}>
                <p className="text-xs font-bold" style={{ color: 'var(--primary)' }}>
                  {event.time}
                </p>
                <h3 className="text-sm sm:text-base font-bold mt-1" style={{ color: 'var(--text)' }}>
                  {event.title}
                </h3>
                {event.description && (
                  <p className="text-xs sm:text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                    {event.description}
                  </p>
                )}
              </article>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
