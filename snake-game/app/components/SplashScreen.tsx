"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

interface SplashScreenProps {
    onFinished: () => void;
}

export default function SplashScreen({ onFinished }: SplashScreenProps) {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        // Chạy thanh loading từ 0% đến 100% trong vòng 2.5 giây
        const interval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setTimeout(() => {
                        onFinished(); // Báo hiệu đã load xong để ẩn Splash Screen
                    }, 400); // Đợi thêm 0.4s để tạo hiệu ứng chuyển cảnh mượt
                    return 30;
                }
                return prev + 1;
            });
        }, 50);

        return () => clearInterval(interval);
    }, [onFinished]);

    return (
        <div
            className="fixed inset-0 z-50 flex flex-col items-center justify-center select-none animate-fade-in"
            style={{ backgroundColor: "#f6edcc" }} // Mã màu nền bạn yêu cầu
        >
            <style>{`
    @keyframes jump-low {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-15px); } /* Độ cao nhảy thấp vừa phải, cực mượt */
    }
  `}</style>
            {/* Khu vực Logo */}
            <div className="mb-8" style={{ animation: 'jump-low 1s ease-in-out infinite' }}>
                <Image
                    src="https://res.cloudinary.com/det724qml/image/upload/v1779598010/SnakeGame_logo_tbbt6c.png"
                    alt="Snake Game Logo"
                    width={700}
                    height={700}
                    priority
                    className="object-contain drop-shadow-md"
                />
            </div>

            {/* Khung thanh Loading phong cách Rắn bò */}
            <div className="w-64 h-6 bg-slate-700/10 rounded-full p-1 overflow-hidden relative border border-slate-700/20">

                {/* Phần thân rắn lấp đầy thanh loading */}
                <div
                    className="h-full bg-lime-600 rounded-full transition-all duration-75 ease-out relative"
                    style={{ width: `${progress}%` }}
                >
                    {/* Hiệu ứng uốn lượn (Rắn bò) trên thanh loading */}
                    <div className="absolute inset-0 bg-stripes opacity-30 animate-[pulse_1s_infinite]"></div>

                    {/* Mắt/Đầu con rắn ở điểm cuối thanh loading */}
                    {progress > 0 && (
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-lime-800 rounded-full flex items-center justify-center mr-1">
                            <div className="w-1 h-1 bg-white rounded-full"></div>
                        </div>
                    )}
                </div>
            </div>

            {/* Hiển thị số phần trăm */}
            <div className="mt-3 text-sm font-semibold font-mono text-slate-600">
                {progress}%
            </div>
        </div>
    );
}