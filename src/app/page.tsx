"use client";

import React, { useEffect, useRef, useState } from "react";

interface Star {
  x: number;
  y: number;
  r: number;
  a: number;
  phase: number;
  hueOffset: number;
}

interface Ray {
  t: number;
  rayIndex: number;
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

    const SCENE_W = 1280;
    const SCENE_H = 720;

    let viewW = 0;
    let viewH = 0;
    let animId = 0;
    let started = false;
    let totalDrawn = 0;

    const rays: Ray[] = [];
    const phase1Count = 440;
    const phase2Count = 240;

    for (let i = 0; i < phase1Count; i++) {
      const p = i / phase1Count;
      const t =
        (Math.PI * 1.95 - p * Math.PI * 1.9 + Math.PI * 2) % (Math.PI * 2);
      rays.push({
        t,
        rayIndex: i,
        width: 1.35,
        layer: 1,
      });
    }

    for (let i = 0; i < phase2Count; i++) {
      const p2 = i / phase2Count;
      const t = Math.PI * 1.85 - p2 * Math.PI * 0.85;
      rays.push({
        t,
        rayIndex: phase1Count + i,
        width: 1.45,
        layer: 2,
      });
    }

    const stars: Star[] = Array.from({ length: 180 }, (_, idx) => ({
      x: Math.random() * SCENE_W,
      y: Math.random() * SCENE_H,
      r: Math.random() * 1.5 + 0.35,
      a: Math.random() * 0.75 + 0.25,
      phase: Math.random() * Math.PI * 2,
      hueOffset: (idx * 29) % 360,
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
        totalDrawn = Math.min(rays.length, totalDrawn + 8);
      }

      // Sınırsız, sürekli dönen RGB açısı (0..360)
      const rgbAngle = ((tSec * 150) % 360 + 360) % 360;

      ctx.fillStyle = "#06060b";
      ctx.fillRect(0, 0, viewW, viewH);

      const fitScale = Math.min(viewW / SCENE_W, viewH / SCENE_H);
      const offsetX = (viewW - SCENE_W * fitScale) / 2;
      const offsetY = (viewH - SCENE_H * fitScale) / 2;

      ctx.save();
      ctx.translate(offsetX, offsetY);
      ctx.scale(fitScale, fitScale);

      // RGB parıltılı yıldızlar
      for (const s of stars) {
        const twinkle = 0.7 + 0.3 * Math.sin(tSec * 3 + s.phase);
        const starHue = (rgbAngle + s.hueOffset) % 360;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${starHue}, 95%, 78%, ${s.a * twinkle})`;
        ctx.fill();
      }

      if (started) {
        const heartScale = 17.5;
        const cx = SCENE_W / 2;
        const cy = SCENE_H / 2 + 22;

        for (let i = 0; i < totalDrawn; i++) {
          const ray = rays[i];
          const pt = getHeartPoint(ray.t, heartScale, cx, cy);

          // Her çizgi ve zaman için sınırsız tam RGB döngüsü
          const hue =
            (rgbAngle + ray.rayIndex * 1.45 + Math.sin(tSec * 2 + i * 0.05) * 45) %
            360;
          const normalizedHue = ((hue % 360) + 360) % 360;
          const lightness = ray.layer === 2 ? 64 : 58;

          ctx.strokeStyle = `hsla(${normalizedHue}, 100%, ${lightness}%, 0.82)`;
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
