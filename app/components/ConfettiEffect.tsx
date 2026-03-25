'use client';
import { useEffect } from 'react';

export default function ConfettiEffect() {
  useEffect(() => {
    // 每隔3秒釋放一次紙屑
    const interval = setInterval(() => {
      createConfetti();
    }, 3000);

    createConfetti(); // 立即釋放第一次

    return () => clearInterval(interval);
  }, []);

  const createConfetti = () => {
    const colors = ['#e60012', '#ffd600', '#3b8edb', '#a259d9', '#a67b5b'];
    const confettiCount = Math.random() > 0.5 ? 12 : 8;

    for (let i = 0; i < confettiCount; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'confetti';

      const left = Math.random() * 100;
      const delay = Math.random() * 0.3;
      const color = colors[Math.floor(Math.random() * colors.length)];
      const size = Math.random() * 6 + 4;
      const duration = Math.random() * 1 + 2.5;
      
      const direction = Math.random();
      let animationClass = 'fall-straight';
      if (direction < 0.33) animationClass = 'fall-left';
      else if (direction > 0.66) animationClass = 'fall-right';

      confetti.className = `confetti ${animationClass}`;
      confetti.style.cssText = `
        left: ${left}%;
        background-color: ${color};
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        animation-delay: ${delay}s;
        animation-duration: ${duration}s;
        opacity: 0.8;
      `;

      document.body.appendChild(confetti);

      // 動畫結束後移除
      setTimeout(() => confetti.remove(), (duration + delay) * 1000);
    }
  };

  return null;
}
