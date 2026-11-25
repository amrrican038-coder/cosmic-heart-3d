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
  const [pulseKey, setPulseKey] = useState<number>(0);

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

    // 1 tam tur = 440 adım (eski hızla birebir aynı ve açık kalmayan tam 360°)
    const stepsPerLap = 440;

    const initStars = () => {
      stars = [];
      const total = Math.min(160, Math.floor((width * height) / 5500));
      for (let i = 0; i < total; i++) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          r: Math.random() * 1.4 + 0.35,
          a: Math.random() * 0.75 + 0.2,
        });
      }
    };

    const drawStars = () => {
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

      scale = Math.min(width, height) / 34;
      initStars();

      ctx.fillStyle = "#06060b";
      ctx.fillRect(0, 0, width, height);
      drawStars();
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

    const tick = () => {
      if (started) {
        const cx = width / 2;
        const cy = height / 2 + scale * 1.2;

        // Her karede arka planı çok hafif karartarak eski katmanların boğulmasını engelle
        // ve çubuğun sonsuza kadar pürüzsüz görünmesini sağla
        if (step % 3 === 0) {
          ctx.fillStyle = "rgba(6, 6, 11, 0.018)";
          ctx.fillRect(0, 0, width, height);
          drawStars();
        }

        // Aynı karede 2 alt-adım çizerek arada boşluk/açık kalmasını sıfıra indir
        const subSteps = 2;
        for (let s = 0; s < subSteps; s++) {
          const exactStep = step + s / subSteps;
          const lap = Math.floor(exactStep / stepsPerLap);
          const p = (exactStep % stepsPerLap) / stepsPerLap;

          // Tam 2*PI (360°) kesintisiz dönüş — açık kalmaz, takılmaz
          const t = (Math.PI * 2 - p * Math.PI * 2) % (Math.PI * 2);
          const pt = getHeartPoint(t, cx, cy);

          // Her turda renk paleti kayar: Mavi-Mor-Pembe -> Sarı-Kırmızı -> Yeşil-Turkuaz -> Sonsuz
          const hue = (220 + lap * 115 + p * 120) % 360;
          const light = 58 + Math.sin(p * Math.PI) * 10;

          ctx.strokeStyle = `hsla(${hue}, 95%, ${light}%, 0.75)`;
          ctx.lineWidth = 1.25;
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(pt.x, pt.y);
          ctx.stroke();
        }

        // En önde dönen parlak çubuk ucu (nerede döndüğü net görünsün)
        const currentP = (step % stepsPerLap) / stepsPerLap;
        const currentT = (Math.PI * 2 - currentP * Math.PI * 2) % (Math.PI * 2);
        const headPt = getHeartPoint(currentT, cx, cy);
        const headHue =
          (220 + Math.floor(step / stepsPerLap) * 115 + currentP * 120) % 360;

        ctx.strokeStyle = `hsla(${headHue}, 100%, 82%, 0.95)`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(headPt.x, headPt.y);
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
    setPulseKey(1);

    const interval = setInterval(() => {
      c -= 1;
      if (c > 0) {
        setCount(c);
        setPulseKey((prev) => prev + 1);
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

  const ringColor =
    count === 3
      ? "border-cyan-400/70 text-cyan-300 shadow-[0_0_45px_rgba(34,211,238,0.45)]"
      : count === 2
        ? "border-fuchsia-400/70 text-fuchsia-300 shadow-[0_0_45px_rgba(232,121,249,0.45)]"
        : "border-emerald-400/70 text-emerald-300 shadow-[0_0_45px_rgba(52,211,153,0.45)]";

  return (
    <main className="relative w-full h-full flex items-center justify-center bg-[#06060b] overflow-hidden">
      <canvas ref={canvasRef} className="fixed inset-0 w-full h-full block" />

      {count > 0 && (
        <div
          key={pulseKey}
          className={`relative z-10 w-36 h-36 rounded-full border-2 flex items-center justify-center backdrop-blur-xs transition-all duration-500 animate-ping-once ${ringColor}`}
          style={{
            animation: "countPop 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards",
          }}
        >
          <span className="text-7xl font-extrabold tracking-tighter select-none">
            {count}
          </span>
        </div>
      )}

      <style jsx>{`
        @keyframes countPop {
          0% {
            transform: scale(0.55);
            opacity: 0;
          }
          35% {
            transform: scale(1.08);
            opacity: 1;
          }
          100% {
            transform: scale(0.95);
            opacity: 0.2;
          }
        }
      `}</style>
    </main>
  );
}
