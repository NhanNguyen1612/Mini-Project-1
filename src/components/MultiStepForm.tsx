import React, { useState, useEffect } from 'react';
import {
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  MonitorPlay,
  Wind,
  Wifi,
  Armchair,
  ShieldCheck,
  Radio,
  FileCheck2,
  Camera
} from 'lucide-react';
import type {
  SurveyFormData,
  SurveyCategory,
  PriorityLevel
} from '../types/survey';
import { enqueueSurvey, saveDraft, getDraft, clearDraft } from '../db/indexedDB';
import { syncService } from '../services/syncService';
import { networkService } from '../services/networkService';
import { CameraCapture } from './CameraCapture';
import { SpatialMatrixSelector } from './SpatialMatrixSelector';
import { FacilityHealthDial } from './FacilityHealthDial';
import { LiveAuditTicket } from './LiveAuditTicket';
import { SlideToSubmit } from './SlideToSubmit';

interface MultiStepFormProps {
  onSubmitted: () => void;
}

const CATEGORIES: {
  id: SurveyCategory;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  badge: string;
}[] = [
  {
    id: 'AudioVisual',
    title: 'Âm thanh & Máy chiếu',
    subtitle: 'Projector 4K, Micro, Âm ly, Màn chiếu điện',
    icon: MonitorPlay,
    badge: 'AV-SYSTEM'
  },
  {
    id: 'ClimateAC',
    title: 'Điều hòa & Không khí',
    subtitle: 'Hệ thống VRV, Điều hòa inverter, Quạt thông gió',
    icon: Wind,
    badge: 'HVAC-AIR'
  },
  {
    id: 'LightingPower',
    title: 'Mạng Wi-Fi & Nguồn điện',
    subtitle: 'AP Wi-Fi 6, Ổ cắm âm sàn, Chiếu sáng LED',
    icon: Wifi,
    badge: 'NET-POWER'
  },
  {
    id: 'ErgoFurniture',
    title: 'Bàn ghế & Nội thất',
    subtitle: 'Bàn ghế công thái học, Bục giảng điện tử',
    icon: Armchair,
    badge: 'SMART-FURNITURE'
  }
];

const QUICK_TAG_OPTIONS: Record<string, string[]> = {
  AudioVisual: ['Mất tín hiệu HDMI', 'Máy chiếu mờ/vàng', 'Micro mất tiếng', 'Loa rè', 'Màn chiếu kẹt'],
  ClimateAC: ['Không mát / Chảy nước', 'Kêu to bất thường', 'Mất remote', 'Mùi ẩm mốc'],
  LightingPower: ['Mất kết nối Wi-Fi', 'Ổ cắm lỏng/chập', 'Đèn LED nhấp nháy', 'Tốc độ mạng chậm'],
  ErgoFurniture: ['Ghế gãy bánh xe', 'Bàn lung lay', 'Bục giảng hỏng khóa', 'Mặt bàn trầy xước']
};

