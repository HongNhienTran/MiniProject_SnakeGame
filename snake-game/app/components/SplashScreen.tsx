"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

interface SplashScreenProps {
    onFinished: () => void;
}

export default function SplashScreen({ onFinished }: SplashScreenProps) {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        // Run loading bar from 0% to 100% in ~2.5s
        const interval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setTimeout(() => {
                        onFinished(); // Notify loading is finished to hide Splash Screen
                    }, 400); // 0.4s buffer for smooth transition
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
            style={{ backgroundColor: "#f6edcc" }}
        >
            <style>{`
            @keyframes jump-low {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-15px); } 
            }
            `}</style>
            {/* Logo Area */}
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

            {/* Snake Loading Bar */}
            <div className="w-64 h-6 bg-slate-700/10 rounded-full p-1 overflow-hidden relative border border-slate-700/20">

                {/* Snake body filling the bar */}
                <div
                    className="h-full bg-lime-600 rounded-full transition-all duration-75 ease-out relative"
                    style={{ width: `${progress}%` }}
                >
                    {/* Pattern effect */}
                    <div className="absolute inset-0 bg-stripes opacity-30 animate-[pulse_1s_infinite]"></div>

                    {/* Snake head / eye at the tip */}
                    {progress > 0 && (
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-lime-800 rounded-full flex items-center justify-center mr-1">
                            <div className="w-1 h-1 bg-white rounded-full"></div>
                        </div>
                    )}
                </div>
            </div>

            {/* Percentage display */}
            <div className="mt-3 text-sm font-semibold font-mono text-slate-600">
                {progress}%
            </div>
        </div>
    );
}