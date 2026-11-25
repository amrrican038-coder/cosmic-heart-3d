"use client";

import React, { useEffect, useRef, useState } from "react";

interface Star {
  x: number;
  y: number;
  r: number;
  a: number;
  hueOffset: number;
}

interface Ray {
  t: number;
  offset: number;
  width: number;
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

    const rays: Ray[] = [];
    const phase1 = 440;
    const phase2 = 240;

    for (let i = 0; i < phase1; i++) {
      const p = i / phase1;
      const t =
        (Math.PI * 1.95 - p * Math.PI * 1.9 + Math.PI * 2) % (Math.PI * 2);
      rays.push({
        t,
        offset: p * 110,
        width: 1.35,
      });
    }

    for (let i = 0; i < phase2; i++) {
      const p2 = i / phase2;
      const t = Math.PI * 1.85 - p2 * Math.PI * 0.85;
      const wave = Math.sin(p2 * 30);
      rays.push({
        t,
        offset: 180 + wave * 35,
        width: 1.45,
      });
    }

    const initStars = () => {
      stars = [];
      const total = Math.min(160, Math.floor((width * height) / 5500));
      for (let i = 0; i < total; i++) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          r: Math.random() * 1.4 + 0.35,
          a: Math.random() * 0.7 + 0.2,
          hueOffset: (i * 37) % 360,
        });
      }
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Tam ekran uyumlu büyük ve ortalı ölçek
      scale = Math.min(width, height) / 36;
      initStars();
    };

    const getHeartPoint = (t: number, cx: number, cy: number) => {
      const x = 16 * Math.pow(Math.sin(t), 3);
      const y = -(
        13 * Math.cos(t) -
        5 * Math.cos(2 * t) -
        2 * Math.cos(3 * t) -
        Math.cos(4 * t)
      );

      return {
        x: cx + x * scale,
        y: cy + y * scale,
      };
    };

    const renderFrame = (timeMs: number) => {
      const rgbShift = ((timeMs * 0.09) % 360 + 360) % 360;

      ctx.fillStyle = "#06060b";
      ctx.fillRect(0, 0, width, height);

      for (const s of stars) {
        const hue = (rgbShift + s.hueOffset) % 360;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${hue}, 95%, 80%, ${s.a})`;
        ctx.fill();
      }

      if (started) {
        // Eski hızda adım adım çizim (1 adım / frame)
        if (step < rays.length) {
          step++;
        }

        const cx = width / 2;
        const cy = height / 2 + scale * 1.2;

        for (let i = 0; i < step; i++) {
          const ray = rays[i];
          const pt = getHeartPoint(ray.t, cx, cy);
          const hue = (rgbShift + ray.offset) % 360;

          ctx.strokeStyle = `hsla(${hue}, 100%, 60%, 0.82)`;
          ctx.lineWidth = ray.width;
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(pt.x, pt.y);
          ctx.stroke();
        }
      }

      animId = requestAnimationFrame(renderFrame);
    };

    resize();
    window.addEventListener("resize", resize);
    animId = requestAnimationFrame(renderFrame);

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