export const MultiStepForm: React.FC<MultiStepFormProps> = ({ onSubmitted }) => {
  const [formData, setFormData] = useState<SurveyFormData>({
    building: 'Khu V (Việt - Hàn)',
    floor: 'Tầng 3',
    roomNumber: 'V301',
    category: 'AudioVisual',
    conditionRating: 5,
    defectNotes: '',
    photoBase64: undefined,
    inspectorName: 'KTV VKU Smart Campus',
    priority: 'MEDIUM',
    quickTags: [],
    classroomType: 'SMART_CLASSROOM'
  });

  const [isOnline, setIsOnline] = useState<boolean>(networkService.isOnline);
  const [hasRestoredDraft, setHasRestoredDraft] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successModalData, setSuccessModalData] = useState<{
    uuid: string;
    room: string;
    online: boolean;
  } | null>(null);

  // Generate a live simulated UUID for the ticket preview
  const livePreviewUuid = React.useMemo(() => {
    return 'VKU-' + Math.random().toString(36).substring(2, 10).toUpperCase() + '-' + Date.now().toString(36).toUpperCase();
  }, []);

  // 1. Subscribe to network changes
  useEffect(() => {
    return networkService.subscribe((online) => setIsOnline(online));
  }, []);

  // 2. Load draft from IndexedDB on initial mount
  useEffect(() => {
    async function loadSavedDraft() {
      try {
        const savedDraft = await getDraft();
        if (savedDraft && savedDraft.data) {
          setFormData((prev) => ({
            ...prev,
            ...savedDraft.data,
            priority: savedDraft.data.priority || 'MEDIUM',
            quickTags: savedDraft.data.quickTags || [],
            classroomType: savedDraft.data.classroomType || 'SMART_CLASSROOM'
          }));
          setHasRestoredDraft(true);
        }
      } catch (err) {
        console.error('Failed to load draft from IndexedDB:', err);
      }
    }
    loadSavedDraft();
  }, []);

  // 3. Real-time auto-save to IndexedDB draft
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.roomNumber || formData.defectNotes || (formData.quickTags && formData.quickTags.length > 0)) {
        saveDraft(formData, 1).catch((e) => console.error('Draft auto-save error:', e));
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [formData]);

  // Handle Quick Tag toggle
  const toggleQuickTag = (tag: string) => {
    setFormData((prev) => {
      const currentTags = prev.quickTags || [];
      const newTags = currentTags.includes(tag)
        ? currentTags.filter((t) => t !== tag)
        : [...currentTags, tag];
      return { ...prev, quickTags: newTags };
    });
  };

  // Clear Form / Reset Draft
  const handleReset = async () => {
    if (window.confirm('Bạn có chắc muốn đặt lại toàn bộ bảng kiểm định và xóa bản nháp hiện tại?')) {
      await clearDraft();
      setFormData({
        building: 'Khu V (Việt - Hàn)',
        floor: 'Tầng 3',
        roomNumber: 'V301',
        category: 'AudioVisual',
        conditionRating: 5,
        defectNotes: '',
        photoBase64: undefined,
        inspectorName: formData.inspectorName,
        priority: 'MEDIUM',
        quickTags: [],
        classroomType: 'SMART_CLASSROOM'
      });
      setHasRestoredDraft(false);
    }
  };

  // Validation
  const validateInspection = (): boolean => {
    if (!formData.roomNumber.trim()) {
      alert('Vui lòng chọn hoặc nhập mã số phòng học kiểm định!');
      return false;
    }
    if (
      formData.conditionRating <= 3 &&
      !formData.defectNotes.trim() &&
      (!formData.quickTags || formData.quickTags.length === 0)
    ) {
      alert(
        'Chỉ số sức khỏe thiết bị ở mức ≤ 60% (Cảnh báo/Khẩn cấp). Vui lòng chọn ít nhất 1 thẻ sự cố hoặc nhập ghi chú mô tả hư hại!'
      );
      return false;
    }
    return true;
  };

  // Submission handler triggered by SlideToSubmit
  const handleDispatchSubmit = async () => {
    if (!validateInspection()) return;

    setIsSubmitting(true);
    try {
      // 1. Tag offline item with UUID, timestamp, and save as PENDING_SYNC in IndexedDB
      const queuedItem = await enqueueSurvey(formData);

      // 2. Clear real-time draft
      await clearDraft();

      // 3. If online, immediately process queue to Cloudflare D1
      if (isOnline) {
        syncService.processQueue().catch((e) => console.error(e));
      }

      setSuccessModalData({
        uuid: queuedItem.uuid,
        room: formData.roomNumber,
        online: isOnline
      });

      // Reset form fields
      setFormData({
        building: 'Khu V (Việt - Hàn)',
        floor: 'Tầng 3',
        roomNumber: 'V301',
        category: 'AudioVisual',
        conditionRating: 5,
        defectNotes: '',
        photoBase64: undefined,
        inspectorName: formData.inspectorName,
        priority: 'MEDIUM',
        quickTags: [],
        classroomType: 'SMART_CLASSROOM'
      });
      setHasRestoredDraft(false);
    } catch (err: any) {
      console.error('Submit failed:', err);
      alert('Đã xảy ra lỗi khi lưu kiểm định: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeCategoryKey = (formData.category in QUICK_TAG_OPTIONS) ? formData.category : 'AudioVisual';
  const availableTags = QUICK_TAG_OPTIONS[activeCategoryKey] || [];

  return (
    <div className="space-y-6">
      {/* Top Cockpit Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 text-white px-4 sm:px-5 py-3 rounded-2xl border border-slate-800 shadow-md">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-indigo-500/20 text-cyan-400 border border-indigo-500/30">
            <Radio className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold tracking-wider uppercase text-slate-200">
                Bento Inspection Cockpit v3.0
              </span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-900 text-indigo-200 font-mono font-semibold">
                ALL-IN-ONE
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Kiểm định cơ sở vật chất theo không gian trực tiếp • Ký số tức thì
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {hasRestoredDraft && (
            <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-mono bg-emerald-950/60 border border-emerald-800/80 px-2 py-1 rounded-lg">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Đã khôi phục nháp
            </span>
          )}
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1 text-[11px] font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-700 transition-all"
            title="Xóa nháp và đặt lại"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>Làm mới</span>
          </button>
        </div>
      </div>

      {/* Main Responsive Grid: Cockpit Panels & Live Ticket */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left 7/12 Columns: Spatial Selector, Facility Health Dial, Category, Telemetry */}
        <div className="lg:col-span-7 space-y-5">
          {/* Module 1: Spatial Matrix Selector */}
          <SpatialMatrixSelector
            building={formData.building}
            floor={formData.floor}
            roomNumber={formData.roomNumber}
            classroomType={formData.classroomType}
            onBuildingChange={(b) => setFormData((prev) => ({ ...prev, building: b }))}
            onFloorChange={(f) => setFormData((prev) => ({ ...prev, floor: f }))}
            onRoomNumberChange={(r) => setFormData((prev) => ({ ...prev, roomNumber: r }))}
            onClassroomTypeChange={(t) => setFormData((prev) => ({ ...prev, classroomType: t }))}
          />

          {/* Module 2: Category Bento Selector */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 sm:p-5">
            <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Hạng mục cơ sở vật chất cần đánh giá
              </h4>
              <span className="text-[10px] font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                1-TOUCH SELECT
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {CATEGORIES.map((cat) => {
                const isSelected = formData.category === cat.id;
                const IconC = cat.icon;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, category: cat.id }))}
                    className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-all relative overflow-hidden ${
                      isSelected
                        ? 'bg-gradient-to-br from-indigo-50/90 via-white to-indigo-50/40 border-indigo-600 text-indigo-950 shadow-md shadow-indigo-600/10 scale-[1.01]'
                        : 'bg-slate-50/70 border-slate-200/90 text-slate-700 hover:bg-slate-100/80 hover:border-slate-300'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-0 right-0 w-8 h-8 bg-indigo-600 flex items-center justify-center rounded-bl-xl text-white">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </div>
                    )}
                    <div
                      className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                        isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      <IconC className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold block">{cat.title}</span>
                      <span className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                        {cat.subtitle}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Module 3: Facility Health Dial (Replaces 5 stars) */}
          <FacilityHealthDial
            value={formData.conditionRating}
            onChange={(val) => setFormData((prev) => ({ ...prev, conditionRating: val }))}
          />

          {/* Module 4: Incident Telemetry & Evidence Station */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Viễn thám sự cố & Bằng chứng hiện trường
              </h4>
              <span className="text-[10px] font-mono text-slate-400">TELEMETRY</span>
            </div>

            {/* Urgency Priority Level */}
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">
                Mức độ ưu tiên khắc phục
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'LOW', label: 'Thường', color: 'border-slate-300 text-slate-600' },
                  { id: 'MEDIUM', label: 'Ưu tiên', color: 'border-amber-400 text-amber-700 bg-amber-50/60' },
                  { id: 'URGENT', label: 'Khẩn cấp', color: 'border-rose-500 text-rose-700 bg-rose-50/60 font-black' }
                ].map((p) => {
                  const isSelected = formData.priority === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, priority: p.id as PriorityLevel }))}
                      className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all text-center ${
                        isSelected
                          ? p.id === 'URGENT'
                            ? 'bg-rose-600 text-white border-rose-600 shadow-md shadow-rose-600/20'
                            : 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Fault Tags */}
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">
                Thẻ lỗi thường gặp (Nhấn để chọn nhanh)
              </label>
              <div className="flex flex-wrap gap-1.5">
                {availableTags.map((tag) => {
                  const isChecked = (formData.quickTags || []).includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleQuickTag(tag)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                        isChecked
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {isChecked ? '✓ ' : '+ '}
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Notes & Inspector Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">
                  Kiểm định viên phụ trách
                </label>
                <input
                  type="text"
                  value={formData.inspectorName || ''}
                  onChange={(e) => setFormData((prev) => ({ ...prev, inspectorName: e.target.value }))}
                  placeholder="Nhập tên kiểm định viên..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">
                  Ghi chú chi tiết hiện trường
                </label>
                <textarea
                  rows={2}
                  value={formData.defectNotes}
                  onChange={(e) => setFormData((prev) => ({ ...prev, defectNotes: e.target.value }))}
                  placeholder="Mô tả cụ thể vị trí hư hỏng, tình trạng lỗi..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all resize-none"
                />
              </div>
            </div>

            {/* Camera Evidence Snapshot */}
            <div className="border-t border-slate-100 pt-3">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-indigo-600" />
                Ảnh chụp bằng chứng kiểm định (Capacitor Native / Web)
              </label>
              <CameraCapture
                photoBase64={formData.photoBase64}
                onPhotoChange={(base64) => setFormData((prev) => ({ ...prev, photoBase64: base64 }))}
              />
            </div>
          </div>
        </div>

        {/* Right 5/12 Columns: Live Digital Ticket & SlideToSubmit Action */}
        <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-4">
          {/* Live Digital Ticket */}
          <LiveAuditTicket
            formData={formData}
            isOnline={isOnline}
            tempUuid={livePreviewUuid}
          />

          {/* New Novel Submission Mechanism: Slide To Submit */}
          <div className="bg-white rounded-3xl border border-slate-200 p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <FileCheck2 className="w-4 h-4 text-indigo-600" />
                Ký số & Phát lệnh kiểm định
              </span>
              <span className="text-[10px] font-mono text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded-full">
                SLIDE-TO-DISPATCH
              </span>
            </div>

            <SlideToSubmit
              onConfirm={handleDispatchSubmit}
              isLoading={isSubmitting}
              label="Trượt để phát lệnh & Đồng bộ Cloud"
              successLabel="Đang lưu & phát lệnh D1..."
            />
          </div>
        </div>
      </div>

      {/* Success Modal / Certificate Overlay */}
      {successModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-indigo-500/40 text-white max-w-md w-full rounded-3xl p-6 shadow-2xl space-y-5 text-center relative overflow-hidden">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-indigo-500 to-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
              <ShieldCheck className="w-9 h-9" />
            </div>

            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold block mb-1">
                DISPATCH PROTOCOL EXECUTED
              </span>
              <h3 className="text-xl font-black text-white">
                Kiểm Định Đã Phát Hành Thành Công!
              </h3>
              <p className="text-xs text-slate-300 mt-2">
                Hồ sơ phòng <span className="text-cyan-300 font-bold">{successModalData.room}</span> đã được ký duyệt bảo mật và ghi nhận.
              </p>
            </div>

            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-3 text-left font-mono text-xs space-y-1.5">
              <div className="flex justify-between text-slate-400">
                <span>Mã số UUID:</span>
                <span className="text-white font-bold">{successModalData.uuid.slice(0, 18)}...</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Cơ chế đồng bộ:</span>
                <span className={successModalData.online ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                  {successModalData.online ? 'Cloudflare D1 Instant Sync' : 'IndexedDB Offline Queue'}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setSuccessModalData(null);
                onSubmitted();
              }}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-indigo-500/30 transition-all"
            >
              Chuyển đến Hàng đợi & Lịch sử
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
