export type ThemeId = "classic" | "cyberpunk" | "gameboy" | "matcha" | "sunset";

export interface GameTheme {
  id: ThemeId;
  name: string;
  bgHex: string;
  cardBg: string;
  modalBgHex: string;
  textColor: string;
  textMuted: string;
  borderColor: string;
  borderHex: string;
  accentText: string;
  primaryBtn: string;
  secondaryBtn: string;
  
  // Game Board visual styles
  boardBg: string;
  boardBorder: string;
  gridLine: string;
  snakeHead: string;
  snakeBody: string;
  food: string;
  
  // Swatches for preview
  swatch: {
    bg: string;
    snake: string;
    food: string;
  };
}

export const GAME_THEMES: Record<ThemeId, GameTheme> = {
  classic: {
    id: "classic",
    name: "Classic",
    bgHex: "#f6edcc",
    cardBg: "bg-white/80",
    modalBgHex: "#f6edcc",
    textColor: "text-slate-800",
    textMuted: "text-slate-500",
    borderColor: "border-slate-800",
    borderHex: "#1e293b",
    accentText: "text-lime-700",
    primaryBtn: "bg-lime-700 hover:bg-lime-600 text-white border-2 border-lime-700",
    secondaryBtn: "bg-white hover:bg-slate-100 text-slate-800 border-2 border-slate-800",
    boardBg: "bg-gray-800",
    boardBorder: "border-slate-800",
    gridLine: "border-gray-900/15",
    snakeHead: "bg-emerald-400",
    snakeBody: "bg-emerald-600",
    food: "bg-red-500",
    swatch: {
      bg: "#f6edcc",
      snake: "#10b981",
      food: "#ef4444",
    },
  },
  cyberpunk: {
    id: "cyberpunk",
    name: "Cyberpunk",
    bgHex: "#0d1117",
    cardBg: "bg-slate-900/90",
    modalBgHex: "#161b22",
    textColor: "text-cyan-100",
    textMuted: "text-cyan-400/60",
    borderColor: "border-cyan-500/70",
    borderHex: "#06b6d4",
    accentText: "text-cyan-400",
    primaryBtn: "bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-black border-2 border-cyan-400",
    secondaryBtn: "bg-slate-800 hover:bg-slate-700 text-cyan-200 border-2 border-cyan-500/60",
    boardBg: "bg-slate-950",
    boardBorder: "border-cyan-500",
    gridLine: "border-cyan-900/20",
    snakeHead: "bg-cyan-300",
    snakeBody: "bg-cyan-500",
    food: "bg-fuchsia-500",
    swatch: {
      bg: "#0d1117",
      snake: "#06b6d4",
      food: "#d946ef",
    },
  },
  gameboy: {
    id: "gameboy",
    name: "GameBoy",
    bgHex: "#8b956d",
    cardBg: "bg-[#9bbc0f]/90",
    modalBgHex: "#9bbc0f",
    textColor: "text-[#0f380f]",
    textMuted: "text-[#306230]",
    borderColor: "border-[#0f380f]",
    borderHex: "#0f380f",
    accentText: "text-[#0f380f]",
    primaryBtn: "bg-[#306230] hover:bg-[#0f380f] text-[#9bbc0f] font-bold border-2 border-[#0f380f]",
    secondaryBtn: "bg-[#8bac0f] hover:bg-[#9bbc0f] text-[#0f380f] border-2 border-[#0f380f]",
    boardBg: "bg-[#0f380f]",
    boardBorder: "border-[#0f380f]",
    gridLine: "border-[#306230]/30",
    snakeHead: "bg-[#cadc9f]",
    snakeBody: "bg-[#8bac0f]",
    food: "bg-[#9bbc0f] border-2 border-[#cadc9f]",
    swatch: {
      bg: "#8b956d",
      snake: "#8bac0f",
      food: "#cadc9f",
    },
  },
  matcha: {
    id: "matcha",
    name: "Matcha",
    bgHex: "#e2ece9",
    cardBg: "bg-white/85",
    modalBgHex: "#e2ece9",
    textColor: "text-slate-800",
    textMuted: "text-emerald-700/70",
    borderColor: "border-[#2d6a4f]",
    borderHex: "#2d6a4f",
    accentText: "text-[#2d6a4f]",
    primaryBtn: "bg-[#2d6a4f] hover:bg-[#1b4332] text-white border-2 border-[#2d6a4f]",
    secondaryBtn: "bg-white hover:bg-emerald-50 text-[#2d6a4f] border-2 border-[#2d6a4f]",
    boardBg: "bg-[#1b4332]",
    boardBorder: "border-[#2d6a4f]",
    gridLine: "border-emerald-800/20",
    snakeHead: "bg-[#95d5b2]",
    snakeBody: "bg-[#52b788]",
    food: "bg-[#ff758f]",
    swatch: {
      bg: "#e2ece9",
      snake: "#52b788",
      food: "#ff758f",
    },
  },
  sunset: {
    id: "sunset",
    name: "Sunset",
    bgHex: "#faedcd",
    cardBg: "bg-[#fff1e6]/95",
    modalBgHex: "#faedcd",
    textColor: "text-[#4a2e2b]",
    textMuted: "text-[#9c6644]",
    borderColor: "border-[#6f1d1b]",
    borderHex: "#6f1d1b",
    accentText: "text-[#d90429]",
    primaryBtn: "bg-[#e76f51] hover:bg-[#f4a261] text-white border-2 border-[#d90429]",
    secondaryBtn: "bg-[#fefae0] hover:bg-[#faedcd] text-[#6f1d1b] border-2 border-[#6f1d1b]",
    boardBg: "bg-[#382220]",
    boardBorder: "border-[#6f1d1b]",
    gridLine: "border-amber-900/20",
    snakeHead: "bg-[#f4a261]",
    snakeBody: "bg-[#e76f51]",
    food: "bg-[#e63946]",
    swatch: {
      bg: "#faedcd",
      snake: "#e76f51",
      food: "#e63946",
    },
  },
};
