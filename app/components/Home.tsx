"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc, collection, getDocs, deleteDoc } from "firebase/firestore";
import { LogOut, Lock, ChevronRight, CalendarDays, Clock3, ArrowLeft } from "lucide-react";
import { THEME_NAMES } from "./tasks";
import { QUESTS } from "../../constants/quests";
import MapComponent from "./Map";
import Countdown from "@/app/components/Countdown";
import Timeline from "@/app/components/Timeline";
import ComicCard from "@/app/components/ui/ComicCard";
import NumberBadge from "@/app/components/ui/NumberBadge";

const TOTAL_QUESTS = 20;
const SMALL_REWARD_THRESHOLD = 10;
const BIG_REWARD_THRESHOLD = 20;

interface HomeProps {
  unlockedTasks?: number[];
}

interface LocalUser {
  email?: string | null;
  displayName?: string | null;
  photoURL?: string | null;
}

type ViewMode = 'home' | 'select' | 'game' | 'map' | 'game-map';

function GamepadIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block ${className}`}
      style={{
        backgroundColor: "currentColor",
        WebkitMaskImage: "url('/game.png')",
        WebkitMaskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
        WebkitMaskSize: "contain",
        maskImage: "url('/game.png')",
        maskRepeat: "no-repeat",
        maskPosition: "center",
        maskSize: "contain",
      }}
    />
  );
}

const STUDENT_EMAIL_DOMAIN = "@hlhs.hlc.edu.tw";

function isStudentEmail(email?: string | null) {
  return Boolean(email && email.toLowerCase().endsWith(STUDENT_EMAIL_DOMAIN));
}

export default function Home({ unlockedTasks: unlockedTasksProp = [] }: HomeProps) {
  const router = useRouter();
  const [user, setUser] = useState<LocalUser | null>(null);
  const [completed, setCompleted] = useState<number[]>([]);
  const [redeemedRewards, setRedeemedRewards] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [showIntro, setShowIntro] = useState(false);
  const [isStudent, setIsStudent] = useState(false);
  const [showNicknameModal, setShowNicknameModal] = useState(false);
  const [nickname, setNickname] = useState("");
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [privacyAgreed, setPrivacyAgreed] = useState(false);

  const [userMode, setUserMode] = useState<ViewMode>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('userMode');
      if (saved === 'home' || saved === 'select' || saved === 'game' || saved === 'map' || saved === 'game-map') return saved;
    }
    return 'home';
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('userMode', userMode);
    }
  }, [userMode]);

  // unlocked tasks state (writable) - initialize from localStorage or prop
  const [unlockedTasks, setUnlockedTasks] = useState<number[]>(() => {
    if (typeof window === 'undefined') return unlockedTasksProp || [];
    const saved = window.localStorage.getItem('unlockedTasks');
    return saved ? JSON.parse(saved) : (unlockedTasksProp || []);
  });

  // helper to persist unlocked tasks
  const persistUnlockedTasks = (arr: number[]) => {
    setUnlockedTasks(arr);
    if (typeof window !== 'undefined') window.localStorage.setItem('unlockedTasks', JSON.stringify(arr));
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // allow any user to sign in, but remember whether they're a student
        setIsStudent(isStudentEmail(currentUser.email));
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

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const seenIntro = window.localStorage.getItem('seenHomeIntro');
    if (seenIntro === '1') return;

    setShowIntro(true);
    window.localStorage.setItem('seenHomeIntro', '1');

    const timer = window.setTimeout(() => setShowIntro(false), 1600);
    return () => window.clearTimeout(timer);
  }, []);

  const handleLogin = async () => {
    try { await signInWithPopup(auth, new GoogleAuthProvider()); }
    catch (error) { console.error(error); alert("登入失敗，請檢查網路設定"); }
  };

  const handleLogout = async () => { await signOut(auth); window.location.reload(); };

  const handleSaveNickname = async () => {
    if (!nickname.trim()) { alert("請輸入暱稱"); return; }
    if (!user?.email) { alert("使用者資料異常，請重新登入"); return; }
    try {
      const userRef = doc(db, "users", user.email);
      await updateDoc(userRef, { nickname });
      setShowNicknameModal(false); setPrivacyAgreed(false); setShowPrivacyModal(true);
    } catch { alert("❌ 保存失敗，請重試"); }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{background: 'var(--bg)'}}>
      <span className="text-base font-semibold" style={{color: 'var(--primary)'}}>載入中…</span>
    </div>
  );

  const pct = Math.round((completed.length / TOTAL_QUESTS) * 100);
  const goHome = () => setUserMode('home');
  const ADMIN_EMAIL = "cheiling0131@gmail.com";

  const goGameHub = async () => {
    // if not logged in, trigger popup login first
    if (!user) {
      try {
        const result = await signInWithPopup(auth, new GoogleAuthProvider());
        const email = (result.user?.email || "").toLowerCase();
        // 允許任何已登入的使用者進入遊戲；管理員仍自動解鎖所有關卡
        if (email.toLowerCase() === ADMIN_EMAIL) {
          const all = Array.from({ length: TOTAL_QUESTS }, (_, i) => i + 1);
          persistUnlockedTasks(all);
        }
        setUserMode('game');
      } catch (err) {
        console.error(err);
        alert('登入失敗，請重試');
      }
      return;
    }

    // 已登入使用者可以直接進入遊戲；管理員自動解鎖所有關卡
    const currentEmail = (user?.email || '').toLowerCase();
    if (currentEmail === ADMIN_EMAIL) {
      const all = Array.from({ length: TOTAL_QUESTS }, (_, i) => i + 1);
      persistUnlockedTasks(all);
    }
    setUserMode('game');
  };

  const openAdminRedeemPage = () => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("adminAccessGranted", "1");
    }
    router.push("/admin/redeem");
  };
  const isMapMode = userMode === 'map' || userMode === 'game-map';

  return (
    <div className="min-h-screen" style={{background: 'var(--bg)'}}>
      {showIntro && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-[rgba(252,242,204,0.92)] backdrop-blur-sm animate-[intro-overlay_1.6s_ease]">
          <div className="premium-card flex flex-col items-center gap-3 px-6 py-5 text-center animate-[intro-pop_1.6s_ease]">
            <div className="text-5xl">🎪</div>
            <div>
              <p className="text-xs font-black tracking-[0.3em]" style={{ color: 'var(--primary)' }}>2026</p>
              <h2 className="text-2xl font-black" style={{ color: 'var(--text)' }}>拾光地圖:重返1936</h2>
            </div>
          </div>
        </div>
      )}

      {/* ── 導航列 ── */}
      <header className="sticky-header">
        <div className="flex items-center justify-between px-3 sm:px-4 md:px-6 h-14 sm:h-16 max-w-6xl mx-auto gap-2">
          <h1 className="text-sm sm:text-base md:text-lg lg:text-xl font-black truncate tracking-tight" style={{color: 'var(--bg-100)', maxWidth: '60%'}}>🎪 拾光地圖</h1>
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {(userMode === 'game' || !user) && (
              <button onClick={() => setUserMode(user ? 'game-map' : 'map')}
                className="clay-button clay-button-yellow flex items-center gap-0.5 !py-1.5 sm:!py-2 !px-2 sm:!px-3 !text-xs sm:!text-sm !rounded-none">
                <img src="/Map_icon.png" alt="" aria-hidden="true" className="h-3.5 sm:h-4 w-3.5 sm:w-4 object-contain" />
                <span className="hidden sm:inline">地圖</span>
              </button>
            )}
            {user && user.email === "cheiling0131@gmail.com" && (
              <button onClick={openAdminRedeemPage}
                className="clay-button clay-button-yellow flex items-center gap-0.5 !py-1.5 sm:!py-2 !px-2 sm:!px-3 !text-xs sm:!text-sm !rounded-none">
                🏆 <span className="hidden sm:inline">兌換</span>
              </button>
            )}
            {!user && (
              <button onClick={handleLogin} className="clay-button !py-1.5 sm:!py-2 !px-2 sm:!px-3 !text-xs sm:!text-sm !rounded-none">
                🔐 <span className="hidden sm:inline">登入</span>
              </button>
            )}
            {user && (
              <button
                onClick={handleLogout}
                className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full transition-all hover:bg-white/10"
                style={{color: 'var(--bg-100)', background: 'transparent'}}
              >
                <LogOut size={18}/>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ── 主內容 ── */}
      <main className="px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8 max-w-6xl mx-auto space-y-4 sm:space-y-6 animate-[fade-in_0.25s_ease]">

        {/* 主畫面 */}
        {userMode === 'home' ? (
          <div className="space-y-6 mt-0">
            {/* Hero 背景容器 */}
            <div
              className="bauhaus-frame relative overflow-hidden bg-white p-4 sm:p-6 md:p-8 lg:p-12"
              style={{ background: '#ffffff' }}
            >
              {/* 手機上隱藏或縮小幾何形狀 */}
              <div className="hidden sm:block absolute right-0 top-0 h-16 sm:h-20 md:h-24 w-16 sm:w-20 md:w-24 border-l-3 sm:border-l-4 border-b-3 sm:border-b-4 border-black bg-[#1040C0]" />
              <div className="hidden sm:block absolute right-8 sm:right-12 md:right-14 top-8 sm:top-12 md:top-14 h-12 sm:h-16 w-12 sm:w-16 rotate-45 border-3 sm:border-4 border-black bg-[#F0C020]" />
              <div className="absolute left-3 sm:left-5 bottom-3 sm:bottom-5 h-8 sm:h-12 w-8 sm:w-12 rounded-full border-2 sm:border-4 border-black bg-[#D02020]" />

              {/* 內容 */}
              <div className="relative z-10 text-center space-y-3 sm:space-y-4">
                <div className="text-4xl sm:text-5xl md:text-6xl mb-1 sm:mb-2" style={{ lineHeight: 1 }}>◎</div>
                <h1 className="hero-title" style={{marginBottom: '0.75rem', color: 'var(--text)'}}>
                  拾光地圖:重返1936
                </h1>
                <p className="text-sm sm:text-base md:text-lg font-black uppercase" style={{ color: 'var(--primary)', letterSpacing: '0.18em' }}>
                  2026 校園盛事
                </p>
                <p className="text-xs sm:text-sm" style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>
                  完成各處任務、蒐集徽章、領取獎品<br/>在校園各角落發現驚喜冒險！
                </p>
                <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 pt-1">
                  <span className="site-pill"><CalendarDays size={12} className="sm:size-4" /> <span className="text-xs sm:text-sm">5/23</span></span>
                  <span className="site-pill"><Clock3 size={12} className="sm:size-4" /> <span className="text-xs sm:text-sm">10:00 - 14:00</span></span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 mt-4 sm:mt-6">
                  <button
                    onClick={goGameHub}
                    className="btn-cta-large w-full inline-flex items-center justify-center gap-1.5 sm:gap-2"
                  >
                    <GamepadIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span>玩遊戲</span>
                  </button>
                  <button
                    onClick={() => setUserMode('map')}
                    className="clay-button clay-button-yellow w-full inline-flex items-center justify-center gap-1.5 sm:gap-2"
                  >
                    <img src="/Map_icon.png" alt="地圖 icon" className="h-4 w-4 sm:h-5 sm:w-5 object-contain" />
                    <span>地圖</span>
                  </button>
                </div>

                {/* 次要 CTA */}
                <p className="text-xs pt-2 sm:pt-4" style={{ color: 'var(--text-muted)' }}>
                  一起來參加校慶冒險吧！
                </p>
              </div>
            </div>

            {/* 倒數計時器 */}
            <Countdown />

            {/* 活動亮點卡片 */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
              {[
                { icon: '/game.png', label: '20 關任務', desc: '挑戰完成', isImage: true },
                { icon: '🏆', label: '分級獎品', desc: '等你領取' },
                { icon: '📸', label: '相機上傳', desc: '留下回憶' }
              ].map((item, idx) => (
                  <div
                    key={idx}
                    className="bauhaus-frame p-2.5 sm:p-3 text-center h-full"
                    style={{ background: idx === 0 ? '#F0C020' : idx === 1 ? '#1040C0' : '#D02020', color: idx === 0 ? '#121212' : '#ffffff' }}
                  >
                  <div className="text-2xl sm:text-3xl mb-1 flex justify-center">
                    {item.isImage ? (
                      <GamepadIcon className="h-6 w-6 sm:h-8 sm:w-8" />
                    ) : (
                      item.icon
                    )}
                  </div>
                  <p className="text-xs font-bold" style={{ color: idx === 0 ? '#121212' : '#ffffff' }}>
                    {item.label}
                  </p>
                  <p className="text-[9px] sm:text-[10px] font-bold uppercase" style={{ color: idx === 0 ? '#121212' : '#ffffff', letterSpacing: '0.12em' }}>
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>

            {/* 活動時程 */}
            <Timeline />
          </div>

        ) : isMapMode ? (
          <MapComponent
            onBack={() => setUserMode(userMode === 'game-map' ? 'game' : 'home')}
            isModal={false}
          />

        ) : userMode === 'select' ? (
          <div className="space-y-2 sm:space-y-3 mt-4 sm:mt-6">
            <div className="flex items-center justify-between gap-2 sm:gap-3 mb-2">
              <button
                onClick={goHome}
                className="flex items-center gap-1 sm:gap-2 clay-button clay-button-blue !py-1.5 sm:!py-2 !px-2 sm:!px-3 !text-xs sm:!text-sm !rounded-none"
              >
                <ArrowLeft size={14} className="sm:size-4" />
                <span className="hidden sm:inline">返回</span>
              </button>
              {!user && (
                <button
                  onClick={handleLogin}
                  className="flex items-center gap-1 sm:gap-2 clay-button !py-1.5 sm:!py-2 !px-2 sm:!px-3 !text-xs sm:!text-sm !rounded-none"
                >
                  🔐 <span className="hidden sm:inline">登入</span>
                </button>
              )}
            </div>
            <p className="text-center text-xs sm:text-sm font-semibold mb-3 sm:mb-4" style={{color: 'var(--primary)'}}>選擇活動</p>
            <button onClick={() => setUserMode('game')}
              className="w-full premium-card clay-shadow-sm p-3 sm:p-4 sm:p-5 flex items-center justify-between transition-all hover:-translate-y-1 active:scale-[0.98] border-b-2 sm:border-b-4"
              style={{borderColor: 'var(--primary)', background: 'var(--surface)'}}>
              <div className="text-left min-w-0">
                <p className="text-sm sm:text-base font-bold" style={{color: 'var(--text)'}}>🎯 玩遊戲</p>
                <p className="text-xs mt-0.5 font-medium" style={{color: 'var(--primary)'}}>完成任務、領獎品</p>
              </div>
              <ChevronRight size={18} className="sm:size-5" style={{color: 'var(--primary)', flexShrink: 0}}/>
            </button>
            <button onClick={() => setUserMode('map')}
              className="w-full premium-card clay-shadow-sm p-3 sm:p-4 sm:p-5 flex items-center justify-between transition-all hover:-translate-y-1 active:scale-[0.98] border-b-2 sm:border-b-4"
              style={{borderColor: 'var(--secondary)', background: 'var(--surface)'}}>
              <div className="text-left min-w-0">
                <p className="text-sm sm:text-base font-bold flex items-center gap-1.5 sm:gap-2" style={{color: 'var(--text)'}}>
                  <img src="/Map_icon.png" alt="" aria-hidden="true" className="h-4 w-4 sm:h-5 sm:w-5 object-contain" />
                  <span>查看地圖</span>
                </p>
                <p className="text-xs mt-0.5 font-medium" style={{color: 'var(--primary)'}}>瀏覽園遊會位置</p>
              </div>
              <ChevronRight size={18} className="sm:size-5" style={{color: 'var(--secondary)', flexShrink: 0}}/>
            </button>
          </div>

        /* 遊戲主畫面 */
        ) : (
          <>
            <div className="flex items-center justify-between gap-2 sm:gap-3 mb-2 sm:mb-3">
              <button
                onClick={goHome}
                className="flex items-center gap-1 sm:gap-2 clay-button clay-button-blue !py-1.5 sm:!py-2 !px-2 sm:!px-3 !text-xs sm:!text-sm !rounded-none"
              >
                <ArrowLeft size={14} className="sm:size-4" />
                <span className="hidden sm:inline">返回</span>
              </button>
              {!user && (
                <button
                  onClick={handleLogin}
                  className="flex items-center gap-1 sm:gap-2 clay-button !py-1.5 sm:!py-2 !px-2 sm:!px-3 !text-xs sm:!text-sm !rounded-none"
                >
                  🔐 <span className="hidden sm:inline">登入</span>
                </button>
              )}
            </div>

            {!user && (
              <div className="premium-card clay-shadow-sm p-3 sm:p-4" style={{background: 'var(--surface)'}}>
                <p className="text-xs sm:text-sm font-bold" style={{color: 'var(--text)'}}>👋 訪客模式</p>
                <p className="text-xs mt-1" style={{color: 'var(--text-muted)'}}>
                  可瀏覽任務與地圖；登入後可同步進度與兌換獎勵。
                </p>
              </div>
            )}

            {/* 玩家資訊卡 */}
            <div className="premium-card clay-shadow-sm p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3 mb-3">
                {user?.photoURL
                  ? <img src={user.photoURL} alt="頭像" className="w-9 h-9 sm:w-11 sm:h-11 rounded-full object-cover shrink-0" style={{border: '2px solid var(--primary)'}}/>
                  : <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center text-lg sm:text-xl shrink-0" style={{background: 'var(--primary-blue)',color:'#ffffff', border: '2px solid #121212'}}>◼</div>
                }
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-xs sm:text-sm truncate" style={{color: 'var(--text)'}}>{nickname || user?.displayName || '訪客'}</p>
                  <p className="text-xs" style={{color: 'var(--text-muted)'}}>ID: {user?.email?.split('@')[0].slice(0,6).toUpperCase() || 'GUEST'}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-xs font-semibold" style={{color: 'var(--primary)'}}>進度</p>
                  <p className="text-xs sm:text-sm font-bold" style={{color: 'var(--text)'}}>{completed.length}/{TOTAL_QUESTS}</p>
                </div>
              </div>
              {/* 進度條 */}
              <div className="progress-bar-container rounded-none h-2.5 sm:h-3 overflow-hidden mt-2 sm:mt-3" style={{background: 'var(--bg-100)', borderColor: 'var(--border)'}}>
                <div className="progress-bar-fill h-full rounded-none transition-all duration-500" 
                  style={{
                    width: `${pct}%`,
                    background: 'var(--primary-blue)'
                  }}
                />
              </div>
              <p className="text-xs text-right mt-1 font-semibold" style={{color: 'var(--primary)'}}>{pct}%</p>
            </div>

            {/* 獎品區 — 橫排兩張卡 */}
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              {/* 小獎品 */}
              <div className={`premium-card clay-shadow-sm p-2.5 sm:p-3 flex flex-col gap-1.5 sm:gap-2 ${completed.length >= SMALL_REWARD_THRESHOLD && !redeemedRewards.includes(SMALL_REWARD_THRESHOLD) ? 'reward-available' : ''}`}
                style={{background: completed.length >= SMALL_REWARD_THRESHOLD && !redeemedRewards.includes(SMALL_REWARD_THRESHOLD)
                  ? 'var(--primary-yellow)' : '#ffffff'}}>
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm font-bold" style={{color: 'var(--text)'}}>🎁 小獎</span>
                  <span className="text-xs font-bold px-1.5 sm:px-2 py-0.5 rounded-full"
                    style={{background: 'var(--primary)', color: 'white', whiteSpace: 'nowrap', fontSize: '0.65rem'}}>
                    {completed.length}/{SMALL_REWARD_THRESHOLD}
                  </span>
                </div>
                <p className="text-xs" style={{color: 'var(--primary)'}}>完成 {SMALL_REWARD_THRESHOLD} 關</p>
                <div className="flex flex-wrap gap-1">
                  <span className="inline-flex items-center rounded-none border border-black sm:border-2 px-1 sm:px-2 py-0.5 text-[10px] sm:text-[11px] font-black" style={{background: redeemedRewards.includes(SMALL_REWARD_THRESHOLD) ? 'var(--primary-yellow)' : '#ffffff', color: '#121212'}}>
                    {redeemedRewards.includes(SMALL_REWARD_THRESHOLD) ? '已兌換' : '待兌換'}
                  </span>
                </div>
              </div>

              {/* 大獎品 */}
              <div className={`premium-card clay-shadow-sm p-2.5 sm:p-3 flex flex-col gap-1.5 sm:gap-2 ${completed.length >= BIG_REWARD_THRESHOLD && !redeemedRewards.includes(BIG_REWARD_THRESHOLD) ? 'reward-available' : ''}`}
                style={{background: completed.length >= BIG_REWARD_THRESHOLD && !redeemedRewards.includes(BIG_REWARD_THRESHOLD)
                  ? 'var(--primary-red)' : '#ffffff', color: completed.length >= BIG_REWARD_THRESHOLD && !redeemedRewards.includes(BIG_REWARD_THRESHOLD) ? '#ffffff' : 'inherit'}}>
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm font-bold" style={{color: 'var(--text)'}}>🏆 大獎</span>
                  <span className="text-xs font-bold px-1.5 sm:px-2 py-0.5 rounded-full"
                    style={{background: 'var(--secondary)', color: 'white', whiteSpace: 'nowrap', fontSize: '0.65rem'}}>
                    {completed.length}/{BIG_REWARD_THRESHOLD}
                  </span>
                </div>
                <p className="text-xs" style={{color: 'var(--primary)'}}>完成 {BIG_REWARD_THRESHOLD} 關</p>
                <div className="flex flex-wrap gap-1">
                  <span className="inline-flex items-center rounded-none border border-black sm:border-2 px-1 sm:px-2 py-0.5 text-[10px] sm:text-[11px] font-black" style={{background: redeemedRewards.includes(BIG_REWARD_THRESHOLD) ? 'var(--primary-red)' : '#ffffff', color: redeemedRewards.includes(BIG_REWARD_THRESHOLD) ? '#ffffff' : '#121212'}}>
                    {redeemedRewards.includes(BIG_REWARD_THRESHOLD) ? '已兌換' : '待兌換'}
                  </span>
                </div>
              </div>
            </div>

            {/* 任務格子 */}
            <div className="premium-card clay-shadow-sm p-3 sm:p-4">
              <h3 className="text-xs sm:text-base font-bold mb-3 px-2 sm:px-3 py-1.5 sm:py-2 rounded-none inline-flex items-center gap-1.5 sm:gap-2" style={{color: 'white', backgroundColor: 'var(--primary)'}}>
                <GamepadIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                <span>任務 ({TOTAL_QUESTS})</span>
              </h3>
              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3 mt-3 sm:mt-4">
                {Array.from({ length: TOTAL_QUESTS }).map((_, index) => {
                  const questId = index + 1;
                  const quest = QUESTS.find(q => q.id === questId);
                  const isCompleted = completed.includes(questId);
                  const isUnlocked = unlockedTasks.includes(questId);

                  if (!isUnlocked) return (
                    <ComicCard key={questId} className="quest-card-shell quest-card-locked">
                      <NumberBadge value={questId} />
                      <Lock size={14} style={{color: 'var(--text-muted)'}}/>
                      <span className="text-[10px] sm:text-[11px] font-bold" style={{color: 'var(--text-muted)'}}>鎖</span>
                    </ComicCard>
                  );

                  if (!quest) return null;

                  if (isCompleted) return (
                    <ComicCard key={questId} className="quest-card-shell quest-card-completed" highlighted={questId === 4}>
                      <NumberBadge value={questId} />
                      <span className="text-xl sm:text-2xl" style={{animation: 'bounce-pop 0.6s ease'}}>✓</span>
                      <span className="text-[10px] sm:text-[11px] font-bold" style={{color: 'var(--primary-700)'}}>
                        完成
                      </span>
                    </ComicCard>
                  );

                  return (
                    <a key={questId} href={`/scan/${quest.slug}`} className="quest-card-link">
                      <ComicCard className="quest-card-shell" highlighted={questId === 4}>
                        <NumberBadge value={questId} />
                        <p className="text-base sm:text-lg font-black text-[var(--primary-700)] leading-none">
                          GO
                        </p>
                        <span className="text-[9px] sm:text-[10px] font-bold text-center px-0.5 leading-tight"
                          style={{color: 'var(--text)', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden', maxWidth: '90%'}}>
                          {THEME_NAMES[questId] || "任"}
                        </span>
                      </ComicCard>
                    </a>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </main>

      {/* ── 暱稱模態 ── */}
      {showNicknameModal && (
        <div className="fixed inset-0 modal-overlay flex items-end sm:items-center justify-center z-50 p-0 sm:p-3 md:p-4">
          <div className="modal-content w-full sm:max-w-sm p-4 sm:p-6 rounded-t-2xl sm:rounded-none clay-shadow-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-3 sm:mb-4">
              <h3 className="text-base sm:text-lg font-bold" style={{color: 'var(--text)'}}>👤 設定暱稱</h3>
              <button onClick={() => setShowNicknameModal(false)} className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full font-bold text-lg" style={{color: 'var(--text-muted)', background: 'transparent'}}>✕</button>
            </div>
            <p className="text-xs sm:text-sm font-medium mb-3 sm:mb-4" style={{color: 'var(--primary)'}}>設定遊戲暱稱，將代替真實姓名顯示。</p>
            <input type="text" placeholder="輸入暱稱" value={nickname}
              onChange={e => setNickname(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && handleSaveNickname()}
              className="w-full clay-input mb-3 sm:mb-4 text-black font-bold border-2 sm:border-2" style={{borderColor: 'var(--border)'}}/>
            <div className="flex gap-2">
              <button onClick={() => setShowNicknameModal(false)}
                className="flex-1 py-2.5 sm:py-3 rounded-none font-bold text-xs sm:text-sm border" style={{borderColor: 'var(--border)', color: 'var(--text-secondary)', background: 'var(--surface)'}}>稍後</button>
              <button onClick={handleSaveNickname} className="flex-1 clay-button !text-xs sm:!text-sm">✅ 確認</button>
            </div>
          </div>
        </div>
      )}

      {/* ── 隱私說明模態 ── */}
      {showPrivacyModal && (
        <div className="fixed inset-0 modal-overlay flex items-end sm:items-center justify-center z-50 p-0 sm:p-3 md:p-4">
          <div className="modal-content w-full sm:max-w-md p-4 sm:p-6 rounded-t-2xl sm:rounded-none clay-shadow-lg max-h-[90vh] overflow-y-auto">
            <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4" style={{color: 'var(--text)'}}>📸 圖片隱私說明</h3>
            <div className="space-y-2 sm:space-y-3 mb-3 sm:mb-4">
              {[
                { icon: '📺', title: '當天大螢幕', color: 'var(--primary-hover)', text: '圖片將在活動現場播放。' },
                { icon: '🎁', title: '紀念保存', color: 'var(--primary)', text: '作為校慶活動紀念。' },
                { icon: '⚠️', title: '自制提醒', color: 'var(--secondary-hover)', text: '上傳得體的圖片。' },
              ].map(item => (
                <div key={item.title} className="premium-card clay-shadow-sm p-2.5 sm:p-3">
                  <p className="text-xs sm:text-sm font-bold mb-1" style={{color: item.color}}>{item.icon} {item.title}</p>
                  <p className="text-xs font-medium" style={{color: 'var(--primary)'}}>{item.text}</p>
                </div>
              ))}
            </div>
            <label className="flex items-center gap-2 sm:gap-3 premium-card clay-shadow-sm p-2.5 sm:p-3 mb-3 sm:mb-4 cursor-pointer">
              <input type="checkbox" checked={privacyAgreed} onChange={e => setPrivacyAgreed(e.target.checked)}
                className="w-4 h-4 sm:w-5 sm:h-5 rounded" style={{borderColor: 'var(--border)'}}/>
              <span className="text-xs sm:text-sm font-semibold" style={{color: 'var(--text)'}}>我已了解，同意上傳</span>
            </label>
            <div className="flex gap-2 flex-col sm:flex-row">
              <button onClick={() => setShowPrivacyModal(false)}
                className="flex-1 py-2 sm:py-3 rounded-none font-bold text-xs sm:text-sm border" style={{borderColor: 'var(--border)', color: 'var(--text-secondary)', background: 'var(--surface)'}}>返回</button>
              <button
                onClick={() => { if (privacyAgreed) { setShowPrivacyModal(false); setUserMode('game'); } else alert("請勾選同意框才能繼續"); }}
                disabled={!privacyAgreed}
                className={`flex-1 !text-xs sm:!text-sm ${privacyAgreed ? 'clay-button' : 'py-2 sm:py-3 rounded-none font-bold cursor-not-allowed'}`}
                style={!privacyAgreed ? {background: 'var(--bg-200)', color: 'var(--text-muted)'} : undefined}>
                ✅ 同意
              </button>
            </div>
          </div>
        </div>
      )}


    </div>
  );
}