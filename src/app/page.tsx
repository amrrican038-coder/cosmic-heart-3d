"use client";

import React, { useEffect, useRef, useState } from "react";

interface Star {
  x: number;
  y: number;
  r: number;
  a: number;
  phase: number;
}

interface Ray {
  t: number;
  offset: number;
  width: number;
  layer: 1 | 2;
}

export default function HomePage() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [count, setCount] = useState<number>(3);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Masaüstü (16:9 geniş) sanal sahne boyutu
    const SCENE_W = 1280;
    const SCENE_H = 720;

    let viewW = 0;
    let viewH = 0;
    let animId = 0;
    let started = false;
    let totalDrawn = 0;
    let rgbShift = 0;

    const rays: Ray[] = [];
    const phase1Count = 440;
    const phase2Count = 240;

    for (let i = 0; i < phase1Count; i++) {
      const p = i / phase1Count;
      const t =
        (Math.PI * 1.95 - p * Math.PI * 1.9 + Math.PI * 2) % (Math.PI * 2);
      rays.push({
        t,
        offset: p * 95,
        width: 1.3,
        layer: 1,
      });
    }

    for (let i = 0; i < phase2Count; i++) {
      const p2 = i / phase2Count;
      const t = Math.PI * 1.85 - p2 * Math.PI * 0.85;
      const wave = Math.sin(p2 * 30);
      rays.push({
        t,
        offset: 185 + wave * 28,
        width: 1.35,
        layer: 2,
      });
    }

    const stars: Star[] = Array.from({ length: 160 }, () => ({
      x: Math.random() * SCENE_W,
      y: Math.random() * SCENE_H,
      r: Math.random() * 1.4 + 0.35,
      a: Math.random() * 0.75 + 0.2,
      phase: Math.random() * Math.PI * 2,
    }));

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      viewW = window.innerWidth;
      viewH = window.innerHeight;
      canvas.width = Math.floor(viewW * dpr);
      canvas.height = Math.floor(viewH * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const getHeartPoint = (t: number, scale: number, cx: number, cy: number) => {
      const hx = 16 * Math.pow(Math.sin(t), 3);
      const hy = -(
        13 * Math.cos(t) -
        5 * Math.cos(2 * t) -
        2 * Math.cos(3 * t) -
        Math.cos(4 * t)
      );

      return {
        x: cx + hx * scale,
        y: cy + hy * scale,
      };
    };

    const renderFrame = (timeMs: number) => {
      const tSec = timeMs * 0.001;

      if (started && totalDrawn < rays.length) {
        totalDrawn = Math.min(rays.length, totalDrawn + 6);
      }

      // Sürekli RGB renk kayması
      if (started) {
        rgbShift = (tSec * 75) % 360;
      }

      ctx.fillStyle = "#06060b";
      ctx.fillRect(0, 0, viewW, viewH);

      // Geniş (masaüstü) sahneyi ekrana tam sığdırarak ortala
      const fitScale = Math.min(viewW / SCENE_W, viewH / SCENE_H);
      const offsetX = (viewW - SCENE_W * fitScale) / 2;
      const offsetY = (viewH - SCENE_H * fitScale) / 2;

      ctx.save();
      ctx.translate(offsetX, offsetY);
      ctx.scale(fitScale, fitScale);

      // Yıldızlar
      for (const s of stars) {
        const twinkle = 0.75 + 0.25 * Math.sin(tSec * 2.2 + s.phase);
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(220, 236, 255, ${s.a * twinkle})`;
        ctx.fill();
      }

      if (started) {
        const heartScale = 17.5;
        const cx = SCENE_W / 2;
        const cy = SCENE_H / 2 + 22;

        for (let i = 0; i < totalDrawn; i++) {
          const ray = rays[i];
          const pt = getHeartPoint(ray.t, heartScale, cx, cy);
          const hue = (rgbShift + ray.offset) % 360;

          ctx.strokeStyle = `hsla(${hue}, 95%, 60%, 0.78)`;
          ctx.lineWidth = ray.width;
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(pt.x, pt.y);
          ctx.stroke();
        }
      }

      ctx.restore();
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
