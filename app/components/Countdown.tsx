'use client';
import { useState, useEffect } from 'react';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export default function Countdown() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
    
    const calculateTimeLeft = () => {
      // 設定校慶日期 - 可根據實際調整
      const eventDate = new Date(2026, 4, 15).getTime(); // 5月15日
      const now = new Date().getTime();
      const difference = eventDate - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    
    return () => clearInterval(timer);
  }, []);

  if (!isLoaded) return null;

  return (
    <div className="w-full py-6 px-4 bg-gradient-to-r from-red-500/10 to-yellow-500/10 rounded-2xl border border-red-200/30">
      <p className="text-center text-sm font-bold mb-4" style={{ color: '#6b6b6b' }}>
        ⏰ 校慶即將開始
      </p>
      <div className="grid grid-cols-4 gap-2 sm:gap-4">
        {[
          { label: '天', value: timeLeft.days },
          { label: '時', value: timeLeft.hours },
          { label: '分', value: timeLeft.minutes },
          { label: '秒', value: timeLeft.seconds }
        ].map((item, idx) => (
          <div key={idx} className="flex flex-col items-center">
            <div
              className="w-full aspect-square flex items-center justify-center rounded-lg font-black text-xl sm:text-3xl"
              style={{
                background: 'linear-gradient(135deg, rgba(230, 0, 18, 0.2), rgba(255, 214, 0, 0.2))',
                border: '2px solid rgba(230, 0, 18, 0.3)',
                color: '#3d3d3d'
              }}
            >
              {String(item.value).padStart(2, '0')}
            </div>
            <span className="text-xs font-bold mt-2" style={{ color: '#6b6b6b' }}>
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
