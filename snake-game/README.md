# 🐍 Snake Game (Next.js + Supabase)

Game Rắn săn mồi phong cách hiện đại được xây dựng bằng **Next.js**, **TailwindCSS**, và **Supabase**.

---

## 🚀 Tính năng chính
- 🎮 Gameplay Snake mượt mà với nhiều mức độ khó / chế độ chơi.
- 🏆 Bảng xếp hạng trực tuyến (Leaderboard) theo thời gian thực với Supabase.
- 👤 Đăng nhập, lưu hồ sơ cá nhân và avatar.
- ⏰ **Cơ chế Keep-Alive tự động**: Ngăn Supabase Free Tier bị tạm dừng (pause/sleep) do không có hoạt động.

---

## 🛠️ Cài đặt & Chạy cục bộ

1. **Cài đặt dependencies**:
   ```bash
   cd snake-game
   npm install
   ```

2. **Cấu hình biến môi trường**:
   Tạo file `.env.local` trong thư mục `snake-game`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

3. **Chạy server phát triển**:
   ```bash
   npm run dev
   ```
   Mở [http://localhost:3000](http://localhost:3000) trên trình duyệt.

---

## 🛡️ Cơ chế Keep-Alive Supabase (Chống Server Sleep)

Supabase gói miễn phí sẽ tự động pause dự án nếu không có truy vấn trong vòng 7 ngày. Dự án đã được trang bị 2 cơ chế tự động giữ Supabase luôn hoạt động:

### 1. GitHub Actions Cron Job (Khuyên dùng)
- File workflow: `.github/workflows/supabase-keep-alive.yml`
- Tự động chạy định kỳ mỗi 2 ngày (`0 0 */2 * *`) để gửi request trực tiếp đến Supabase REST API.
- **Yêu cầu cài đặt trên GitHub**:
  Vào repository trên GitHub ➡️ **Settings** ➡️ **Secrets and variables** ➡️ **Actions** ➡️ Thêm 2 Repository secrets:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Bạn cũng có thể bấm nút **"Run workflow"** thủ công trong tab **Actions** bất cứ lúc nào.

### 2. Next.js API Route + Vercel Cron
- Endpoint: `/api/keep-alive`
- Đã cấu hình sẵn trong `vercel.json` để Vercel tự động kích hoạt mỗi 2 ngày khi deploy.
- Ngoài ra, bạn cũng có thể sử dụng các dịch vụ webhook miễn phí như [cron-job.org](https://cron-job.org) hoặc [UptimeRobot](https://uptimerobot.com) để ping định kỳ vào URL `https://your-domain.vercel.app/api/keep-alive`.

---

## 📦 Build & Kiểm tra
```bash
npm run build
```
