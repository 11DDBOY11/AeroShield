import React from 'react';
import { Shield, CheckCircle2 } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-20 border-t border-slate-800 bg-slate-950 py-10 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-300 font-semibold">
            <Shield className="w-4 h-4 text-cyan-400" aria-hidden="true" />
            <span>AeroShield AI • Winter Smog & Urban Inversion Assistant</span>
          </div>

          <div className="flex items-center gap-2 text-emerald-400 font-medium">
            <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
            <span>WCAG 2.1 AA Accessibility Compliant</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-slate-900 text-[11px] leading-relaxed">
          <div>
            <span className="font-bold text-slate-300 block mb-1">Scientific Data Sources</span>
            <p className="text-slate-500">
              Atmospheric boundary layer thermal inversion modeling, OpenAQ ground station telemetry, and Berkeley Earth particulate dosimetry metrics.
            </p>
          </div>

          <div>
            <span className="font-bold text-slate-300 block mb-1">Accessibility & Universal Design</span>
            <p className="text-slate-500">
              Built with semantic HTML5 landmarks, visible focus rings, ARIA live status regions, and dual-encoding pattern aids for full colorblind accessibility.
            </p>
          </div>

          <div>
            <span className="font-bold text-slate-300 block mb-1">Community Defense</span>
            <p className="text-slate-500">
              Empowering urban citizens against severe winter smog with DIY Corsi-Rosenthal boxes, smart ventilation timing, and low-emission transit shifts.
            </p>
          </div>
        </div>

        <div className="text-center text-slate-600 pt-2">
          © {new Date().getFullYear()} AeroShield AI. Designed for clean urban skies and protected lungs.
        </div>
      </div>
    </footer>
  );
};
