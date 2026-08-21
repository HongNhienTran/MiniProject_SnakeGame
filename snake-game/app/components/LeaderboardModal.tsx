"use client";

import { useEffect } from "react";
import { ThemeId, GAME_THEMES, GameTheme } from "@/utils/themes";
import { soundManager } from "@/utils/audio";

type LeaderboardItem = {
  score: number;
  created_at: string;
  profiles: {
    username: string;
  };
};

type LeaderboardModalProps = {
  isOpen: boolean;
  onClose: () => void;
  leaderboard: LeaderboardItem[];
  themeId?: ThemeId;
  soundEnabled?: boolean;
  volume?: number;
};

export default function LeaderboardModal({
  isOpen,
  onClose,
  leaderboard,
  themeId = "classic",
  soundEnabled = true,
  volume = 0.5,
}: LeaderboardModalProps) {
  const theme: GameTheme = GAME_THEMES[themeId] || GAME_THEMES.classic;

  // Đóng modal khi bấm phím ESC cho trải nghiệm mượt mà
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in font-mono"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          if (soundEnabled) soundManager.playClick(volume);
          onClose();
        }
      }}
    >
      <div 
        className={`w-full max-w-sm p-6 rounded-2xl border-3 shadow-2xl transition-all ${theme.textColor} ${theme.borderColor}`}
        style={{ backgroundColor: theme.modalBgHex }}
      >
        {/* Header */}
        <div className={`flex justify-between items-center mb-4 border-b-2 ${theme.borderColor} pb-2`}>
          <h3 className="text-base font-black tracking-widest uppercase">LEADERBOARD</h3>
          <button 
            type="button"
            onClick={() => {
              if (soundEnabled) soundManager.playClick(volume);
              onClose();
            }}
            className={`w-7 h-7 rounded-full border-2 ${theme.borderColor} flex items-center justify-center font-bold text-xs hover:scale-105 active:scale-95 transition bg-white/40`}
          >
            ✕
          </button>
        </div>

        {/* Danh sách bảng xếp hạng */}
        <div className="flex flex-col gap-2 max-h-[280px] overflow-y-auto pr-1">
          {leaderboard.length === 0 ? (
            <p className={`text-center text-sm py-4 ${theme.textMuted}`}>No records yet</p>
          ) : (
            leaderboard.map((item, index) => (
              <div 
                key={index} 
                className={`flex justify-between items-center px-4 py-2.5 rounded-xl border font-bold text-sm transition-all ${
                  index === 0 
                    ? "bg-amber-100/90 border-2 border-amber-500/80 text-amber-900 shadow-xs" 
                    : "bg-white/90 text-slate-800 border-slate-300/80"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-mono font-black ${index === 0 ? "text-amber-700" : "text-slate-400"}`}>
                    #{index + 1}
                  </span>
                  <span className="truncate max-w-[140px]">
                    {item.profiles?.username || "Unknown"}
                  </span>
                </div>
                <span className={`font-black flex-shrink-0 ${theme.accentText}`}>{item.score} pts</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}