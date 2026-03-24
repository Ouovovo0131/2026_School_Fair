"use client";
import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc, collection, getDocs, deleteDoc } from "firebase/firestore";
import { LogOut, Map, Settings, Lock, ChevronRight } from "lucide-react";
import { THEME_NAMES } from "./tasks";
import { QUESTS } from "../../constants/quests";
import MapComponent from "./Map";

const TOTAL_QUESTS = 20;
const SMALL_REWARD_THRESHOLD = 10;
const BIG_REWARD_THRESHOLD = 20;

interface HomeProps {
  unlockedTasks?: number[];
}

export default function Home({ unlockedTasks = [] }: HomeProps) {
  const [user, setUser] = useState<any>(null);
  const [completed, setCompleted] = useState<number[]>([]);
  const [redeemedRewards, setRedeemedRewards] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [redeemConfirmCode, setRedeemConfirmCode] = useState("");
  const [redeemLevel, setRedeemLevel] = useState<number | null>(null);
  const [redeemError, setRedeemError] = useState("");
  const [showAdminMode, setShowAdminMode] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [showNicknameModal, setShowNicknameModal] = useState(false);
  const [nickname, setNickname] = useState("");
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [privacyAgreed, setPrivacyAgreed] = useState(false);

  const [userMode, setUserMode] = useState<'select' | 'game' | 'map' | 'game-map'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('userMode');
      if (saved === 'game') return 'game';
    }
    return 'select';
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('userMode', userMode);
    }
  }, [userMode]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const docRef = doc(db, "users", currentUser.email!);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setCompleted(data.completedQuests || []);
          setRedeemedRewards(data.redeemedRewards || []);
          setNickname(data.nickname || "");
          if (!data.nickname || data.nickname.trim() === "") setShowNicknameModal(true);
        } else {
          await setDoc(docRef, { email: currentUser.email, name: currentUser.displayName, nickname: "", completedQuests: [], redeemedRewards: [] });
          setCompleted([]); setRedeemedRewards([]); setNickname("");
          setShowNicknameModal(true);
        }
      } else {
        setUser(null); setCompleted([]); setRedeemedRewards([]); setNickname("");
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try { await signInWithPopup(auth, new GoogleAuthProvider()); }
    catch (error) { console.error(error); alert("登入失敗，請檢查網路設定"); }
  };

  const handleLogout = async () => { await signOut(auth); window.location.reload(); };

  const openRedeemModal = (level: number) => {
    setRedeemLevel(level); setShowRedeemModal(true);
    setRedeemConfirmCode(""); setRedeemError("");
  };
  const closeRedeemModal = () => {
    setShowRedeemModal(false); setRedeemConfirmCode("");
    setRedeemError(""); setRedeemLevel(null);
  };

  const handleRedeemSubmit = async () => {
    if (!redeemConfirmCode.trim()) { setRedeemError("請輸入確認碼"); return; }
    const smallPassword = process.env.NEXT_PUBLIC_STAFF_SMALL_PASSWORD || "STAFF10";
    const bigPassword = process.env.NEXT_PUBLIC_STAFF_BIG_PASSWORD || "STAFF20";
    const expectedCode = redeemLevel === 10 ? smallPassword : bigPassword;
    if (redeemConfirmCode.toUpperCase() !== expectedCode) { setRedeemError("❌ 確認碼錯誤"); return; }
    try {
      const userRef = doc(db, "users", user.email);
      const newRedeemedRewards = [...redeemedRewards, redeemLevel!];
      await updateDoc(userRef, { redeemedRewards: newRedeemedRewards });
      setRedeemedRewards(newRedeemedRewards);
      alert(`🎉 ${redeemLevel === 10 ? "小" : "大"}獎品兌換成功！`);
      closeRedeemModal();
    } catch (error) { setRedeemError("連線錯誤，請重試"); }
  };

  const handleSaveNickname = async () => {
    if (!nickname.trim()) { alert("請輸入暱稱"); return; }
    try {
      const userRef = doc(db, "users", user.email);
      await updateDoc(userRef, { nickname });
      setShowNicknameModal(false); setPrivacyAgreed(false); setShowPrivacyModal(true);
    } catch { alert("❌ 保存失敗，請重試"); }
  };

  const handleClearAllData = async () => {
    const correctPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "ADMIN2025";
    if (adminPassword !== correctPassword) { alert("❌ 密碼錯誤"); return; }
    if (!window.confirm("⚠️ 確定要清除所有用戶的遊戲進度？此操作無法復原！")) return;
    try {
      const snapshot = await getDocs(collection(db, "users"));
      for (const d of snapshot.docs) await deleteDoc(doc(db, "users", d.id));
      localStorage.removeItem("unlockedTasks");
      alert("✅ 所有用戶數據已清除");
      setAdminPassword(""); setShowAdminMode(false);
      window.location.reload();
    } catch { alert("❌ 清除失敗，請重試"); }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{background: 'linear-gradient(180deg, #d4e5f0 0%, #f5ede0 100%)'}}>
      <span className="text-base font-semibold" style={{color: '#6b6b6b'}}>載入中…</span>
    </div>
  );

  const pct = Math.round((completed.length / TOTAL_QUESTS) * 100);

  // ─── 渲染分支：地圖 ───────────────────────────────────
  if (userMode === 'map') return <MapComponent onBack={() => setUserMode('select')} isModal={false} />;
  if (userMode === 'game-map') return <MapComponent onBack={() => setUserMode('game')} isModal={false} />;

  return (
    <div className="min-h-screen" style={{background: 'linear-gradient(180deg, #d4e5f0 0%, #f5ede0 60%, #e8dcc8 100%)'}}>

      {/* ── 導航列 ── */}
      <header className="premium-nav sticky top-0 z-10">
        <div className="flex items-center justify-between px-4 h-14">
          <h1 className="text-xl font-black truncate tracking-wide" style={{color: '#3d3d3d', maxWidth: '55%', textShadow: '1px 2px 0px rgba(245,163,199,0.8)'}}>🎪 校慶拾光地圖</h1>
          <div className="flex items-center gap-2 shrink-0">
            {user && userMode === 'game' && (
              <button onClick={() => setUserMode('game-map')}
                className="clay-button clay-button-blue flex items-center gap-1 !py-2 !px-3 !text-sm !rounded-xl">
                <Map size={15}/><span>地圖</span>
              </button>
            )}
            {user && (
              <button onClick={() => setShowAdminMode(!showAdminMode)}
                className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/30 transition-all"
                style={{color: '#3d3d3d'}}>
                <Settings size={20}/>
              </button>
            )}
            {user && (
              <button onClick={handleLogout}
                className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/30 transition-all"
                style={{color: '#3d3d3d'}}>
                <LogOut size={20}/>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ── 主內容 ── */}
      <main className="px-4 py-5 max-w-lg mx-auto space-y-4">

        {/* 未登入 */}
        {!user ? (
          <div className="premium-card clay-shadow-md mt-10 p-8 text-center">
            <div className="text-6xl mb-4 animate-bounce">🎢</div>
            <h2 className="text-3xl font-black mb-2 tracking-wide" style={{color: '#3d3d3d', textShadow: '2px 2px 0px #f5a3c7'}}>校慶拾光地圖</h2>
            <p className="text-sm mb-6 font-medium" style={{color: '#6b6b6b'}}>完成各個任務，蒐集徽章、領取獎品！</p>
            <button onClick={handleLogin} className="w-full clay-button">🔐 使用 Google 登入</button>
          </div>

        /* 流程選擇 */
        ) : userMode === 'select' ? (
          <div className="space-y-3 mt-6">
            <p className="text-center text-sm font-semibold mb-4" style={{color: '#6b6b6b'}}>選擇您想要進行的活動</p>
            <button onClick={() => setUserMode('game')}
              className="w-full premium-card clay-shadow-sm p-5 flex items-center justify-between transition-all hover:-translate-y-1 active:scale-[0.98] border-b-4"
              style={{borderColor: '#f5a3c7', background: 'linear-gradient(135deg,rgba(245,163,199,0.2),rgba(212,197,232,0.2))'}}>
              <div className="text-left">
                <p className="text-base font-bold" style={{color: '#3d3d3d'}}>🎯 玩遊戲</p>
                <p className="text-xs mt-0.5 font-medium" style={{color: '#6b6b6b'}}>完成任務，蒐集徽章、領取獎品</p>
              </div>
              <ChevronRight size={20} style={{color: '#f5a3c7', flexShrink: 0}}/>
            </button>
            <button onClick={() => setUserMode('map')}
              className="w-full premium-card clay-shadow-sm p-5 flex items-center justify-between transition-all hover:-translate-y-1 active:scale-[0.98] border-b-4"
              style={{borderColor: '#a8d8e8', background: 'linear-gradient(135deg,rgba(168,216,232,0.2),rgba(252,232,178,0.2))'}}>
              <div className="text-left">
                <p className="text-base font-bold" style={{color: '#3d3d3d'}}>🗺️ 查看地圖</p>
                <p className="text-xs mt-0.5 font-medium" style={{color: '#6b6b6b'}}>瀏覽校慶園遊會的所有攤位位置</p>
              </div>
              <ChevronRight size={20} style={{color: '#a8d8e8', flexShrink: 0}}/>
            </button>
          </div>

        /* 遊戲主畫面 */
        ) : (
          <>
            {/* 玩家資訊卡 */}
            <div className="premium-card clay-shadow-sm p-4">
              <div className="flex items-center gap-3 mb-3">
                {user.photoURL
                  ? <img src={user.photoURL} alt="頭像" className="w-11 h-11 rounded-full object-cover shrink-0" style={{border: '2px solid #a8d8e8'}}/>
                  : <div className="w-11 h-11 rounded-full flex items-center justify-center text-xl shrink-0" style={{background: 'linear-gradient(135deg,#6b9dc6,#a67b5b)',color:'white'}}>🦆</div>
                }
                <div className="min-w-0">
                  <p className="font-bold text-sm truncate" style={{color: '#3d3d3d'}}>{nickname || user.displayName}</p>
                  <p className="text-xs" style={{color: '#9a9a9a'}}>ID: {user.email?.split('@')[0].slice(0,6).toUpperCase()}</p>
                </div>
                <div className="ml-auto shrink-0 text-right">
                  <p className="text-xs font-semibold" style={{color: '#6b6b6b'}}>進度</p>
                  <p className="text-sm font-bold" style={{color: '#3d3d3d'}}>{completed.length}/{TOTAL_QUESTS}</p>
                </div>
              </div>
              {/* 進度條 */}
              <div className="progress-bar-container bg-white/50 rounded-full h-3 overflow-hidden border border-gray-200 mt-2">
                <div className="progress-bar-fill h-full rounded-full transition-all duration-500" 
                  style={{
                    width: `${pct}%`,
                    background: 'linear-gradient(90deg, #f5a3c7, #a8d8e8)',
                    backgroundImage: 'linear-gradient(45deg, rgba(255,255,255,0.3) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0.3) 75%, transparent 75%, transparent)',
                    backgroundSize: '1rem 1rem',
                    animation: 'progress-stripes 2s linear infinite'
                  }}
                />
              </div>
              <p className="text-xs text-right mt-1 font-semibold" style={{color: '#6b6b6b'}}>{pct}%</p>
            </div>

            {/* 獎品區 — 橫排兩張卡 */}
            <div className="grid grid-cols-2 gap-3">
              {/* 小獎品 */}
              <div className={`premium-card clay-shadow-sm p-3 flex flex-col gap-2 ${completed.length >= 10 && !redeemedRewards.includes(10) ? 'reward-available' : ''}`}
                style={{background: completed.length >= 10 && !redeemedRewards.includes(10)
                  ? 'linear-gradient(135deg,rgba(245,163,199,0.18),rgba(212,197,232,0.18))' : undefined}}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold" style={{color: '#3d3d3d'}}>🎁 小獎</span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{background: '#f5a3c7', color: 'white', whiteSpace: 'nowrap'}}>
                    {completed.length}/10
                  </span>
                </div>
                <p className="text-xs" style={{color: '#6b6b6b'}}>完成 10 關領取</p>
                {redeemedRewards.includes(10) ? (
                  <button disabled className="w-full clay-button !text-xs !py-2 !rounded-2xl" style={{opacity:0.5}}>✅ 已領取</button>
                ) : completed.length >= 10 ? (
                  <button onClick={() => openRedeemModal(10)} className="w-full clay-button !text-xs !py-2 !rounded-2xl animate-pulse">🎊 兌換</button>
                ) : (
                  <button disabled className="w-full clay-button !text-xs !py-2 !rounded-2xl" style={{opacity:0.5}}>差 {10 - completed.length} 關</button>
                )}
              </div>

              {/* 大獎品 */}
              <div className={`premium-card clay-shadow-sm p-3 flex flex-col gap-2 ${completed.length >= 20 && !redeemedRewards.includes(20) ? 'reward-available' : ''}`}
                style={{background: completed.length >= 20 && !redeemedRewards.includes(20)
                  ? 'linear-gradient(135deg,rgba(168,216,232,0.18),rgba(252,232,178,0.18))' : undefined}}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold" style={{color: '#3d3d3d'}}>🏆 大獎</span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{background: '#a8d8e8', color: 'white', whiteSpace: 'nowrap'}}>
                    {completed.length}/20
                  </span>
                </div>
                <p className="text-xs" style={{color: '#6b6b6b'}}>完成 20 關領取</p>
                {redeemedRewards.includes(20) ? (
                  <button disabled className="w-full clay-button clay-button-blue !text-xs !py-2 !rounded-2xl" style={{opacity:0.5,color:'white'}}>✅ 已領取</button>
                ) : completed.length >= 20 ? (
                  <button onClick={() => openRedeemModal(20)} className="w-full clay-button clay-button-blue !text-xs !py-2 !rounded-2xl animate-pulse" style={{color:'white'}}>👑 兌換</button>
                ) : (
                  <button disabled className="w-full clay-button clay-button-blue !text-xs !py-2 !rounded-2xl" style={{opacity:0.5,color:'white'}}>差 {20 - completed.length} 關</button>
                )}
              </div>
            </div>

            {/* 任務格子 */}
            <div className="premium-card clay-shadow-sm p-4">
              <h3 className="text-base font-bold mb-3" style={{color: '#3d3d3d'}}>🎮 任務列表 ({TOTAL_QUESTS} 關)</h3>
              <div className="grid grid-cols-4 gap-2">
                {Array.from({ length: TOTAL_QUESTS }).map((_, index) => {
                  const questId = index + 1;
                  const quest = QUESTS.find(q => q.id === questId);
                  const isCompleted = completed.includes(questId);
                  const isUnlocked = unlockedTasks.includes(questId);

                  if (!isUnlocked) return (
                    <div key={questId}
                      className="aspect-square rounded-2xl flex flex-col items-center justify-center gap-0.5"
                      style={{
                        background: 'rgba(0,0,0,0.04)', 
                        border: '1.5px solid rgba(0,0,0,0.07)',
                        borderBottom: '4px solid rgba(0,0,0,0.1)'
                      }}>
                      <Lock size={16} style={{color: '#bbb'}}/>
                      <span className="text-xs font-bold" style={{color: '#bbb'}}>#{questId}</span>
                    </div>
                  );

                  if (!quest) return null;

                  if (isCompleted) return (
                    <div key={questId}
                      className="aspect-square rounded-2xl flex flex-col items-center justify-center gap-0.5 relative"
                      style={{
                        background: 'linear-gradient(135deg,rgba(245,163,199,0.3),rgba(168,216,232,0.3))', 
                        border: '1.5px solid rgba(245,163,199,0.5)',
                        borderBottom: '4px solid rgba(245,163,199,0.6)'
                      }}>
                      <span className="text-xl font-black drop-shadow-sm" style={{color: '#d16d99'}}>✓</span>
                      <span className="text-xs font-bold" style={{color: '#6b6b6b'}}>#{questId}</span>
                    </div>
                  );

                  return (
                    <a key={questId} href={`/scan/${quest.slug}`}
                      className="aspect-square rounded-2xl flex flex-col items-center justify-center gap-0.5 transition-all hover:-translate-y-1 active:scale-95 active:translate-y-0"
                      style={{
                        background: 'linear-gradient(180deg, rgba(255,255,255,0.9) 0%, rgba(240,248,255,0.8) 100%)', 
                        border: '1.5px solid rgba(107,157,198,0.3)',
                        borderBottom: '4px solid rgba(107,157,198,0.4)',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
                      }}>
                      <span className="text-sm font-black" style={{color: '#6b9dc6'}}>#{questId}</span>
                      <span className="text-[10px] font-bold text-center px-0.5 leading-tight text-gray-700"
                        style={{color: '#3d3d3d', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'}}>
                        {THEME_NAMES[questId] || "任務"}
                      </span>
                    </a>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </main>

      {/* ── 兌換模態 ── */}
      {showRedeemModal && (
        <div className="fixed inset-0 modal-overlay flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="modal-content w-full sm:max-w-sm p-6 rounded-t-3xl sm:rounded-3xl clay-shadow-lg">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-bold" style={{color: '#3d3d3d'}}>
                {redeemLevel === 10 ? '🎁 兌換小獎品' : '🏆 兌換大獎品'}
              </h3>
              <button onClick={closeRedeemModal} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 font-bold text-lg text-gray-500">✕</button>
            </div>
            <div className="premium-card clay-shadow-sm p-3 mb-4 space-y-1">
              <p className="text-sm font-semibold" style={{color: '#3d3d3d'}}>👤 {nickname || user?.displayName}</p>
              <p className="text-xs" style={{color: '#6b6b6b'}}>✉️ {user?.email}</p>
              <p className="text-sm font-semibold" style={{color: '#3d3d3d'}}>🎮 完成：<span style={{color: '#8fb372'}}>{completed.length}/{TOTAL_QUESTS} 關</span></p>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-bold mb-1.5" style={{color: '#3d3d3d'}}>⚠️ 工作人員確認碼</label>
              <input type="text" placeholder="請輸入確認碼" value={redeemConfirmCode}
                onChange={e => setRedeemConfirmCode(e.target.value)} className="w-full clay-input text-black font-bold border-2 border-gray-200 focus:border-pink-300"/>
              {redeemError && <p className="text-red-500 text-xs mt-1.5 font-bold">{redeemError}</p>}
            </div>
            <div className="flex gap-2">
              <button onClick={closeRedeemModal}
                className="flex-1 py-3 rounded-2xl font-bold text-sm border border-gray-200 text-gray-600 hover:bg-gray-50">取消</button>
              <button onClick={handleRedeemSubmit} className="flex-1 clay-button !text-sm">✅ 確認兌換</button>
            </div>
          </div>
        </div>
      )}

      {/* ── 暱稱模態 ── */}
      {showNicknameModal && (
        <div className="fixed inset-0 modal-overlay flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="modal-content w-full sm:max-w-sm p-6 rounded-t-3xl sm:rounded-3xl clay-shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold" style={{color: '#3d3d3d'}}>👤 設定暱稱</h3>
              <button onClick={() => setShowNicknameModal(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 font-bold text-lg text-gray-500">✕</button>
            </div>
            <p className="text-sm font-medium mb-4" style={{color: '#6b6b6b'}}>請設定您的遊戲暱稱，這將代替您的真實姓名顯示在遊戲中。</p>
            <input type="text" placeholder="輸入您喜歡的暱稱" value={nickname}
              onChange={e => setNickname(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && handleSaveNickname()}
              className="w-full clay-input mb-4 text-black font-bold border-2 border-gray-200 focus:border-blue-300"/>
            <div className="flex gap-2">
              <button onClick={() => setShowNicknameModal(false)}
                className="flex-1 py-3 rounded-2xl font-bold text-sm border border-gray-200 text-gray-600 hover:bg-gray-50">稍後設定</button>
              <button onClick={handleSaveNickname} className="flex-1 clay-button !text-sm">✅ 確認</button>
            </div>
          </div>
        </div>
      )}

      {/* ── 隱私說明模態 ── */}
      {showPrivacyModal && (
        <div className="fixed inset-0 modal-overlay flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="modal-content w-full sm:max-w-md p-6 rounded-t-3xl sm:rounded-3xl clay-shadow-lg max-h-[85vh] overflow-y-auto">
            <h3 className="text-lg font-bold mb-4" style={{color: '#3d3d3d'}}>📸 圖片隱私說明</h3>
            <div className="space-y-3 mb-4">
              {[
                { icon: '📺', title: '當天大螢幕', color: '#e85c8a', text: '您上傳的圖片將在活動現場的大螢幕上播放，讓全校同學看到您的精彩表現。' },
                { icon: '🎁', title: '紀念保存', color: '#4a90d9', text: '您的圖片將被保存，作為校慶拾光地圖的活動紀念，讓我們永遠記住這美好的回憶。' },
                { icon: '⚠️', title: '自制提醒', color: '#d4a017', text: '請上傳得體、適合全校播放的圖片，確保圖片符合校園文化。' },
              ].map(item => (
                <div key={item.title} className="premium-card clay-shadow-sm p-3">
                  <p className="text-sm font-bold mb-1" style={{color: item.color}}>{item.icon} {item.title}</p>
                  <p className="text-xs font-medium" style={{color: '#6b6b6b'}}>{item.text}</p>
                </div>
              ))}
            </div>
            <label className="flex items-center gap-3 premium-card clay-shadow-sm p-3 mb-4 cursor-pointer">
              <input type="checkbox" checked={privacyAgreed} onChange={e => setPrivacyAgreed(e.target.checked)}
                className="w-5 h-5 rounded border-gray-400"/>
              <span className="text-sm font-semibold" style={{color: '#3d3d3d'}}>我已了解上述說明，同意上傳符合要求的圖片</span>
            </label>
            <div className="flex gap-2">
              <button onClick={() => setShowPrivacyModal(false)}
                className="flex-1 py-3 rounded-2xl font-bold text-sm border border-gray-200 text-gray-600 hover:bg-gray-50">返回修改暱稱</button>
              <button
                onClick={() => { if (privacyAgreed) { setShowPrivacyModal(false); setUserMode('select'); } else alert("請勾選同意框才能繼續"); }}
                disabled={!privacyAgreed}
                className={`flex-1 !text-sm ${privacyAgreed ? 'clay-button' : 'py-3 rounded-2xl font-bold bg-gray-200 text-gray-400 cursor-not-allowed'}`}>
                ✅ 我已同意
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 管理員模態 ── */}
      {showAdminMode && (
        <div className="fixed inset-0 modal-overlay flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="modal-content w-full sm:max-w-sm p-6 rounded-t-3xl sm:rounded-3xl clay-shadow-lg" style={{borderColor: 'rgba(239,68,68,0.3)'}}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-red-700">⚙️ 管理員面板</h3>
              <button onClick={() => { setShowAdminMode(false); setAdminPassword(""); }}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-50 font-bold text-lg text-red-500">✕</button>
            </div>
            <div className="premium-card clay-shadow-sm p-3 mb-4 border-l-4 border-red-500">
              <p className="text-sm font-semibold text-red-700">⚠️ 此操作將清除<strong>所有用戶的遊戲進度</strong>，無法復原！</p>
            </div>
            <input type="password" placeholder="請輸入管理員密碼" value={adminPassword}
              onChange={e => setAdminPassword(e.target.value)} className="w-full clay-input mb-4 text-black font-bold border-2 border-red-200 focus:border-red-400"/>
            <div className="flex gap-2">
              <button onClick={() => { setShowAdminMode(false); setAdminPassword(""); }}
                className="flex-1 py-3 rounded-2xl font-bold text-sm border border-gray-200 text-gray-600 hover:bg-gray-50">取消</button>
              <button onClick={handleClearAllData}
                className="flex-1 py-3 rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-red-500 to-red-600">🗑️ 清除數據</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}