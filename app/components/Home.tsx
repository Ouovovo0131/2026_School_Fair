"use client";
import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc, collection, getDocs, deleteDoc } from "firebase/firestore"; 
import { Trophy, LogOut, Gift, Stamp, MapPin, Award, X, Settings, Lock } from "lucide-react";
import { THEME_NAMES } from "./tasks"; // 引入集中的設定
import { QUESTS } from "../../constants/quests";

const TOTAL_QUESTS = 20;
const SMALL_REWARD_THRESHOLD = 10; // 10 關領取小獎品
const BIG_REWARD_THRESHOLD = 20;   // 20 關領取大獎品

interface HomeProps {
  unlockedTasks?: number[];
}

export default function Home({ unlockedTasks = [] }: HomeProps) {
  const [user, setUser] = useState<any>(null);
  const [completed, setCompleted] = useState<number[]>([]);
  const [redeemedRewards, setRedeemedRewards] = useState<number[]>([]); // 已兌換的獎品等級 [10, 20]
  const [loading, setLoading] = useState(true);
  const [showRedeemModal, setShowRedeemModal] = useState(false); // 控制兌換模態
  const [redeemConfirmCode, setRedeemConfirmCode] = useState(""); // 工作人員確認碼
  const [redeemLevel, setRedeemLevel] = useState<number | null>(null); // 要兌換哪個級別 (10 或 20)
  const [redeemError, setRedeemError] = useState(""); // 錯誤訊息
  const [showAdminMode, setShowAdminMode] = useState(false); // 管理員模式
  const [adminPassword, setAdminPassword] = useState(""); // 管理員密碼
  const [showNicknameModal, setShowNicknameModal] = useState(false); // 暱稱輸入模態
  const [nickname, setNickname] = useState(""); // 玩家暱稱
  const [showPrivacyModal, setShowPrivacyModal] = useState(false); // 隱私說明模態
  const [privacyAgreed, setPrivacyAgreed] = useState(false); // 隱私同意狀態

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const docRef = doc(db, "users", currentUser.email!);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setCompleted(data.completedQuests || []);
          setRedeemedRewards(data.redeemedRewards || []); // 讀取已兌換的獎品
          setNickname(data.nickname || ""); // 讀取暱稱
          // 如果暱稱為空，顯示輸入框
          if (!data.nickname || data.nickname.trim() === "") {
            setShowNicknameModal(true);
          }
        } else {
          await setDoc(docRef, {
            email: currentUser.email,
            name: currentUser.displayName,
            nickname: "", // 新增暱稱欄位
            completedQuests: [],
            redeemedRewards: [], // 新增欄位
          });
          setCompleted([]);
          setRedeemedRewards([]);
          setNickname("");
          setShowNicknameModal(true); // 新使用者顯示輸入暱稱界面
        }
      } else {
        setUser(null);
        setCompleted([]);
        setRedeemedRewards([]);
        setNickname("");
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
    } catch (error) {
      console.error(error);
      alert("登入失敗，請檢查網路設定");
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    window.location.reload();
  };

  // 開啟兌換模態
  const openRedeemModal = (level: number) => {
    setRedeemLevel(level);
    setShowRedeemModal(true);
    setRedeemConfirmCode("");
    setRedeemError("");
  };

  // 關閉兌換模態
  const closeRedeemModal = () => {
    setShowRedeemModal(false);
    setRedeemConfirmCode("");
    setRedeemError("");
    setRedeemLevel(null);
  };

  // 提交工作人員確認碼
  const handleRedeemSubmit = async () => {
    if (!redeemConfirmCode.trim()) {
      setRedeemError("請輸入確認碼");
      return;
    }

    // 簡單的確認碼驗證 (可以改為更複雜的邏輯)
    // 從環境變數讀取工作人員密碼
    const smallPassword = process.env.NEXT_PUBLIC_STAFF_SMALL_PASSWORD || "STAFF10";
    const bigPassword = process.env.NEXT_PUBLIC_STAFF_BIG_PASSWORD || "STAFF20";
    const expectedCode = redeemLevel === 10 ? smallPassword : bigPassword;
    
    if (redeemConfirmCode.toUpperCase() !== expectedCode) {
      setRedeemError("❌ 確認碼錯誤，請檢查工作人員提供的碼");
      return;
    }

    try {
      // 更新資料庫：記錄已兌換的獎品
      const userRef = doc(db, "users", user.email);
      const newRedeemedRewards: number[] = [...redeemedRewards, redeemLevel!];
      
      await updateDoc(userRef, {
        redeemedRewards: newRedeemedRewards,
      });

      // 更新狀態但 "不" 清除 completedQuests (保留遊玩紀錄)
      setRedeemedRewards(newRedeemedRewards);
      alert(`🎉 ${redeemLevel === 10 ? "小" : "大"}獎品兌換成功！`);
      closeRedeemModal();
    } catch (error) {
      console.error("兌換失敗", error);
      setRedeemError("連線錯誤，請重試");
    }
  };

  // 保存玩家暱稱
  const handleSaveNickname = async () => {
    if (!nickname.trim()) {
      alert("請輸入暱稱");
      return;
    }

    try {
      const userRef = doc(db, "users", user.email);
      await updateDoc(userRef, {
        nickname: nickname,
      });
      setShowNicknameModal(false);
      setPrivacyAgreed(false); // 重置隱私同意狀態
      setShowPrivacyModal(true); // 顯示隱私說明
    } catch (error) {
      console.error("保存暱稱失敗", error);
      alert("❌ 保存失敗，請重試");
    }
  };

  // 清除所有用戶數據
  const handleClearAllData = async () => {
    const correctPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "ADMIN2025";
    if (adminPassword !== correctPassword) {
      alert("❌ 密碼錯誤");
      return;
    }

    const confirm = window.confirm("⚠️ 確定要清除所有用戶的遊戲進度？此操作無法復原！");
    if (!confirm) return;

    try {
      const usersRef = collection(db, "users");
      const snapshot = await getDocs(usersRef);
      
      for (const userDoc of snapshot.docs) {
        await deleteDoc(doc(db, "users", userDoc.id));
      }
      
      // 清除所有本地存儲的關卡解鎖狀態
      localStorage.removeItem("unlockedTasks");
      
      alert("✅ 所有用戶數據已清除，所有關卡已重新鎖定");
      setAdminPassword("");
      setShowAdminMode(false);
      window.location.reload();
    } catch (error) {
      console.error("清除數據失敗", error);
      alert("❌ 清除失敗，請重試");
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-500">載入中...</div>;

  const canRedeemSmall = completed.length >= SMALL_REWARD_THRESHOLD && !redeemedRewards.includes(10);
  const canRedeemBig = completed.length >= BIG_REWARD_THRESHOLD && !redeemedRewards.includes(20);

  return (
    <div className="min-h-screen" style={{background: 'linear-gradient(180deg, #d4e5f0 0%, #f5ede0 50%, #e8dcc8 100%)', backgroundAttachment: 'fixed'}}>
      {/* Claymorphic 導航列 */}
      <div className="premium-nav sticky top-0 z-10">
        <div className="w-full px-6 h-20 flex justify-between items-center">
          <h1 className="text-3xl font-bold" style={{color: '#3d3d3d'}}>
            🎪 校慶拾光地圖
          </h1>
          <div className="flex gap-3">
            {user && (
              <button
                onClick={() => setShowAdminMode(!showAdminMode)}
                className="p-3 rounded-full transition-all active:scale-90 hover:bg-white/30"
                style={{color: '#3d3d3d'}}
                title="管理員"
              >
                <Settings className="text-current" size={24} />
              </button>
            )}
            {user ? (
              <button
                onClick={handleLogout}
                className="p-3 rounded-full transition-all active:scale-90 hover:bg-white/30"
                style={{color: '#3d3d3d'}}
                title="登出"
              >
                <LogOut className="text-current" size={24} />
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {/* 主容器 */}
      <div className="w-full px-4 py-6">
        <div className="max-w-7xl mx-auto">
          {!user ? (
            // 未登入狀態
            <div className="max-w-md mx-auto premium-card" style={{marginTop: '60px'}}>
              <div style={{textAlign: 'center', animation: 'gentle-float 3s ease-in-out infinite'}}>
                <div style={{fontSize: '80px', marginBottom: '16px'}}>🎪</div>
                <h2 className="text-4xl font-bold mb-4" style={{color: '#3d3d3d'}}>校慶拾光地圖</h2>
                <p className="text-lg mb-6" style={{color: '#6b6b6b', fontWeight: '500'}}>
                  完成各個任務，蒐集徽章、領取獎品！
                </p>
                <button
                  onClick={handleLogin}
                  className="w-full clay-button mb-3" 
                >
                  🔐 使用 Google 登入
                </button>
              </div>
            </div>
          ) : (
            // 登入後的雙欄布局
            <div className="flex flex-col lg:flex-row gap-8 px-4 pt-6">
              {/* 左側：玩家卡片、進度條、獎品卡片 */}
              <div className="lg:w-1/3 flex flex-col gap-6">
                {/* 玩家卡片 */}
                <div className="premium-card clay-float">
                  {/* 玩家頭部 */}
                  <div className="flex items-center gap-4 mb-6 pb-6" style={{borderBottom: '2px solid rgba(0,0,0,0.06)'}}>
                    {user.photoURL ? (
                      <img src={user.photoURL} alt="玩家頭像" className="w-20 h-20 rounded-full object-cover" style={{border: '3px solid var(--duck-pond-blue)', boxShadow: '0 4px 12px rgba(107, 157, 198, 0.2)'}} />
                    ) : (
                      <div className="w-20 h-20 rounded-full flex items-center justify-center text-4xl font-bold" style={{background: 'linear-gradient(135deg, #6b9dc6, #a67b5b)', color: 'white', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}>
                        🦆
                      </div>
                    )}
                    <div>
                      <h3 className="font-bold text-xl" style={{color: '#3d3d3d'}}>{nickname || user.displayName}</h3>
                      <p className="text-sm font-semibold" style={{color: '#9a9a9a'}}>玩家 ID: {user.email?.split('@')[0].slice(0,3).toUpperCase()}</p>
                    </div>
                  </div>

                  {/* 進度條 */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-bold" style={{color: '#3d3d3d', fontSize: '16px'}}>⭐ 進度</span>
                      <span className="font-bold" style={{background: 'linear-gradient(90deg, #6b9dc6, #8fb372)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontSize: '16px'}}>{completed.length} / {TOTAL_QUESTS}</span>
                    </div>
                    <div className="progress-bar-container">
                      <div
                        className="progress-bar-fill"
                        style={{ width: `${(completed.length / TOTAL_QUESTS) * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-center text-sm font-semibold mt-3" style={{color: '#6b6b6b'}}>
                      完成度：{Math.round((completed.length / TOTAL_QUESTS) * 100)}%
                    </p>
                  </div>
                </div>

                {/* 獎品卡片 */}
                <div className="space-y-4">
                  {/* 10 關獎品 */}
                  <div className="premium-card" style={{background: canRedeemSmall ? 'linear-gradient(135deg, rgba(245, 163, 199, 0.15), rgba(212, 197, 232, 0.15))' : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.7))', opacity: canRedeemSmall ? 1 : 0.8}}>
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-bold text-lg" style={{color: '#3d3d3d'}}>🎁 小獎品</span>
                      <span className="text-xs px-3 py-1 font-semibold rounded-full clay-button" style={{fontSize: '12px'}}>{completed.length}/10 關</span>
                    </div>
                    <p className="text-sm mb-4" style={{color: '#6b6b6b', fontWeight: '500'}}>完成 10 關即可領取</p>
                    {redeemedRewards.includes(10) ? (
                      <button disabled className="w-full clay-button" style={{opacity: 0.5}}>
                        ✅ 已領取
                      </button>
                    ) : completed.length >= 10 ? (
                      <button
                        onClick={() => openRedeemModal(10)}
                        className="w-full clay-button"
                      >
                        🎊 兌換小獎品
                      </button>
                    ) : (
                      <button disabled className="w-full clay-button" style={{opacity: 0.5}}>
                        還差 {10 - completed.length} 關
                      </button>
                    )}
                  </div>

                  {/* 20 關獎品 */}
                  <div className="premium-card" style={{background: canRedeemBig ? 'linear-gradient(135deg, rgba(168, 216, 232, 0.15), rgba(252, 232, 178, 0.15))' : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.7))', opacity: canRedeemBig ? 1 : 0.8}}>
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-bold text-lg" style={{color: '#3d3d3d'}}>🏆 大獎品</span>
                      <span className="text-xs px-3 py-1 font-semibold rounded-full clay-button-blue" style={{fontSize: '12px'}}>{completed.length}/20 關</span>
                    </div>
                    <p className="text-sm mb-4" style={{color: '#6b6b6b', fontWeight: '500'}}>完成所有 20 關即可領取更好的獎品</p>
                    {redeemedRewards.includes(20) ? (
                      <button disabled className="w-full clay-button-blue" style={{opacity: 0.5}}>
                        ✅ 已領取
                      </button>
                    ) : completed.length >= 20 ? (
                      <button
                        onClick={() => openRedeemModal(20)}
                        className="w-full clay-button-blue animate-pulse"
                      >
                        👑 兌換大獎品
                      </button>
                    ) : (
                      <button disabled className="w-full clay-button-blue" style={{opacity: 0.5}}>
                        還差 {20 - completed.length} 關
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* 右側：任務卡片 */}
              <div className="lg:w-2/3 premium-card overflow-visible">
                <h3 className="font-bold mb-6 text-2xl" style={{color: '#3d3d3d'}}>🎮 所有任務 (共 {TOTAL_QUESTS} 關)</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-2">
                  {Array.from({ length: TOTAL_QUESTS }).map((_, index) => {
                    const questId = index + 1;
                    const quest = QUESTS.find(q => q.id === questId);
                    const isCompleted = completed.includes(questId);
                    const isUnlocked = unlockedTasks.includes(questId);

                    if (!isUnlocked) {
                      return (
                        <div key={questId} className="task-grid-item locked p-4 text-center flex flex-col items-center justify-center min-h-[120px]">
                          <div className="text-4xl mb-2 font-bold" style={{color: '#a67b5b', opacity: 0.5}}>#{questId}</div>
                          <Lock className="my-1" size={28} style={{opacity: 0.4}} />
                          <span className="text-xs font-semibold mt-2" style={{color: '#9a9a9a'}}>掃碼解鎖</span>
                        </div>
                      );
                    }

                    if (!quest) return null;

                    // 已完成的任務
                    if (isCompleted) {
                      return (
                        <div
                          key={questId}
                          className="task-grid-item completed p-4 text-center transition-all font-bold cursor-not-allowed relative flex flex-col items-center justify-center min-h-[120px]"
                        >
                          <div className="text-2xl font-bold mb-2" style={{color: '#8fb372'}}>#{questId}</div>
                          <div className="text-sm" style={{color: '#3d3d3d'}}>{THEME_NAMES[questId] || "未知主題"}</div>
                          <div className="completion-badge" style={{animation: 'badge-pop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)'}}>✓</div>
                        </div>
                      );
                    }

                    // 未完成但已解鎖的任務
                    return (
                      <a
                        key={questId}
                        href={`/scan/${quest.slug}`}
                        className="task-grid-item p-4 text-center transition-all font-bold cursor-pointer relative flex flex-col items-center justify-center min-h-[120px] hover:shadow-lg"
                      >
                        <div className="text-2xl font-bold mb-2" style={{color: '#6b9dc6'}}>#{questId}</div>
                        <div className="text-sm" style={{color: '#3d3d3d'}}>{THEME_NAMES[questId] || "未知主題"}</div>
                      </a>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 兌換模態 */}
        {showRedeemModal && (
          <div className="fixed inset-0 modal-overlay flex items-center justify-center z-50 p-4">
            <div className="modal-content max-w-sm w-full p-8 clay-shadow-lg">
              <div className="flex justify-between items-center mb-6 pb-6 border-b border-gray-200">
                <h3 className="text-2xl font-bold text-gray-800">
                  🎁 兌換 {redeemLevel === 10 ? "小" : "大"} 獎品
                </h3>
                <button
                  onClick={closeRedeemModal}
                  className="text-gray-500 hover:text-gray-800 transition-colors active:scale-90 font-bold text-2xl"
                >
                  ✕
                </button>
              </div>

              {/* 遊戲狀態展示 */}
              <div className="premium-card clay-shadow-sm p-4 mb-6">
                <h4 className="font-bold text-gray-800 mb-4 text-lg">📊 玩家遊戲狀態</h4>
                <div className="text-sm text-gray-700 space-y-2 font-semibold">
                  <p>👤 玩家：<span className="text-rose-600 font-bold">{nickname || user.displayName}</span></p>
                  <p>📧 信箱：<span className="text-rose-600 font-bold text-xs">{user.email}</span></p>
                  <p>🎮 完成關卡：<span className="text-green-600 font-bold">{completed.length} / {TOTAL_QUESTS}</span></p>
                  <p>🏆 已領獎品：<span className="text-blue-600 font-bold">{redeemedRewards.length > 0 ? redeemedRewards.join(", ") + "關" : "無"}</span></p>
                </div>
              </div>

              {/* 工作人員確認碼輸入 */}
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-800 mb-2">
                  ⚠️ 工作人員確認碼
                </label>
                <input
                  type="text"
                  placeholder="請輸入確認碼"
                  value={redeemConfirmCode}
                  onChange={(e) => setRedeemConfirmCode(e.target.value)}
                  className="w-full clay-input"
                />
                {redeemError && <p className="text-red-600 text-sm mt-2 font-bold">❌ {redeemError}</p>}
              </div>

              {/* 提交按鈕 */}
              <div className="flex gap-3">
                <button
                  onClick={closeRedeemModal}
                  className="flex-1 py-3 rounded-lg font-bold border border-gray-300 text-gray-800 hover:bg-gray-100 transition-all"
                >
                  取消
                </button>
                <button
                  onClick={handleRedeemSubmit}
                  className="flex-1 clay-button"
                >
                  ✅ 確認兌換
                </button>
              </div>

              <p className="text-xs text-gray-600 mt-4 text-center font-semibold">
                💾 確認碼經過驗證以防止重複兌換
              </p>
            </div>
          </div>
        )}

        {/* 暱稱輸入模態 */}
        {showNicknameModal && (
          <div className="fixed inset-0 modal-overlay flex items-center justify-center z-50 p-4">
            <div className="modal-content max-w-sm w-full p-8 clay-shadow-lg">
              <div className="flex justify-between items-center mb-6 pb-6 border-b border-gray-200">
                <h3 className="text-2xl font-bold text-gray-800">
                  👤 設定暱稱
                </h3>
                <button
                  onClick={() => setShowNicknameModal(false)}
                  className="text-gray-500 hover:text-gray-800 transition-colors active:scale-90 font-bold text-2xl"
                >
                  ✕
                </button>
              </div>

              {/* 說明 */}
              <div className="premium-card clay-shadow-sm p-4 mb-6">
                <p className="text-sm text-gray-700 font-semibold">請設定您的遊戲暱稱，這將代替您的真實姓名顯示在遊戲中。</p>
              </div>

              {/* 暱稱輸入 */}
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-800 mb-2">
                  📝 遊戲暱稱
                </label>
                <input
                  type="text"
                  placeholder="輸入您喜歡的暱稱"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="w-full clay-input"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleSaveNickname();
                    }
                  }}
                />
              </div>

              {/* 提交按鈕 */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowNicknameModal(false)}
                  className="flex-1 py-3 rounded-lg font-bold border border-gray-300 text-gray-800 hover:bg-gray-100 transition-all"
                >
                  稍後設定
                </button>
                <button
                  onClick={handleSaveNickname}
                  className="flex-1 clay-button"
                >
                  ✅ 確認
                </button>
              </div>

              <p className="text-xs text-gray-600 mt-4 text-center font-semibold">
                💡 暱稱會在您下次登入時隨時更新
              </p>
            </div>
          </div>
        )}

        {/* 隱私說明模態 */}
        {showPrivacyModal && (
          <div className="fixed inset-0 modal-overlay flex items-center justify-center z-50 p-4">
            <div className="modal-content max-w-lg w-full p-8 clay-shadow-lg">
              <div className="flex justify-between items-center mb-6 pb-6 border-b border-gray-200">
                <h3 className="text-2xl font-bold text-gray-800">
                  📸 圖片隱私說明
                </h3>
              </div>

              {/* 隱私說明內容 */}
              <div className="space-y-4 mb-6">
                <div className="premium-card clay-shadow-sm p-4">
                  <h4 className="font-bold text-rose-600 mb-2 flex items-center gap-2">
                    <span>📺 當天大螢幕</span>
                  </h4>
                  <p className="text-gray-700 font-semibold text-sm">
                    您上傳的圖片將在活動現場的大螢幕上播放，讓全校同學看到您的精彩表現。
                  </p>
                </div>

                <div className="premium-card clay-shadow-sm p-4">
                  <h4 className="font-bold text-blue-600 mb-2 flex items-center gap-2">
                    <span>🎁 紀念保存</span>
                  </h4>
                  <p className="text-gray-700 font-semibold text-sm">
                    您的圖片將被保存，作為校慶拾光地圖的活動紀念，讓我們永遠記住這美好的回憶。
                  </p>
                </div>

                <div className="premium-card clay-shadow-sm p-4">
                  <h4 className="font-bold text-yellow-600 mb-2 flex items-center gap-2">
                    <span>⚠️ 自制提醒</span>
                  </h4>
                  <p className="text-gray-700 font-semibold text-sm">
                    請上傳得體、適合全校播放的圖片。我們希望您能對自己上傳的內容負責，確保圖片符合校園文化。
                  </p>
                </div>
              </div>

              {/* 同意勾選 */}
              <div className="flex items-center gap-3 mb-6 premium-card clay-shadow-sm p-4">
                <input
                  type="checkbox"
                  id="privacyCheckbox"
                  checked={privacyAgreed}
                  onChange={(e) => setPrivacyAgreed(e.target.checked)}
                  className="w-6 h-6 border-2 border-gray-400 cursor-pointer rounded"
                />
                <label htmlFor="privacyCheckbox" className="font-semibold text-gray-800 cursor-pointer flex-1">
                  我已了解上述說明，同意上傳符合要求的圖片
                </label>
              </div>

              {/* 按鈕 */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowPrivacyModal(false)}
                  className="flex-1 py-3 rounded-lg font-bold border border-gray-300 text-gray-800 hover:bg-gray-100 transition-all"
                >
                  返回修改暱稱
                </button>
                <button
                  onClick={() => {
                    if (privacyAgreed) {
                      setShowPrivacyModal(false);
                    } else {
                      alert("✅ 請勾選同意框才能繼續");
                    }
                  }}
                  disabled={!privacyAgreed}
                  className={`flex-1 py-3 rounded-lg font-bold transition-all ${ 
                    privacyAgreed
                      ? "clay-button"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  ✅ 我已同意
                </button>
              </div>

              <p className="text-xs text-gray-600 mt-4 text-center font-semibold">
                🔒 感謝您對活動品質的重視
              </p>
            </div>
          </div>
        )}

        {/* 管理員模態 - 清除所有用戶數據 */}
        {showAdminMode && (
          <div className="fixed inset-0 modal-overlay flex items-center justify-center z-50 p-4">
            <div className="modal-content max-w-sm w-full p-8 clay-shadow-lg" style={{borderColor: 'rgba(239, 68, 68, 0.5)'}}>
              <div className="flex justify-between items-center mb-6 pb-6 border-b border-red-200">
                <h3 className="text-2xl font-bold text-red-700">
                  ⚙️ 管理員面板
                </h3>
                <button
                  onClick={() => {
                    setShowAdminMode(false);
                    setAdminPassword("");
                  }}
                  className="text-red-700 hover:text-red-900 transition-colors active:scale-90 font-bold text-2xl"
                >
                  ✕
                </button>
              </div>

              {/* 警告提示 */}
              <div className="premium-card clay-shadow-sm p-4 mb-6 border-l-4 border-red-600">
                <h4 className="font-bold text-red-700 mb-2 text-lg">⚠️ 警告</h4>
                <p className="text-sm text-red-700 font-semibold">此操作將清除 <span className="font-bold">所有用戶的遊戲進度</span>，包括已完成的關卡和已兌換的獎品。此操作 <span className="font-bold">無法復原</span>！</p>
              </div>

              {/* 密碼輸入 */}
              <div className="mb-6">
                <label className="block text-sm font-bold text-red-700 mb-2">
                  🔑 管理員密碼
                </label>
                <input
                  type="password"
                  placeholder="請輸入管理員密碼"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full clay-input"
                />
              </div>

              {/* 提交按鈕 */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowAdminMode(false);
                    setAdminPassword("");
                  }}
                  className="flex-1 py-3 rounded-lg font-bold border border-gray-300 text-gray-800 hover:bg-gray-100 transition-all"
                >
                  取消
                </button>
                <button
                  onClick={handleClearAllData}
                  className="flex-1 py-3 rounded-lg font-bold text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 transition-all"
                >
                  🗑️ 清除所有數據
                </button>
              </div>

              <p className="text-xs text-red-600 mt-4 text-center font-semibold">
                🔒 密碼受保護以防止誤操作
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
