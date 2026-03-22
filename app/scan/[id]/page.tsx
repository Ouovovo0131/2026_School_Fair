"use client";
import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db, storage } from "@/lib/firebase";
import { doc, updateDoc, arrayUnion, getDoc } from "firebase/firestore";
import { ref, uploadBytes } from "firebase/storage";
import { onAuthStateChanged } from "firebase/auth";
import { QUESTS } from "@/constants/quests";
import imageCompression from "browser-image-compression";
import { ArrowLeft, CheckCircle, Upload, Camera } from "lucide-react";

export default function QuestPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  
  // 1. 取得網址上的參數 (必須是 slug 字串，例如 'p9z3a')
  const urlParam = resolvedParams?.id ?? "";
  // 2. 嚴格比對 slug，拔除數字 ID 判斷，防止學生手動改網址數字作弊！
  const quest = QUESTS.find((q) => q.slug === urlParam);
  // 3. 從找到的任務中取得正確的數字 id，供後續資料庫與 Storage 使用
  const questId = quest?.id ?? 0;

  const [user, setUser] = useState<any>(null);
  const [answer, setAnswer] = useState("");
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState("idle"); // idle, success, error
  const [completedCount, setCompletedCount] = useState(0); // 已完成的關卡唼數

  // 當學生掃描正確的亂碼網址進入時，自動將該任務標記為「已解鎖」
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

  // 檢查登入
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

  // 如果網址不正確 (亂輸入數字或代碼)，直接擋下
  if (!quest) return <div className="p-10 text-center text-red-500 font-bold mt-10">❌ 無效的網址，請去現場尋找並掃描正確的 QR Code！</div>;

  // 1. 處理問答題
  const handleQuizSubmit = async () => {
    // 簡單的防呆，去除前後空白
    if (answer.trim() !== quest.answer) {
      // 第11-20關不顯示提示，其他關卡顯示提示
      if (questId >= 11 && questId <= 20) {
        alert("❌ 答案錯誤，請再試試看！");
      } else {
        alert("❌ 答案錯誤，請再試試看！(提示：" + quest.answer + ")"); // 測試期先偷偷給提示
      }
      setAnswer(""); // 清除輸入框
      return;
    }
    await completeQuest();
  };

  // 2. 處理拍照題 (含壓縮功能)
  const handlePhotoUpload = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      // 壓縮設定
      const options = {
        maxSizeMB: 0.3, // 限制 0.3MB (省流量)
        maxWidthOrHeight: 1024,
        useWebWorker: true,
      };

      const compressedFile = await imageCompression(file, options);
      
      // 上傳到 Firebase Storage
      // 路徑：uploads/user_email/quest_id.jpg
      const storageRef = ref(storage, `uploads/${user.email}/${questId}.jpg`);
      await uploadBytes(storageRef, compressedFile);
      
      // 上傳成功直接過關
      await completeQuest();

    } catch (error) {
      console.error(error);
      alert("上傳失敗，請重試");
    }
    setUploading(false);
  };

  // 3. 過關核心邏輯 (寫入資料庫)
  const completeQuest = async () => {
    if (!user) return;
    
    try {
      const userRef = doc(db, "users", user.email);
      // arrayUnion 代表「加入陣列，但不重複」
      await updateDoc(userRef, {
        completedQuests: arrayUnion(questId)
      });
      
      // 從資料庫讀取最新的已完成關卡數
      const userDoc = await getDoc(userRef);
      const completedQuests = userDoc.data()?.completedQuests || [];
      setCompletedCount(completedQuests.length);
      
      setStatus("success");
      
      // 3秒後回首頁
      setTimeout(() => {
        router.push("/");
      }, 3000);
      
    } catch (error) {
      console.error("Error updating document: ", error);
      alert("連線錯誤，無法儲存進度");
    }
  };

  // 過關動畫畫面 - 優化版
  if (status === "success") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden" style={{background: 'linear-gradient(180deg, #d4e5f0 0%, #f5ede0 50%, #e8dcc8 100%)'}}>
        
        {/* 慶祝彩帶效果 */}
        <div className="absolute inset-0 pointer-events-none">
          <div style={{position: 'absolute', top: '10%', left: '10%', fontSize: '60px', animation: 'float-gentle 3s ease-in-out infinite'}}>🎊</div>
          <div style={{position: 'absolute', top: '20%', right: '15%', fontSize: '60px', animation: 'float-gentle 3.5s ease-in-out infinite'}}>🎈</div>
          <div style={{position: 'absolute', bottom: '20%', left: '20%', fontSize: '60px', animation: 'float-gentle 4s ease-in-out infinite'}}>✨</div>
          <div style={{position: 'absolute', bottom: '30%', right: '10%', fontSize: '60px', animation: 'float-gentle 3.2s ease-in-out infinite'}}>🏆</div>
        </div>

        {/* 主要內容 */}
        <div className="text-center relative z-10">
          {/* 大型動畫圖標 */}
          <div style={{fontSize: '120px', marginBottom: '20px', animation: 'bounce 1s infinite'}} className="animate-bounce">
            🎯
          </div>

          {/* 成功標題 */}
          <h1 className="text-7xl font-black mb-4 tracking-tighter" style={{
            color: '#3d3d3d',
            textShadow: '0 4px 20px rgba(245, 163, 199, 0.3)',
            marginBottom: '10px'
          }}>
            任務完成！
          </h1>

          {/* 鼓勵文案 */}
          <p className="text-3xl font-bold mb-8" style={{
            background: 'linear-gradient(135deg, #f5a3c7, #a8d8e8)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            太棒了！🌟
          </p>

          {/* 成就卡片 */}
          <div className="premium-card clay-shadow-md p-8 mb-8 max-w-md" style={{
            animation: 'modal-pop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)'
          }}>
            <div className="text-center">
              <p className="text-lg font-bold mb-3" style={{color: '#3d3d3d'}}>📊 您的進度</p>
              <p className="text-4xl font-black mb-2" style={{
                background: 'linear-gradient(90deg, #a68080, #8fb372)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                {completedCount}
              </p>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-3">
                <div style={{
                  width: `${(completedCount / 20) * 100}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #f5a3c7, #d4c5e8)',
                  animation: 'shimmer 2s infinite'
                }}></div>
              </div>
              <p style={{color: '#6b6b6b', fontWeight: '600'}}>已完成 {completedCount}/20 關</p>
            </div>
          </div>

          {/* 鼓勵信息 */}
          <div className="mb-6">
            {completedCount % 10 === 0 && completedCount > 0 && (
              <p className="text-2xl font-black mb-3" style={{color: '#c85a54'}}>
                🎁 達成里程碩！即將可以兌換獎品！
              </p>
            )}
            <p className="text-lg font-bold" style={{color: '#3d3d3d'}}>
              {completedCount < 10 ? '還差 ' + (10 - completedCount) + ' 關就可以領取小獎品！' : 
               completedCount < 20 ? '還差 ' + (20 - completedCount) + ' 關就能完成所有任務！' : 
               '🏆 恭喜！您已完成全部任務！'}
            </p>
          </div>

          {/* 返回按鈕 */}
          <p className="text-md font-bold mt-8 animate-pulse" style={{color: '#6b6b6b'}}>
            ⏱️ 3 秒後自動返回...
          </p>
        </div>
      </div>
    );
  }

  // 主要作答畫面
  return (
      <div className="min-h-screen" style={{background: 'linear-gradient(180deg, #d4e5f0 0%, #f5ede0 50%, #e8dcc8 100%)'}}> {/* 移除 backgroundAttachment: 'fixed' */}
      {/* 返回按鈕 */}
      <button 
        onClick={() => router.push("/")} 
        className="m-6 flex items-center font-bold text-sm clay-button clay-button-blue" 
      >
        <ArrowLeft className="w-4 h-4 mr-2" /> 回首頁
      </button>

      {/* 任務卡片容器 */}
      <div className="max-w-2xl mx-auto px-4 mb-8">
        <div className="premium-card clay-shadow-sm p-8">
        
          {/* 標題和類型 */}
          <div className="flex justify-between items-start mb-6 pb-4" style={{borderBottom: '2px solid rgba(0,0,0,0.06)'}}>
            <div>
              <div className="text-sm font-bold" style={{color: '#a68080', marginBottom: '8px'}}>任務 #{quest.id}</div>
              <h1 className="text-3xl font-bold" style={{color: '#3d3d3d'}}>《{quest.title}》</h1>
            </div>
            <span className="badge-blue py-2 px-4 text-xs font-bold rounded-full">
              {quest.type === 'quiz' ? '📝 問答題' : '📷 照片'}
            </span>
          </div>

          {/* 敘述 */}
          <div className="premium-card clay-shadow-sm p-4 mb-6">
            <p className="text-xs font-bold" style={{color: '#a68080', marginBottom: '8px'}}>任務敘述</p>
            <p style={{color: '#3d3d3d', fontWeight: '500'}}>
              {quest.description}
            </p>
          </div>

          {/* 根據題目類型顯示不同輸入框 */}
          {quest.type === "quiz" ? (
            <div className="space-y-4">
              {/* 問題卡片 */}
              <div className="premium-card clay-shadow-sm p-4">
                <p style={{color: '#3d3d3d', fontWeight: '600'}}>❓ {quest.question}</p>
              </div>

              {/* 答案輸入 */}
              <input 
                type="text" 
                placeholder="請輸入選項代號 (如 A, B, C)"
                className="w-full clay-input text-lg uppercase" 
                value={answer}
                onChange={(e) => setAnswer(e.target.value.toUpperCase())}
              />

              {/* 提交按鈕 */}
              <button 
                onClick={handleQuizSubmit}
                className="w-full clay-button clay-button-blue py-4 text-lg font-bold"
              >
                ✅ 送出答案
              </button>
            </div>
            ) : (
            <div className="space-y-6">
              {/* 範例圖片 */}
              {quest.referenceImage && (
                <div className="premium-card clay-shadow-md overflow-hidden">
                  <img src={quest.referenceImage} className="w-full h-auto object-cover" alt="範例" />
                </div>
              )}

              {/* 上傳按鈕 */}
              <label className={`block w-full text-center font-bold py-6 rounded-2xl transition-all cursor-pointer clay-button ${ 
                uploading 
                  ? 'clay-button opacity-60' 
                  : 'clay-button-yellow'
              }`}>
                <div className="flex flex-col items-center justify-center gap-2 text-lg">
                  {uploading ? (
                    <>
                      <span>🔄 壓縮上傳中...</span>
                    </>
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