"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { supabase } from "@/utils/supabase";
import GameBoard from "./components/GameBoards";
import SplashScreen from "./components/SplashScreen";
import LeaderboardModal from "./components/LeaderboardModal"; // 👈 Import component vừa tách

type LeaderboardItem = {
  score: number;
  created_at: string;
  profiles: {
    username: string;
  };
};

const DEFAULT_AVATARS = [
  "https://res.cloudinary.com/det724qml/image/upload/v1779599103/avt03_erxaak.png",
  "https://res.cloudinary.com/det724qml/image/upload/v1779599102/avt05_mvl7v2.png",
  "https://res.cloudinary.com/det724qml/image/upload/v1779599102/avt01_ov2vup.png",
  "https://res.cloudinary.com/det724qml/image/upload/v1779599109/avt02_jfvkdm.png",
  "https://res.cloudinary.com/det724qml/image/upload/v1779599103/avt04_fh5tnp.png"
];

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [bestScore, setBestScore] = useState<number>(0);
  const [usernameInput, setUsernameInput] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState(DEFAULT_AVATARS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);

  const [showEditModal, setShowEditModal] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false); // 👈 State quản lý đóng/mở BXH

  const fetchLeaderboard = useCallback(async () => {
    const { data, error } = await supabase
      .from("scores")
      .select(`
        score,
        created_at,
        profiles ( username )
      `)
      .order("score", { ascending: false })
      .limit(10);

    if (error) {
      console.error("Lỗi lấy BXH:", error.message);
    } else if (data) {
      setLeaderboard(data as unknown as LeaderboardItem[]);
    }
  }, []);

  const fetchBestScore = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from("scores")
      .select("score")
      .eq("user_id", userId)
      .order("score", { ascending: false })
      .limit(1);

    if (!error && data && data.length > 0) {
      setBestScore(data[0].score);
    } else {
      setBestScore(0);
    }
  }, []);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        
        setProfile(profileData);
        if (profileData) {
          await fetchBestScore(user.id);
          setUsernameInput(profileData.username || "");
          setSelectedAvatar(profileData.avatar_url || DEFAULT_AVATARS[0]);
        } else {
          const randomIndex = Math.floor(Math.random() * DEFAULT_AVATARS.length);
          setSelectedAvatar(DEFAULT_AVATARS[randomIndex]);
        }
      }
      await fetchLeaderboard();
      setLoading(false);
    };

    checkUser();
  }, [fetchLeaderboard, fetchBestScore]);

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setBestScore(0);
    setIsPlaying(false);
    setShowEditModal(false);
    setShowLeaderboard(false);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (usernameInput.trim().length < 3) {
      alert("Biệt danh phải có ít nhất 3 ký tự!");
      return;
    }

    const updatedData = { 
      id: user.id, 
      username: usernameInput.trim(),
      avatar_url: selectedAvatar 
    };

    const { data, error } = await supabase
      .from("profiles")
      .upsert([updatedData])
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        alert("Biệt danh này đã có người sử dụng, vui lòng chọn tên khác!");
      } else {
        alert("Lỗi: " + error.message);
      }
    } else {
      setProfile(data);
      await fetchBestScore(user.id);
      setShowEditModal(false);
    }
  };

  if (showSplash) {
    return (
      <SplashScreen onFinished={() => { if (!loading) setShowSplash(false); }} />
    );
  }

  if (isPlaying) {
    return (
      <div className="relative min-h-screen flex items-center justify-center" style={{ backgroundColor: "#f6edcc" }}>
        <GameBoard userId={profile?.id} onBackToMenu={() => { setIsPlaying(false); fetchLeaderboard(); if (user) fetchBestScore(user.id); }} />
        <button 
          onClick={handleLogout}
          className="absolute top-4 right-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-sm rounded font-mono text-white shadow-md transition"
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <main 
      className="w-full min-h-screen font-mono p-4 md:p-6 relative overflow-hidden flex items-center justify-center" 
      style={{ backgroundColor: "#f6edcc" }}
    >
      
      {/* 📦 KHUNG CHỨA CHÍNH (MAIN CONTAINER) - NƠI BẠN QUẢN LÝ KÍCH THƯỚC VÀ BORDER */}
      <div 
        className="w-full max-w-[800px] h-full min-h-[85vh] md:min-h-[600px] relative flex flex-col items-center justify-between p-6 rounded-3xl bg-transparent border-2 border-transparent transition-all"
        /* 💡 Mẹo quản lý sau này:
          - Muốn đổi độ rộng: Sửa `max-w-[500px]` thành kích thước mong muốn (ví dụ: 450px, 600px).
          - Muốn hiện khung lên để căn chỉnh: Thay `border-transparent` bằng `border-slate-800` 
            và thay `bg-transparent` thành `bg-white/20` để nhìn rõ vùng an toàn.
        */
      >

        {/* 👑 KHU VỰC TRÊN GÓC TRÁI: THANH THỂ HIỆN AVATAR & BEST SCORE (Bây giờ sẽ tuyệt đối theo khung chứa chính) */}
        <div className="absolute top-0 left-0 z-20 flex items-center gap-3 bg-white/80 p-2 pr-4 rounded-full border-2 border-slate-800 shadow-sm min-w-[180px]">
          {user && profile ? (
            <>
              <div className="w-10 h-10 rounded-full border border-slate-800 overflow-hidden relative bg-slate-200 flex-shrink-0">
                <img src={profile.avatar_url || DEFAULT_AVATARS[0]} alt="Avatar" className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col leading-tight min-w-[70px]">
                <span className="text-xs font-black text-slate-800 truncate max-w-[90px]">{profile.username}</span>
                <span className="text-[10px] text-amber-600 font-bold tracking-wider">🏆 BEST: {bestScore}</span>
              </div>
              <button 
                type="button"
                onClick={() => {
                  setUsernameInput(profile.username);
                  setSelectedAvatar(profile.avatar_url || DEFAULT_AVATARS[0]);
                  setShowEditModal(true);
                }}
                className="p-1 hover:bg-slate-200 rounded-full transition text-slate-600 hover:text-slate-900 border border-transparent hover:border-slate-300 ml-1"
                title="Chỉnh sửa thông tin"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                </svg>
              </button>
            </>
          ) : (
            <>
              <div className="w-10 h-10 rounded-full border-2 border-dashed border-slate-400 flex items-center justify-center text-slate-400 font-bold text-sm bg-slate-100 flex-shrink-0">?</div>
              <div className="flex flex-col leading-tight">
                <span className="text-xs font-bold text-slate-400">GUEST MODE</span>
                <span className="text-[10px] text-slate-400 font-medium">No Rank Saved</span>
              </div>
            </>
          )}
        </div>

        {/* KHU VỰC TRÊN: LOGO GAME */}
        <div className="flex flex-col items-center mt-16 w-full">
          <div style={{ animation: 'jump-low 2s ease-in-out infinite' }}>
            <style>{`
              @keyframes jump-low {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-10px); }
              }
            `}</style>
            <Image src="https://res.cloudinary.com/det724qml/image/upload/v1779598010/SnakeGame_logo_tbbt6c.png" alt="Snake Game Logo" width={680} height={200} priority className="object-contain drop-shadow-sm" />
          </div>
        </div>

        {/* KHU VỰC GIỮA: CÁC NÚT ĐIỀU HƯỚNG CHÍNH */}
        <div className="w-full max-w-sm flex flex-col gap-4 my-auto z-10">
          {!user && (
            <>
              <button onClick={handleGoogleLogin} className="w-full py-3.5 px-6 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-full border-2 border-slate-800 transition transform hover:scale-102 active:scale-98 flex items-center justify-center gap-3 shadow-md">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                LOGIN WITH GG
              </button>
              <button onClick={() => setIsPlaying(true)} className="w-full py-3.5 bg-transparent hover:bg-slate-800/5 text-slate-800 font-bold rounded-full border-2 border-slate-800 transition transform hover:scale-102 active:scale-98 shadow-sm">
                PLAY AS GUEST
              </button>
            </>
          )}

          {user && !profile && (
            <form onSubmit={handleSaveProfile} className="w-full flex flex-col gap-4 bg-white/70 p-6 rounded-2xl border-2 border-slate-800 shadow-sm">
              <p className="text-sm font-bold text-slate-700 text-center">Setup your Retro Profile:</p>
              <div className="flex flex-col items-center gap-2">
                <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Choose Avatar</span>
                <div className="flex gap-2 justify-center">
                  {DEFAULT_AVATARS.map((av, idx) => (
                    <button key={idx} type="button" onClick={() => setSelectedAvatar(av)} className={`w-10 h-10 rounded-full overflow-hidden relative transition border-2 ${selectedAvatar === av ? "border-lime-600 scale-110 shadow-md" : "border-transparent opacity-60 hover:opacity-100"}`}>
                      <img src={av} alt="Avatar option" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
              <input type="text" placeholder="Nickname (min 3 chars)..." value={usernameInput} onChange={(e) => setUsernameInput(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-white border-2 border-slate-800 text-slate-800 text-center font-bold focus:outline-none focus:ring-2 focus:ring-lime-600" />
              <button type="submit" className="w-full py-2.5 bg-lime-700 hover:bg-lime-600 text-white font-bold rounded-xl border-2 border-lime-700 shadow-sm transition">CONFIRM PROFILE</button>
            </form>
          )}

          {user && profile && (
            <div className="w-full flex flex-col gap-4 items-center text-center">
              <button onClick={() => setIsPlaying(true)} className="w-full py-4 bg-lime-700 hover:bg-lime-600 text-white font-black text-xl rounded-full border-2 border-lime-700 shadow-md transition transform hover:scale-105">
                START GAME 🚀
              </button>
              <button onClick={handleLogout} className="text-xs text-slate-500 hover:text-red-600 transition underline tracking-wider font-bold">
                SIGN OUT
              </button>
            </div>
          )}
        </div>

        {/* KHU VỰC DƯỚI GÓC PHẢI: HAI NÚT TRÒN (Tuyệt đối theo khung chứa chính) */}
        <div className="absolute bottom-0 right-0 flex gap-4 z-20">
          <button 
            type="button"
            className="w-14 h-14 bg-white hover:bg-slate-100 text-slate-800 rounded-full border-2 border-slate-800 flex items-center justify-center shadow-md transition transform hover:scale-110 active:scale-95"
            onClick={() => setShowLeaderboard(true)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 14a3.5 3.5 0 003.5-3.5V5.5h-7v5A3.5 3.5 0 0012 14zM9 7H6.5a1.5 1.5 0 000 3H9M15 7h2.5a1.5 1.5 0 010 3H15M12 14v4m-3 0h6" />
            </svg>
          </button>

          <button type="button" className="w-14 h-14 bg-white hover:bg-slate-100 text-slate-800 rounded-full border-2 border-slate-800 flex items-center justify-center shadow-md transition transform hover:scale-110 active:scale-95" onClick={() => alert("Settings coming soon in Phase 5!")}>
            <svg className="w-6 h-6 animate-[spin_8s_linear_infinite]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.43l-1.003.767a1.123 1.123 0 00-.417 1.03c.004.074.006.148.006.222 0 .074-.002.148-.006.222a1.123 1.123 0 00.417 1.03l1.003.767a1.125 1.125 0 01.26 1.43l-1.296 2.247a1.125 1.125 0 01-1.37.49l-1.216-.456a1.125 1.125 0 00-1.076.124a2.08 2.08 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281a1.125 1.125 0 00-.645-.87a2.08 2.08 0 01-.22-.127a1.126 1.126 0 00-1.075-.124l-1.217.456a1.125 1.125 0 01-1.37-.49l-1.296-2.247a1.125 1.125 0 01.26-1.43l1.003-.767a1.122 1.122 0 00.417-1.03a2.07 2.07 0 01-.006-.222c0-.074.002-.148.006-.222a1.122 1.122 0 00-.417-1.03l-1.003-.767a1.125 1.125 0 01-.26-1.43l1.296-2.247a1.125 1.125 0 011.37-.49l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128c.332-.183.582-.495.644-.869l.214-1.28z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>

      </div>

      {/* 🛠️ CÁC MODAL HỆ THỐNG (Giữ nguyên bên ngoài container để phủ toàn màn hình) */}
      {showEditModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50" onClick={(e) => { if (e.target === e.currentTarget) setShowEditModal(false); }}>
          <form onSubmit={handleSaveProfile} className="bg-[#f6edcc] w-full max-w-sm p-6 rounded-2xl border-3 border-slate-800 shadow-2xl flex flex-col gap-5">
            <div className="flex justify-between items-center border-b-2 border-slate-800 pb-2">
              <h3 className="text-base font-black text-slate-800 tracking-wider">✏️ EDIT PROFILE</h3>
              <button type="button" onClick={() => setShowEditModal(false)} className="text-slate-500 hover:text-slate-800 font-bold">✕</button>
            </div>
            <div className="flex flex-col items-center gap-2">
              <span className="text-xs font-bold text-slate-700">Change Avatar</span>
              <div className="flex gap-2 justify-center bg-white/40 p-2 rounded-xl border border-slate-300">
                {DEFAULT_AVATARS.map((av, idx) => (
                  <button key={idx} type="button" onClick={() => setSelectedAvatar(av)} className={`w-10 h-10 rounded-full overflow-hidden relative transition border-2 ${selectedAvatar === av ? "border-slate-800 scale-110 shadow-md" : "border-transparent opacity-50 hover:opacity-100"}`}>
                    <img src={av} alt="Avatar option" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-bold text-slate-700 pl-1">Change Nickname</span>
              <input type="text" value={usernameInput} onChange={(e) => setUsernameInput(e.target.value)} className="w-full px-4 py-2 bg-white border-2 border-slate-800 text-slate-800 text-center font-bold focus:outline-none focus:ring-2 focus:ring-lime-600 rounded-xl" />
            </div>
            <button type="submit" className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl border-2 border-slate-800 shadow-sm transition text-sm">SAVE CHANGES</button>
          </form>
        </div>
      )}

      <LeaderboardModal isOpen={showLeaderboard} onClose={() => setShowLeaderboard(false)} leaderboard={leaderboard} />

    </main>
  );
}