# 📦 Aptech Project (React)

Dự án React sử dụng các thư viện:

* `@mui/material`
* `@mui/styled-engine-sc`
* `styled-components`
* `@mui/icons-material`
* `react-router-dom`
* `axios`
* `antd`

---

# 🚀 BẮT ĐẦU (CHO TẤT CẢ MỌI NGƯỜI)

## 1. Clone repo

```bash
git clone https://github.com/uph0r1a/aptech-project.git
cd aptech-project
```

## 2. Cài dependencies

```bash
npm install
```

## 3. Chạy project

```bash
npm start
```

👉 Mở trình duyệt:

```
http://localhost:3000
```

---

# 🧑‍💻 QUY TRÌNH HÀNG NGÀY — CHỦ REPO (OWNER)

## 🔄 1. Bắt đầu ngày làm việc (lấy code mới nhất)

```bash
git checkout main
git pull origin main
```

---

## ▶️ 2. Chạy project

```bash
npm install
npm start
```

---

## 📥 3. Xem các branch của contributor

```bash
git fetch --all
git branch -r
```

👉 Checkout branch:

```bash
git checkout -b ten-branch origin/ten-branch
```

---

## 🔀 4. Merge branch vào main

### Bước 1:

```bash
git checkout main
```

### Bước 2:

```bash
git pull origin main
```

### Bước 3:

```bash
git merge ten-branch
```

### Bước 4: Nếu có conflict

```bash
git add .
git commit -m "resolve merge conflict"
```

---

## 🚀 5. Push lên GitHub

```bash
git push origin main
```

---

## 🧹 6. Xoá branch đã merge (tuỳ chọn)

```bash
git branch -d ten-branch
git push origin --delete ten-branch
```

---

# 👥 QUY TRÌNH HÀNG NGÀY — CONTRIBUTOR

## 🔄 1. Bắt đầu ngày làm việc

```bash
git checkout main
git pull origin main
```

---

## 🌱 2. Tạo branch mới

```bash
git checkout -b feature/ten-chuc-nang
```

👉 Ví dụ:

```bash
git checkout -b feature/login-page
```

---

## ▶️ 3. Chạy project

```bash
npm install
npm start
```

---

## 💻 4. Code và commit

### Add code

```bash
git add .
```

### Commit

```bash
git commit -m "add: giao dien login"
```

---

## ⬆️ 5. Push branch lên GitHub

```bash
git push origin feature/ten-chuc-nang
```

---

## 🔁 6. Đồng bộ với main (QUAN TRỌNG)

```bash
git checkout main
git pull origin main
git checkout feature/ten-chuc-nang
git merge main
```

Nếu có conflict:

```bash
git add .
git commit -m "merge main vao feature"
```

---

## 📤 7. Push lại branch

```bash
git push origin feature/ten-chuc-nang
```

---

## 🔔 8. Tạo Pull Request (PR)

* Vào GitHub
* Chọn branch của bạn
* Nhấn **"Create Pull Request"**
* Chờ owner review

---

# ⚠️ QUY TẮC QUAN TRỌNG

❌ Không push trực tiếp vào `main` (đối với contributor)
✅ Luôn tạo branch mới
✅ Luôn pull code mới nhất trước khi code
✅ Luôn xử lý conflict cẩn thận

---

# 🛠 LỆNH THƯỜNG DÙNG

## Reset code (cẩn thận)

```bash
git fetch --all
git reset --hard origin/main
```

---

## Xem branch

```bash
git branch
git branch -r
```

---

## Kiểm tra trạng thái

```bash
git status
```

---

# 🎯 TÓM TẮT

* Owner → review + merge + quản lý main
* Contributor → tạo branch + commit + PR
* Luôn đồng bộ code trước khi làm
* Commit rõ ràng, dễ hiểu
