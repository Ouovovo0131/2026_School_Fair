'use client';

import React, { useState } from 'react';
import Home from "@/app/components/Home";

export default function Page() {
  const [unlockedTasks] = useState<number[]>(() => {
    if (typeof window === 'undefined') return [];
    const saved = localStorage.getItem('unlockedTasks');
    return saved ? JSON.parse(saved) : [];
  });

  return (
    <main className="min-h-screen flex flex-col">
      <Home unlockedTasks={unlockedTasks} />
    </main>
  );
}