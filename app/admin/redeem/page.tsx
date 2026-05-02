"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { addDoc, arrayUnion, collection, doc, getDoc, onSnapshot, orderBy, query, updateDoc } from "firebase/firestore";
import { ArrowLeft, CheckCircle2, Clock3, LogOut, Search, ShieldCheck, ShieldAlert } from "lucide-react";

const ADMIN_ACCESS_KEY = "adminAccessGranted";
const REDEMPTION_COLLECTION = "redemptionRecords";

const REWARDS = [
  { level: 10, label: "小獎品", theme: "yellow" as const },
  { level: 20, label: "大獎品", theme: "red" as const },
];

type RewardTheme = "yellow" | "red";

type PlayerProfile = {
  email: string;
  name?: string | null;
  nickname?: string | null;
  redeemedRewards?: number[];
  completedQuests?: number[];
};

type RedemptionRecord = {
  id: string;
  adminName: string;
  adminEmail: string;
  playerEmail: string;
  playerName: string;
  rewardLevel: number;
  rewardLabel: string;
  alreadyRedeemed: boolean;
  createdAtMs: number;
};

function formatTime(ms: number) {
  return new Intl.DateTimeFormat("zh-TW", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(ms));
}

function RewardBadge({ level, theme }: { level: number; theme: RewardTheme }) {
  const palette = theme === "yellow"
    ? { background: "var(--primary-yellow)", color: "#121212" }
    : { background: "var(--primary-red)", color: "#ffffff" };

  return (
    <span
      className="inline-flex items-center rounded-none border-4 border-black px-3 py-1 text-xs font-black uppercase tracking-[0.12em]"
      style={palette}
    >
      {level} 關兌換
    </span>
  );
}

