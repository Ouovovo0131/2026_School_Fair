'use client';

import { useEffect, useState } from 'react';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export default function Countdown() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const eventDate = new Date(2026, 4, 15).getTime();
      const now = new Date().getTime();
      const difference = eventDate - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <section className="premium-card clay-shadow-sm p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-bold" style={{ color: 'var(--primary)' }}>
          校慶倒數
        </p>
        <span className="text-xs px-2 py-1 rounded-lg" style={{ background: 'var(--primary-soft)', color: 'var(--primary-hover)' }}>
          Live
        </span>
      </div>

      <div className="grid grid-cols-4 gap-2 sm:gap-4">
        {[
          { label: '天', value: timeLeft.days },
          { label: '時', value: timeLeft.hours },
          { label: '分', value: timeLeft.minutes },
          { label: '秒', value: timeLeft.seconds },
        ].map((item) => (
          <div key={item.label} className="rounded-xl p-2 sm:p-3 text-center" style={{ background: 'var(--surface-soft)', border: '1px solid var(--border)' }}>
            <p className="text-xl sm:text-2xl font-extrabold" style={{ color: 'var(--text)' }}>
              {String(item.value).padStart(2, '0')}
            </p>
            <p className="text-[11px] sm:text-xs font-semibold mt-1" style={{ color: 'var(--text-muted)' }}>
              {item.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
