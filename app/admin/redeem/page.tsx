'use client';

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { addDoc, arrayUnion, collection, doc, getDoc, getDocs, onSnapshot, orderBy, query, setDoc, updateDoc, where, writeBatch } from "firebase/firestore";
import { ArrowLeft, CheckCircle2, Clock3, LogOut, Search, ShieldCheck, ShieldAlert } from "lucide-react";

const ADMIN_ACCESS_KEY = "adminAccessGranted";
const REDEMPTION_COLLECTION = "redemptionRecords";
const TEMP_CODE_COLLECTION = "redeemTempCodes";
const DEFAULT_RESET_EMAIL = "cheiling0131@gmail.com";

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
  tempCode?: string;
  tempCodeCreatedAtMs?: number;
  tempCodeExpiresAtMs?: number;
  tempCodeUsedAtMs?: number;
};

type TempRedeemCode = {
  code: string;
  playerEmail: string;
  playerName?: string | null;
  rewardLevel: number;
  rewardLabel: string;
  createdAtMs: number;
  expiresAtMs: number;
  status: "active" | "used" | "expired";
  usedAtMs?: number | null;
  usedByAdminName?: string | null;
  usedByAdminEmail?: string | null;
};

function formatTime(ms: number) {
  return new Intl.DateTimeFormat("zh-TW", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(ms));
}

