"use client";

import React, { useEffect } from "react";
import { ThemeId, GAME_THEMES, GameTheme } from "@/utils/themes";
import { soundManager } from "@/utils/audio";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: ThemeId;
  onThemeChange: (theme: ThemeId) => void;
  soundEnabled: boolean;
  onSoundToggle: (enabled: boolean) => void;
  volume: number;
  onVolumeChange: (volume: number) => void;
  bgmEnabled: boolean;
  onBgmToggle: (enabled: boolean) => void;
}

export default function SettingsModal({
  isOpen,
  onClose,
  currentTheme,
  onThemeChange,
  soundEnabled,
  onSoundToggle,
  volume,
  onVolumeChange,
  bgmEnabled,
  onBgmToggle,
}: SettingsModalProps) {
  const activeTheme: GameTheme = GAME_THEMES[currentTheme] || GAME_THEMES.classic;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleTestSound = () => {
    if (soundEnabled) {
      soundManager.playEat(volume);
    } else {
      soundManager.playClick(volume);
    }
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value) / 100;
    onVolumeChange(val);
  };

  const percent = Math.round(volume * 100);

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
        className={`w-full max-w-md p-6 rounded-3xl border-3 shadow-2xl transition-all max-h-[90vh] overflow-y-auto ${activeTheme.textColor} ${activeTheme.borderColor}`}
        style={{ backgroundColor: activeTheme.modalBgHex }}
      >
        {/* HEADER */}
        <div className={`flex justify-between items-center pb-3 border-b-2 ${activeTheme.borderColor} mb-5`}>
          <div className="flex items-center gap-2">
            <span className="text-xl">⚙️</span>
            <h3 className="text-lg font-black tracking-widest uppercase">GAME SETTINGS</h3>
          </div>
          <button
            type="button"
            onClick={() => {
              if (soundEnabled) soundManager.playClick(volume);
              onClose();
            }}
            className={`w-8 h-8 rounded-full border-2 ${activeTheme.borderColor} flex items-center justify-center font-bold text-sm hover:scale-105 active:scale-95 transition bg-white/40`}
          >
            ✕
          </button>
        </div>

        {/* SECTION 1: THEME SELECTION */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
              <span>🎨</span> COLOR THEME
            </span>
            <span className="text-[11px] font-bold opacity-75">{activeTheme.name}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {(Object.keys(GAME_THEMES) as ThemeId[]).map((themeKey) => {
              const item = GAME_THEMES[themeKey];
              const isSelected = currentTheme === themeKey;

              return (
                <button
                  key={themeKey}
                  type="button"
                  onClick={() => {
                    if (soundEnabled) soundManager.playClick(volume);
                    onThemeChange(themeKey);
                  }}
                  className={`p-3 rounded-2xl border-2 transition-all flex items-center justify-between text-left ${
                    isSelected
                      ? `ring-2 ring-offset-1 scale-102 shadow-md ${item.borderColor}`
                      : "opacity-70 hover:opacity-100 border-slate-400/40 hover:scale-101"
                  }`}
                  style={{
                    backgroundColor: item.modalBgHex,
                    color: item.id === "cyberpunk" ? "#e0f2fe" : item.id === "gameboy" ? "#0f380f" : "#1e293b",
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{item.emoji}</span>
                    <span className="text-xs font-black">{item.name}</span>
                  </div>

                  {/* Swatches (Color dots) */}
                  <div className="flex items-center gap-1">
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-black/20"
                      style={{ backgroundColor: item.swatch.bg }}
                      title="Nền"
                    />
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-black/20"
                      style={{ backgroundColor: item.swatch.snake }}
                      title="Rắn"
                    />
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-black/20"
                      style={{ backgroundColor: item.swatch.food }}
                      title="Mồi"
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* SECTION 2: AUDIO CONTROLS */}
        <div className={`pt-4 border-t-2 ${activeTheme.borderColor} mb-6 flex flex-col gap-4`}>
          <span className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
            <span>🔊</span> SOUND & AUDIO
          </span>

          {/* Sound FX Toggle */}
          <div className="flex items-center justify-between bg-black/5 p-3 rounded-2xl border border-black/10">
            <div className="flex flex-col">
              <span className="text-xs font-bold">Sound Effects (SFX)</span>
              <span className="text-[10px] opacity-70">Âm thanh ăn mồi, rẽ hướng, game over</span>
            </div>
            <button
              type="button"
              onClick={() => {
                const nextState = !soundEnabled;
                onSoundToggle(nextState);
                if (nextState) soundManager.playEat(volume);
              }}
              className={`w-14 h-7 rounded-full transition-colors relative border-2 ${activeTheme.borderColor} ${
                soundEnabled ? "bg-emerald-500" : "bg-gray-400"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white border border-slate-700 shadow-md transform transition-transform absolute top-0.5 ${
                  soundEnabled ? "translate-x-7" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>

          {/* Volume Slider */}
          <div className="flex flex-col gap-2 bg-black/5 p-3.5 rounded-2xl border border-black/10">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="flex items-center gap-1.5">
                {percent === 0 ? "🔇" : percent < 50 ? "🔉" : "🔊"} Âm lượng (Volume)
              </span>
              <span className="text-xs font-black bg-white/70 px-2 py-0.5 rounded-lg border border-black/10">
                {percent}%
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-[10px] font-bold opacity-60">0%</span>
              <input
                type="range"
                min="0"
                max="100"
                value={percent}
                onChange={handleSliderChange}
                disabled={!soundEnabled}
                className="w-full h-2.5 bg-slate-300 rounded-lg appearance-none cursor-pointer accent-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed"
              />
              <span className="text-[10px] font-bold opacity-60">100%</span>
            </div>

            <div className="flex justify-end mt-1">
              <button
                type="button"
                onClick={handleTestSound}
                disabled={!soundEnabled}
                className="text-[11px] font-bold px-3 py-1 bg-white/80 hover:bg-white text-slate-800 rounded-xl border border-slate-700 shadow-xs transition active:scale-95 disabled:opacity-40"
              >
                🎵 Test SFX
              </button>
            </div>
          </div>

          {/* BGM Chiptune Toggle */}
          <div className="flex items-center justify-between bg-black/5 p-3 rounded-2xl border border-black/10">
            <div className="flex flex-col">
              <span className="text-xs font-bold">Retro Chiptune BGM</span>
              <span className="text-[10px] opacity-70">Nhạc nền 8-bit hoài niệm</span>
            </div>
            <button
              type="button"
              onClick={() => {
                const nextState = !bgmEnabled;
                onBgmToggle(nextState);
                if (nextState) {
                  soundManager.startBGM(volume);
                } else {
                  soundManager.stopBGM();
                }
              }}
              className={`w-14 h-7 rounded-full transition-colors relative border-2 ${activeTheme.borderColor} ${
                bgmEnabled ? "bg-emerald-500" : "bg-gray-400"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white border border-slate-700 shadow-md transform transition-transform absolute top-0.5 ${
                  bgmEnabled ? "translate-x-7" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>
        </div>

        {/* FOOTER BUTTON */}
        <button
          type="button"
          onClick={() => {
            if (soundEnabled) soundManager.playClick(volume);
            onClose();
          }}
          className={`w-full py-3 rounded-2xl font-black text-sm tracking-wider shadow-md transition active:scale-98 ${activeTheme.primaryBtn}`}
        >
          DONE & SAVE
        </button>
      </div>
    </div>
  );
}
