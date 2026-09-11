import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Layers,
  FileText,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Save,
  RotateCcw,
  Sparkles,
  AlertTriangle,
  Cpu,
  Tv,
  Wind,
  Zap,
  Armchair,
  Check,
  ShieldAlert,
  Sliders,
  Tag,
  Clock,
  UserCheck
} from 'lucide-react';
import type { SurveyCategory, SurveyFormData, PriorityLevel, ClassroomType } from '../types/survey';
import { saveDraft, getDraft, clearDraft, enqueueSurvey } from '../db/indexedDB';
import { networkService } from '../services/networkService';
import { syncService } from '../services/syncService';
import { StarRating } from './StarRating';
import { CameraCapture } from './CameraCapture';

interface MultiStepFormProps {
  onSubmitted: () => void;
}

interface CategoryOption {
  id: SurveyCategory;
  label: string;
  badge: string;
  icon: React.ReactNode;
  desc: string;
}

const CATEGORY_OPTIONS: CategoryOption[] = [
  {
    id: 'TechHardware',
    label: 'Máy trạm AI & PC Lab',
    badge: 'Hardware',
    icon: <Cpu className="w-5 h-5" />,
    desc: 'Case PC, màn hình 144Hz, phím chuột, camera AI'
  },
  {
    id: 'AudioVisual',
    label: 'Trình chiếu & Âm thanh',
    badge: 'Projector',
    icon: <Tv className="w-5 h-5" />,
    desc: 'Smart Board, máy chiếu laser, micro, loa giảng đường'
  },
  {
    id: 'ClimateAC',
    label: 'Vi khí hậu & Máy lạnh',
    badge: 'AC',
    icon: <Wind className="w-5 h-5" />,
    desc: 'Điều hòa trung tâm, cảm biến nhiệt độ, thông gió'
  },
  {
    id: 'LightingPower',
    label: 'Điện & Chiếu sáng LED',
    badge: 'Electrical',
    icon: <Zap className="w-5 h-5" />,
    desc: 'Đèn chống lóa, ổ cắm sàn, cầu dao PCCC'
  },
  {
    id: 'ErgoFurniture',
    label: 'Nội thất Công thái học',
    badge: 'Furniture',
    icon: <Armchair className="w-5 h-5" />,
    desc: 'Bàn ghế thông minh, bục giảng xoay, rèm cản nhiệt'
  }
];

const CLASSROOM_TYPES: { id: ClassroomType; label: string; desc: string; icon: string }[] = [
  { id: 'SMART_CLASSROOM', label: 'Phòng học Thông minh', desc: 'Bảng tương tác & Hybrid learning', icon: '✨' },
  { id: 'AI_LAB', label: 'Lab AI & Robotics', desc: 'Trạm máy GPU & trang bị thực hành', icon: '🤖' },
  { id: 'LECTURE_HALL', label: 'Giảng đường bậc thang', desc: 'Sức chứa lớn > 120 sinh viên', icon: '🏛️' },
  { id: 'COWORKING_SPACE', label: 'Không gian Tự học', desc: 'Khu tự do sáng tạo sinh viên', icon: '💡' }
];

const QUICK_TAGS = [
  '#MờHình',
  '#ChớpNháy',
  '#NhiệtĐộNóng',
  '#MấtMạng',
  '#ỔCắmLỏng',
  '#HỏngMicro',
  '#RèLoa',
  '#GhếLungLay',
  '#CầnVệSinh',
  '#CầnNângCấp'
];

const BUILDINGS = ['Khu V (Việt - Hàn)', 'Khu C (Công nghệ cao)', 'Khu B (Giảng đường)', 'Khu A (Hành chính)', 'Khu K (Ký túc xá)'];
const FLOORS = ['Tầng 1', 'Tầng 2', 'Tầng 3', 'Tầng 4', 'Tầng 5'];

