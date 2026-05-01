"use client";
import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db, storage } from "@/lib/firebase";
import { doc, updateDoc, arrayUnion, getDoc } from "firebase/firestore";
import { ref, uploadBytes } from "firebase/storage";
import { onAuthStateChanged } from "firebase/auth";
import { QUESTS } from "@/constants/quests";
import imageCompression from "browser-image-compression";
import { ArrowLeft, Camera } from "lucide-react";

interface LocalUser {
  email?: string | null;
  displayName?: string | null;
}

export default function QuestPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  
  const urlParam = resolvedParams?.id ?? "";
  const quest = QUESTS.find((q) => q.slug === urlParam);
  const questId = quest?.id ?? 0;

  const [user, setUser] = useState<LocalUser | null>(null);
  const [answer, setAnswer] = useState("");
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState("idle");
  const [completedCount, setCompletedCount] = useState(0);

  useEffect(() => {
    if (questId) {
      const saved = localStorage.getItem("unlockedTasks");
      const unlockedTasks: number[] = saved ? JSON.parse(saved) : [];
      
      if (!unlockedTasks.includes(questId)) {
        const newUnlocked = [...unlockedTasks, questId];
        localStorage.setItem("unlockedTasks", JSON.stringify(newUnlocked));
      }
    }
  }, [questId]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      if (!u) {
        alert("請先登入！");
        router.push("/"); 
      } else {
        setUser(u);
      }
    });
    return () => unsubscribe();
  }, [router]);

  if (!quest) return (
    <div
      className="min-h-screen flex items-center justify-center p-10 text-center"
      style={{background: 'var(--background)'}}
    >
      <p className="font-bold text-lg" style={{color: 'var(--warning-600)'}}>❌ 無效的網址，請去現場尋找並掃描正確的 QR Code！</p>
    </div>
  );

  const handleQuizSubmit = async () => {
    if (answer.trim() !== quest.answer) {
      if (questId >= 11 && questId <= 20) {
        alert("❌ 答案錯誤，請再試試看！");
      } else {
        alert("❌ 答案錯誤，請再試試看！(提示：" + quest.answer + ")");
      }
      setAnswer("");
      return;
    }
    await completeQuest();
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const options = {
        maxSizeMB: 0.3,
        maxWidthOrHeight: 1024,
        useWebWorker: true,
      };

      const compressedFile = await imageCompression(file, options);
      const storageRef = ref(storage, `uploads/${user.email}/${questId}.jpg`);
      await uploadBytes(storageRef, compressedFile);
      await completeQuest();

    } catch (error) {
      console.error(error);
      alert("上傳失敗，請重試");
    }
    setUploading(false);
  };

  const completeQuest = async () => {
    if (!user) return;
    
    try {
      const userRef = doc(db, "users", user.email);
      await updateDoc(userRef, {
        completedQuests: arrayUnion(questId)
      });
      
      const userDoc = await getDoc(userRef);
      const completedQuests = userDoc.data()?.completedQuests || [];
      setCompletedCount(completedQuests.length);
      
      setStatus("success");
      
      setTimeout(() => {
        router.push("/");
      }, 3000);
      
    } catch (error) {
      console.error("Error updating document: ", error);
      alert("連線錯誤，無法儲存進度");
    }
  };

  // 過關畫面
  if (status === "success") {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
        style={{background: 'var(--bg)'}}
      >
        <div className="absolute inset-0 pointer-events-none">
          <div style={{position: 'absolute', top: '10%', left: '10%', width: '72px', height: '72px', border: '4px solid #121212', background: '#f0c020'}} />
          <div style={{position: 'absolute', top: '20%', right: '15%', width: '56px', height: '56px', border: '4px solid #121212', background: '#1040c0', transform: 'rotate(45deg)'}} />
          <div style={{position: 'absolute', bottom: '20%', left: '20%', width: '60px', height: '60px', border: '4px solid #121212', background: '#d02020', borderRadius: '9999px'}} />
          <div style={{position: 'absolute', bottom: '30%', right: '10%', width: '84px', height: '20px', border: '4px solid #121212', background: '#ffffff'}} />
        </div>

        <div className="text-center relative z-10">
          <div className="mb-5 mx-auto flex h-28 w-28 items-center justify-center border-4 border-black bg-[#1040c0] text-6xl text-white">
            ◎
          </div>

          <h1 className="text-5xl sm:text-7xl font-black mb-4 tracking-tighter uppercase" style={{
            color: 'var(--text)',
            marginBottom: '10px',
          }}>
            任務完成！
          </h1>

          <p className="text-2xl sm:text-3xl font-black mb-8 uppercase" style={{ color: 'var(--primary)' }}>
            太棒了！🌟
          </p>

          <div className="premium-card clay-shadow-md p-8 mb-8 max-w-md" style={{ animation: 'modal-pop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
            <div className="text-center">
              <p className="text-lg font-bold mb-3" style={{color: 'var(--text)'}}>📊 您的進度</p>
              <p className="text-4xl font-black mb-2" style={{ color: 'var(--primary-blue)' }}>
                {completedCount}
              </p>
              <div className="h-3 border-4 border-black bg-white overflow-hidden mb-3 rounded-none">
                <div style={{
                  width: `${(completedCount / 20) * 100}%`,
                  height: '100%',
                  background: 'var(--primary-red)'
                }}></div>
              </div>
              <p style={{color: 'var(--primary)', fontWeight: '600'}}>已完成 {completedCount}/20 關</p>
            </div>
          </div>

          <div className="mb-6">
            {completedCount % 10 === 0 && completedCount > 0 && (
              <p className="text-2xl font-black mb-3" style={{color: 'var(--primary-hover)'}}>
                🎁 達成里程碑！即將可以兌換獎品！
              </p>
            )}
            <p className="text-lg font-bold" style={{color: 'var(--text)'}}>
              {completedCount < 10 ? '還差 ' + (10 - completedCount) + ' 關就可以領取小獎品！' : 
               completedCount < 20 ? '還差 ' + (20 - completedCount) + ' 關就能完成所有任務！' : 
               '🏆 恭喜！您已完成全部任務！'}
            </p>
          </div>

          <p className="text-md font-bold mt-8 animate-pulse" style={{color: 'var(--primary)'}}>
            ⏱️ 3 秒後自動返回...
          </p>
        </div>
      </div>
    );
  }

  // 主要作答畫面
  return (
    <div
      className="min-h-screen"
      style={{background: 'var(--bg)'}}
    >
      {/* 返回按鈕 */}
      <button 
        onClick={() => router.push("/")} 
        className="m-6 flex items-center font-bold text-sm clay-button clay-button-blue rounded-none" 
      >
        <ArrowLeft className="w-4 h-4 mr-2" /> 回首頁
      </button>

      {/* 任務卡片容器 */}
      <div className="max-w-2xl mx-auto px-4 mb-8">
        <div className="premium-card clay-shadow-sm p-8">
        
          {/* 標題和類型 */}
          <div className="flex justify-between items-start mb-6 pb-4" style={{borderBottom: '2px dashed var(--border)'}}>
            <div>
              <div className="text-sm font-black tracking-widest uppercase" style={{color: 'var(--primary)', marginBottom: '8px'}}>Mission #{quest.id}</div>
              <h1 className="text-3xl font-black" style={{color: 'var(--text)'}}>《{quest.title}》</h1>
            </div>
            <span className="badge-blue py-2 px-4 text-xs font-bold rounded-none">
              {quest.type === 'quiz' ? '📝 問答題' : '📷 照片'}
            </span>
          </div>

          {/* 敘述 */}
          <div className="premium-card clay-shadow-sm p-4 mb-6">
            <p className="text-xs font-bold" style={{color: 'var(--primary)', marginBottom: '8px'}}>任務敘述</p>
            <p style={{color: 'var(--text)', fontWeight: '500'}}>
              {quest.description}
            </p>
          </div>

          {/* 根據題目類型顯示不同輸入框 */}
          {quest.type === "quiz" ? (
            <div className="space-y-4">
              <div className="premium-card clay-shadow-sm p-4">
                <p style={{color: 'var(--text)', fontWeight: '600'}}>❓ {quest.question}</p>
              </div>

              <input 
                type="text" 
                placeholder="請輸入選項代號 (如 A, B, C)"
                className="w-full clay-input text-lg uppercase text-black font-black border-2 border-blue-200 focus:border-blue-400" 
                value={answer}
                onChange={(e) => setAnswer(e.target.value.toUpperCase())}
              />

              <button 
                onClick={handleQuizSubmit}
                className="w-full clay-button clay-button-blue py-4 text-lg font-bold"
              >
                ✅ 送出答案
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {quest.referenceImage && (
                <div className="bauhaus-frame overflow-hidden bg-white">
                  <img src={quest.referenceImage} className="w-full h-auto object-cover" alt="範例" />
                </div>
              )}

              <label className={`block w-full text-center font-bold py-6 rounded-none transition-all cursor-pointer clay-button ${ 
                uploading 
                  ? 'clay-button opacity-60' 
                  : 'clay-button-yellow'
              }`}>
                <div className="flex flex-col items-center justify-center gap-2 text-lg">
                  {uploading ? (
                    <span>🔄 壓縮上傳中...</span>
                  ) : (
                    <>
                      <Camera className="w-6 h-6" />
                      <span>📱 開啟相機 / 上傳</span>
                    </>
                  )}
                </div>
                <input 
                  type="file" 
                  accept="image/*" 
                  capture="environment"
                  className="hidden" 
                  onChange={handlePhotoUpload} 
                  disabled={uploading} 
                />
              </label>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}