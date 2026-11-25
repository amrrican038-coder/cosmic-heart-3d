"use client";

import React, { useEffect, useRef, useState } from "react";

interface Star {
  x: number;
  y: number;
  r: number;
  a: number;
}

interface Point {
  x: number;
  y: number;
}

export default function HomePage() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [count, setCount] = useState<number>(3);
  const [showMessage, setShowMessage] = useState<boolean>(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let scale = 1;
    let stars: Star[] = [];
    let animId = 0;
    let countdownTimer: ReturnType<typeof setInterval> | null = null;

    const createStars = () => {
      stars = [];
      const starCount = Math.min(180, Math.floor((width * height) / 4500));
      for (let i = 0; i < starCount; i++) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          r: Math.random() * 1.5 + 0.4,
          a: Math.random() * 0.75 + 0.2,
        });
      }
    };

    const drawBackground = () => {
      ctx.fillStyle = "#07070c";
      ctx.fillRect(0, 0, width, height);

      for (const s of stars) {
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${s.a})`;
        ctx.fill();
      }
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      scale = Math.min(width, height) / 36;
      createStars();
      drawBackground();
    };

    const getHeartPoint = (t: number): Point => {
      const x = 16 * Math.pow(Math.sin(t), 3);
      const y = -(
        13 * Math.cos(t) -
        5 * Math.cos(2 * t) -
        2 * Math.cos(3 * t) -
        Math.cos(4 * t)
      );

      return {
        x: width / 2 + x * scale,
        y: height / 2 - 12 + y * scale,
      };
    };

    const startAnimation = () => {
      let step = 0;
      const phase1 = 360;
      const phase2 = 260;

      const frame = () => {
        if (step < phase1) {
          const p = step / phase1;
          const t = -p * Math.PI * 2;
          const pt = getHeartPoint(t);
          const hue = 225 + p * 90;

          ctx.strokeStyle = `hsla(${hue}, 92%, 62%, 0.85)`;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(width / 2, height / 2 - 12);
          ctx.lineTo(pt.x, pt.y);
          ctx.stroke();

          step++;
          animId = requestAnimationFrame(frame);
        } else if (step < phase1 + phase2) {
          const p = (step - phase1) / phase2;
          const t = -p * Math.PI * 2;
          const pt = getHeartPoint(t);
          const wave = Math.sin(p * 32);
          const hue = 192 + wave * 24;
          const light = 55 + Math.cos(p * 24) * 32;

          ctx.strokeStyle = `hsla(${hue}, 95%, ${light}%, 0.9)`;
          ctx.lineWidth = 1.7;
          ctx.beginPath();
          ctx.moveTo(width / 2, height / 2 - 12);
          ctx.lineTo(pt.x, pt.y);
          ctx.stroke();

          step++;
          animId = requestAnimationFrame(frame);
        } else {
          setShowMessage(true);
        }
      };

      animId = requestAnimationFrame(frame);
    };

    resize();
    window.addEventListener("resize", resize);

    let current = 3;
    setCount(3);

    countdownTimer = setInterval(() => {
      current -= 1;
      if (current > 0) {
        setCount(current);
      } else {
        if (countdownTimer) clearInterval(countdownTimer);
        setCount(0);
        startAnimation();
      }
    }, 1000);

    return () => {
      window.removeEventListener("resize", resize);
      if (countdownTimer) clearInterval(countdownTimer);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <main className="relative w-full h-full flex items-center justify-center bg-[#07070c]">
      <canvas ref={canvasRef} className="fixed inset-0 w-full h-full block" />

      {count > 0 && (
        <div
          className="relative z-10 text-8xl font-extrabold text-[#4ade80]"
          style={{ textShadow: "0 0 28px rgba(74, 222, 128, 0.55)" }}
        >
          {count}
        </div>
      )}

      <div
        className={`fixed bottom-11 left-1/2 -translate-x-1/2 z-10 text-white/90 text-base tracking-[3px] uppercase whitespace-nowrap pointer-events-none transition-opacity duration-1000 ${
          showMessage ? "opacity-100" : "opacity-0"
        }`}
        style={{ textShadow: "0 0 14px rgba(125, 211, 252, 0.45)" }}
      >
        Naz İçin ❤️
      </div>
    </main>
  );
}
