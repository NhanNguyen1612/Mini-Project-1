import React from 'react';
import { AlertTriangle, AlertCircle, CheckCircle, ShieldCheck, Zap } from 'lucide-react';

interface FacilityHealthDialProps {
  value: number; // 1 to 5
  onChange: (value: number) => void;
  disabled?: boolean;
}

const HEALTH_LEVELS = [
  {
    score: 1,
    pct: 20,
    label: 'Khẩn cấp',
    subtext: 'Hỏng hóc hoàn toàn - Ngừng hoạt động',
    color: 'text-rose-500',
    bgLight: 'bg-rose-50 border-rose-200',
    accentBg: 'bg-rose-500',
    glowColor: 'shadow-rose-500/30',
    icon: AlertTriangle
  },
  {
    score: 2,
    pct: 40,
    label: 'Xuống cấp',
    subtext: 'Lỗi chập chờn - Ảnh hưởng tiết học',
    color: 'text-amber-500',
    bgLight: 'bg-amber-50 border-amber-200',
    accentBg: 'bg-amber-500',
    glowColor: 'shadow-amber-500/30',
    icon: AlertCircle
  },
  {
    score: 3,
    pct: 60,
    label: 'Tạm ổn',
    subtext: 'Vận hành được nhưng cần bảo trì',
    color: 'text-yellow-600',
    bgLight: 'bg-yellow-50 border-yellow-200',
    accentBg: 'bg-yellow-500',
    glowColor: 'shadow-yellow-500/30',
    icon: Zap
  },
  {
    score: 4,
    pct: 80,
    label: 'Đạt chuẩn',
    subtext: 'Thiết bị hoạt động tốt & ổn định',
    color: 'text-cyan-600',
    bgLight: 'bg-cyan-50 border-cyan-200',
    accentBg: 'bg-cyan-500',
    glowColor: 'shadow-cyan-500/30',
    icon: CheckCircle
  },
  {
    score: 5,
    pct: 100,
    label: 'Tối ưu',
    subtext: 'Hoàn hảo - Chuẩn thông minh VKU',
    color: 'text-emerald-600',
    bgLight: 'bg-emerald-50 border-emerald-200',
    accentBg: 'bg-emerald-500',
    glowColor: 'shadow-emerald-500/30',
    icon: ShieldCheck
  }
];

export const FacilityHealthDial: React.FC<FacilityHealthDialProps> = ({
  value,
  onChange,
  disabled = false
}) => {
  const currentLevel = HEALTH_LEVELS.find((lvl) => lvl.score === value) || HEALTH_LEVELS[3];
  const IconComponent = currentLevel.icon;

  return (
    <div className="w-full bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 shadow-xl relative overflow-hidden">
      {/* Background cyber grid effect */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />

      {/* Header bar */}
      <div className="flex items-center justify-between relative z-10 mb-4">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
          <h4 className="text-xs font-mono font-bold tracking-wider uppercase text-slate-300">
            Chỉ số tình trạng thiết bị (Health Index)
          </h4>
        </div>
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold font-mono border ${currentLevel.bgLight} ${currentLevel.color}`}
        >
          <IconComponent className="w-3.5 h-3.5" />
          <span>{currentLevel.label.toUpperCase()}</span>
          <span className="text-[10px] opacity-75">({currentLevel.pct}%)</span>
        </div>
      </div>

      {/* Main Gauge Visualizer */}
      <div className="relative z-10 mb-5">
        <div className="flex items-end justify-between px-1 mb-2">
          <span className="text-[10px] font-mono text-slate-400">20% BÁO ĐỘNG</span>
          <div className="text-center">
            <span className={`text-3xl font-black font-mono tracking-tight ${currentLevel.color}`}>
              {currentLevel.pct}%
            </span>
            <p className="text-[11px] text-slate-300 font-medium mt-0.5">
              {currentLevel.subtext}
            </p>
          </div>
          <span className="text-[10px] font-mono text-emerald-400">100% HOÀN HẢO</span>
        </div>

        {/* Segmented Interactive Progress Bar */}
        <div className="grid grid-cols-5 gap-1.5 h-3 rounded-xl bg-slate-800/80 p-1 border border-slate-700">
          {HEALTH_LEVELS.map((lvl) => {
            const isActive = lvl.score <= value;
            const isCurrent = lvl.score === value;
            return (
              <button
                key={lvl.score}
                type="button"
                disabled={disabled}
                onClick={() => onChange(lvl.score)}
                className={`h-full rounded-md transition-all duration-200 relative group ${
                  isActive
                    ? `${lvl.accentBg} ${isCurrent ? 'ring-2 ring-white/60 shadow-lg ' + lvl.glowColor : 'opacity-80'}`
                    : 'bg-slate-700/60 hover:bg-slate-700'
                }`}
              >
                <span className="sr-only">{lvl.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 5 Quick Selection Cards */}
      <div className="grid grid-cols-5 gap-1.5 relative z-10">
        {HEALTH_LEVELS.map((lvl) => {
          const isSelected = lvl.score === value;
          const CardIcon = lvl.icon;
          return (
            <button
              key={lvl.score}
              type="button"
              disabled={disabled}
              onClick={() => onChange(lvl.score)}
              className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all text-center border ${
                isSelected
                  ? `bg-slate-800/90 border-cyan-500/80 text-white shadow-lg ${lvl.glowColor} scale-[1.03]`
                  : 'bg-slate-800/40 border-slate-800 text-slate-400 hover:bg-slate-800/70 hover:text-slate-200'
              }`}
            >
              <CardIcon className={`w-4 h-4 mb-1 ${isSelected ? lvl.color : 'text-slate-500'}`} />
              <span className="text-[11px] font-bold tracking-tight line-clamp-1">{lvl.label}</span>
              <span className="text-[9px] font-mono opacity-70 mt-0.5">{lvl.score}★</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