function formatDuration(ms: number) {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes} 分 ${seconds.toString().padStart(2, "0")} 秒`;
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

function SessionPulse({ session, now }: { session: TempRedeemCode | null; now: number }) {
  if (!session) return null;

  const remainingMs = Math.max(0, session.expiresAtMs - now);
  const expired = session.status !== "active" || remainingMs <= 0;

  return (
    <div className="bauhaus-frame p-4" style={{ background: expired ? "#F5F5F5" : "var(--primary-yellow)" }}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.12em]" style={{ color: "var(--text-secondary)" }}>臨時代碼</p>
          <p className="text-3xl sm:text-4xl font-black tracking-[0.18em] mt-1" style={{ color: "var(--text)" }}>{session.code}</p>
        </div>
        <span
          className="inline-flex items-center rounded-none border-2 border-black px-3 py-1 text-xs font-black uppercase"
          style={{ background: expired ? "var(--primary-red)" : "var(--primary-blue)", color: "#ffffff" }}
        >
          {expired ? "已過期" : "可使用"}
        </span>
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-2 text-sm font-medium">
        <p><span className="font-black">獎勵：</span>{session.rewardLabel}</p>
        <p><span className="font-black">剩餘：</span>{expired ? "已失效" : formatDuration(remainingMs)}</p>
      </div>
    </div>
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
  const [tempCodeInput, setTempCodeInput] = useState("");
  const [resetEmail, setResetEmail] = useState(DEFAULT_RESET_EMAIL);
  const [completedInput, setCompletedInput] = useState("");
  const [activeSession, setActiveSession] = useState<TempRedeemCode | null>(null);
  const [playerProfile, setPlayerProfile] = useState<PlayerProfile | null>(null);
  const [playerRecords, setPlayerRecords] = useState<RedemptionRecord[]>([]);
  const [records, setRecords] = useState<RedemptionRecord[]>([]);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [now, setNow] = useState(() => Date.now());

  const normalizedPlayerEmail = playerEmail.trim().toLowerCase();
  const normalizedTempCode = tempCodeInput.trim().toLowerCase();
  const selectedPlayerEmail = playerProfile?.email || activeSession?.playerEmail || "";
  const sessionRemainingMs = activeSession ? Math.max(0, activeSession.expiresAtMs - now) : 0;
  const sessionExpired = activeSession ? (activeSession.status !== "active" || sessionRemainingMs <= 0) : false;

  useEffect(() => {
    if (typeof window === "undefined") return;
    setAccessGranted(window.localStorage.getItem(ADMIN_ACCESS_KEY) === "1");
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
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
    if (!selectedPlayerEmail) {
      setPlayerRecords([]);
      return;
    }

    setPlayerRecords(records.filter((record) => record.playerEmail === selectedPlayerEmail));
  }, [records, selectedPlayerEmail]);

  useEffect(() => {
    if (!activeSession) return;
    if (activeSession.status === "active" && now >= activeSession.expiresAtMs) {
      setActiveSession((prev) => (prev ? { ...prev, status: "expired" } : prev));
    }
  }, [activeSession, now]);

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

  const clearSelectedPlayer = () => {
    setActiveSession(null);
    setPlayerProfile(null);
    setPlayerRecords([]);
  };

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
      setNotice("已登入，請先產生或輸入 8 碼小寫英數臨時代碼後進行兌換");
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

  const loadPlayerProfile = async (email: string) => {
    const snapshot = await getDoc(doc(db, "users", email));
    if (!snapshot.exists()) return null;

    const data = snapshot.data();
    return {
      email,
      name: data.name || null,
      nickname: data.nickname || null,
      redeemedRewards: data.redeemedRewards || [],
      completedQuests: data.completedQuests || [],
    } satisfies PlayerProfile;
  };

  const readTempSession = async (code: string) => {
    const snapshot = await getDoc(doc(db, TEMP_CODE_COLLECTION, code));
    if (!snapshot.exists()) return null;
    return snapshot.data() as TempRedeemCode;
  };

  const persistTempSession = async (session: TempRedeemCode) => {
    await setDoc(doc(db, TEMP_CODE_COLLECTION, session.code), session, { merge: true });
  };

  const resetPlayerProgress = async () => {
    if (!requireAccess()) return;

    const targetEmail = resetEmail.trim().toLowerCase();
    if (!targetEmail) {
      setError("請輸入要重製的玩家 Gmail");
      return;
    }

    const confirmed = window.confirm(`確定要清除 ${targetEmail} 的兌換紀錄並重製遊戲進度嗎？此操作無法復原。`);
    if (!confirmed) return;

    setBusy(true);
    setError("");
    setNotice("");

    try {
      const userRef = doc(db, "users", targetEmail);
      const userSnapshot = await getDoc(userRef);
      if (!userSnapshot.exists()) {
        setError("找不到這個玩家帳號");
        return;
      }

      const recordsQuery = query(collection(db, REDEMPTION_COLLECTION), where("playerEmail", "==", targetEmail));
      const tempCodesQuery = query(collection(db, TEMP_CODE_COLLECTION), where("playerEmail", "==", targetEmail));
      const [recordSnapshot, tempSnapshot] = await Promise.all([getDocs(recordsQuery), getDocs(tempCodesQuery)]);

      const recordBatch = writeBatch(db);
      recordSnapshot.docs.forEach((entry) => recordBatch.delete(entry.ref));
      if (recordSnapshot.docs.length > 0) {
        await recordBatch.commit();
      }

      const tempBatch = writeBatch(db);
      tempSnapshot.docs.forEach((entry) => tempBatch.delete(entry.ref));
      if (tempSnapshot.docs.length > 0) {
        await tempBatch.commit();
      }

      const userData = userSnapshot.data();
      await setDoc(userRef, {
        email: targetEmail,
        name: userData.name || null,
        nickname: "",
        photoURL: userData.photoURL || null,
        completedQuests: [],
        redeemedRewards: [],
        resetAtMs: Date.now(),
      }, { merge: true });

      if (playerProfile?.email === targetEmail) {
        setPlayerProfile({
          email: targetEmail,
          name: userData.name || null,
          nickname: userData.nickname || null,
          redeemedRewards: [],
          completedQuests: [],
        });
      }

      if (activeSession?.playerEmail === targetEmail) {
        setActiveSession(null);
      }

      setPlayerRecords([]);
      setNotice(`已重製 ${targetEmail} 的兌換紀錄與遊戲進度`);
    } catch (resetError) {
      console.error(resetError);
      setError("重製失敗，請稍後再試");
    } finally {
      setBusy(false);
    }
  };

  function parseCompletedInput(input: string): number[] {
    const cleaned = input.replace(/\s+/g, '').replace(/，/g, ',');
    if (!cleaned) return [];

    const parts = cleaned.split(',');
    const result = new Set<number>();

    for (const part of parts) {
      if (!part) continue;
      if (part.includes('-')) {
        const [aRaw, bRaw] = part.split('-');
        const a = parseInt(aRaw, 10);
        const b = parseInt(bRaw, 10);
        if (Number.isNaN(a) || Number.isNaN(b)) continue;
        const from = Math.max(1, Math.min(a, b));
        const to = Math.min(20, Math.max(a, b));
        for (let i = from; i <= to; i++) result.add(i);
      } else {
        const n = parseInt(part, 10);
        if (!Number.isNaN(n) && n >= 1 && n <= 20) result.add(n);
      }
    }

    return Array.from(result).sort((x, y) => x - y);
  }

  const applyCompletedInput = async () => {
    if (!requireAccess()) return;
    const target = resetEmail.trim().toLowerCase();
    if (!target) { setError('請輸入玩家 Gmail'); return; }

    const parsed = parseCompletedInput(completedInput);
    if (parsed.length === 0) { setError('請輸入有效的關卡編號 (1-20)，格式如: 1-5,7,9'); return; }

    setBusy(true); setError(''); setNotice('');
    try {
      const userRef = doc(db, 'users', target);
      const userSnapshot = await getDoc(userRef);
      if (!userSnapshot.exists()) { setError('找不到這個玩家帳號'); return; }

      await setDoc(userRef, { completedQuests: parsed }, { merge: true });

      if (playerProfile?.email === target) {
        setPlayerProfile({ ...playerProfile, completedQuests: parsed });
      }

      setNotice(`已將 ${target} 的完成關卡設定為: ${parsed.join(',')}`);
    } catch (e) {
      console.error(e);
      setError('設定失敗，請稍後再試');
    } finally {
      setBusy(false);
    }
  };

  const createUniqueCode = async () => {
    const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";

    for (let attempt = 0; attempt < 25; attempt += 1) {
      let candidate = "";
      for (let i = 0; i < 8; i += 1) {
        candidate += alphabet[Math.floor(Math.random() * alphabet.length)];
      }
      const snapshot = await getDoc(doc(db, TEMP_CODE_COLLECTION, candidate));
      if (!snapshot.exists()) return candidate;
    }

    return null;
  };

  const generateTempCode = async () => {
    if (!requireAccess()) return;
    setError("");
    setNotice("");

    if (!normalizedPlayerEmail) {
      setError("請先輸入玩家 Gmail");
      return;
    }

    try {
      const profile = await loadPlayerProfile(normalizedPlayerEmail);
      if (!profile) {
        setError("找不到此玩家帳號，請確認 Gmail 是否輸入正確");
        return;
      }

      const reward = REWARDS.find((item) => item.level === selectedReward) || REWARDS[0];
      const issuedAtMs = Date.now();
      const expiresAtMs = issuedAtMs + 60_000;

      const tempSnapshot = await getDocs(collection(db, TEMP_CODE_COLLECTION));
      const batch = writeBatch(db);
      let hasInvalidatedTempCodes = false;

      tempSnapshot.docs.forEach((tempDoc) => {
        const data = tempDoc.data() as TempRedeemCode;
        if (data.playerEmail === normalizedPlayerEmail && data.rewardLevel === reward.level && data.status === "active" && data.expiresAtMs > issuedAtMs) {
          batch.update(tempDoc.ref, { status: "expired" });
          hasInvalidatedTempCodes = true;
        }
      });

      if (hasInvalidatedTempCodes) {
        await batch.commit();
      }

      const code = await createUniqueCode();
      if (!code) {
        setError("無法產生臨時代碼，請稍後再試");
        return;
      }

      const session: TempRedeemCode = {
        code,
        playerEmail: normalizedPlayerEmail,
        playerName: profile.nickname || profile.name || normalizedPlayerEmail,
        rewardLevel: reward.level,
        rewardLabel: reward.label,
        createdAtMs: issuedAtMs,
        expiresAtMs,
        status: "active",
      };

      await persistTempSession(session);
      setTempCodeInput(code);
      setActiveSession(session);
      setPlayerProfile(profile);
      setPlayerRecords(records.filter((record) => record.playerEmail === normalizedPlayerEmail));
      setNotice(`已產生 ${code}，請在 1 分鐘內使用`);
    } catch (loadError) {
      console.error(loadError);
      setError("產生臨時代碼失敗，請稍後再試");
    }
  };

  const lookupTempCode = async () => {
    if (!requireAccess()) return;
    setError("");
    setNotice("");

    if (!/^[a-z0-9]{8}$/.test(normalizedTempCode)) {
      setError("請輸入 8 碼小寫英數臨時代碼");
      return;
    }

    try {
      const session = await readTempSession(normalizedTempCode);

      if (!session) {
        clearSelectedPlayer();
        setError("找不到此臨時代碼，請確認是否輸入正確");
        return;
      }

      setActiveSession(session);

      const profile = await loadPlayerProfile(session.playerEmail);
      if (!profile) {
        clearSelectedPlayer();
        setError("此代碼對應的玩家帳號不存在");
        return;
      }

      setPlayerProfile(profile);
      setPlayerRecords(records.filter((record) => record.playerEmail === session.playerEmail));

      if (session.status !== "active" || now >= session.expiresAtMs) {
        setError("此臨時代碼已過期或已使用，請重新刷新兌換代碼");
        return;
      }

      setNotice(`已載入 ${session.code} 的玩家資訊，請在 1 分鐘內完成兌換`);
    } catch (lookupError) {
      console.error(lookupError);
      setError("查詢臨時代碼失敗，請稍後再試");
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

    if (!/^[a-z0-9]{8}$/.test(normalizedTempCode)) {
      setError("請輸入 8 碼小寫英數臨時代碼");
      return;
    }

    if (!user?.email) {
      setError("請先登入 Google 帳號");
      return;
    }

    setBusy(true);
    try {
      const session = activeSession?.code === normalizedTempCode ? activeSession : await readTempSession(normalizedTempCode);

      if (!session) {
        setError("找不到此臨時代碼，無法兌換");
        return;
      }

      if (session.status !== "active" || now >= session.expiresAtMs) {
        const expiredSession: TempRedeemCode = { ...session, status: "expired" };
        await persistTempSession(expiredSession);
        setActiveSession(expiredSession);
        setError("此臨時代碼已過期，請重新刷新兌換代碼");
        return;
      }

      const playerRef = doc(db, "users", session.playerEmail);
      const snapshot = await getDoc(playerRef);

      if (!snapshot.exists()) {
        setError("找不到此玩家帳號，無法兌換");
        return;
      }

      const data = snapshot.data();
      const redeemedRewards: number[] = data.redeemedRewards || [];
      const playerName = data.nickname || data.name || data.displayName || session.playerEmail;
      const alreadyRedeemed = redeemedRewards.includes(session.rewardLevel);

      if (!alreadyRedeemed) {
        await updateDoc(playerRef, {
          redeemedRewards: arrayUnion(session.rewardLevel),
        });
      }

      const redeemedAtMs = Date.now();
      await addDoc(collection(db, REDEMPTION_COLLECTION), {
        adminName: trimmedAdminName,
        adminEmail: user.email,
        playerEmail: session.playerEmail,
        playerName,
        rewardLevel: session.rewardLevel,
        rewardLabel: session.rewardLabel,
        alreadyRedeemed,
        createdAtMs: redeemedAtMs,
        tempCode: session.code,
        tempCodeCreatedAtMs: session.createdAtMs,
        tempCodeExpiresAtMs: session.expiresAtMs,
        tempCodeUsedAtMs: redeemedAtMs,
      });

      const updatedSession: TempRedeemCode = {
        ...session,
        status: "used",
        usedAtMs: redeemedAtMs,
        usedByAdminName: trimmedAdminName,
        usedByAdminEmail: user.email,
      };

      await persistTempSession(updatedSession);
      setActiveSession(updatedSession);

      const refreshed = await getDoc(playerRef);
      const refreshedData = refreshed.data();
      setPlayerProfile({
        email: session.playerEmail,
        name: refreshedData?.name || null,
        nickname: refreshedData?.nickname || null,
        redeemedRewards: refreshedData?.redeemedRewards || [],
        completedQuests: refreshedData?.completedQuests || [],
      });
      setPlayerRecords((prev) => [
        {
          id: `local-${redeemedAtMs}`,
          adminName: trimmedAdminName,
          adminEmail: user.email || "",
          playerEmail: session.playerEmail,
          playerName,
          rewardLevel: session.rewardLevel,
          rewardLabel: session.rewardLabel,
          alreadyRedeemed,
          createdAtMs: redeemedAtMs,
          tempCode: session.code,
          tempCodeCreatedAtMs: session.createdAtMs,
          tempCodeExpiresAtMs: session.expiresAtMs,
          tempCodeUsedAtMs: redeemedAtMs,
        },
        ...prev,
      ]);

      setNotice(alreadyRedeemed
        ? `已記錄：${session.playerEmail} 的 ${session.rewardLabel} 先前已兌換過`
        : `已兌換：${session.playerEmail} 的 ${session.rewardLabel}`);
    } catch (redeemError) {
      console.error(redeemError);
      setError("兌換失敗，請稍後再試");
    } finally {
      setBusy(false);
    }
  };

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
              <p className="mt-2 max-w-3xl text-sm sm:text-base font-medium text-[var(--text-secondary)]">
                先輸入玩家 Gmail 產生 8 碼小寫英數臨時代碼，再把代碼交給玩家或直接用代碼查詢；代碼只在 1 分鐘內有效。
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

        <section className="grid gap-6 xl:grid-cols-[1fr_1.1fr]">
          <div>
            <div className="mb-3">
              <p className="text-xs font-black uppercase" style={{ color: 'var(--primary)' }}>兌換部分</p>
              <h2 className="text-2xl font-black">兌換 / 查詢</h2>
            </div>
            <div className="space-y-6">
            <div className="bauhaus-frame bg-white p-5 sm:p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center border-4 border-black bg-[#F0C020] text-black">
                  <Search className="h-6 w-6" />
                </div>
                <div>
                  <p className="bauhaus-label" style={{ color: 'var(--primary)' }}>Temp Code Generator</p>
                  <h2 className="text-2xl font-black tracking-tighter uppercase">產生臨時代碼</h2>
                </div>
              </div>

              <div className="space-y-3">
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

                <button
                  type="button"
                  onClick={generateTempCode}
                  className="clay-button clay-button-yellow rounded-none w-full py-3"
                >
                  <Search className="mr-2 h-5 w-5" />
                  產生臨時代碼
                </button>
              </div>

              <div className="mt-4">
                <SessionPulse session={activeSession} now={now} />
              </div>
            </div>

            <div className="bauhaus-frame bg-white p-5 sm:p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center border-4 border-black bg-[#1040C0] text-white">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div>
                  <p className="bauhaus-label" style={{ color: 'var(--primary)' }}>Reward Status</p>
                  <h2 className="text-2xl font-black tracking-tighter uppercase">玩家兌換狀態</h2>
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

                  <div className="bauhaus-frame bg-white p-4">
                    <p className="text-xs font-black uppercase tracking-[0.12em]" style={{ color: 'var(--primary)' }}>代碼狀態</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <RewardBadge level={activeSession?.rewardLevel || selectedReward} theme={(activeSession?.rewardLevel || selectedReward) === 20 ? 'red' : 'yellow'} />
                      <span className="inline-flex items-center rounded-none border-2 border-black px-3 py-1 text-xs font-black uppercase" style={{ background: sessionExpired ? 'var(--primary-red)' : 'var(--primary-blue)', color: '#ffffff' }}>
                        {sessionExpired ? '不可使用' : '可使用'}
                      </span>
                    </div>
                    <p className="mt-2 text-sm font-medium text-[var(--text-secondary)]">
                      {activeSession ? `到期時間：${formatTime(activeSession.expiresAtMs)}` : '尚未載入代碼'}
                    </p>
                  </div>

                  <div>
                    <p className="mb-2 bauhaus-label" style={{ color: 'var(--text)' }}>此玩家的兌換紀錄</p>
                    <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
                      {playerRecords.length === 0 ? (
                        <div className="bauhaus-frame bg-white px-4 py-3 text-sm font-medium">目前沒有此玩家的紀錄</div>
                      ) : (
                        playerRecords.map((record) => (
                          <div key={record.id} className="bauhaus-frame bg-white px-4 py-3">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div>
                                <p className="text-sm font-black">{record.rewardLabel}</p>
                                <p className="text-xs font-medium text-[var(--text-secondary)] break-all">代碼：{record.tempCode || 'N/A'}</p>
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
                  輸入並查詢臨時代碼後，這裡會顯示玩家的 Gmail、完成關卡與兌換狀態。
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="mb-3">
              <p className="text-xs font-black uppercase" style={{ color: 'var(--primary)' }}>玩家部分</p>
              <h2 className="text-2xl font-black">產生代碼 / 帳號管理</h2>
            </div>
            <div className="space-y-6">
            <div className="bauhaus-frame bg-white p-5 sm:p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center border-4 border-black bg-[#D02020] text-white">
                  <Clock3 className="h-6 w-6" />
                </div>
                <div>
                  <p className="bauhaus-label" style={{ color: 'var(--primary)' }}>Temp Code Lookup</p>
                  <h2 className="text-2xl font-black tracking-tighter uppercase">輸入代碼完成兌換</h2>
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
                  <span className="mb-2 block bauhaus-label text-sm font-black uppercase tracking-[0.12em]" style={{ color: 'var(--text)' }}>8 碼小寫英數臨時代碼</span>
                  <input
                    value={tempCodeInput}
                    onChange={(event) => setTempCodeInput(event.target.value.toLowerCase().replace(/[^a-z0-9]/g, ""))}
                    placeholder="a1b2c3d4"
                    maxLength={8}
                    inputMode="text"
                    autoCapitalize="none"
                    className="clay-input rounded-none tracking-[0.25em] font-black text-center text-lg"
                  />
                </label>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    type="button"
                    onClick={lookupTempCode}
                    className="clay-button clay-button-yellow rounded-none flex-1 sm:flex-none py-3"
                  >
                    <Search className="mr-2 h-5 w-5" />
                    查詢代碼
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
                  <p className="bauhaus-label" style={{ color: 'var(--primary)' }}>Shared Log</p>
                  <h2 className="text-2xl font-black tracking-tighter uppercase">所有管理員的兌換紀錄</h2>
                  <p className="text-xs font-medium text-[var(--text-secondary)] mt-1">紀錄會包含臨時代碼、玩家與兌換時間，方便後續追查</p>
                </div>
              </div>

              {records.length === 0 ? (
                <div className="bauhaus-frame bg-[#F0F0F0] p-6 text-center">
                  <p className="text-sm font-black uppercase tracking-[0.12em]">還沒有任何兌換紀錄</p>
                  <p className="text-xs font-medium text-[var(--text-secondary)] mt-2">當管理員進行兌換時，紀錄會出現在此</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[420px] overflow-y-auto pr-2">
                  {records.map((record) => (
                    <div key={record.id} className="bauhaus-frame bg-white p-4 sm:p-5">
                      <div className="space-y-3">
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

                        <div className="border-t-2 border-black pt-3 space-y-1">
                          <p className="text-xs font-black uppercase tracking-[0.12em] text-[var(--primary)]">玩家</p>
                          <p className="text-sm font-black break-all">{record.playerName}</p>
                          <p className="text-xs font-medium text-[var(--text-secondary)] break-all">{record.playerEmail}</p>
                        </div>

                        <div className="border-t-2 border-black pt-3 space-y-1">
                          <p className="text-xs font-black uppercase tracking-[0.12em] text-[var(--primary)]">管理員</p>
                          <p className="text-sm font-black">{record.adminName}</p>
                          <p className="text-xs font-medium text-[var(--text-secondary)] break-all">{record.adminEmail}</p>
                        </div>

                        <div className="border-t-2 border-black pt-3 space-y-1">
                          <p className="text-xs font-black uppercase tracking-[0.12em] text-[var(--primary)]">臨時代碼</p>
                          <p className="text-sm font-black tracking-[0.2em]">{record.tempCode || 'N/A'}</p>
                          <p className="text-xs font-medium text-[var(--text-secondary)] break-all">{formatTime(record.createdAtMs)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bauhaus-frame bg-white p-5 sm:p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center border-4 border-black bg-[#D02020] text-white">
                  <ShieldAlert className="h-6 w-6" />
                </div>
                <div>
                  <p className="bauhaus-label" style={{ color: 'var(--primary)' }}>Account Reset</p>
                  <h2 className="text-2xl font-black tracking-tighter uppercase">重製指定帳號</h2>
                </div>
              </div>

              <p className="text-sm font-medium text-[var(--text-secondary)] leading-relaxed">
                會清除該帳號的兌換紀錄、臨時代碼與遊戲進度。這是不可復原操作。
              </p>

              <div className="mt-4 space-y-3">
                <label className="block">
                  <span className="mb-2 block bauhaus-label text-sm font-black uppercase tracking-[0.12em]" style={{ color: 'var(--text)' }}>玩家 Gmail</span>
                  <input
                    value={resetEmail}
                    onChange={(event) => setResetEmail(event.target.value)}
                    className="clay-input rounded-none"
                    placeholder="cheiling0131@gmail.com"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block bauhaus-label text-sm font-black uppercase tracking-[0.12em]" style={{ color: 'var(--text)' }}>設定完成關卡 (1-20，可用逗號/範圍)</span>
                  <input
                    value={completedInput}
                    onChange={(e) => setCompletedInput(e.target.value)}
                    placeholder="例如：1-5,7,9 或 1 2 3"
                    className="clay-input rounded-none"
                  />
                </label>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={applyCompletedInput}
                    disabled={busy}
                    className="clay-button clay-button-yellow rounded-none flex-1 py-3 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    套用完成關卡
                  </button>
                  
                </div>

                <button
                  type="button"
                  onClick={resetPlayerProgress}
                  disabled={busy}
                  className="clay-button clay-button-blue rounded-none w-full py-3 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ShieldAlert className="mr-2 h-5 w-5" />
                  {busy ? '處理中…' : '重製此帳號'}
                </button>
              </div>
            </div>
          </div>
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
