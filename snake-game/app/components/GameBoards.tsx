"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/utils/supabase";
import { soundManager } from "@/utils/audio";
import { ThemeId, GAME_THEMES, GameTheme } from "@/utils/themes";

type Position = { x: number; y: number };
type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT";
type GameBoardProps = {
  userId?: string;
  avatarUrl?: string;
  onBackToMenu: () => void;
  themeId?: ThemeId;
  soundEnabled?: boolean;
  volume?: number;
};

const GRID_SIZE = 20; // 20x20 grid

export default function GameBoard({
  userId,
  avatarUrl,
  onBackToMenu,
  themeId = "classic",
  soundEnabled = true,
  volume = 0.5,
}: GameBoardProps) {
  const theme: GameTheme = GAME_THEMES[themeId] || GAME_THEMES.classic;

  const [snake, setSnake] = useState<Position[]>([{ x: 10, y: 10 }]);
  const [food, setFood] = useState<Position>({ x: 5, y: 5 });
  const [direction, setDirection] = useState<Direction>("RIGHT");
  const [score, setScore] = useState<number>(0);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);

  const directionRef = useRef<Direction>(direction);
  directionRef.current = direction;

  const soundEnabledRef = useRef<boolean>(soundEnabled);
  soundEnabledRef.current = soundEnabled;

  const volumeRef = useRef<number>(volume);
  volumeRef.current = volume;

  const generateFood = useCallback((currentSnake: Position[]): Position => {
    while (true) {
      const newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      const is_on_snake = currentSnake.some(
        (segment) => segment.x === newFood.x && segment.y === newFood.y
      );
      if (!is_on_snake) return newFood;
    }
  }, []);

  const resetGame = () => {
    if (soundEnabledRef.current) soundManager.playClick(volumeRef.current);
    const initialSnake = [{ x: 10, y: 10 }];
    setSnake(initialSnake);
    setFood(generateFood(initialSnake));
    setDirection("RIGHT");
    setScore(0);
    setIsGameOver(false);
  };

  // Hàm trung gian đổi hướng dùng chung cho cả phím cứng lẫn phím ảo trên màn hình
  const changeDirection = useCallback((newDir: Direction) => {
    const opposites = {
      UP: "DOWN",
      DOWN: "UP",
      LEFT: "RIGHT",
      RIGHT: "LEFT",
    };
    if (opposites[newDir] !== directionRef.current) {
      setDirection(newDir);
      if (soundEnabledRef.current) {
        soundManager.playMove(volumeRef.current);
      }
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowUp":
        case "w":
        case "W":
          changeDirection("UP");
          break;
        case "ArrowDown":
        case "s":
        case "S":
          changeDirection("DOWN");
          break;
        case "ArrowLeft":
        case "a":
        case "A":
          changeDirection("LEFT");
          break;
        case "ArrowRight":
        case "d":
        case "D":
          changeDirection("RIGHT");
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [changeDirection]);

  useEffect(() => {
    if (isGameOver) return;

    const gameLoop = setInterval(() => {
      setSnake((prevSnake) => {
        const head = prevSnake[0];
        let newHead = { ...head };

        switch (directionRef.current) {
          case "UP": newHead.y -= 1; break;
          case "DOWN": newHead.y += 1; break;
          case "LEFT": newHead.x -= 1; break;
          case "RIGHT": newHead.x += 1; break;
        }

        if (
          newHead.x < 0 ||
          newHead.x >= GRID_SIZE ||
          newHead.y < 0 ||
          newHead.y >= GRID_SIZE
        ) {
          setIsGameOver(true);
          if (soundEnabledRef.current) soundManager.playGameOver(volumeRef.current);
          return prevSnake;
        }

        const bit_itself = prevSnake.some(
          (segment) => segment.x === newHead.x && segment.y === newHead.y
        );
        if (bit_itself) {
          setIsGameOver(true);
          if (soundEnabledRef.current) soundManager.playGameOver(volumeRef.current);
          return prevSnake;
        }

        const newSnake = [newHead, ...prevSnake];

        if (newHead.x === food.x && newHead.y === food.y) {
          setScore((prev) => prev + 1);
          if (soundEnabledRef.current) soundManager.playEat(volumeRef.current);
          setFood(generateFood(newSnake));
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    }, 150);

    return () => clearInterval(gameLoop);
  }, [food, isGameOver, generateFood]);

  useEffect(() => {
    const saveScore = async () => {
      if (isGameOver && userId && score > 0) {
        const { error } = await supabase
          .from("scores")
          .insert([{ user_id: userId, score: score }]);

        if (error) console.error("Error saving score to Cloud:", error.message);
      }
    };
    saveScore();
  }, [isGameOver, userId, score]);

  return (
    <div className="flex flex-col items-center justify-center max-w-sm w-full p-4 animate-fade-in font-mono">
      
      {/* THANH ĐIỂM SỐ & NÚT QUAY LẠI MENU */}
      <div className={`w-full flex justify-between items-center px-4 py-3 rounded-2xl border-2 shadow-xs mb-4 ${theme.cardBg} ${theme.borderColor}`}>
        <span className={`font-bold tracking-wider text-sm ${theme.textColor}`}>
          SCORE: <span className={`font-black text-base ${theme.accentText}`}>{score}</span>
        </span>
        <button 
          onClick={() => {
            if (soundEnabledRef.current) soundManager.playClick(volumeRef.current);
            onBackToMenu();
          }}
          className={`text-xs font-bold px-3 py-1.5 rounded-xl transition active:scale-95 shadow-xs ${theme.secondaryBtn}`}
        >
          MENU
        </button>
      </div>

      {/* KHUNG LƯỚI CHƠI GAME */}
      <div
        className={`grid border-4 relative rounded-2xl overflow-hidden shadow-md transition-all ${theme.boardBg} ${theme.boardBorder}`}
        style={{
          gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
          width: "100%",
          aspectRatio: "1 / 1"
        }}
      >
        {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, index) => {
          const x = index % GRID_SIZE;
          const y = Math.floor(index / GRID_SIZE);

          const isSnake = snake.some((seg) => seg.x === x && seg.y === y);
          const isSnakeHead = snake[0].x === x && snake[0].y === y;
          const isFood = food.x === x && food.y === y;

          return (
            <div
              key={index}
              className={`w-full h-full border-[0.5px] relative flex items-center justify-center transition-all duration-75 ${theme.gridLine} ${
                isSnakeHead
                  ? avatarUrl
                    ? "rounded-md overflow-hidden z-10 scale-110 shadow-sm border border-white/40"
                    : `${theme.snakeHead} rounded-sm z-10 shadow-xs`
                  : isSnake
                    ? `${theme.snakeBody} rounded-xs`
                    : isFood
                      ? `${theme.food} animate-pulse rounded-full`
                      : "bg-transparent"
              }`}
            >
              {isSnakeHead && avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Snake Head"
                  className="w-full h-full object-cover"
                />
              ) : null}
            </div>
          );
        })}

        {/* BẢNG THÔNG BÁO THUA CUỘC */}
        {isGameOver && (
          <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center text-center p-4 z-10 animate-fade-in">
            <h2 className="text-2xl font-black text-red-500 mb-2 tracking-widest">
              GAME OVER
            </h2>
            <p className="text-gray-200 text-sm mb-6 font-bold">You scored {score} points.</p>
            <div className="flex gap-3">
              <button 
                onClick={resetGame} 
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 font-bold rounded-xl text-xs transition active:scale-95 text-white shadow-md uppercase"
              >
                Play Again
              </button>
              <button 
                onClick={() => {
                  if (soundEnabledRef.current) soundManager.playClick(volumeRef.current);
                  onBackToMenu();
                }} 
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 font-bold rounded-xl text-xs transition active:scale-95 text-white shadow-md uppercase"
              >
                Main Menu
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 🎮 CỤM PHÍM MŨI TÊN ẢO D-PAD TRÊN MÀN HÌNH */}
      <div className="flex flex-col items-center gap-1.5 mt-6 w-full max-w-[180px]">
        {/* Phím Lên */}
        <button 
          type="button"
          onClick={() => changeDirection("UP")}
          className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center shadow-sm transition active:scale-90 ${theme.secondaryBtn} ${direction === "UP" ? "ring-2 ring-emerald-500" : ""}`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
          </svg>
        </button>

        {/* Hàng ngang gồm Trái - Xuống - Phải */}
        <div className="flex gap-1.5 w-full justify-between">
          {/* Phím Trái */}
          <button 
            type="button"
            onClick={() => changeDirection("LEFT")}
            className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center shadow-sm transition active:scale-90 ${theme.secondaryBtn} ${direction === "LEFT" ? "ring-2 ring-emerald-500" : ""}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>

          {/* Phím Xuống */}
          <button 
            type="button"
            onClick={() => changeDirection("DOWN")}
            className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center shadow-sm transition active:scale-90 ${theme.secondaryBtn} ${direction === "DOWN" ? "ring-2 ring-emerald-500" : ""}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </button>

          {/* Phím Phải */}
          <button 
            type="button"
            onClick={() => changeDirection("RIGHT")}
            className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center shadow-sm transition active:scale-90 ${theme.secondaryBtn} ${direction === "RIGHT" ? "ring-2 ring-emerald-500" : ""}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </div>
      </div>
      
    </div>
  );
}