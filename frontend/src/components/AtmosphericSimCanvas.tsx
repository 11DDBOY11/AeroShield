import React, { useRef, useEffect, useState } from 'react';
import { LocationData } from '../types';
import { Sun, Wind, Fan, ShieldCheck, AlertTriangle } from 'lucide-react';

interface AtmosphericSimCanvasProps {
  location: LocationData;
}

export const AtmosphericSimCanvas: React.FC<AtmosphericSimCanvasProps> = ({ location }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [hour, setHour] = useState<number>(13); // Default to Golden Window
  const [fanSpeed, setFanSpeed] = useState<number>(2); // 0=off, 1=low, 2=high

  const isGoldenWindow = hour >= 12 && hour <= 15;

  // Planetary boundary layer height model
  const pblHeightM = isGoldenWindow
    ? Math.round((location.boundaryLayerM || 300) + 650 + Math.sin(((hour - 12) / 3) * Math.PI) * 200)
    : hour >= 9 && hour < 12
    ? Math.round((location.boundaryLayerM || 200) + (hour - 9) * 150)
    : Math.round((location.boundaryLayerM || 180) + (hour <= 6 ? hour * 8 : (24 - hour) * 12));

  // Modeled ambient PM2.5
  const simulatedPm25 = isGoldenWindow
    ? Math.round(location.pm25 * 0.48)
    : hour >= 9 && hour < 12
    ? Math.round(location.pm25 * 0.85)
    : Math.round(location.pm25 * 1.25);

  // Inhaled dose avoided
  const filterFactor = fanSpeed === 2 ? 0.92 : fanSpeed === 1 ? 0.65 : 0.2;
  const doseAvoidedUg = Math.round(simulatedPm25 * filterFactor * 0.65);
  const indoorPurityPct = Math.min(99, Math.round(filterFactor * 100));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    const width = canvas.width;
    const height = canvas.height;

    // Particles system
    const particleCount = 140;
    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      alpha: number;
      type: 'smog' | 'clean';
    }> = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.3) * 0.9,
        vy: (Math.random() - 0.5) * 0.4,
        size: Math.random() * 2.2 + 0.9,
        alpha: Math.random() * 0.6 + 0.3,
        type: Math.random() < 0.65 ? 'smog' : 'clean',
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Inversion ceiling Y position on canvas
      const lidY = height - (pblHeightM / 1300) * (height * 0.72) - 25;

      // 1. Atmospheric Gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
      if (isGoldenWindow) {
        skyGrad.addColorStop(0, '#0369a1');
        skyGrad.addColorStop(0.5, '#0f172a');
        skyGrad.addColorStop(1, '#064e3b');
      } else {
        skyGrad.addColorStop(0, '#1e1b4b');
        skyGrad.addColorStop(Math.min(1, Math.max(0, lidY / height)), '#4c0519');
        skyGrad.addColorStop(1, '#090d16');
      }
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, height);

      // 2. Inversion Boundary Layer Line
      ctx.beginPath();
      ctx.moveTo(0, lidY);
      for (let x = 0; x <= width; x += 30) {
        const wave = Math.sin((x + Date.now() * 0.04) * 0.015) * (isGoldenWindow ? 7 : 3);
        ctx.lineTo(x, lidY + wave);
      }
      ctx.strokeStyle = isGoldenWindow ? 'rgba(52, 211, 153, 0.85)' : 'rgba(244, 63, 94, 0.8)';
      ctx.lineWidth = 2.5;
      ctx.setLineDash(isGoldenWindow ? [6, 4] : [3, 3]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Inversion Text Tag
      ctx.font = '10px monospace';
      ctx.fillStyle = isGoldenWindow ? '#34d399' : '#fb7185';
      ctx.fillText(`--- Atmospheric Boundary Layer: ${pblHeightM}m ---`, 15, lidY - 6);

      // 3. Ground & Skyline
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, height - 16, width, 16);
      ctx.strokeStyle = '#334155';
      ctx.strokeRect(0, height - 16, width, 1);

      // Skyline Silhouettes
      ctx.fillStyle = '#1e293b';
      const buildings = [
        [30, 26], [65, 38], [105, 20], [140, 44], [190, 30],
        [280, 24], [320, 48], [370, 28], [460, 36], [510, 22]
      ];
      buildings.forEach(([bx, bh]) => {
        ctx.fillRect(bx, height - 16 - bh, 24, bh);
      });

      // 4. Protected Indoor Room with Corsi-Rosenthal Fan
      const roomX = width * 0.74;
      const roomW = width * 0.23;
      const roomH = 65;
      const roomY = height - 16 - roomH;

      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.fillRect(roomX, roomY, roomW, roomH);
      ctx.strokeStyle = fanSpeed > 0 ? '#10b981' : '#475569';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(roomX, roomY, roomW, roomH);

      // Fan Icon
      const fanX = roomX + roomW * 0.5;
      const fanY = roomY + roomH * 0.58;
      ctx.beginPath();
      ctx.arc(fanX, fanY, 12, 0, Math.PI * 2);
      ctx.fillStyle = fanSpeed > 0 ? 'rgba(16, 185, 129, 0.25)' : 'rgba(71, 85, 105, 0.2)';
      ctx.fill();
      ctx.strokeStyle = fanSpeed > 0 ? '#34d399' : '#475569';
      ctx.stroke();

      // Spinning Fan Blades
      if (fanSpeed > 0) {
        const angle = (Date.now() * 0.008 * fanSpeed) % (Math.PI * 2);
        ctx.save();
        ctx.translate(fanX, fanY);
        ctx.rotate(angle);
        ctx.beginPath();
        ctx.moveTo(-9, 0); ctx.lineTo(9, 0);
        ctx.moveTo(0, -9); ctx.lineTo(0, 9);
        ctx.strokeStyle = '#6ee7b7';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
      }

      // Room Title
      ctx.font = '9px sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('CR-Box Clean Room', roomX + 6, roomY + 12);

      // 5. Update & Draw Particles
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;

        if (p.type === 'smog') {
          if (p.y < lidY && !isGoldenWindow) {
            p.y = lidY + 1;
            p.vy = Math.abs(p.vy);
          }
          if (p.y > height - 16) {
            p.y = height - 18;
            p.vy = -Math.abs(p.vy);
          }

          // Fan suction filter physics
          if (fanSpeed > 0 && p.x > width * 0.7) {
            p.x += (fanX - p.x) * 0.04 * fanSpeed;
            p.y += (fanY - p.y) * 0.04 * fanSpeed;
            if (Math.hypot(p.x - fanX, p.y - fanY) < 14) {
              p.type = 'clean';
              p.vx = (Math.random() - 0.5) * 1.8;
              p.vy = -Math.random() * 1.2;
            }
          }
        } else {
          if (p.y > height - 16) p.y = height - 18;
          if (p.y < 10) p.y = 12;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        if (p.type === 'smog') {
          ctx.fillStyle = `rgba(244, 63, 94, ${p.alpha * 0.85})`;
        } else {
          ctx.fillStyle = `rgba(56, 189, 248, ${p.alpha})`;
        }
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [hour, fanSpeed, pblHeightM, isGoldenWindow, location]);

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 space-y-4 shadow-2xl relative overflow-hidden ai-glass-card">
      {/* Header & HUD */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Wind className="w-4 h-4 animate-breeze" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              Atmospheric Boundary Layer Physics Engine
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950/80 text-cyan-300 border border-cyan-800/60">
                Live Simulation
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Interactive particulate suspension, inversion trapping, and DIY Corsi-Rosenthal purification physics.
            </p>
          </div>
        </div>

        {/* Live Status Badge */}
        <div className="flex items-center gap-2">
          {isGoldenWindow ? (
            <div className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 flex items-center gap-1.5 shadow-sm shadow-emerald-500/20">
              <Sun className="w-3.5 h-3.5 text-emerald-400" />
              <span>Golden Window Convection Lift</span>
            </div>
          ) : (
            <div className="px-3 py-1 rounded-full text-xs font-semibold bg-rose-950/80 border border-rose-500/50 text-rose-300 flex items-center gap-1.5 shadow-sm shadow-rose-500/20">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              <span>Trapped Ground Cold Pool</span>
            </div>
          )}
        </div>
      </div>

      {/* Physics Canvas Viewport */}
      <div className="relative rounded-xl overflow-hidden border border-slate-700/60 bg-slate-950 shadow-inner">
        <canvas ref={canvasRef} width={720} height={210} className="w-full h-[210px] block" />

        {/* Live Canvas HUD Overlays */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-2 pointer-events-none">
          <div className="px-2.5 py-1 rounded-lg bg-slate-900/90 backdrop-blur border border-slate-700 text-xs font-mono">
            <span className="text-slate-400">PBL Boundary: </span>
            <span className="font-bold text-cyan-300">{pblHeightM} m</span>
          </div>
          <div className="px-2.5 py-1 rounded-lg bg-slate-900/90 backdrop-blur border border-slate-700 text-xs font-mono">
            <span className="text-slate-400">Ambient PM2.5: </span>
            <span className={`font-bold ${isGoldenWindow ? 'text-emerald-400' : 'text-rose-400'}`}>
              {simulatedPm25} µg/m³
            </span>
          </div>
        </div>

        <div className="absolute top-2.5 right-2.5 pointer-events-none">
          <div className="px-2.5 py-1 rounded-lg bg-slate-900/90 backdrop-blur border border-slate-700 text-xs font-mono">
            <span className="text-slate-400">Indoor IAQ: </span>
            <span className="font-bold text-emerald-400">{indoorPurityPct}% Pure</span>
          </div>
        </div>

        {isGoldenWindow && (
          <div className="absolute bottom-2 left-2 right-2 px-3 py-1.5 rounded-lg bg-emerald-950/85 backdrop-blur border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center justify-between pointer-events-none animate-fade-in">
            <div className="flex items-center gap-2">
              <Sun className="w-4 h-4 text-emerald-400 animate-spin-slow" />
              <span>Golden Window Active (12:30 – 15:30): Solar heating erodes nocturnal cold cap!</span>
            </div>
            <span className="text-[11px] underline font-mono">Open Cross-Ventilation</span>
          </div>
        )}
      </div>

      {/* Interactive Controls & Real-Time Impact */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs">
        {/* Time of Day Slider */}
        <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 font-medium flex items-center gap-1.5">
              <Sun className="w-3.5 h-3.5 text-cyan-400" />
              Diurnal Solar Cycle
            </span>
            <span className="font-mono font-bold text-cyan-400">
              {(hour < 10 ? '0' : '') + hour}:00 {hour >= 12 ? 'PM' : 'AM'}
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="23"
            value={hour}
            onChange={(e) => setHour(parseInt(e.target.value, 10))}
            className="w-full accent-cyan-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>00:00 Inversion</span>
            <span className="text-emerald-400 font-bold">13:00 Golden</span>
            <span>23:00 Trapped</span>
          </div>
        </div>

        {/* DIY Purifier Power Toggle */}
        <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 font-medium flex items-center gap-1.5">
              <Fan className={`w-3.5 h-3.5 ${fanSpeed > 0 ? 'text-emerald-400 animate-spin' : 'text-slate-500'}`} />
              Corsi-Rosenthal Box
            </span>
            <span className={`font-mono font-bold ${fanSpeed > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {fanSpeed === 2 ? 'MERV-13 (450 CFM)' : fanSpeed === 1 ? 'Eco (200 CFM)' : 'Filter OFF'}
            </span>
          </div>
          <div className="flex items-center gap-1.5 pt-0.5">
            <button
              type="button"
              onClick={() => setFanSpeed(0)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition ${
                fanSpeed === 0
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
              }`}
            >
              Off
            </button>
            <button
              type="button"
              onClick={() => setFanSpeed(1)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition ${
                fanSpeed === 1
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
              }`}
            >
              Eco
            </button>
            <button
              type="button"
              onClick={() => setFanSpeed(2)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition ${
                fanSpeed === 2
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
              }`}
            >
              Purge High
            </button>
          </div>
        </div>

        {/* Real-time Dose Saved Gauge */}
        <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 font-medium flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Inhaled Dose Avoided
            </span>
            <span className="font-mono font-bold text-emerald-400 text-sm">+{doseAvoidedUg} µg</span>
          </div>
          <div className="pt-2">
            <div className="flex justify-between text-[11px] text-slate-400 pb-1">
              <span>Indoor Protection Efficiency</span>
              <span className="font-mono text-emerald-400 font-semibold">{indoorPurityPct}%</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-emerald-500 to-cyan-400 h-full transition-all duration-300"
                style={{ width: `${indoorPurityPct}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};