"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/utils/supabase";

type Position = { x: number; y: number };
type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT";
type GameBoardProps = {
  userId?: string;
  onBackToMenu: () => void;
};

const GRID_SIZE = 20; // Lưới 20x20

export default function GameBoard({ userId, onBackToMenu }: GameBoardProps) {
  const [snake, setSnake] = useState<Position[]>([{ x: 10, y: 10 }]);
  const [food, setFood] = useState<Position>({ x: 5, y: 5 });
  const [direction, setDirection] = useState<Direction>("RIGHT");
  const [score, setScore] = useState<number>(0);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);

  const directionRef = useRef<Direction>(direction);
  directionRef.current = direction;

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
          return prevSnake;
        }

        const bit_itself = prevSnake.some(
          (segment) => segment.x === newHead.x && segment.y === newHead.y
        );
        if (bit_itself) {
          setIsGameOver(true);
          return prevSnake;
        }

        const newSnake = [newHead, ...prevSnake];

        if (newHead.x === food.x && newHead.y === food.y) {
          setScore((prev) => prev + 1);
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

        if (error) console.error("Lỗi lưu điểm lên Cloud:", error.message);
      }
    };
    saveScore();
  }, [isGameOver, userId, score]);

  return (
    <div className="flex flex-col items-center justify-center max-w-sm w-full p-4 animate-fade-in font-mono">
      
      {/* THANH ĐIỂM SỐ & NÚT QUAY LẠI MENU */}
      <div className="w-full flex justify-between items-center bg-white/80 px-4 py-3 rounded-2xl border-2 border-slate-800 shadow-xs mb-4">
        <span className="text-slate-800 font-bold tracking-wider text-sm">
          SCORE: <span className="text-lime-700 font-black text-base">{score}</span>
        </span>
        <button 
          onClick={onBackToMenu}
          className="text-xs font-bold bg-slate-800 text-white px-3 py-1.5 rounded-xl hover:bg-slate-700 transition active:scale-95"
        >
          MENU
        </button>
      </div>

      {/* KHUNG LƯỚI CHƠI GAME (GIỮ NGUYÊN KÍCH THƯỚC VÀ HIỂN THỊ CỦA BẠN) */}
      <div
        className="grid bg-gray-800 border-4 border-slate-800 relative rounded-2xl overflow-hidden shadow-md"
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
              className={`w-full h-full border-[0.5px] border-gray-900/10 ${
                isSnakeHead
                  ? "bg-emerald-400 rounded-xs"
                  : isSnake
                    ? "bg-emerald-600"
                    : isFood
                      ? "bg-red-500 animate-pulse rounded-full"
                      : "bg-transparent"
              }`}
            />
          );
        })}

        {/* BẢNG THÔNG BÁO THUA cuộc */}
        {isGameOver && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-center p-4 z-10 animate-fade-in">
            <h2 className="text-2xl font-black text-red-500 mb-2 tracking-widest">
              GAME OVER
            </h2>
            <p className="text-gray-300 text-sm mb-6 font-bold">Bạn đạt được {score} điểm.</p>
            <div className="flex gap-3">
              <button onClick={resetGame} className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 font-bold rounded-xl text-xs transition active:scale-95 text-white">
                Chơi Lại
              </button>
              <button onClick={onBackToMenu} className="px-4 py-2 bg-gray-600 hover:bg-gray-700 font-bold rounded-xl text-xs transition active:scale-95 text-white">
                Menu Chính
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
          className={`w-12 h-12 bg-white text-slate-800 rounded-xl border-2 border-slate-800 flex items-center justify-center shadow-sm transition active:scale-90 ${direction === "UP" ? "bg-amber-100" : ""}`}
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
            className={`w-12 h-12 bg-white text-slate-800 rounded-xl border-2 border-slate-800 flex items-center justify-center shadow-sm transition active:scale-90 ${direction === "LEFT" ? "bg-amber-100" : ""}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>

          {/* Phím Xuống */}
          <button 
            type="button"
            onClick={() => changeDirection("DOWN")}
            className={`w-12 h-12 bg-white text-slate-800 rounded-xl border-2 border-slate-800 flex items-center justify-center shadow-sm transition active:scale-90 ${direction === "DOWN" ? "bg-amber-100" : ""}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </button>

          {/* Phím Phải */}
          <button 
            type="button"
            onClick={() => changeDirection("RIGHT")}
            className={`w-12 h-12 bg-white text-slate-800 rounded-xl border-2 border-slate-800 flex items-center justify-center shadow-sm transition active:scale-90 ${direction === "RIGHT" ? "bg-amber-100" : ""}`}
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