export default function AdminRedeemPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ email?: string | null; displayName?: string | null } | null>(null);
  const [accessGranted, setAccessGranted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [adminName, setAdminName] = useState("");
  const [playerEmail, setPlayerEmail] = useState("");
  const [selectedReward, setSelectedReward] = useState<number>(10);
  const [playerProfile, setPlayerProfile] = useState<PlayerProfile | null>(null);
  const [playerRecords, setPlayerRecords] = useState<RedemptionRecord[]>([]);
  const [records, setRecords] = useState<RedemptionRecord[]>([]);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const normalizedPlayerEmail = playerEmail.trim().toLowerCase();

  useEffect(() => {
    if (typeof window === "undefined") return;
    setAccessGranted(window.localStorage.getItem(ADMIN_ACCESS_KEY) === "1");
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser ? { email: currentUser.email, displayName: currentUser.displayName } : null);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!accessGranted) return;

    const q = query(collection(db, REDEMPTION_COLLECTION), orderBy("createdAtMs", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const nextRecords = snapshot.docs.map((document) => ({
        id: document.id,
        ...(document.data() as Omit<RedemptionRecord, "id">),
      }));
      setRecords(nextRecords);
    });

    return () => unsubscribe();
  }, [accessGranted]);

  useEffect(() => {
    if (!normalizedPlayerEmail) {
      setPlayerProfile(null);
      setPlayerRecords([]);
      return;
    }

    setPlayerRecords(records.filter((record) => record.playerEmail === normalizedPlayerEmail));
  }, [records, normalizedPlayerEmail]);

  const playerRewardStatus = useMemo(() => {
    const redeemed = playerProfile?.redeemedRewards || [];
    return REWARDS.map((reward) => ({
      ...reward,
      redeemed: redeemed.includes(reward.level),
    }));
  }, [playerProfile]);

  const requireAccess = () => {
    if (!accessGranted) {
      setError("請先從首頁的管理員面板進入此頁面");
      return false;
    }
    return true;
  };

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
      setNotice("已登入，請輸入管理員名稱與玩家 Gmail 後進行兌換");
    } catch (loginError) {
      console.error(loginError);
      setError("登入失敗，請重試");
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(ADMIN_ACCESS_KEY);
    }
    router.replace("/");
  };

  const loadPlayer = async () => {
    if (!requireAccess()) return;
    setError("");
    setNotice("");

    if (!normalizedPlayerEmail) {
      setError("請先輸入玩家 Gmail");
      return;
    }

    try {
      const playerRef = doc(db, "users", normalizedPlayerEmail);
      const snapshot = await getDoc(playerRef);

      if (!snapshot.exists()) {
        setPlayerProfile(null);
        setPlayerRecords([]);
        setError("找不到此玩家帳號，請確認 Gmail 是否輸入正確");
        return;
      }

      const data = snapshot.data();
      const profile: PlayerProfile = {
        email: normalizedPlayerEmail,
        name: data.name || null,
        nickname: data.nickname || null,
        redeemedRewards: data.redeemedRewards || [],
        completedQuests: data.completedQuests || [],
      };

      setPlayerProfile(profile);
      setPlayerRecords(records.filter((record) => record.playerEmail === normalizedPlayerEmail));
      setNotice(`已載入 ${normalizedPlayerEmail} 的玩家資料`);
    } catch (loadError) {
      console.error(loadError);
      setError("載入玩家資料失敗，請稍後再試");
    }
  };

  const handleRedeem = async () => {
    if (!requireAccess()) return;
    setError("");
    setNotice("");

    const trimmedAdminName = adminName.trim();
    if (!trimmedAdminName) {
      setError("請輸入管理員名稱");
      return;
    }

    if (!normalizedPlayerEmail) {
      setError("請輸入玩家 Gmail");
      return;
    }

    if (!user?.email) {
      setError("請先登入 Google 帳號");
      return;
    }

    setBusy(true);
    try {
      const playerRef = doc(db, "users", normalizedPlayerEmail);
      const snapshot = await getDoc(playerRef);

      if (!snapshot.exists()) {
        setError("找不到此玩家帳號，無法兌換");
        setBusy(false);
        return;
      }

      const data = snapshot.data();
      const redeemedRewards: number[] = data.redeemedRewards || [];
      const playerName = data.nickname || data.name || data.displayName || normalizedPlayerEmail;
      const reward = REWARDS.find((item) => item.level === selectedReward) || REWARDS[0];
      const alreadyRedeemed = redeemedRewards.includes(selectedReward);

      if (!alreadyRedeemed) {
        await updateDoc(playerRef, {
          redeemedRewards: arrayUnion(selectedReward),
        });
      }

      await addDoc(collection(db, REDEMPTION_COLLECTION), {
        adminName: trimmedAdminName,
        adminEmail: user.email,
        playerEmail: normalizedPlayerEmail,
        playerName,
        rewardLevel: reward.level,
        rewardLabel: reward.label,
        alreadyRedeemed,
        createdAtMs: Date.now(),
      });

      setNotice(alreadyRedeemed
        ? `已記錄：${normalizedPlayerEmail} 的 ${reward.label} 先前已兌換過`
        : `已兌換：${normalizedPlayerEmail} 的 ${reward.label}`);

      const refreshed = await getDoc(playerRef);
      const refreshedData = refreshed.data();
      setPlayerProfile({
        email: normalizedPlayerEmail,
        name: refreshedData?.name || null,
        nickname: refreshedData?.nickname || null,
        redeemedRewards: refreshedData?.redeemedRewards || [],
        completedQuests: refreshedData?.completedQuests || [],
      });
      setPlayerRecords((prev) => [
        {
          id: `local-${Date.now()}`,
          adminName: trimmedAdminName,
          adminEmail: user.email,
          playerEmail: normalizedPlayerEmail,
          playerName,
          rewardLevel: reward.level,
          rewardLabel: reward.label,
          alreadyRedeemed,
          createdAtMs: Date.now(),
        },
        ...prev,
      ]);
    } catch (redeemError) {
      console.error(redeemError);
      setError("兌換失敗，請稍後再試");
    } finally {
      setBusy(false);
    }
  };

  const filteredRecords = useMemo(() => {
    if (!normalizedPlayerEmail) return records;
    return records.filter((record) => record.playerEmail === normalizedPlayerEmail);
  }, [records, normalizedPlayerEmail]);

  // 所有管理員的兌換紀錄，不被玩家搜尋過濾
  const allAdminRecords = useMemo(() => {
    return records;
  }, [records]);

  const accessMissing = !accessGranted;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
        <div className="bauhaus-frame bg-white px-6 py-4 text-center">
          <p className="text-lg font-black uppercase">載入管理員頁面中</p>
        </div>
      </div>
    );
  }

  if (accessMissing) {
    return (
      <div className="min-h-screen bg-[var(--bg)] px-4 py-8">
        <div className="mx-auto max-w-3xl bauhaus-frame bg-white p-6 sm:p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center border-4 border-black bg-[#1040C0] text-white">
              <ShieldAlert className="h-7 w-7" />
            </div>
            <div>
              <p className="bauhaus-label" style={{ color: 'var(--primary)' }}>Admin Access</p>
              <h1 className="text-3xl sm:text-5xl font-black tracking-tighter uppercase">兌換管理頁</h1>
            </div>
          </div>
          <p className="mb-6 text-base font-medium leading-relaxed text-[var(--text-secondary)]">
            請先從首頁的管理員面板進入此頁面。
          </p>
          <button
            type="button"
            onClick={() => router.replace("/")}
            className="clay-button clay-button-blue rounded-none"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回首頁
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="bauhaus-frame bg-white p-5 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="bauhaus-label" style={{ color: 'var(--primary)' }}>Reward Administration</p>
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tighter uppercase">兌換管理中心</h1>
              <p className="mt-2 max-w-2xl text-sm sm:text-base font-medium text-[var(--text-secondary)]">
                以玩家 Gmail 查詢並兌換獎品，所有管理員的操作會同步記錄在同一份 Firestore 紀錄中。
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => router.replace("/")}
                className="clay-button clay-button-blue rounded-none"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                回首頁
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="clay-button rounded-none"
              >
                <LogOut className="mr-2 h-4 w-4" />
                登出
              </button>
            </div>
          </div>
        </header>

        <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="bauhaus-frame bg-white p-5 sm:p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center border-4 border-black bg-[#F0C020] text-black">
                <Search className="h-6 w-6" />
              </div>
              <div>
                <p className="bauhaus-label" style={{ color: 'var(--primary)' }}>Redeem Form</p>
                <h2 className="text-2xl font-black tracking-tighter uppercase">輸入玩家 Gmail</h2>
              </div>
            </div>

            <div className="space-y-3">
              <label className="block">
                <span className="mb-2 block bauhaus-label text-sm font-black uppercase tracking-[0.12em]" style={{ color: 'var(--text)' }}>管理員名稱</span>
                <input
                  value={adminName}
                  onChange={(event) => setAdminName(event.target.value)}
                  placeholder="例如：總召、工作人員 A"
                  className="clay-input rounded-none"
                />
              </label>

              <label className="block">
                <span className="mb-2 block bauhaus-label text-sm font-black uppercase tracking-[0.12em]" style={{ color: 'var(--text)' }}>玩家 Gmail</span>
                <input
                  value={playerEmail}
                  onChange={(event) => setPlayerEmail(event.target.value)}
                  placeholder="player@gmail.com"
                  className="clay-input rounded-none"
                />
              </label>

              <label className="block">
                <span className="mb-3 block bauhaus-label text-sm font-black uppercase tracking-[0.12em]" style={{ color: 'var(--text)' }}>選擇獎品</span>
                <div className="grid grid-cols-2 gap-3">
                  {REWARDS.map((reward) => {
                    const active = selectedReward === reward.level;
                    return (
                      <button
                        key={reward.level}
                        type="button"
                        onClick={() => setSelectedReward(reward.level)}
                        className="bauhaus-frame px-4 py-4 text-center font-black uppercase transition-transform hover:-translate-y-1 active:translate-y-0 min-h-[60px] flex flex-col items-center justify-center"
                        style={{
                          background: active ? (reward.theme === 'yellow' ? 'var(--primary-yellow)' : 'var(--primary-red)') : '#ffffff',
                          color: active && reward.theme === 'red' ? '#ffffff' : '#121212',
                          borderWidth: '4px'
                        }}
                      >
                        <span className="text-xs sm:text-sm">{reward.label}</span>
                        <span className="text-2xl sm:text-3xl font-black">{reward.level}</span>
                      </button>
                    );
                  })}
                </div>
              </label>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  onClick={loadPlayer}
                  className="clay-button clay-button-yellow rounded-none flex-1 sm:flex-none py-3"
                >
                  <Search className="mr-2 h-5 w-5" />
                  載入玩家
                </button>
                <button
                  type="button"
                  onClick={handleRedeem}
                  disabled={busy}
                  className="clay-button clay-button-blue rounded-none flex-1 sm:flex-none py-3 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ShieldCheck className="mr-2 h-5 w-5" />
                  {busy ? '處理中…' : '執行兌換'}
                </button>
              </div>

              <div className="flex items-center gap-2 rounded-none border-4 border-black bg-white px-4 py-3 font-black text-sm">
                <Clock3 className="h-5 w-5 shrink-0" />
                <span className="break-all">{user?.displayName || user?.email || '未登入'}</span>
              </div>
            </div>

            {(notice || error) && (
              <div className="mt-4 space-y-2">
                {notice && (
                  <div className="bauhaus-frame border-black bg-[#F0C020] px-4 py-3 font-black text-black">
                    {notice}
                  </div>
                )}
                {error && (
                  <div className="bauhaus-frame border-black bg-[#D02020] px-4 py-3 font-black text-white">
                    {error}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="bauhaus-frame bg-white p-5 sm:p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center border-4 border-black bg-[#1040C0] text-white">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <p className="bauhaus-label" style={{ color: 'var(--primary)' }}>Player Status</p>
                <h2 className="text-2xl font-black tracking-tighter uppercase">玩家兌換紀錄</h2>
              </div>
            </div>

            {playerProfile ? (
              <div className="space-y-4">
                <div className="bauhaus-frame bg-white p-4">
                  <p className="text-xs font-black uppercase tracking-[0.12em]" style={{ color: 'var(--primary)' }}>玩家資訊</p>
                  <p className="mt-2 text-base sm:text-lg font-black break-all">{playerProfile.nickname || playerProfile.name || playerProfile.email}</p>
                  <p className="text-xs sm:text-sm font-medium text-[var(--text-secondary)] break-all mt-1">{playerProfile.email}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {playerRewardStatus.map((reward) => (
                      <span
                        key={reward.level}
                        className="inline-flex items-center rounded-none border-2 border-black px-3 py-2 text-xs font-black"
                        style={{
                          background: reward.redeemed ? (reward.theme === 'yellow' ? 'var(--primary-yellow)' : 'var(--primary-red)') : '#ffffff',
                          color: reward.redeemed && reward.theme === 'red' ? '#ffffff' : '#121212',
                        }}
                      >
                        {reward.level} 關 {reward.redeemed ? '已兌換' : '未兌換'}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="mb-2 bauhaus-label" style={{ color: 'var(--text)' }}>此玩家的兌換紀錄</p>
                  <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                    {playerRecords.length === 0 ? (
                      <div className="bauhaus-frame bg-white px-4 py-3 text-sm font-medium">目前沒有此玩家的紀錄</div>
                    ) : (
                      playerRecords.map((record) => (
                        <div key={record.id} className="bauhaus-frame bg-white px-4 py-3">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div>
                              <p className="text-sm font-black">{record.rewardLabel}</p>
                              <p className="text-xs font-medium text-[var(--text-secondary)]">由 {record.adminName} 建立</p>
                            </div>
                            <span
                              className="inline-flex items-center rounded-none border-2 border-black px-2 py-1 text-[11px] font-black"
                              style={{ background: record.alreadyRedeemed ? 'var(--primary-red)' : 'var(--primary-yellow)', color: record.alreadyRedeemed ? '#ffffff' : '#121212' }}
                            >
                              {record.alreadyRedeemed ? '已兌換過' : '已兌換'}
                            </span>
                          </div>
                          <p className="mt-2 text-xs font-medium text-[var(--text-secondary)]">{formatTime(record.createdAtMs)}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bauhaus-frame bg-white p-4 text-sm font-medium text-[var(--text-secondary)]">
                輸入玩家 Gmail 後按下「載入玩家」，就會顯示該玩家的兌換狀態與歷史紀錄。
              </div>
            )}
          </div>
        </section>

        <section className="bauhaus-frame bg-white p-5 sm:p-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center border-4 border-black bg-[#D02020] text-white">
              <Clock3 className="h-6 w-6" />
            </div>
            <div>
              <p className="bauhaus-label" style={{ color: 'var(--primary)' }}>Shared Log</p>
              <h2 className="text-2xl font-black tracking-tighter uppercase">所有管理員的兌換紀錄</h2>
              <p className="text-xs font-medium text-[var(--text-secondary)] mt-1">所有兌換操作都會在此顯示，實時更新</p>
            </div>
          </div>

          {allAdminRecords.length === 0 ? (
            <div className="bauhaus-frame bg-[#F0F0F0] p-6 text-center">
              <p className="text-sm font-black uppercase tracking-[0.12em]">還沒有任何兌換紀錄</p>
              <p className="text-xs font-medium text-[var(--text-secondary)] mt-2">當管理員進行兌換時，紀錄會出現在此</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
              {allAdminRecords.map((record) => (
                <div key={record.id} className="bauhaus-frame bg-white p-4 sm:p-5">
                  <div className="space-y-3">
                    {/* 獎品與狀態 */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span
                        className="inline-flex items-center rounded-none border-3 border-black px-3 py-2 text-sm font-black uppercase tracking-[0.12em]"
                        style={{
                          background: record.rewardLevel === 20 ? 'var(--primary-red)' : 'var(--primary-yellow)',
                          color: record.rewardLevel === 20 ? '#ffffff' : '#121212'
                        }}
                      >
                        {record.rewardLabel}
                      </span>
                      <span
                        className="inline-flex items-center rounded-none border-2 border-black px-2 py-1 text-xs font-black uppercase tracking-[0.12em]"
                        style={{
                          background: record.alreadyRedeemed ? 'var(--primary-red)' : 'var(--primary-blue)',
                          color: '#ffffff'
                        }}
                      >
                        {record.alreadyRedeemed ? '重複兌換' : '新兌換'}
                      </span>
                    </div>

                    {/* 玩家資訊 */}
                    <div className="border-t-2 border-black pt-3 space-y-1">
                      <p className="text-xs font-black uppercase tracking-[0.12em] text-[var(--primary)]">玩家</p>
                      <p className="text-sm font-black break-all">{record.playerName}</p>
                      <p className="text-xs font-medium text-[var(--text-secondary)] break-all">{record.playerEmail}</p>
                    </div>

                    {/* 管理員資訊 */}
                    <div className="border-t-2 border-black pt-3 space-y-1">
                      <p className="text-xs font-black uppercase tracking-[0.12em] text-[var(--primary)]">管理員</p>
                      <p className="text-sm font-black">{record.adminName}</p>
                      <p className="text-xs font-medium text-[var(--text-secondary)] break-all">{record.adminEmail}</p>
                    </div>

                    {/* 時間 */}
                    <div className="border-t-2 border-black pt-3">
                      <p className="text-xs font-medium text-[var(--text-secondary)]">{formatTime(record.createdAtMs)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {!user && (
          <section className="bauhaus-frame bg-[#F0C020] p-5 sm:p-6 text-black">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="bauhaus-label">Login Required</p>
                <h2 className="text-2xl font-black tracking-tighter uppercase">先登入 Google 帳號</h2>
                <p className="mt-1 text-sm font-medium">
                  進行兌換前請先登入管理員的 Google 帳號。
                </p>
              </div>
              <button type="button" onClick={handleLogin} className="clay-button clay-button-blue rounded-none">
                登入
              </button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
