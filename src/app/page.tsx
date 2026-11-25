"use client";

import React, { useEffect, useRef, useState } from "react";

interface Star {
  x: number;
  y: number;
  r: number;
  a: number;
}

export default function HomePage() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [count, setCount] = useState<number>(3);

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
    let started = false;
    let step = 0;

    const initStars = () => {
      stars = [];
      const total = Math.min(160, Math.floor((width * height) / 5500));
      for (let i = 0; i < total; i++) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          r: Math.random() * 1.4 + 0.35,
          a: Math.random() * 0.7 + 0.2,
        });
      }
    };

    const drawBg = () => {
      ctx.fillStyle = "#06060b";
      ctx.fillRect(0, 0, width, height);
      for (const s of stars) {
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(215, 232, 255, ${s.a})`;
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

      // Büyük ve tam ekran kalp ölçeği
      scale = Math.min(width, height) / 34;
      initStars();
      drawBg();
    };

    const getHeartPoint = (t: number) => {
      const x = 16 * Math.pow(Math.sin(t), 3);
      const y = -(
        13 * Math.cos(t) -
        5 * Math.cos(2 * t) -
        2 * Math.cos(3 * t) -
        Math.cos(4 * t)
      );

      const cx = width / 2;
      const cy = height / 2 + scale * 1.2;

      return {
        cx,
        cy,
        x: cx + x * scale,
        y: cy + y * scale,
      };
    };

    // Tek bir tam tur = 440 adım (eski hızla birebir aynı)
    const stepsPerLap = 440;

    const tick = () => {
      if (started) {
        const lap = Math.floor(step / stepsPerLap);
        const p = (step % stepsPerLap) / stepsPerLap;

        // Çubuk aynı eski yönde ve eski hızda sonsuz tur atar
        const t =
          (Math.PI * 1.95 - p * Math.PI * 1.95 + Math.PI * 2) % (Math.PI * 2);
        const pt = getHeartPoint(t);

        // 1. turda mavi -> mor -> pembe, sonraki turlarda sarı -> kırmızı -> yeşil -> turkuaz -> sonsuz
        const baseHue = 222 + lap * 135;
        const hue = (baseHue + p * 110) % 360;
        const light = 56 + Math.sin(p * Math.PI) * 10;

        ctx.strokeStyle = `hsla(${hue}, 95%, ${light}%, 0.8)`;
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        ctx.moveTo(pt.cx, pt.cy);
        ctx.lineTo(pt.x, pt.y);
        ctx.stroke();

        step++;
      }

      animId = requestAnimationFrame(tick);
    };

    resize();
    window.addEventListener("resize", resize);
    animId = requestAnimationFrame(tick);

    let c = 3;
    setCount(3);

    const interval = setInterval(() => {
      c -= 1;
      if (c > 0) {
        setCount(c);
      } else {
        clearInterval(interval);
        setCount(0);
        started = true;
      }
    }, 1000);

    return () => {
      clearInterval(interval);
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <main className="relative w-full h-full flex items-center justify-center bg-[#06060b]">
      <canvas ref={canvasRef} className="fixed inset-0 w-full h-full block" />
      {count > 0 && (
        <div className="relative z-10 text-8xl font-bold text-emerald-400">
          {count}
        </div>
      )}
    </main>
  );
}
