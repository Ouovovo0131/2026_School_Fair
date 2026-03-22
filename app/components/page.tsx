"use client";
import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db, storage } from "@/lib/firebase";
import { doc, updateDoc, arrayUnion } from "firebase/firestore";
import { ref, uploadBytes } from "firebase/storage";
import { onAuthStateChanged } from "firebase/auth";
import { QUESTS } from "@/constants/quests";
import imageCompression from "browser-image-compression";
import { ArrowLeft, CheckCircle, Upload, Camera } from "lucide-react";

export default function QuestPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  
  // 1. 取得網址上的參數 (此時會是 slug 字串，例如 'p9z3a'，或者是舊版的數字字串)
  const urlParam = resolvedParams?.id ?? "";
  // 2. 透過 slug 尋找任務 (為了相容性，也同時允許比對數字 id)
  const quest = QUESTS.find((q) => q.slug === urlParam || q.id.toString() === urlParam);
  // 3. 從找到的任務中取得正確的數字 id，供後續資料庫與 Storage 使用
  const questId = quest?.id ?? 0;

  const [user, setUser] = useState<any>(null);
  const [answer, setAnswer] = useState("");
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState("idle"); // idle, success, error

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

  if (!questId) return <div className="p-10 text-center">載入中...</div>;
  if (!quest) return <div className="p-10 text-center text-red-500 font-bold">找不到這個任務 (ID: {questId})</div>;

  // 1. 處理問答題
  const handleQuizSubmit = async () => {
    // 簡單的防呆，去除前後空白
    if (answer.trim() !== quest.answer) {
      alert("❌ 答案錯誤，請再試試看！(提示：" + quest.answer + ")"); // 測試期先偷偷給提示
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
      
      setStatus("success");
      
      // 2秒後回首頁
      setTimeout(() => {
        router.push("/");
      }, 2000);
      
    } catch (error) {
      console.error("Error updating document: ", error);
      alert("連線錯誤，無法儲存進度");
    }
  };

  // 過關動畫畫面
  if (status === "success") {
    return (
      <div className="min-h-screen bg-green-500 flex flex-col items-center justify-center text-white animate-bounce">
        <CheckCircle className="w-32 h-32 mb-6" />
        <h1 className="text-5xl font-black tracking-tighter">SUCCESS!</h1>
        <p className="text-xl font-mono mt-4">任務完成 / 蓋章確認</p>
      </div>
    );
  }

  // 主要作答畫面
  return (
    <div className="min-h-screen bg-yellow-50 p-4 font-mono">
      <button onClick={() => router.push("/")} className="mb-6 flex items-center font-bold text-gray-500 hover:text-black">
        <ArrowLeft className="w-5 h-5 mr-2" /> 回首頁
      </button>

      <div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex justify-between items-start mb-4">
          <h1 className="text-4xl font-black text-blue-900">#{quest.id}</h1>
          <span className="bg-black text-white px-2 py-1 text-xs font-bold">
            {quest.type === 'quiz' ? '歷史問答' : '照片挑戰'}
          </span>
        </div>
        
        <h2 className="text-2xl font-bold mb-4 leading-tight text-gray-900">{quest.title}</h2>
        <p className="mb-8 text-gray-800 text-sm leading-relaxed border-l-4 border-gray-400 pl-4">
          {quest.description}
        </p>

        {/* 根據題目類型顯示不同輸入框 */}
        {quest.type === "quiz" ? (
          <div className="space-y-4">
            <p className="font-bold text-red-600 text-lg">Q: {quest.question}</p>
            <input 
            type="text" 
            placeholder="請輸入選項代號 (如 A, B, C)"
            className="w-full border-4 border-black p-4 font-bold text-lg focus:outline-none focus:bg-yellow-100 uppercase text-gray-900" // 加了 uppercase 讓學生輸入小寫也會變大寫
            value={answer}
            onChange={(e) => setAnswer(e.target.value.toUpperCase())} // 強制轉大寫
            />
            <button 
              onClick={handleQuizSubmit}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all"
            >
              送出答案
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* 這裡之後可以放範例圖片 */}
            <div className="bg-gray-200 aspect-video flex items-center justify-center border-4 border-black border-dashed relative overflow-hidden group">
               {quest.referenceImage ? ( 
                 <img src={quest.referenceImage} className="w-full h-full object-cover opacity-80" alt="範例" />
               ) : (
                 <span className="text-gray-500 text-sm">（這裡會顯示範例照片）</span>
               )}
            </div>

            <label className={`block w-full text-center font-bold py-4 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all cursor-pointer ${uploading ? 'bg-gray-400' : 'bg-green-500 hover:bg-green-400 text-white'}`}>
              <div className="flex items-center justify-center gap-2">
                {uploading ? (
                  <span>壓縮上傳中...</span>
                ) : (
                  <>
                    <Camera className="w-6 h-6" />
                    <span>開啟相機 / 上傳</span>
                  </>
                )}
              </div>
              <input 
                type="file" 
                accept="image/*" 
                capture="environment" // 手機上會直接開相機
                className="hidden" 
                onChange={handlePhotoUpload} 
                disabled={uploading} 
              />
            </label>
          </div>
        )}
      </div>
    </div>
  );
}