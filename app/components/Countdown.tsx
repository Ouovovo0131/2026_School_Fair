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
  const [isStarted, setIsStarted] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const eventDate = new Date('2026-05-23T10:00:00+08:00').getTime();
      const now = new Date().getTime();
      const difference = eventDate - now;

      if (difference > 0) {
        setIsStarted(false);
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setIsStarted(true);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <section className="countdown-board">
      <div className="flex items-center justify-between mb-3">
        <p className="countdown-title text-base">校慶倒數 2026/05/23 10:00</p>
        <span className="countdown-live">Live</span>
      </div>

      <div className="grid grid-cols-4 gap-2 sm:gap-4">
        {[
          { label: 'Days', value: timeLeft.days },
          { label: 'Hours', value: timeLeft.hours },
          { label: 'Minutes', value: timeLeft.minutes },
          { label: 'Seconds', value: timeLeft.seconds },
        ].map((item, index) => (
          <div key={item.label} className={`countdown-slot ${index % 2 === 0 ? 'countdown-slot-primary' : 'countdown-slot-accent'}`}>
            <p className="countdown-value">
              {String(item.value).padStart(2, '0')}
            </p>
            <p className="countdown-label">
              {item.label}
            </p>
          </div>
        ))}
      </div>

      {isStarted && (
        <p className="countdown-finished">校慶已開始 🎉</p>
      )}
    </section>
  );
}
