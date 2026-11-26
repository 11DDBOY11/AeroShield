import React from 'react';
import { getAQIClassification } from '../utils/calculator';
import { ShieldCheck, Info, AlertTriangle, AlertOctagon, Flame, Skull } from 'lucide-react';

interface AqiBadgeProps {
  aqi: number;
  size?: 'sm' | 'md' | 'lg';
  showAdvice?: boolean;
  colorblindMode?: boolean;
}

export const AqiBadge: React.FC<AqiBadgeProps> = ({
  aqi,
  showAdvice = false,
  colorblindMode = false,
}) => {
  const info = getAQIClassification(aqi);

  const renderIcon = () => {
    switch (info.category) {
      case 'good':
        return <ShieldCheck className="w-5 h-5 flex-shrink-0" aria-hidden="true" />;
      case 'moderate':
        return <Info className="w-5 h-5 flex-shrink-0" aria-hidden="true" />;
      case 'sensitive':
        return <AlertTriangle className="w-5 h-5 flex-shrink-0" aria-hidden="true" />;
      case 'unhealthy':
        return <AlertOctagon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />;
      case 'very-unhealthy':
        return <Flame className="w-5 h-5 flex-shrink-0" aria-hidden="true" />;
      case 'hazardous':
        return <Skull className="w-5 h-5 flex-shrink-0" aria-hidden="true" />;
    }
  };

  return (
    <div
      className={`rounded-xl border p-4 transition-all ${info.bgClass} ${
        colorblindMode ? 'ring-2 ring-white/50 border-white/60' : ''
      }`}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-black/30 border border-white/10 text-white">
            {renderIcon()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider font-semibold opacity-90">
                Smog Severity
              </span>
              {colorblindMode && (
                <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded font-mono font-bold text-white uppercase">
                  Pattern: {info.ariaPattern.split(' - ')[0]}
                </span>
              )}
            </div>
            <h3 className="text-lg md:text-xl font-bold tracking-tight text-white flex items-center gap-2">
              {info.level}
            </h3>
          </div>
        </div>

        <div className="text-right">
          <div className="text-3xl md:text-4xl font-extrabold tracking-tight text-white font-mono">
            {aqi}
          </div>
          <span className="text-[11px] uppercase tracking-wider opacity-80 block text-slate-200">
            US AQI Index
          </span>
        </div>
      </div>

      {showAdvice && (
        <div className="mt-3 pt-3 border-t border-white/20 text-sm text-slate-100 flex items-start gap-2">
          <span className="font-semibold text-white flex-shrink-0">Action:</span>
          <span>{info.healthAdvice}</span>
        </div>
      )}
    </div>
  );
};
