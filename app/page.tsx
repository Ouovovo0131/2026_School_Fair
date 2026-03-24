'use client';

import React, { useState, useEffect } from 'react';
import Home from "@/app/components/Home";

export default function Page() {
  const [unlockedTasks, setUnlockedTasks] = useState<number[]>([]);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  useEffect(() => {
    const saved = localStorage.getItem('unlockedTasks');
    if (saved) {
      setUnlockedTasks(JSON.parse(saved));
    }
    setIsLoaded(true);
  }, []);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <span className="text-gray-500">系統載入中...</span>
      </div>
    );
  }

  return (
    <main className="min-h-screen flex flex-col">
      <Home unlockedTasks={unlockedTasks} />
    </main>
  );
}