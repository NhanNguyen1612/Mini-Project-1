# 🏛️ VKU Smart Campus Audit — Khảo sát & Đánh giá Tiện nghi Giảng đường Thông minh

> **Mini-Project #1** — Trường Đại học Công nghệ Thông tin và Truyền thông Việt - Hàn (VKU)  
> **Chủ đề**: Ứng dụng PWA & Capacitor phục vụ kiểm định, khảo sát môi trường & cơ sở vật chất phòng học ngoại tuyến (**Offline-First**).  
> **Repository**: [https://github.com/NhanNguyen1612/Mini-Project-1.git](https://github.com/NhanNguyen1612/Mini-Project-1.git)

---

## 📌 1. Tổng quan bài toán & Kịch bản thực tế (Problem Scenario)

Tại Trường Đại học Công nghệ Thông tin và Truyền thông Việt - Hàn (VKU), cán bộ quản lý cơ sở vật chất, giảng viên và sinh viên thường xuyên phải tiến hành khảo sát thực địa chất lượng phòng học, phòng lab nghiên cứu, giảng đường bậc thang và khu vực tự học. Các khu vực như tầng hầm, phòng kín cách âm, hoặc góc tòa nhà xa xôi thường xuyên gặp tình trạng **mất sóng Wi-Fi và mạng di động 4G/5G**.

**VKU Smart Campus Audit** được xây dựng theo kiến trúc **Offline-First**, hoạt động trơn tru 100% kể cả khi hoàn toàn không có mạng:
- **Tự động lưu bản nháp theo thời gian thực (Draft Persistence)** vào **IndexedDB**, đảm bảo không mất dữ liệu dù người dùng vô tình tải lại trang (F5) hay đóng trình duyệt.
- **Đóng gói dữ liệu ngoại tuyến chuẩn quốc tế**: Sinh mã định danh duy nhất (**UUID v4**), gán nhãn `PENDING_SYNC` và lưu trữ an toàn trong IndexedDB.
- **Tự động đồng bộ nền (Background Sync)**: Lắng nghe sự kiện `window.ononline` và plugin native `@capacitor/network`. Ngay khi có mạng trở lại, ứng dụng tự động duyệt hàng đợi và gửi tuần tự các phiếu lên Cloudflare Cloud Database.
- **Trải nghiệm Native Di động đa nền tảng**: Đóng gói thành ứng dụng Android APK độc lập qua **Capacitor 8**, tích hợp Camera chụp ảnh hiện trường và nén ảnh cục bộ.

---

## ✨ 2. Điểm Khác Biệt & Đổi Mới Vượt Trội (Key Innovations)

### 🎯 Chủ đề Khảo sát Giảng đường Thông minh (Smart Campus Audit)
Khác biệt hoàn toàn so với các form kiểm kê thiết bị đơn điệu, ứng dụng mang đến trải nghiệm kiểm định tiện nghi học đường hiện đại:
- **Phân loại phòng học chuyên dụng**:
  - ✨ *Phòng học Thông minh (Smart Room)*: Bảng tương tác thông minh, micro giảng viên & hybrid learning.
  - 🤖 *Phòng Lab AI & Robotics*: Trạm máy GPU cấu hình cao & thiết bị thực hành chuyên sâu.
  - 🏛️ *Giảng đường bậc thang*: Hội trường dốc sức chứa lớn (> 120 sinh viên).
  - 💡 *Không gian Tự học Co-working*: Khu vực tự do sáng tạo, làm việc nhóm của sinh viên.
- **5 Hạng mục tiện nghi công nghệ cao**:
  - 🖥️ *Máy trạm AI & PC Lab* (Case PC, màn hình 144Hz, webcam AI, phím chuột)
  - 📺 *Trình chiếu & Âm thanh* (Smart Board, máy chiếu laser, micro, loa giảng đường)
  - ❄️ *Vi khí hậu & Máy lạnh* (Hệ thống điều hòa, cảm biến nhiệt độ, thông gió)
  - ⚡ *Điện & Chiếu sáng LED* (Đèn chống lóa mắt, ổ cắm sàn an toàn, cầu dao PCCC)
  - 🪑 *Nội thất Công thái học* (Bàn ghế thông minh, bục giảng xoay, rèm cản nhiệt)
- **Mức độ khẩn cấp điều phối (Priority Level)**:
  - 🟢 **Bình thường (Low)**: Bảo trì định kỳ theo lịch.
  - 🟡 **Cần bảo trì (Medium)**: Xử lý kỹ thuật trong vòng 48 giờ.
  - 🔴 **Khẩn cấp (Urgent)**: Hiệu ứng phát sáng nhịp tim (Pulse Glow), báo hiệu cần can thiệp kỹ thuật ngay lập tức.
- **Gắn nhãn lỗi nhanh 1 chạm (1-Touch Quick Defect Tags)**:
  - Tích hợp các thẻ chọn nhanh: `#MờHình`, `#ChớpNháy`, `#NhiệtĐộNóng`, `#MấtMạng`, `#ỔCắmLỏng`, `#HỏngMicro`, `#RèLoa`, `#GhếLungLay`, `#CầnVệSinh`, `#CầnNângCấp` giúp kiểm định viên thao tác cực nhanh trên di động mà không cần gõ bàn phím.
- **Thước đo chất lượng trực quan (Star Rating)**:
  - Hiệu ứng ngôi sao phát sáng (*glow effect*), tự động tính điểm phần trăm chất lượng phòng học và hiển thị nhãn trạng thái cảm xúc theo từng mức sao (1-5).
- **Thẻ kiểm định số (Smart Audit Pass)**:
  - Bước 4 tổng quan phiếu kiểm định được thiết kế như một **chứng nhận kiểm định điện tử** phong cách hologram gradient, hiển thị đầy đủ thông số vị trí, loại phòng, huy hiệu ưu tiên, tag sự cố và ảnh chụp hiện trường rõ nét.

---

### 🎨 Giao diện Neo-Glassmorphism Công nghệ cao
- Bảng màu chủ đạo **Deep Indigo & Cyber Teal** thời thượng, viền phát sáng (*neon border glow*).
- Thẻ Bento-grid bo góc lớn, tương tác mượt mà, phản hồi rung chạm trực quan (*tactile active feedback*).
- Thanh tiến trình **Audit Flow** hiển thị chính xác % hoàn thành (`25%`, `50%`, `75%`, `100%`) cùng các viên thuốc tiến trình (*Step Pills*).

---

## 🚀 3. Các tính năng kỹ thuật cốt lõi (Technical Specifications)

### 1. PWA Standalone & Service Worker Cache-First
- File `manifest.webmanifest` chuẩn PWA với chế độ `display: standalone`, màu chủ đạo `#4f46e5`, icon đa kích cỡ (192x192, 512x512, maskable).
- Service Worker tối ưu hóa bằng **Workbox** theo chiến lược **Cache-First** đối với toàn bộ App Shell (HTML, CSS, JS, Fonts, Icons) giúp khởi động tức thì (< 1 giây) khi không có mạng.

### 2. Lưu trữ cục bộ IndexedDB & Tự động lưu bản nháp
- Sử dụng thư viện `idb` Promise-based quản trị 3 Stores:
  - `drafts`: Lưu bản nháp thời gian thực (debounce 400ms). F5 phục hồi 100% dữ liệu đang nhập.
  - `sync_queue`: Hàng đợi các phiếu nộp ngoại tuyến mang mã **UUID v4**, trạng thái `PENDING_SYNC`.
  - `synced_history`: Kho lưu trữ lịch sử các phiếu đã đồng bộ thành công lên máy chủ.

### 3. Tích hợp Native Capacitor 8 & Đóng gói Android APK
- Tích hợp plugin `@capacitor/camera` hỗ trợ mở máy ảnh chụp hiện trường hoặc chọn ảnh từ thư viện, tự động nén kích thước tối ưu bộ nhớ.
- Tích hợp `@capacitor/network` theo dõi trạng thái kết nối mạng thực tế ở cấp độ hệ điều hành Android.
- Đã cấu hình và biên dịch thành công file APK: `android/app/build/outputs/apk/debug/app-debug.apk` (8.32 MB).

### 4. Công cụ Giả lập mạng tích hợp (Simulator Tab)
- Tab **Giả lập & Test** cho phép bật/tắt chế độ **Mất mạng giả lập (Simulated Offline)** chỉ bằng 1 nút bấm trực quan để chấm điểm tính năng Offline-first mà không cần mở Chrome DevTools.
- Hỗ trợ nút nạp sẵn dữ liệu mẫu, công cụ đo ping độ trễ máy chủ và dọn dẹp bộ nhớ IndexedDB.

---

## 🛠️ 4. Công nghệ sử dụng (Tech Stack)

- **Frontend**: React 19, TypeScript, Vite 6, Tailwind CSS v4, Lucide Icons
- **PWA & Caching**: `vite-plugin-pwa`, `workbox-window` (Cache-First Precache & Runtime Cache)
- **Local Storage**: IndexedDB (`idb`, `uuid`)
- **Native Mobile**: Capacitor 8 (`@capacitor/core`, `@capacitor/android`, `@capacitor/camera`, `@capacitor/network`)
- **Cloud Backend**: Cloudflare Pages Functions, Cloudflare D1 (SQLite Cloud DB), Cloud Edge Cache & Global REST Persistence
- **CI/CD**: GitHub Actions (`build-android-apk.yml`) tự động build Android APK và PWA

---

## 📂 5. Cấu trúc thư mục dự án

```text
vku-field-survey/
├── .github/workflows/
│   └── build-android-apk.yml    # CI/CD tự động build APK trên GitHub Actions
├── android/                     # Dự án Native Android (Capacitor Bridge)
│   ├── app/src/main/
│   │   ├── AndroidManifest.xml  # Cấp quyền CAMERA, NETWORK, STORAGE
│   │   ├── assets/public/       # Web bundle được đồng bộ vào Android Native
│   │   └── res/values/strings.xml
│   └── gradlew.bat
├── functions/                   # Serverless Backend API (Cloudflare Pages Functions)
│   └── api/
│       └── surveys.ts           # Endpoint /api/surveys (D1, KV & Cloud Fallback)
├── public/
│   ├── icons/                   # Icons chuẩn PWA (192x192, 512x512, SVG)
│   └── manifest.webmanifest
├── src/
│   ├── components/
│   │   ├── Header.tsx           # Thanh điều hướng, huy hiệu Online/Offline, nút Install PWA
│   │   ├── MultiStepForm.tsx    # Form khảo sát 4 bước Neo-Glassmorphic & Lưu nháp
│   │   ├── CameraCapture.tsx    # Chụp ảnh Camera Capacitor / Web Fallback
│   │   ├── StarRating.tsx       # Bộ đánh giá chất lượng sao phát sáng & cảm xúc
│   │   ├── SyncQueueList.tsx    # Danh sách hàng đợi PENDING_SYNC & tiến trình đồng bộ
│   │   ├── SurveyHistory.tsx    # Lịch sử khảo sát đã gửi, tìm kiếm, xuất file JSON
│   │   └── NetworkSimulator.tsx # Công cụ giả lập mất mạng & kiểm tra bộ nhớ DB
│   ├── db/
│   │   └── indexedDB.ts         # Khởi tạo DB, drafts, sync_queue, synced_history
│   ├── services/
│   │   ├── networkService.ts    # Lắng nghe trạng thái mạng & Giả lập Offline
│   │   ├── cameraService.ts     # Wrapper Capacitor Camera & Nén ảnh
│   │   └── syncService.ts       # Luồng xử lý hàng đợi đồng bộ nền tuần tự
│   ├── types/
│   │   └── survey.ts            # Định nghĩa TypeScript (Phòng, Hạng mục, Ưu tiên, Thẻ lỗi)
│   ├── App.tsx                  # Điều hướng Tabs responsive Mobile/Desktop
│   ├── main.tsx
│   └── index.css                # Tailwind CSS v4 & tùy chỉnh giao diện Neo-Glassmorphism
├── capacitor.config.ts          # Cấu hình Capacitor
├── vite.config.ts               # Cấu hình PWA Cache-First
├── wrangler.toml                # Cấu hình Cloudflare Pages & D1 Database
└── package.json
```

---

## 💻 6. Hướng dẫn Cài đặt & Chạy cục bộ (Local Development)

### 1. Cài đặt các gói phụ thuộc
```bash
npm install
```

### 2. Chạy môi trường phát triển (Dev Server)
```bash
npm run dev
```
Truy cập: **[http://localhost:5173](http://localhost:5173)**

### 3. Kiểm tra Build Production & Chạy thử nghiệm PWA
```bash
npm run build
npm run preview
```
Truy cập: `http://localhost:4173` để trải nghiệm đầy đủ Service Worker Cache-First và tính năng cài đặt PWA lên màn hình chính.

---

## 🧪 7. Kịch bản kiểm thử Chức năng Ngoại tuyến (Offline Testing Guide)

### Cách 1: Sử dụng Công cụ Giả lập tích hợp sẵn (Khuyên dùng khi chấm điểm)
1. Mở ứng dụng, chuyển sang tab **"Giả lập & Test"**.
2. Bấm nút **"Bật Giả lập Mất mạng"** -> Huy hiệu trên Header chuyển sang `🔴 Ngoại tuyến (Offline)`.
3. Quay lại tab **"Kiểm định mới"**:
   - Chọn loại phòng (VD: *Phòng học Thông minh*), tòa nhà *Khu V*, nhập số phòng *V301*.
   - Chọn hạng mục *Trình chiếu & Âm thanh*, mức ưu tiên *Khẩn cấp*.
   - Đánh giá sao, chọn nhanh thẻ lỗi `#MờHình`, `#HỏngMicro`, chụp ảnh minh chứng.
   - Bấm **"Lưu vào Hàng đợi Offline"**.
4. Ứng dụng tự động lưu vào tab **"Hàng đợi Offline"** với mã **UUID** và trạng thái `PENDING_SYNC`.
5. **Thử F5 tải lại trang**: Toàn bộ dữ liệu trong hàng đợi vẫn được giữ nguyên vẹn 100% nhờ IndexedDB.
6. Quay lại tab **"Giả lập & Test"**, bấm **"Tắt Offline (Khôi phục mạng)"**.
7. Hệ thống tự động kích hoạt **Background Sync**: Phiếu được gửi tuần tự lên máy chủ, chuyển sang trạng thái `SYNCED` và lưu vào tab **"Lịch sử đã gửi"**!

### Cách 2: Sử dụng Chrome DevTools
1. Nhấn `F12` -> Chọn tab **Network** -> Dropdown chọn **Offline**.
2. Nhập form và gửi -> Phiếu được lưu vào IndexedDB.
3. Chuyển lại về **Online** -> Dữ liệu tự động đồng bộ ngay lập tức.

---

## 📱 8. Hướng dẫn Đóng gói & Cài đặt Android APK

### 1. Đồng bộ mã nguồn Web sang Android
```bash
npm run build
npx cap sync android
```

### 2. Biên dịch file APK
```bash
cd android
.\gradlew.bat assembleDebug
```
File APK cài đặt được xuất ra tại:  
📍 `android/app/build/outputs/apk/debug/app-debug.apk` (8.32 MB)

---

## ☁️ 9. Hướng dẫn Triển khai Cloudflare Pages (Deploy)

1. Đăng nhập vào [Cloudflare Dashboard](https://dash.cloudflare.com/) -> **Workers & Pages** -> **Create application** -> **Pages** -> **Connect to Git**.
2. Chọn repository: `NhanNguyen1612/Mini-Project-1`.
3. Cấu hình Build:
   - **Framework preset**: `Vite`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Environment variables**: `NODE_VERSION` = `22`
4. Nhấn **Save and Deploy**. Cloudflare sẽ cấp tên miền miễn phí dạng `https://mini-project-1-xxx.pages.dev` hỗ trợ HTTPS và API tự động!

---

## 📋 10. Các sản phẩm bàn giao (Deliverables)

1. 🌐 **Live Demo URL (PWA & HTTPS)**: Triển khai trên Cloudflare Pages.
2. 💻 **GitHub Repository**: [https://github.com/NhanNguyen1612/Mini-Project-1.git](https://github.com/NhanNguyen1612/Mini-Project-1.git).
3. 📱 **Gói cài đặt Android APK**: File `app-debug.apk` đầy đủ quyền Camera, Network.
4. 📄 **Báo cáo Kỹ thuật (Report)**: Chi tiết tại [`REPORT.md`](./REPORT.md).

---
*© 2026 VKU Smart Campus Audit Team. Trường Đại học Công nghệ Thông tin & Truyền thông Việt - Hàn.*