export const MultiStepForm: React.FC<MultiStepFormProps> = ({ onSubmitted }) => {
  const [step, setStep] = useState<number>(1);
  const [isOnline, setIsOnline] = useState<boolean>(networkService.isOnline);
  const [hasRestoredDraft, setHasRestoredDraft] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<SurveyFormData>({
    building: 'Khu V (Việt - Hàn)',
    floor: 'Tầng 3',
    roomNumber: '',
    category: 'AudioVisual',
    conditionRating: 4,
    defectNotes: '',
    photoBase64: undefined,
    inspectorName: '',
    priority: 'MEDIUM',
    quickTags: [],
    classroomType: 'SMART_CLASSROOM'
  });

  // 1. Subscribe to network status
  useEffect(() => {
    return networkService.subscribe((online) => {
      setIsOnline(online);
    });
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
          if (savedDraft.currentStep) {
            setStep(savedDraft.currentStep);
          }
          setHasRestoredDraft(true);
        }
      } catch (err) {
        console.error('Failed to load draft from IndexedDB:', err);
      }
    }
    loadSavedDraft();
  }, []);

  // 3. Real-time auto-save to IndexedDB whenever formData or step changes
  useEffect(() => {
    const timer = setTimeout(() => {
      // Only save if user has filled at least something
      if (
        formData.roomNumber ||
        formData.defectNotes ||
        formData.photoBase64 ||
        (formData.quickTags && formData.quickTags.length > 0)
      ) {
        saveDraft(formData, step).catch((e) => console.error('Auto-save draft failed:', e));
      }
    }, 400); // 400ms debounce

    return () => clearTimeout(timer);
  }, [formData, step]);

  const handleFieldChange = (field: keyof SurveyFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleToggleQuickTag = (tag: string) => {
    const currentTags = formData.quickTags || [];
    const exists = currentTags.includes(tag);
    const updatedTags = exists ? currentTags.filter((t) => t !== tag) : [...currentTags, tag];
    handleFieldChange('quickTags', updatedTags);
  };

  const handleResetDraft = async () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bản nháp và điền lại từ đầu?')) {
      await clearDraft();
      setFormData({
        building: 'Khu V (Việt - Hàn)',
        floor: 'Tầng 3',
        roomNumber: '',
        category: 'AudioVisual',
        conditionRating: 4,
        defectNotes: '',
        photoBase64: undefined,
        inspectorName: '',
        priority: 'MEDIUM',
        quickTags: [],
        classroomType: 'SMART_CLASSROOM'
      });
      setStep(1);
      setHasRestoredDraft(false);
    }
  };

  const validateStep = (currentStep: number): boolean => {
    if (currentStep === 1) {
      if (!formData.roomNumber.trim()) {
        alert('Vui lòng nhập Mã phòng học kiểm định (Ví dụ: V301, C402, B205)!');
        return false;
      }
    }
    if (currentStep === 2) {
      if (!formData.category) {
        alert('Vui lòng chọn hạng mục tiện nghi cần đánh giá!');
        return false;
      }
    }
    if (currentStep === 3) {
      if (
        formData.conditionRating <= 3 &&
        !formData.defectNotes.trim() &&
        (!formData.quickTags || formData.quickTags.length === 0)
      ) {
        alert('Với tình trạng thiết bị ≤ 3 sao, vui lòng chọn ít nhất 1 thẻ lỗi nhanh hoặc ghi chú mô tả sự cố!');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep((prev) => Math.min(prev + 1, 4));
    }
  };

  const handleBack = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(1) || !validateStep(2) || !validateStep(3)) return;

    setIsSubmitting(true);
    try {
      // 1. Tag offline submission with UUID, timestamp, and save as PENDING_SYNC in IndexedDB
      const queuedItem = await enqueueSurvey(formData);

      // 2. Clear real-time draft from IndexedDB
      await clearDraft();

      // 3. If online, trigger immediate background sync dispatch
      if (isOnline) {
        syncService.processQueue().catch((e) => console.error(e));
        setSuccessMessage(`Đã gửi thành công phiếu kiểm định phòng ${formData.roomNumber}!`);
      } else {
        setSuccessMessage(
          `Bạn đang ngoại tuyến. Khảo sát phòng ${formData.roomNumber} đã được mã hóa UUID (${queuedItem.uuid.slice(
            0,
            8
          )}...) và lưu vào Hàng đợi IndexedDB. Sẽ tự động gửi khi có mạng!`
        );
      }

      // Reset form
      setFormData({
        building: 'Khu V (Việt - Hàn)',
        floor: 'Tầng 3',
        roomNumber: '',
        category: 'AudioVisual',
        conditionRating: 4,
        defectNotes: '',
        photoBase64: undefined,
        inspectorName: formData.inspectorName, // keep inspector name for convenience
        priority: 'MEDIUM',
        quickTags: [],
        classroomType: 'SMART_CLASSROOM'
      });
      setStep(1);
      setHasRestoredDraft(false);

      setTimeout(() => {
        setSuccessMessage(null);
        onSubmitted();
      }, 2500);
    } catch (err: any) {
      console.error('Submit failed:', err);
      alert('Đã xảy ra lỗi khi lưu khảo sát: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeCategoryObj =
    CATEGORY_OPTIONS.find((c) => c.id === formData.category) ||
    CATEGORY_OPTIONS.find((c) => c.badge === formData.category) ||
    CATEGORY_OPTIONS[0];

  return (
    <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-xl shadow-indigo-950/5 border border-slate-200/80 overflow-hidden transition-all">
      {/* Draft Notification Banner */}
      {hasRestoredDraft && (
        <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-b border-amber-200/80 px-4 py-2.5 flex items-center justify-between text-xs text-amber-900">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0 animate-spin" style={{ animationDuration: '6s' }} />
            <span>Đã tự động khôi phục dữ liệu phiên kiểm định từ <strong>IndexedDB</strong>.</span>
          </div>
          <button
            type="button"
            onClick={handleResetDraft}
            className="flex items-center gap-1 font-bold text-rose-600 hover:text-rose-700 bg-rose-50 px-2 py-1 rounded-lg border border-rose-200 transition-all hover:scale-105 active:scale-95"
          >
            <RotateCcw className="w-3 h-3" /> Làm mới
          </button>
        </div>
      )}

      {/* Success Notification Alert */}
      {successMessage && (
        <div className="bg-emerald-500/10 border-b border-emerald-300 p-4 flex items-start gap-3 animate-fadeIn">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-emerald-900">Ghi nhận phiếu kiểm định thành công!</h4>
            <p className="text-xs text-emerald-700 mt-0.5 leading-relaxed">{successMessage}</p>
          </div>
        </div>
      )}

      {/* Neo-Step Progress Header */}
      <div className="p-5 sm:p-6 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white relative overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-44 h-44 rounded-full bg-indigo-500/20 blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-8 w-36 h-36 rounded-full bg-cyan-500/20 blur-2xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                Audit Flow
              </span>
              <span className="text-xs text-slate-300 font-medium">
                Bước {step} trên 4
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-extrabold text-cyan-300">
                {step * 25}%
              </span>
              <button
                type="button"
                onClick={handleResetDraft}
                className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 px-2 py-0.5 rounded-md hover:bg-white/10 transition-colors"
                title="Làm mới form"
              >
                <RotateCcw className="w-3 h-3" /> Đặt lại
              </button>
            </div>
          </div>

          <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
            {step === 1 && '1. Không gian & Vị trí Giảng đường'}
            {step === 2 && '2. Hạng mục Tiện nghi & Mức ưu tiên'}
            {step === 3 && '3. Đánh giá Chất lượng & Minh chứng'}
            {step === 4 && '4. Thẻ Kiểm Định Số & Xác Nhận'}
          </h2>

          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            {step === 1 && 'Lựa chọn loại phòng học chuyên dụng và tọa độ kiểm định trong khuôn viên VKU.'}
            {step === 2 && 'Xác định hệ thống thiết bị cần đánh giá và mức độ ưu tiên xử lý.'}
            {step === 3 && 'Chấm điểm chất lượng thực tế, chọn nhanh nhãn sự cố và chụp ảnh lưu IndexedDB.'}
            {step === 4 && 'Kiểm tra tổng quan thẻ kiểm định số trước khi nộp lên máy chủ hoặc lưu Offline.'}
          </p>

          {/* Step Pills Bar */}
          <div className="grid grid-cols-4 gap-2 mt-5">
            {[
              { num: 1, label: 'Vị trí', icon: <MapPin className="w-3 h-3" /> },
              { num: 2, label: 'Hạng mục', icon: <Sliders className="w-3 h-3" /> },
              { num: 3, label: 'Đánh giá', icon: <Sparkles className="w-3 h-3" /> },
              { num: 4, label: 'Nộp phiếu', icon: <Check className="w-3 h-3" /> }
            ].map((s) => {
              const isActive = step === s.num;
              const isPast = step > s.num;
              return (
                <div
                  key={s.num}
                  className="flex flex-col gap-1.5 cursor-pointer"
                  onClick={() => {
                    if (s.num < step || validateStep(step)) {
                      setStep(s.num);
                    }
                  }}
                >
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      isActive
                        ? 'bg-gradient-to-r from-cyan-400 to-indigo-400 shadow-[0_0_12px_rgba(99,102,241,0.8)]'
                        : isPast
                        ? 'bg-emerald-400'
                        : 'bg-slate-700/80'
                    }`}
                  />
                  <div className="flex items-center gap-1">
                    <span
                      className={`text-[11px] font-bold hidden sm:inline ${
                        isActive
                          ? 'text-cyan-300'
                          : isPast
                          ? 'text-emerald-300'
                          : 'text-slate-400'
                      }`}
                    >
                      {s.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Form Content Body */}
      <form onSubmit={handleSubmit} className="p-5 sm:p-7 space-y-6">
        {/* ===================== STEP 1 ===================== */}
        {step === 1 && (
          <div className="space-y-6 animate-fadeIn">
            {/* 1. Classroom Type Selector */}
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-2.5 flex items-center justify-between">
                <span>Loại phòng học chuyên dụng (Space Type)</span>
                <span className="text-[10px] text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded font-bold">Chuẩn VKU</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {CLASSROOM_TYPES.map((t) => {
                  const isSelected = formData.classroomType === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => handleFieldChange('classroomType', t.id)}
                      className={`p-3.5 rounded-2xl border text-left transition-all relative overflow-hidden ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/60 shadow-md ring-2 ring-indigo-500/20'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl p-2 rounded-xl bg-white shadow-xs border border-slate-100">{t.icon}</span>
                        <div>
                          <div className="text-xs font-bold text-slate-900">{t.label}</div>
                          <div className="text-[11px] text-slate-500 mt-0.5">{t.desc}</div>
                        </div>
                      </div>
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Building Selector */}
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-indigo-600" /> Tòa nhà kiểm định (Campus Building)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {BUILDINGS.map((b) => {
                  const isSelected = formData.building === b;
                  return (
                    <button
                      key={b}
                      type="button"
                      onClick={() => handleFieldChange('building', b)}
                      className={`p-3 rounded-xl border text-xs font-bold transition-all text-center ${
                        isSelected
                          ? 'border-indigo-600 bg-gradient-to-b from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-600/25'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {b}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Floor & Room Number */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-indigo-600" /> Tầng (Floor Level)
                </label>
                <select
                  value={formData.floor}
                  onChange={(e) => handleFieldChange('floor', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm font-semibold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-xs"
                >
                  {FLOORS.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-indigo-600" /> Số phòng học (Room ID) <span className="text-rose-500">*</span>
                  </span>
                  <span className="text-[10px] text-slate-400">Ví dụ: V301, C402</span>
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: V301, B204, A102..."
                  value={formData.roomNumber}
                  onChange={(e) => handleFieldChange('roomNumber', e.target.value.toUpperCase())}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm font-black tracking-wide text-indigo-950 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-xs"
                  required
                />
              </div>
            </div>

            {/* 4. Inspector Name */}
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-indigo-600" /> Cán bộ / Sinh viên kiểm định (Inspector MSSV)
              </label>
              <input
                type="text"
                placeholder="Họ tên cán bộ hoặc MSSV sinh viên (VD: Nguyễn Văn A - 22GIT...)"
                value={formData.inspectorName}
                onChange={(e) => handleFieldChange('inspectorName', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-xs"
              />
            </div>
          </div>
        )}

        {/* ===================== STEP 2 ===================== */}
        {step === 2 && (
          <div className="space-y-6 animate-fadeIn">
            {/* Category Bento Selector */}
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-2.5 flex items-center justify-between">
                <span>Hạng mục tiện nghi khảo sát (Facility Category)</span>
                <span className="text-[10px] text-slate-400">Chọn 1 hạng mục chính</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {CATEGORY_OPTIONS.map((cat) => {
                  const isSelected =
                    formData.category === cat.id || formData.category === cat.badge;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => handleFieldChange('category', cat.id)}
                      className={`p-4 rounded-2xl border text-left transition-all duration-200 relative overflow-hidden group ${
                        isSelected
                          ? 'border-indigo-600 bg-gradient-to-br from-indigo-50/80 via-white to-indigo-100/50 shadow-md ring-2 ring-indigo-500/20'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs'
                      }`}
                    >
                      <div className="flex items-start gap-3.5">
                        <div
                          className={`p-2.5 rounded-xl transition-all ${
                            isSelected
                              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                              : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200'
                          }`}
                        >
                          {cat.icon}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-slate-900">{cat.label}</span>
                            <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                              {cat.badge}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-1 leading-snug">{cat.desc}</p>
                        </div>
                      </div>

                      {isSelected && (
                        <div className="absolute top-3 right-3 text-indigo-600">
                          <CheckCircle className="w-5 h-5 fill-indigo-600 text-white" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Priority / Urgency Selector */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/80 border border-slate-200/90 space-y-3">
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-500" /> Mức độ khẩn cấp xử lý (Priority Level)
                </span>
                <span className="text-[10px] text-slate-500">Quyết định tốc độ điều phối kỹ thuật</span>
              </label>

              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {[
                  {
                    level: 'LOW' as PriorityLevel,
                    title: 'Bình thường',
                    sub: 'Bảo trì định kỳ',
                    icon: '🟢',
                    activeBg: 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-2 ring-emerald-400/20'
                  },
                  {
                    level: 'MEDIUM' as PriorityLevel,
                    title: 'Cần bảo trì',
                    sub: 'Trong 48 giờ',
                    icon: '🟡',
                    activeBg: 'bg-amber-50 border-amber-500 text-amber-900 ring-2 ring-amber-400/20'
                  },
                  {
                    level: 'URGENT' as PriorityLevel,
                    title: 'Khẩn cấp',
                    sub: 'Cần sửa ngay',
                    icon: '🔴',
                    activeBg: 'bg-rose-50 border-rose-500 text-rose-900 ring-2 ring-rose-400/20 animate-pulse'
                  }
                ].map((p) => {
                  const isSelected = (formData.priority || 'MEDIUM') === p.level;
                  return (
                    <button
                      key={p.level}
                      type="button"
                      onClick={() => handleFieldChange('priority', p.level)}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        isSelected
                          ? `${p.activeBg} font-bold shadow-xs`
                          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <div className="text-base mb-1">{p.icon}</div>
                      <div className="text-xs font-bold leading-tight">{p.title}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{p.sub}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ===================== STEP 3 ===================== */}
        {step === 3 && (
          <div className="space-y-6 animate-fadeIn">
            {/* Condition Rating */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-indigo-50/40 to-transparent border border-indigo-100">
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-2 flex items-center justify-between">
                <span>Chỉ số chất lượng & Tình trạng vận hành (Quality Score) <span className="text-rose-500">*</span></span>
                <span className="text-[11px] font-bold text-indigo-600">Thang 1 — 5 Sao</span>
              </label>
              <StarRating
                value={formData.conditionRating}
                onChange={(val) => handleFieldChange('conditionRating', val)}
                size="lg"
              />
            </div>

            {/* 1-Touch Quick Defect Tags */}
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-indigo-600" /> Nhãn sự cố nhanh (1-Touch Quick Tags)
                </span>
                <span className="text-[10px] text-slate-400">Chạm để chọn / hủy</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {QUICK_TAGS.map((tag) => {
                  const isSelected = (formData.quickTags || []).includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleToggleQuickTag(tag)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 active:scale-95 ${
                        isSelected
                          ? 'bg-indigo-600 text-white shadow-xs ring-2 ring-indigo-400/30'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200/80'
                      }`}
                    >
                      {tag} {isSelected && '✓'}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Defect Notes */}
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center justify-between">
                <span>Mô tả chi tiết sự cố / Đề xuất nâng cấp</span>
                {formData.conditionRating <= 3 && (!formData.quickTags || formData.quickTags.length === 0) && (
                  <span className="text-rose-600 text-[11px] font-bold flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Yêu cầu ghi rõ khi đánh giá ≤ 3 sao
                  </span>
                )}
              </label>
              <textarea
                rows={3}
                placeholder="Ghi chú cụ thể: Máy chiếu chớp tắt, điều hòa không lạnh, dây mạng lỏng, bảng tương tác lệch cảm ứng..."
                value={formData.defectNotes}
                onChange={(e) => handleFieldChange('defectNotes', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-xs resize-none"
              />
              <div className="text-right text-[10px] text-slate-400 mt-1">
                {formData.defectNotes.length} ký tự
              </div>
            </div>

            {/* Camera Photo Capture */}
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-2 flex items-center justify-between">
                <span>Ảnh chụp hiện trường thực tế (Camera Photo)</span>
                <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                  Lưu Offline IndexedDB
                </span>
              </label>
              <CameraCapture
                photoBase64={formData.photoBase64}
                onPhotoChange={(base64) => handleFieldChange('photoBase64', base64)}
              />
            </div>
          </div>
        )}

        {/* ===================== STEP 4 ===================== */}
        {step === 4 && (
          <div className="space-y-5 animate-fadeIn">
            {/* Digital Audit Card (Phiếu kiểm định số công nghệ cao) */}
            <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-5 sm:p-6 shadow-xl relative overflow-hidden">
              {/* Card Hologram Decorative Glow */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

              {/* Card Header */}
              <div className="flex items-start justify-between border-b border-white/10 pb-4 mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-cyan-400/20 text-cyan-300 border border-cyan-400/30">
                      Smart Audit Pass
                    </span>
                    <span className="text-xs text-slate-300">VKU Campus Quality</span>
                  </div>
                  <h3 className="text-xl font-black text-white mt-1.5 flex items-center gap-2">
                    <span>Phòng {formData.roomNumber}</span>
                    <span className="text-xs font-normal text-slate-300">({formData.building})</span>
                  </h3>
                </div>

                <div className="text-right">
                  <div className="text-[11px] font-mono text-cyan-300 flex items-center justify-end gap-1">
                    <Clock className="w-3 h-3" /> {new Date().toLocaleDateString('vi-VN')}
                  </div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider mt-0.5">Thời gian kiểm định</div>
                </div>
              </div>

              {/* Card Details Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mb-4">
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-slate-400 text-[10px] block">Loại phòng:</span>
                  <strong className="text-white text-xs mt-0.5 block truncate">
                    {CLASSROOM_TYPES.find((c) => c.id === formData.classroomType)?.label || 'Phòng học'}
                  </strong>
                </div>

                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-slate-400 text-[10px] block">Hạng mục:</span>
                  <strong className="text-white text-xs mt-0.5 block truncate">
                    {activeCategoryObj.label}
                  </strong>
                </div>

                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-slate-400 text-[10px] block">Chất lượng:</span>
                  <strong className="text-amber-300 text-xs mt-0.5 block">
                    ★ {formData.conditionRating} / 5 ({formData.conditionRating * 20}%)
                  </strong>
                </div>

                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-slate-400 text-[10px] block">Ưu tiên:</span>
                  <strong
                    className={`text-xs mt-0.5 block font-bold ${
                      formData.priority === 'URGENT'
                        ? 'text-rose-400'
                        : formData.priority === 'MEDIUM'
                        ? 'text-amber-400'
                        : 'text-emerald-400'
                    }`}
                  >
                    {formData.priority === 'URGENT' ? 'Khẩn cấp' : formData.priority === 'MEDIUM' ? 'Cần bảo trì' : 'Bình thường'}
                  </strong>
                </div>
              </div>

              {/* Inspector info */}
              <div className="text-xs text-slate-300 mb-3 flex items-center justify-between border-t border-white/10 pt-3">
                <span>Người kiểm tra: <strong>{formData.inspectorName || 'Ẩn danh / Sinh viên VKU'}</strong></span>
                <span className="text-[11px] text-slate-400">Vị trí: {formData.floor}</span>
              </div>

              {/* Quick tags badges */}
              {formData.quickTags && formData.quickTags.length > 0 && (
                <div className="mb-3">
                  <span className="text-[10px] text-slate-400 block mb-1">Các nhãn sự cố đã gắn:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {formData.quickTags.map((t) => (
                      <span key={t} className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-500/30 text-cyan-200 border border-indigo-400/20">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Defect notes */}
              {formData.defectNotes && (
                <div className="bg-white/5 p-3 rounded-xl border border-white/10 text-xs text-slate-200 mb-3">
                  <span className="text-slate-400 text-[10px] block font-semibold mb-0.5">Ghi chú sự cố:</span>
                  <p className="italic">"{formData.defectNotes}"</p>
                </div>
              )}

              {/* Attached Photo */}
              {formData.photoBase64 && (
                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 border border-white/10">
                  <img
                    src={formData.photoBase64}
                    alt="Ảnh minh chứng"
                    className="w-14 h-14 object-cover rounded-lg border border-white/20"
                  />
                  <div className="text-xs">
                    <span className="text-emerald-400 font-bold block">✓ Đã đính kèm ảnh minh chứng hiện trường</span>
                    <span className="text-slate-400 text-[10px]">Đã nén và sẵn sàng đồng bộ</span>
                  </div>
                </div>
              )}
            </div>

            {/* Offline/Online Dispatch Status Hint */}
            <div
              className={`p-3.5 rounded-2xl border text-xs flex items-center gap-3 ${
                isOnline
                  ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                  : 'bg-amber-50 text-amber-900 border-amber-200'
              }`}
            >
              <Save className="w-5 h-5 shrink-0 text-emerald-600" />
              <div>
                <strong className="block">
                  {isOnline ? 'Thiết bị đang Trực tuyến (Online)' : 'Thiết bị đang Ngoại tuyến (Offline)'}
                </strong>
                <span className="opacity-90 mt-0.5 block text-[11px]">
                  {isOnline
                    ? 'Phiếu sẽ được gửi trực tiếp lên cơ sở dữ liệu Cloudflare D1/KV.'
                    : 'Phiếu sẽ được cấp mã định danh duy nhất (UUID), lưu an toàn vào Hàng đợi IndexedDB và tự động đồng bộ khi có Wi-Fi/4G.'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Form Footer Action Buttons */}
        <div className="pt-5 border-t border-slate-200/80 flex items-center justify-between gap-3">
          {step > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" /> Quay lại
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 active:scale-95 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all ml-auto"
            >
              Tiếp tục bước {step + 1} <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700 active:scale-95 text-white text-xs font-extrabold shadow-lg shadow-indigo-600/30 transition-all ml-auto disabled:opacity-50"
            >
              {isSubmitting ? (
                <>Đang lưu dữ liệu...</>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>{isOnline ? 'Xác nhận & Nộp Phiếu' : 'Lưu vào Hàng đợi Offline (UUID)'}</span>
                </>
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
