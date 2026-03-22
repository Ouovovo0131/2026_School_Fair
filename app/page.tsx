'use client';

import React, { useState, useEffect } from 'react';
import Home from "@/app/components/Home";

export default function Page() {
  // 1. 管理已解鎖的關卡 ID (預設為空陣列，表示全鎖)
  const [unlockedTasks, setUnlockedTasks] = useState<number[]>([]);
  const [inputLevel, setInputLevel] = useState<string>(''); // 管理輸入框的狀態
  const [isLoaded, setIsLoaded] = useState<boolean>(false); // 確保 localStorage 已讀取

  // 2. 初始化：從 localStorage 讀取之前的進度
  useEffect(() => {
    const saved = localStorage.getItem('unlockedTasks');
    if (saved) {
      setUnlockedTasks(JSON.parse(saved));
    }
    // 標記為已載入完畢
    setIsLoaded(true);
  }, []);

  // 3. 處理手動輸入解鎖邏輯
  const handleManualUnlock = (e: React.FormEvent) => {
    e.preventDefault(); // 防止表單重整頁面
    const taskId = parseInt(inputLevel, 10);
    
    if (taskId > 0 && taskId <= 20) {
      if (!unlockedTasks.includes(taskId)) {
        const newUnlocked = [...unlockedTasks, taskId];
        setUnlockedTasks(newUnlocked);
        localStorage.setItem('unlockedTasks', JSON.stringify(newUnlocked));
        alert(`🎉 恭喜解鎖關卡：${taskId}`);
      } else {
        alert('⚠️ 這個關卡已經解鎖過了');
      }
    } else {
      alert('❌ 請輸入 1 到 20 之間的有效數字');
    }
    setInputLevel(''); // 解鎖後清空輸入框
  };

  // 在確認讀取完 localStorage 之前先顯示簡單的載入或空白畫面
  // 這樣能避免子元件拿到預設的空陣列而誤判狀態卡住
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <span className="text-gray-500">系統載入中...</span>
      </div>
    );
  }

  return (
    <main className="min-h-screen flex flex-col">
      {/* --- 測試區域：輸入編號解鎖 (正式上線可隱藏或移除) --- */}
      <div className="bg-gray-100 p-4 border-b border-gray-300 text-black">
        <h3 className="font-bold mb-2">🔧 解鎖控制台 (輸入關卡編號)</h3>
        <form onSubmit={handleManualUnlock} className="flex gap-2 items-center">
          <input
            type="number"
            min="1"
            max="20"
            value={inputLevel}
            onChange={(e) => setInputLevel(e.target.value)}
            placeholder="輸入編號 (1-20)"
            className="border-2 border-gray-400 rounded px-2 py-1 outline-none focus:border-blue-500"
          />
          <button type="submit" className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700 transition-colors">解鎖</button>
          <button type="button" onClick={() => { setUnlockedTasks([]); localStorage.removeItem('unlockedTasks'); }} className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600 transition-colors">重置進度</button>
        </form>
      </div>

      {/* --- 主畫面 --- */}
      <Home unlockedTasks={unlockedTasks} />
    </main>
  );
}