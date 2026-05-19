'use client';

interface TimelineItem {
  id: number;
  time: string;
  location: string;
  title: string;
  description?: string;
  details?: string[];
}

const TIMELINE_EVENTS: TimelineItem[] = [
  {
    id: 1,
    time: '8:15 - 10:30',
    location: '綜合大樓四樓',
    title: '校慶慶祝大會',
    description: '全體師生共同參與的開幕典禮，揭開校慶活動序幕。',
  },
  {
    id: 2,
    time: '10:00 - 13:30',
    location: '圖資大樓一樓右側',
    title: '各學科暨社團靜態成果展',
    description: '展示各學科、社團成果，以及性平、兒權的寶貴作品。',
  },
  {
    id: 3,
    time: '10:00 - 14:00',
    location: '忠孝樓及信義樓前廣場',
    title: '校慶園遊會',
    description: '各班級、社團設置攤位銷售美食、手工藝品與遊戲，共同打造熱鬧校慶市集。',
  },
  {
    id: 4,
    time: '10:30 - 13:30',
    location: '表演舞台',
    title: '動態表演',
    description: '多組表演團體接力登場，帶來節奏、律動與舞台魅力。',
    details: [
      '花中合奏社',
      'Sparking舞團',
      '花中流行音樂歌唱社',
      '花中儀隊社',
      '花商熱音',
      '花中打漾越對',
      '四維舞感社',
      '花女熱音',
      '慈中熱舞',
      '花女舞動社',
      '花中熱音社',
      '花中蔚藍光焰舞蹈研究社',
      '花工音創社',
      '花女韓社',
      '花中宿團',
      '黑旋風',
    ],
  },
  {
    id: 5,
    time: '14:00 - 18:00',
    location: '體育場',
    title: '高二高三傳承盃',
    description: '學長與學弟的競技交流，延續班級與年級之間的精神傳承。',
  },
];

export default function Timeline() {
  return (
    <section className="countdown-board p-5 sm:p-6">
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
                className="absolute left-0 top-3 w-6 h-6 rounded-full border"
                style={{ background: 'var(--primary-soft)', borderColor: 'var(--primary)' }}
                aria-hidden="true"
              >
                <span className="sr-only">{event.title}</span>
              </div>

              <article className="rounded-xl p-3 sm:p-4" style={{ background: 'var(--surface-soft)', border: '1px solid var(--border)' }}>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-xs font-bold" style={{ color: 'var(--primary)' }}>
                    {event.time}
                  </p>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ background: 'var(--primary-soft)', color: 'var(--primary)' }}>
                    {event.location}
                  </span>
                </div>
                <h3 className="text-sm sm:text-base font-bold mt-2" style={{ color: 'var(--text)' }}>
                  {event.title}
                </h3>
                {event.description && (
                  <p className="text-xs sm:text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                    {event.description}
                  </p>
                )}
                {event.details && event.details.length > 0 && (
                  <ul className="mt-3 space-y-1.5">
                    {event.details.map((detail) => (
                      <li key={detail} className="text-xs sm:text-sm leading-relaxed flex gap-2" style={{ color: 'var(--text-muted)' }}>
                        <span className="mt-1 h-1.5 w-1.5 rounded-full shrink-0" style={{ background: 'var(--secondary)' }} />
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </article>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
