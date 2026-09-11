import React from 'react';
import { Star, Sparkles, ShieldAlert, Wrench, CheckCircle, Flame } from 'lucide-react';

interface StarRatingProps {
  value: number;
  onChange: (rating: number) => void;
  readOnly?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const RATING_METRICS: Record<
  number,
  {
    text: string;
    sub: string;
    color: string;
    badgeBg: string;
    borderColor: string;
    icon: React.ReactNode;
  }
> = {
  1: {
    text: '1 Sao — Nghiêm trọng / Hư hỏng',
    sub: 'Cần can thiệp sửa chữa ngay lập tức',
    color: 'text-rose-500',
    badgeBg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
    borderColor: 'border-rose-300',
    icon: <ShieldAlert className="w-4 h-4 text-rose-500" />
  },
  2: {
    text: '2 Sao — Xuống cấp / Cần bảo trì',
    sub: 'Hoạt động chập chờn, ảnh hưởng việc học',
    color: 'text-amber-500',
    badgeBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    borderColor: 'border-amber-300',
    icon: <Wrench className="w-4 h-4 text-amber-500" />
  },
  3: {
    text: '3 Sao — Trung bình / Dùng tạm được',
    sub: 'Đạt yêu cầu tối thiểu, cần lên lịch bảo dưỡng',
    color: 'text-yellow-600',
    badgeBg: 'bg-yellow-500/10 text-yellow-700',
    borderColor: 'border-yellow-300',
    icon: <Flame className="w-4 h-4 text-yellow-600" />
  },
  4: {
    text: '4 Sao — Tốt / Đạt chuẩn giảng đường',
    sub: 'Vận hành ổn định, sẵn sàng cho giờ học',
    color: 'text-indigo-600',
    badgeBg: 'bg-indigo-500/10 text-indigo-700',
    borderColor: 'border-indigo-300',
    icon: <CheckCircle className="w-4 h-4 text-indigo-600" />
  },
  5: {
    text: '5 Sao — Xuất sắc / Phòng học thông minh',
    sub: 'Trang thiết bị tối tân, tiện nghi lý tưởng',
    color: 'text-emerald-600',
    badgeBg: 'bg-emerald-500/10 text-emerald-700',
    borderColor: 'border-emerald-300',
    icon: <Sparkles className="w-4 h-4 text-emerald-600" />
  }
};

export const StarRating: React.FC<StarRatingProps> = ({
  value,
  onChange,
  readOnly = false,
  size = 'md'
}) => {
  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-10 h-10'
  };

  const currentMetric = RATING_METRICS[value] || RATING_METRICS[4];

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 sm:gap-3">
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = star <= value;
          return (
            <button
              key={star}
              type="button"
              disabled={readOnly}
              onClick={() => onChange(star)}
              className={`relative group p-1.5 rounded-xl transition-all duration-200 ${
                readOnly
                  ? 'cursor-default'
                  : 'hover:scale-120 active:scale-90 focus:outline-none'
              } ${
                filled
                  ? 'bg-amber-400/10 shadow-xs'
                  : 'hover:bg-slate-100'
              }`}
            >
              <Star
                className={`${iconSizes[size]} transition-all duration-300 ${
                  filled
                    ? 'text-amber-400 fill-amber-400 drop-shadow-[0_2px_8px_rgba(251,191,36,0.5)]'
                    : 'text-slate-300 fill-slate-50 group-hover:text-amber-300 group-hover:fill-amber-100'
                }`}
              />
              {!readOnly && (
                <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[10px] font-bold text-slate-400 group-hover:text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  {star}
                </span>
              )}
            </button>
          );
        })}

        {/* Quality percentage badge */}
        <div className="ml-auto hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-mono font-bold text-slate-700">
          <span>{value * 20}%</span>
          <span className="text-[10px] text-slate-400 font-normal">Chất lượng</span>
        </div>
      </div>

      {value > 0 && currentMetric && (
        <div
          className={`flex items-start gap-2.5 p-3 rounded-xl border text-xs transition-all animate-fadeIn ${currentMetric.badgeBg} ${currentMetric.borderColor}`}
        >
          <div className="shrink-0 mt-0.5">{currentMetric.icon}</div>
          <div>
            <div className={`font-bold ${currentMetric.color}`}>{currentMetric.text}</div>
            <div className="text-[11px] opacity-80 mt-0.5">{currentMetric.sub}</div>
          </div>
        </div>
      )}
    </div>
  );
};

