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
    <div className="w-full py-6 px-4 rounded-2xl border" style={{ background: '#FFF8DC', borderColor: '#FF8C00' }}>
      <p className="text-center text-sm font-bold mb-4" style={{ color: '#0047AB' }}>
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
                background: '#ADD8E6',
                border: '2px solid #000080',
                color: '#000080'
              }}
            >
              {String(item.value).padStart(2, '0')}
            </div>
            <span className="text-xs font-bold mt-2" style={{ color: '#0047AB' }}>
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
