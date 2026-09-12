import React from 'react';
import { Building2, Layers, MapPin, Sparkles, Cpu, Users, GraduationCap } from 'lucide-react';
import type { ClassroomType } from '../types/survey';

interface SpatialMatrixSelectorProps {
  building: string;
  floor: string;
  roomNumber: string;
  classroomType?: ClassroomType;
  onBuildingChange: (val: string) => void;
  onFloorChange: (val: string) => void;
  onRoomNumberChange: (val: string) => void;
  onClassroomTypeChange: (val: ClassroomType) => void;
}

const BUILDINGS = [
  { id: 'Khu V (Việt - Hàn)', label: 'Tòa V', desc: 'Viện CNTT & TT', code: 'V' },
  { id: 'Khu K (Kỹ thuật)', label: 'Tòa K', desc: 'Khối Kỹ thuật & Lab', code: 'K' },
  { id: 'Khu C (Hành chính)', label: 'Tòa C', desc: 'Giảng đường trung tâm', code: 'C' }
];

const FLOORS = ['Tầng 1', 'Tầng 2', 'Tầng 3', 'Tầng 4', 'Tầng 5'];

const SPACE_TYPES: { id: ClassroomType; label: string; icon: React.ElementType }[] = [
  { id: 'SMART_CLASSROOM', label: 'Smart Class', icon: Sparkles },
  { id: 'AI_LAB', label: 'AI & Robotics Lab', icon: Cpu },
  { id: 'LECTURE_HALL', label: 'Giảng đường', icon: GraduationCap },
  { id: 'COWORKING_SPACE', label: 'Coworking', icon: Users }
];

export const SpatialMatrixSelector: React.FC<SpatialMatrixSelectorProps> = ({
  building,
  floor,
  roomNumber,
  classroomType = 'SMART_CLASSROOM',
  onBuildingChange,
  onFloorChange,
  onRoomNumberChange,
  onClassroomTypeChange
}) => {
  const currentBuildingObj = BUILDINGS.find((b) => b.id === building) || BUILDINGS[0];
  const floorNum = floor.replace(/[^0-9]/g, '') || '1';
  const prefix = currentBuildingObj.code + floorNum;

  // Generate suggested quick room pills
  const suggestedRooms = [
    `${prefix}01`,
    `${prefix}02`,
    `${prefix}03`,
    `${prefix}04`,
    `${prefix}05`
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 sm:p-5 space-y-4">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">Không gian & Vị trí kiểm định</h3>
            <p className="text-[11px] text-slate-500">Định vị ma trận phòng học trong khuôn viên VKU</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-100 text-slate-600 text-[11px] font-mono font-semibold">
          <MapPin className="w-3 h-3 text-indigo-500" />
          <span>{roomNumber || 'Chưa chọn phòng'}</span>
        </div>
      </div>

      {/* Building Selector */}
      <div>
        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">
          1. Tòa nhà khuôn viên
        </label>
        <div className="grid grid-cols-3 gap-2">
          {BUILDINGS.map((b) => {
            const isSelected = building === b.id;
            return (
              <button
                key={b.id}
                type="button"
                onClick={() => onBuildingChange(b.id)}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all ${
                  isSelected
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-600/20 scale-[1.02]'
                    : 'bg-slate-50 border-slate-200/80 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span className="text-xs sm:text-sm font-black tracking-tight">{b.label}</span>
                <span className={`text-[10px] line-clamp-1 mt-0.5 ${isSelected ? 'text-indigo-100' : 'text-slate-400'}`}>
                  {b.desc}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Floor & Space Type Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Floor selector */}
        <div>
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
            <Layers className="w-3 h-3 text-slate-400" />
            2. Tầng lầu
          </label>
          <div className="flex items-center gap-1 overflow-x-auto pb-1">
            {FLOORS.map((f) => {
              const isSelected = floor === f;
              return (
                <button
                  key={f}
                  type="button"
                  onClick={() => onFloorChange(f)}
                  className={`flex-1 min-w-[52px] py-2 px-1 text-center rounded-lg text-xs font-bold transition-all ${
                    isSelected
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {f.replace('Tầng ', 'T')}
                </button>
              );
            })}
          </div>
        </div>

        {/* Space Type Selector */}
        <div>
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">
            3. Kiểu không gian
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            {SPACE_TYPES.map((st) => {
              const isSelected = classroomType === st.id;
              const IconComp = st.icon;
              return (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => onClassroomTypeChange(st.id)}
                  className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-[11px] font-semibold border transition-all text-left truncate ${
                    isSelected
                      ? 'bg-indigo-50 border-indigo-300 text-indigo-700 shadow-xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <IconComp className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-indigo-600' : 'text-slate-400'}`} />
                  <span className="truncate">{st.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Room Code Quick Matrix & Custom Input */}
      <div>
        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">
          4. Mã số phòng học
        </label>
        <div className="flex flex-wrap items-center gap-1.5 mb-2">
          {suggestedRooms.map((sRoom) => {
            const isSelected = roomNumber.toUpperCase() === sRoom;
            return (
              <button
                key={sRoom}
                type="button"
                onClick={() => onRoomNumberChange(sRoom)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all border ${
                  isSelected
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-indigo-50 hover:text-indigo-600'
                }`}
              >
                {sRoom}
              </button>
            );
          })}
        </div>

        <div className="relative">
          <input
            type="text"
            value={roomNumber}
            onChange={(e) => onRoomNumberChange(e.target.value.toUpperCase())}
            placeholder={`Hoặc nhập mã phòng tùy biến (Ví dụ: ${prefix}08, LAB-AI, HALL-A)...`}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all uppercase"
          />
        </div>
      </div>
    </div>
  );
};
