'use client';

interface TimelineItem {
  id: number;
  time: string;
  title: string;
  description?: string;
  icon: string;
}

const TIMELINE_EVENTS: TimelineItem[] = [
  { id: 1, time: '10:00', title: '活動開始', description: '各區攤位開放、來賓進場', icon: '🎪' },
  { id: 2, time: '10:00 - 13:30', title: '舞台表演時段', description: '社團與班級演出輪番登場', icon: '🎭' },
  { id: 4, time: '12:00', title: '攤位高峰時段', description: '美食、手作與遊戲體驗最熱鬧', icon: '🍔' },
  { id: 5, time: '13:30', title: '表演尾聲', description: '舞台節目收尾與合影', icon: '🎤' },
  { id: 6, time: '14:00', title: '活動結束', description: '感謝大家參與，期待下次相見', icon: '👋' },
  { id: 7, time: '14:10', title: '高三傳承盃比賽', description: '園遊會結束後接續進行高三傳承盃賽事', icon: '🏆' },
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
