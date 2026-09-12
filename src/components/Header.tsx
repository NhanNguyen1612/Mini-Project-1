import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw, Download, CheckCircle2 } from 'lucide-react';
import { networkService } from '../services/networkService';
import { syncService, type SyncProgress } from '../services/syncService';

interface HeaderProps {
  pendingCount: number;
  onSyncTriggered?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ pendingCount, onSyncTriggered }) => {
  const [isOnline, setIsOnline] = useState<boolean>(networkService.isOnline);
  const [syncProgress, setSyncProgress] = useState<SyncProgress>({
    isSyncing: false,
    total: 0,
    completed: 0
  });
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);

  useEffect(() => {
    const unsubNet = networkService.subscribe((online) => {
      setIsOnline(online);
    });

    const unsubSync = syncService.subscribe((progress) => {
      setSyncProgress(progress);
    });

    // PWA Install prompt listener
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => {
      unsubNet();
      unsubSync();
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleManualSync = async () => {
    if (!isOnline) {
      alert('Thiết bị đang ở chế độ ngoại tuyến (Offline). Vui lòng kết nối mạng để đồng bộ!');
      return;
    }
    await syncService.processQueue();
    if (onSyncTriggered) onSyncTriggered();
  };

  const handleInstallPWA = async () => {
    if (!deferredPrompt) {
      alert('Ứng dụng đã được cài đặt hoặc trình duyệt không hỗ trợ nhắc cài đặt tự động.');
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs transition-all">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* VKU Brand Info */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-indigo-600/25 font-black text-base tracking-wider ring-2 ring-indigo-500/20">
            VKU
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-base font-black text-slate-900 leading-tight">VKU Smart Audit</h1>
              <span className="text-[9px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 border border-indigo-200">
                PWA • D1
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">Trung tâm Kiểm định Không gian & Thiết bị Số · Cloudflare D1</p>
          </div>
        </div>

        {/* Status Badges & Quick Action */}
        <div className="flex items-center gap-2">
          {/* Network Status Badge */}
          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-all ${
              isOnline
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-xs'
                : 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse'
            }`}
          >
            {isOnline ? (
              <>
                <Wifi className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden sm:inline">Trực tuyến</span>
                <span className="sm:hidden">Online</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 text-rose-600" />
                <span className="hidden sm:inline">Ngoại tuyến</span>
                <span className="sm:hidden">Offline</span>
              </>
            )}
          </div>

          {/* Sync status / Manual Sync Button */}
          {pendingCount > 0 && (
            <button
              onClick={handleManualSync}
              disabled={syncProgress.isSyncing || !isOnline}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-all ${
                syncProgress.isSyncing
                  ? 'bg-amber-50 text-amber-700 border-amber-200 cursor-wait'
                  : isOnline
                  ? 'bg-indigo-50 text-indigo-700 border-indigo-300 hover:bg-indigo-100 active:scale-95 shadow-xs'
                  : 'bg-slate-100 text-slate-500 border-slate-200 opacity-80'
              }`}
              title="Nhấn để đồng bộ dữ liệu ngay"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncProgress.isSyncing ? 'animate-spin text-amber-600' : 'text-indigo-600'}`} />
              <span>
                {syncProgress.isSyncing
                  ? `Đang gửi ${syncProgress.completed}/${syncProgress.total}`
                  : `Chờ gửi (${pendingCount})`}
              </span>
            </button>
          )}

          {/* Install PWA Prompt button */}
          {deferredPrompt && !isInstalled && (
            <button
              onClick={handleInstallPWA}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-indigo-600 to-indigo-700 text-white hover:from-indigo-700 hover:to-indigo-800 shadow-sm shadow-indigo-600/30 active:scale-95 transition-all"
              title="Cài đặt PWA lên màn hình chính"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Cài đặt App</span>
            </button>
          )}

          {isInstalled && (
            <span className="hidden md:flex items-center gap-1 text-xs text-emerald-600 font-bold px-2">
              <CheckCircle2 className="w-3.5 h-3.5" /> Đã cài đặt
            </span>
          )}
        </div>
      </div>
    </header>
  );
};
