"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/utils/supabase"

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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowUp":
        case "w":
        case "W":
          if (directionRef.current !== "DOWN") setDirection("UP");
          break;
        case "ArrowDown":
        case "s":
        case "S":
          if (directionRef.current !== "UP") setDirection("DOWN");
          break;
        case "ArrowLeft":
        case "a":
        case "A":
          if (directionRef.current !== "RIGHT") setDirection("LEFT");
          break;
        case "ArrowRight":
        case "d":
        case "D":
          if (directionRef.current !== "LEFT") setDirection("RIGHT");
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <div className="mb-4 text-2xl font-bold font-mono">SCORE: {score}</div>

      {/* Khung lưới chơi game */}
      <div
        className="grid bg-gray-800 border-4 border-gray-700 relative"
        style={{
          gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
          width: "400px",
          height: "400px",
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
              className={`w-full h-full border-[0.5px] border-gray-800/10 ${isSnakeHead
                  ? "bg-emerald-400 rounded-sm"
                  : isSnake
                    ? "bg-emerald-600"
                    : isFood
                      ? "bg-red-500 animate-pulse rounded-full"
                      : "bg-transparent"
                }`}
            />
          );
        })}

        {isGameOver && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-center p-4">
            <h2 className="text-3xl font-extrabold text-red-500 mb-2 font-mono animate-bounce">
              GAME OVER
            </h2>
            <p className="text-gray-300 mb-6">Bạn đạt được {score} điểm.</p>
            <div className="flex gap-4">
              <button onClick={resetGame} className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 font-bold rounded text-sm">
                Chơi Lại
              </button>
              <button onClick={onBackToMenu} className="px-4 py-2 bg-gray-600 hover:bg-gray-700 font-bold rounded text-sm">
                Menu Chính
              </button>
            </div>
          </div>
        )}
      </div>
      <p className="mt-4 text-xs text-gray-500 font-mono">Dùng các phím mũi tên hoặc WASD để di chuyển</p>
    </div>
  );
}