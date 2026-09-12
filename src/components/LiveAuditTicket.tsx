import React from 'react';
import { ShieldCheck, QrCode, Cpu, Clock, MapPin, User } from 'lucide-react';
import type { SurveyFormData } from '../types/survey';

interface LiveAuditTicketProps {
  formData: SurveyFormData;
  isOnline: boolean;
  tempUuid: string;
}

export const LiveAuditTicket: React.FC<LiveAuditTicketProps> = ({
  formData,
  isOnline,
  tempUuid
}) => {
  const ratingPct = (formData.conditionRating || 5) * 20;

  return (
    <div className="relative bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl border border-indigo-500/30 p-5 shadow-2xl overflow-hidden">
      {/* Decorative top glow and laser line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-indigo-500 to-emerald-400" />
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Ticket Header */}
      <div className="flex items-center justify-between border-b border-indigo-800/60 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-600/80 border border-indigo-400/40 flex items-center justify-center text-cyan-300">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[9px] font-mono tracking-widest uppercase text-indigo-300 font-bold block">
              VKU SMART AUDIT PROTOCOL
            </span>
            <h4 className="text-xs font-black tracking-wider text-white">
              VÉ KIỂM ĐỊNH SỐ THỜI GIAN THỰC
            </h4>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-slate-800/80 border border-slate-700">
          <span
            className={`w-2 h-2 rounded-full ${
              isOnline ? 'bg-emerald-400 shadow-sm shadow-emerald-400 animate-pulse' : 'bg-amber-400'
            }`}
          />
          <span className={isOnline ? 'text-emerald-300' : 'text-amber-300'}>
            {isOnline ? 'D1 EDGE SYNC' : 'OFFLINE VAULT'}
          </span>
        </div>
      </div>

      {/* Room & Building Big Display */}
      <div className="bg-slate-800/60 border border-indigo-500/20 rounded-2xl p-3.5 mb-4 backdrop-blur-xs flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1 text-indigo-300 text-[11px] font-semibold mb-0.5">
            <MapPin className="w-3 h-3 text-cyan-400" />
            <span>{formData.building || 'Khu V'} • {formData.floor}</span>
          </div>
          <div className="text-2xl font-black font-mono tracking-tight text-white flex items-center gap-2">
            <span>{formData.roomNumber || 'CHƯA ĐẶT'}</span>
            <span className="text-[10px] font-normal px-2 py-0.5 rounded-md bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
              {formData.classroomType || 'SMART_CLASSROOM'}
            </span>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] font-mono uppercase text-slate-400 block">Sức khỏe thiết bị</span>
          <span
            className={`text-xl font-mono font-black ${
              ratingPct >= 80 ? 'text-emerald-400' : ratingPct >= 60 ? 'text-cyan-400' : 'text-amber-400'
            }`}
          >
            {ratingPct}%
          </span>
        </div>
      </div>

      {/* Audit Meta Grid */}
      <div className="grid grid-cols-2 gap-2 text-xs mb-4">
        <div className="bg-slate-850/60 border border-slate-800 rounded-xl p-2.5">
          <span className="text-[10px] font-mono text-slate-400 uppercase block mb-1 flex items-center gap-1">
            <Cpu className="w-3 h-3 text-indigo-400" /> Hạng mục
          </span>
          <span className="font-bold text-slate-200 truncate block">
            {formData.category || 'TechHardware'}
          </span>
        </div>

        <div className="bg-slate-850/60 border border-slate-800 rounded-xl p-2.5">
          <span className="text-[10px] font-mono text-slate-400 uppercase block mb-1 flex items-center gap-1">
            <User className="w-3 h-3 text-cyan-400" /> Kiểm định viên
          </span>
          <span className="font-bold text-slate-200 truncate block">
            {formData.inspectorName || 'VKU Inspector'}
          </span>
        </div>
      </div>

      {/* Quick Tags Badge Bar */}
      {formData.quickTags && formData.quickTags.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-1">
          {formData.quickTags.map((tag) => (
            <span
              key={tag}
              className="text-[10px] px-2 py-0.5 rounded-md bg-indigo-900/60 text-indigo-200 border border-indigo-700/50"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Ticket Tear Notches on Left and Right */}
      <div className="relative my-3">
        <div className="border-t-2 border-dashed border-indigo-800/80 w-full" />
        <div className="absolute -left-7 -top-2.5 w-5 h-5 rounded-full bg-slate-100" />
        <div className="absolute -right-7 -top-2.5 w-5 h-5 rounded-full bg-slate-100" />
      </div>

      {/* Ticket Footer / Barcode & Live UUID */}
      <div className="flex items-center justify-between pt-1">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400">
            <Clock className="w-3 h-3 text-indigo-400" />
            <span>{new Date().toLocaleDateString('vi-VN')} {new Date().toLocaleTimeString('vi-VN')}</span>
          </div>
          <div className="text-[10px] font-mono text-indigo-300/80 select-all">
            UUID: <span className="text-white font-bold">{tempUuid.slice(0, 16)}...</span>
          </div>
        </div>

        <div className="text-right flex items-center gap-2">
          {/* Simulated SVG Barcode */}
          <div className="hidden sm:flex items-center gap-0.5 h-7 opacity-75">
            <div className="w-1 h-full bg-white" />
            <div className="w-0.5 h-full bg-white" />
            <div className="w-1.5 h-full bg-white" />
            <div className="w-0.5 h-full bg-white" />
            <div className="w-2 h-full bg-white" />
            <div className="w-1 h-full bg-white" />
            <div className="w-0.5 h-full bg-white" />
            <div className="w-1.5 h-full bg-white" />
          </div>
          <QrCode className="w-7 h-7 text-indigo-300 opacity-90" />
        </div>
      </div>
    </div>
  );
};
