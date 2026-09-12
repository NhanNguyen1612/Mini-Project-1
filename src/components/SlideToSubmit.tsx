import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronRight, CheckCircle2, ShieldCheck, Sparkles, Loader2 } from 'lucide-react';

interface SlideToSubmitProps {
  onConfirm: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  label?: string;
  successLabel?: string;
}

export const SlideToSubmit: React.FC<SlideToSubmitProps> = ({
  onConfirm,
  isLoading = false,
  disabled = false,
  label = 'Trượt để phát lệnh & Đồng bộ Cloud',
  successLabel = 'Đang phát lệnh kiểm định...'
}) => {
  const [sliderPosition, setSliderPosition] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);

  const triggerConfirm = useCallback(() => {
    setIsCompleted(true);
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([40, 60, 40]);
      } catch {
        // Ignore haptic errors on unsupported devices
      }
    }
    onConfirm();
  }, [onConfirm]);

  const handleStart = () => {
    if (disabled || isLoading || isCompleted) return;
    setIsDragging(true);
  };

  const handleMove = useCallback(
    (clientX: number) => {
      if (!isDragging || disabled || isLoading || isCompleted) return;
      if (!trackRef.current || !handleRef.current) return;

      const trackRect = trackRef.current.getBoundingClientRect();
      const handleWidth = handleRef.current.offsetWidth;
      const maxDistance = trackRect.width - handleWidth - 8; // 8px padding

      const currentX = clientX - trackRect.left - handleWidth / 2;
      const clampedX = Math.max(0, Math.min(currentX, maxDistance));

      setSliderPosition(clampedX);

      // Trigger completion if dragged past 88%
      if (clampedX >= maxDistance * 0.88) {
        setIsDragging(false);
        setSliderPosition(maxDistance);
        triggerConfirm();
      }
    },
    [isDragging, disabled, isLoading, isCompleted, triggerConfirm]
  );

  const handleEnd = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);
    if (!isCompleted) {
      // Smooth snap back to start
      setSliderPosition(0);
    }
  }, [isDragging, isCompleted]);

  // Mouse event listeners on window to handle fast movements
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => handleMove(e.clientX);
    const onMouseUp = () => handleEnd();

    if (isDragging) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [isDragging, handleMove, handleEnd]);

  // Touch event listeners on window
  useEffect(() => {
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        handleMove(e.touches[0].clientX);
      }
    };
    const onTouchEnd = () => handleEnd();

    if (isDragging) {
      window.addEventListener('touchmove', onTouchMove, { passive: true });
      window.addEventListener('touchend', onTouchEnd);
    }

    return () => {
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [isDragging, handleMove, handleEnd]);

  // Reset state if loading ends and not completed
  useEffect(() => {
    if (!isLoading && !disabled && isCompleted) {
      const resetTimer = setTimeout(() => {
        setIsCompleted(false);
        setSliderPosition(0);
      }, 3000);
      return () => clearTimeout(resetTimer);
    }
  }, [isLoading, disabled, isCompleted]);

  const percentage = trackRef.current
    ? Math.min(100, Math.round((sliderPosition / (trackRef.current.offsetWidth - 64)) * 100))
    : 0;

  return (
    <div className="w-full select-none">
      <div
        ref={trackRef}
        className={`relative h-16 w-full rounded-2xl p-1.5 flex items-center transition-colors duration-300 overflow-hidden shadow-inner ${
          disabled
            ? 'bg-slate-200 cursor-not-allowed opacity-60'
            : isCompleted || isLoading
            ? 'bg-emerald-600 shadow-emerald-500/20'
            : 'bg-slate-900 border border-slate-700/80 shadow-slate-950/40'
        }`}
      >
        {/* Dynamic Progress Background Filler */}
        <div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-indigo-600 via-indigo-500 to-emerald-500 opacity-80 rounded-2xl transition-all duration-75"
          style={{ width: `${Math.max(sliderPosition + 32, 0)}px` }}
        />

        {/* Shimmer / Laser Scan Effect */}
        {!disabled && !isLoading && !isCompleted && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_2.5s_infinite]" />
        )}

        {/* Center Prompt Text */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none px-12">
          {isLoading ? (
            <div className="flex items-center gap-2 text-white font-bold text-sm sm:text-base tracking-wide animate-pulse">
              <Loader2 className="w-5 h-5 animate-spin text-white" />
              <span>{successLabel}</span>
            </div>
          ) : isCompleted ? (
            <div className="flex items-center gap-2 text-white font-black text-sm sm:text-base tracking-wider uppercase animate-fadeIn">
              <CheckCircle2 className="w-5 h-5 text-white" />
              <span>ĐÃ KÝ DUYỆT & TRUYỀN PHÁT</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-slate-300 font-bold text-xs sm:text-sm tracking-wide text-center">
              <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 hidden sm:inline animate-pulse" />
              <span className="opacity-90">{label}</span>
              <span className="text-[10px] text-indigo-400 font-mono hidden md:inline">({percentage}%)</span>
            </div>
          )}
        </div>

        {/* Draggable Handle Button */}
        <div
          ref={handleRef}
          onMouseDown={() => handleStart()}
          onTouchStart={() => handleStart()}
          style={{
            transform: `translateX(${sliderPosition}px)`,
            transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.18, 0.89, 0.32, 1.28)'
          }}
          className={`relative z-10 w-13 h-13 rounded-xl flex items-center justify-center cursor-grab active:cursor-grabbing shadow-lg transition-colors duration-200 ${
            disabled
              ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
              : isCompleted || isLoading
              ? 'bg-white text-emerald-600 scale-105 shadow-white/30'
              : 'bg-gradient-to-br from-indigo-500 via-indigo-600 to-indigo-700 text-white shadow-indigo-500/50 hover:brightness-110 active:scale-95'
          }`}
        >
          {isLoading ? (
            <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
          ) : isCompleted ? (
            <ShieldCheck className="w-6 h-6 text-emerald-600" />
          ) : (
            <div className="flex items-center">
              <ChevronRight className="w-6 h-6 animate-[bounceRight_1.5s_infinite]" />
            </div>
          )}
        </div>
      </div>

      {/* Micro Legend & Shortcut Note */}
      <div className="flex items-center justify-between mt-2 px-1 text-[11px] text-slate-500">
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-ping" />
          Kéo nút sang phải để phát lệnh
        </span>
        <span className="font-mono text-[10px] text-slate-400">UUIDv4 • D1 Sync Ready</span>
      </div>
    </div>
  );
};
