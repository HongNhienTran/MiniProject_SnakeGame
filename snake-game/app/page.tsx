"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/utils/supabase";
import GameBoard from "./components/GameBoards";

type LeaderboardItem = {
  score: number;
  created_at: string;
  profiles: {
    username: string;
  };
};

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [usernameInput, setUsernameInput] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardItem[]>([]);
  const [loading, setLoading] = useState(true);

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
      }
      await fetchLeaderboard();
      setLoading(false);
    };

    checkUser();
  }, [fetchLeaderboard]);

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin, // Sau khi đăng nhập xong thì quay về trang này
      },
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setIsPlaying(false);
  };

  const handleSaveUsername = async (e: React.FormEvent) => {
    e.preventDefault();
    if (usernameInput.trim().length < 3) {
      alert("Biệt danh phải có ít nhất 3 ký tự!");
      return;
    }

    const { data, error } = await supabase
      .from("profiles")
      .insert([{ id: user.id, username: usernameInput.trim() }])
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
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900 text-white font-mono">
        Loading Assets...
      </div>
    );
  }

  if (isPlaying) {
    return (
      <div className="relative">
        <GameBoard userId={profile?.id} onBackToMenu={() => { setIsPlaying(false); fetchLeaderboard(); }} />
        <button 
          onClick={handleLogout}
          className="absolute top-4 right-4 px-3 py-1 bg-red-600/50 hover:bg-red-600 text-xs rounded font-mono text-white"
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <main className="flex flex-col lg:flex-row min-h-screen bg-gray-900 text-white font-mono p-6 items-center justify-center gap-12">
      
      {/* KHU VỰC TRÁI: MENU CHÍNH */}
      <div className="flex flex-col items-center text-center max-w-md w-full bg-gray-800 p-8 rounded-xl border border-gray-700 shadow-2xl">
        <h1 className="text-4xl font-extrabold text-emerald-400 mb-2 tracking-wider animate-pulse">
          SNAKE RETRO
        </h1>
        <p className="text-gray-400 text-xs mb-8">Next.js + Supabase Cloud Edition</p>

        {!user && (
          <div className="w-full flex flex-col gap-4">
            <button
              onClick={handleGoogleLogin}
              className="w-full py-3 px-4 bg-white hover:bg-gray-100 text-gray-900 font-bold rounded-lg transition transform hover:scale-105 flex items-center justify-center gap-3 shadow-lg"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              Sign in with Google
            </button>
            <button
              onClick={() => setIsPlaying(true)}
              className="w-full py-3 bg-gray-700 hover:bg-gray-600 font-bold rounded-lg transition text-gray-300 border border-gray-600"
            >
              Play as Guest (No Rank)
            </button>
          </div>
        )}

        {/* 2. Trường hợp Đã đăng nhập nhưng Chưa đặt biệt danh */}
        {user && !profile && (
          <form onSubmit={handleSaveUsername} className="w-full flex flex-col gap-3">
            <p className="text-sm text-yellow-400 mb-2">Welcome! Please set a nickname to enter the leaderboard:</p>
            <input
              type="text"
              placeholder="Enter nickname (min 3 chars)..."
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
              className="w-full px-4 py-2 rounded bg-gray-900 border border-gray-600 text-white text-center focus:outline-none focus:border-emerald-400"
            />
            <button
              type="submit"
              className="w-full py-2 bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold rounded"
            >
              Confirm Nickname
            </button>
          </form>
        )}

        {/* 3. Trường hợp Đã đăng nhập & Đã có biệt danh */}
        {user && profile && (
          <div className="w-full flex flex-col gap-4">
            <p className="text-sm text-gray-300">
              Player: <span className="text-emerald-400 font-bold text-lg">{profile.username}</span>
            </p>
            <button
              onClick={() => setIsPlaying(true)}
              className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xl rounded-lg shadow-lg transition transform hover:scale-105 tracking-wide"
            >
              START GAME 🚀
            </button>
            <button
              onClick={handleLogout}
              className="text-xs text-gray-500 hover:text-red-400 transition underline mt-2"
            >
              Sign Out
            </button>
          </div>
        )}
      </div>

      {/* KHU VỰC PHẢI: BẢNG XẾP HẠNG (LEADERBOARD) */}
      <div className="w-full max-w-md bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-2xl">
        <h2 className="text-xl font-bold text-yellow-400 mb-4 text-center border-b border-gray-700 pb-2 tracking-widest">
          🏆 TOP 10 GLOBAL
        </h2>
        {leaderboard.length === 0 ? (
          <p className="text-center text-gray-500 text-sm py-8">No records yet. Be the first!</p>
        ) : (
          <div className="flex flex-col gap-2 max-h-[320px] overflow-y-auto pr-1">
            {leaderboard.map((item, index) => (
              <div 
                key={index} 
                className={`flex justify-between items-center px-4 py-2 rounded font-mono text-sm ${
                  index === 0 ? "bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 font-bold" : "bg-gray-900/50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 text-gray-500 text-xs">#{index + 1}</span>
                  <span>{item.profiles?.username || "Unknown"}</span>
                </div>
                <span className="text-emerald-400 font-bold">{item.score} pts</span>
              </div>
            ))}
          </div>
        )}
      </div>

    </main>
  );
}