"use client";

import { useEffect } from "react";

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
};

export default function LeaderboardModal({ isOpen, onClose, leaderboard }: LeaderboardModalProps) {
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
      className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-[#f6edcc] w-full max-w-sm p-6 rounded-2xl border-3 border-slate-800 shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-4 border-b-2 border-slate-800 pb-2">
          <h3 className="text-lg font-black text-slate-800 tracking-widest">🏆 TOP 10 GLOBAL</h3>
          <button 
            type="button"
            onClick={onClose}
            className="text-slate-500 hover:text-slate-800 font-bold transition transform active:scale-90"
          >
            ✕
          </button>
        </div>

        {/* Danh sách bảng xếp hạng */}
        <div className="flex flex-col gap-2 max-h-[280px] overflow-y-auto pr-1">
          {leaderboard.length === 0 ? (
            <p className="text-center text-slate-500 text-sm py-4">No records yet!</p>
          ) : (
            leaderboard.map((item, index) => (
              <div 
                key={index} 
                className={`flex justify-between items-center px-4 py-2.5 rounded-xl border font-bold text-sm transition-all ${
                  index === 0 
                    ? "bg-amber-100 border-2 border-amber-500 text-amber-800 shadow-xs" 
                    : "bg-white text-slate-700 border-slate-300"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`text-xs ${index === 0 ? "text-amber-600" : "text-slate-400"}`}>
                    #{index + 1}
                  </span>
                  <span className="truncate max-w-[140px]">
                    {item.profiles?.username || "Unknown"}
                  </span>
                </div>
                <span className="text-lime-700 flex-shrink-0">{item.score} pts</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}