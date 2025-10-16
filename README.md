เรียกใช้ด้วยคำสั่งด้านล่างนี้
git clone --recurse-submodules https://github.com/XAN44/next-elysia.git

จากนั้น ไล่ทีละสเต็ป ตามขั้นตอนด้านล่าง
1. cd เข้าไปแต่ละโฟลเดอร์ จากนั้นใช้คำสั่ง bun i (เช่น front / back)
2. ออกมา cd.. ที่ โฟลเดอร์ root จากนั้น bun i
3. bun run dev



จาก claude ai

# Complete Guide: Creating Monorepo with Git Submodules

บทความนี้อธิบายวิธีสร้าง Monorepo โครงสร้าง ตั้งแต่สร้าง Repository แรก จนถึง Push โค้ด และการแก้ไขปัญหา

---

## บทที่ 1: เข้าใจ Submodules คืออะไร

### Submodules คืออะไร?

Submodules คือการลิงก์ Repository หนึ่ง ไปยัง Repository อื่น โดยแต่ละ Repository สามารถจัดการเป็นอิสระได้

### ตัวอย่างโครงสร้าง:

```
next-elysia (Root Repository)
├── back-end/app (Submodule → เชื่อมไปยัง back-end-app Repository)
├── front-end/my-app (Submodule → เชื่อมไปยัง front-end-app Repository)
└── .gitmodules (ไฟล์ที่เก็บ config ของ submodules)
```

### ข้อดี:
- Back-end และ Front-end มี Repository แยกกัน
- Deploy และ Version control ได้อิสระ
- ทีมสามารถทำงานแยกตัวกันได้
- สามารถ Reuse โค้ดในโปรเจคอื่นได้

---

## บทที่ 2: ขั้นตอนสร้าง Submodules จากศูนย์

### ขั้นที่ 1: สร้าง 3 Repositories บน GitHub

1. **Root Repository**: `next-elysia`
2. **Back-end Repository**: `back-end-app`
3. **Front-end Repository**: `front-end-app`

### ขั้นที่ 2: เตรียมโฟลเดอร์โครงสร้างบนเครื่องของคุณ

```bash
# สร้างโฟลเดอร์หลัก
mkdir next-elysia
cd next-elysia

# สร้างโฟลเดอร์ย่อย
mkdir back-end
mkdir front-end
```

### ขั้นที่ 3: สร้าง Root Repository และ Initialize Git

```bash
cd next-elysia

# Initialize Git ที่ root
git init

# สร้างไฟล์พื้นฐาน
echo "# Next-Elysia Monorepo" > README.md
echo "node_modules/" > .gitignore
echo "*.log" >> .gitignore

# Commit ไฟล์พื้นฐาน
git add .
git commit -m "Initial commit: Setup monorepo structure"

# เชื่อม remote (ใช้ URL ของ Repository นั้น)
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/next-elysia.git
git push -u origin main
```

### ขั้นที่ 4: เพิ่ม Back-end เป็น Submodule

```bash
# ขณะอยู่ที่ root folder
git submodule add https://github.com/YOUR_USERNAME/back-end-app.git back-end/app

# ตรวจสอบว่า .gitmodules ถูกสร้าง
cat .gitmodules
```

**ผลลัพธ์ (ไฟล์ .gitmodules):**
```
[submodule "back-end/app"]
	path = back-end/app
	url = https://github.com/YOUR_USERNAME/back-end-app.git
```

### ขั้นที่ 5: เพิ่ม Front-end เป็น Submodule

```bash
git submodule add https://github.com/YOUR_USERNAME/front-end-app.git front-end/my-app

# ตรวจสอบไฟล์ .gitmodules อีกครั้ง
cat .gitmodules
```

**ผลลัพธ์ (ไฟล์ .gitmodules):**
```
[submodule "back-end/app"]
	path = back-end/app
	url = https://github.com/YOUR_USERNAME/back-end-app.git
[submodule "front-end/my-app"]
	path = front-end/my-app
	url = https://github.com/YOUR_USERNAME/front-end-app.git
```

### ขั้นที่ 6: Commit Submodules ไป Root Repository

```bash
# Commit ไฟล์ .gitmodules และ submodules reference
git add .gitmodules back-end/app front-end/my-app
git commit -m "Add back-end and front-end submodules"

# Push ไปยัง root repository
git push origin main
```

---

## บทที่ 3: Clone โปรเจคเพื่อใช้เป็น Base สำหรับพัฒนา

หลังจากที่สร้าง Submodules เสร็จแล้ว ครั้งต่อไปที่จะ Clone โปรเจคนี้มาใช้ ต้องทำตามขั้นตอนนี้:

### ขั้นที่ 1: Clone ด้วย --recurse-submodules

```bash
git clone --recurse-submodules https://github.com/YOUR_USERNAME/next-elysia.git
cd next-elysia
```

**ความสำคัญของ `--recurse-submodules`:**
- Flag นี้บอก Git ให้ดาวน์โหลด submodules (back-end/app และ front-end/my-app) ด้วยโดยอัตโนมัติ
- ถ้าลืม flag นี้ โฟลเดอร์ `back-end/app` และ `front-end/my-app` จะว่างเปล่า
- ถ้าลืม สามารถรันคำสั่งนี้แทน:
  ```bash
  git submodule update --init --recursive
  ```

### ขั้นที่ 2: ตรวจสอบสถานะ Submodules

```bash
git submodule status
```

**ผลลัพธ์ (ตัวอย่าง):**
```
 abc1234def567 back-end/app (HEAD detached at abc1234)
 xyz9876543210 front-end/my-app (HEAD detached at xyz9876)
```

---

## บทที่ 4: ปัญหา Detached HEAD State และวิธีแก้

### ปัญหาคืออะไร?

เมื่อ Clone Submodules ครั้งแรก Git จะอยู่ใน **Detached HEAD state**

```bash
git status
# Output: HEAD detached at abc1234
```

### เหตุผลทำไมถึงเป็น Detached HEAD?

1. **Submodules ชี้ไปยัง Specific Commit** ไม่ใช่ Branch
2. Root Repository เก็บ Reference ไปยัง Specific Commit ของ Submodule ไว้
3. เมื่อ Clone Submodule ลงมา Git จึงชี้ไปที่ Commit นั้น แทนที่จะชี้ไปที่ Branch `main`

### ปัญหาที่เกิดจาก Detached HEAD:

```bash
# ถ้าคุณอยู่ใน Detached HEAD state
cd back-end/app
git add .
git commit -m "Update code"
git push origin main

# Result: Everything up-to-date (ไม่มีการเปลี่ยนแปลง)
```

**เหตุผล:** Commit ของคุณถูกบันทึก แต่ `main` branch ไม่ได้ชี้ไปที่ Commit นี้ ดังนั้น Push จึงไม่มีผล

### วิธีแก้: Checkout ไปยัง main Branch ก่อน

```bash
# ตรวจสอบสถานะปัจจุบัน
git status
# Output: HEAD detached at abc1234

# Checkout ไปที่ main branch
git checkout main

# Pull เวอร์ชันล่าสุด
git pull origin main

# ตรวจสอบว่าเป็น main แล้ว
git status
# Output: On branch main
```

### ตัวอย่าง: ก่อนแก้ไขโค้ด ต้องทำนี้เสมอ

```bash
# เข้าไปใน submodule
cd back-end/app

# ตรวจสอบสถานะ
git status
# Output: HEAD detached at abc1234 ← ปัญหา!

# ไป checkout main
git checkout main
git pull origin main

# ตรวจสอบอีกครั้ง
git status
# Output: On branch main ← ตรรมชาติแล้ว!

# ตอนนี้สามารถแก้ไขโค้ดได้
```

---

## บทที่ 5: Workflow การทำงานจริง

### ขั้นตอนที่ 1: Clone โปรเจคครั้งแรก

```bash
git clone --recurse-submodules https://github.com/YOUR_USERNAME/next-elysia.git
cd next-elysia
```

### ขั้นตอนที่ 2: เตรียมพื้นที่ทำงาน

```bash
# ติดตั้ง back-end dependencies
cd back-end/app
npm install
cd ../..

# ติดตั้ง front-end dependencies
cd front-end/my-app
npm install
cd ../..
```

### ขั้นตอนที่ 3: เข้าใจสถานะ Submodule (สำคัญ!)

```bash
cd back-end/app
git status
# หากแสดง "HEAD detached" → ต้องแก้ไข!
```

### ขั้นตอนที่ 4: แก้ไข Detached HEAD (ต้องทำเสมอก่อนทำงาน)

```bash
# ถ้ายังคง HEAD detached
git checkout main
git pull origin main

# ตรวจสอบ
git status
# Output: On branch main
```

### ขั้นตอนที่ 5: แก้ไขโค้ด Back-end

```bash
# ตอนนี้สามารถแก้ไขไฟล์ได้
# (แก้ไขไฟล์ตามต้องการ)

# เพิ่มไฟล์ที่เปลี่ยนแปลง
git add .

# ตรวจสอบสถานะ
git status

# Commit
git commit -m "Fix API endpoint"

# Push ไป Repository
git push origin main

# ตรวจสอบว่า push สำเร็จ
# ไปดู GitHub หรือรัน git log เพื่อยืนยัน
```

### ขั้นตอนที่ 6: แก้ไข Front-end (ทำแบบเดียวกัน)

```bash
cd ../../front-end/my-app

# ตรวจสอบและแก้ไข Detached HEAD
git status
git checkout main
git pull origin main

# แก้ไขโค้ด
# (แก้ไขไฟล์ตามต้องการ)

# Commit และ Push
git add .
git commit -m "Add new component"
git push origin main
```

### ขั้นตอนที่ 7: Update Root Repository

หลังจาก Push ทั้ง Back-end และ Front-end สำเร็จแล้ว ต้องอัพเดท Root Repository เพื่อบันทึก Reference ของ Submodules ที่ใหม่:

```bash
# กลับไป Root folder
cd ../..

# ดู git status เพื่อตรวจสอบ
git status
# ควรเห็น: back-end/app และ front-end/my-app ที่เปลี่ยนแปลง

# เพิ่ม Submodules ที่เปลี่ยนแปลง
git add back-end/app front-end/my-app

# Commit
git commit -m "Update submodules: backend and frontend"

# Push ไป Root Repository
git push origin main
```

---

## บทที่ 6: ตัวอย่างการใช้งาน 3 สถานการณ์

### สถานการณ์ 1: แก้ไข Back-end เท่านั้น

```bash
# 1. เข้าไป back-end
cd back-end/app

# 2. แก้ไข Detached HEAD
git checkout main
git pull origin main

# 3. แก้ไขไฟล์และ Commit
git add .
git commit -m "Fix authentication bug"
git push origin main

# 4. Update Root Repository
cd ../..
git add back-end/app
git commit -m "Update backend submodule"
git push origin main
```

### สถานการณ์ 2: แก้ไข Front-end เท่านั้น

```bash
# 1. เข้าไป front-end
cd front-end/my-app

# 2. แก้ไข Detached HEAD
git checkout main
git pull origin main

# 3. แก้ไขไฟล์และ Commit
git add .
git commit -m "Improve UI responsiveness"
git push origin main

# 4. Update Root Repository
cd ../..
git add front-end/my-app
git commit -m "Update frontend submodule"
git push origin main
```

### สถานการณ์ 3: แก้ไขทั้ง Back-end และ Front-end

```bash
# === STEP 1: Back-end ===
cd back-end/app
git checkout main && git pull origin main
git add .
git commit -m "Add new API endpoint"
git push origin main
cd ../..

# === STEP 2: Front-end ===
cd front-end/my-app
git checkout main && git pull origin main
git add .
git commit -m "Add form for new API"
git push origin main
cd ../..

# === STEP 3: Update Root ===
git add back-end/app front-end/my-app
git commit -m "Update both submodules"
git push origin main
```

---

## บทที่ 7: คำสั่ง Useful ที่ใช้บ่อย

### ดูสถานะของ Submodules ทั้งหมด

```bash
git submodule status
```

### ดูว่า Commit History ของ Submodule

```bash
cd back-end/app
git log --oneline
```

### Update Submodules เป็นเวอร์ชันล่าสุด (ถ้าเพื่อน Push ใหม่)

```bash
git submodule update --remote
```

### Pull ทั้ง Root + Submodules

```bash
git pull --recurse-submodules
```

### ถ้าลืม Clone ด้วย --recurse-submodules

```bash
git submodule update --init --recursive
```

---

## บทที่ 8: สรุปความสำคัญ

### ✅ สิ่งที่ต้องทำเสมอ:

1. **Clone ด้วย `--recurse-submodules`** เพื่อให้ Submodules ลงมาด้วย
2. **Checkout `main` แล้ว Pull** ก่อนแก้ไขโค้ด เพื่อหลีกเลี่ยง Detached HEAD
3. **Push Submodules ก่อน** แล้วค่อย Push Root Repository
4. **Commit message ให้ชัดเจน** เพื่อให้ทีมเข้าใจ

### ⚠️ ปัญหาหลัก:

| ปัญหา | สาเหตุ | วิธีแก้ |
|------|--------|--------|
| HEAD detached | Git ชี้ไปยัง Specific Commit แทน Branch | `git checkout main && git pull origin main` |
| Push แล้วไม่มีการเปลี่ยนแปลง | อยู่ใน Detached HEAD state | แก้ไข Detached HEAD ก่อน Push |
| Submodules ว่างเปล่า | ลืม Clone ด้วย `--recurse-submodules` | `git submodule update --init --recursive` |

---

## บทที่ 9: Quick Reference (ใช้สำหรับ Copy-Paste)

```bash
# ========== Clone ครั้งแรก ==========
git clone --recurse-submodules https://github.com/YOUR_USERNAME/next-elysia.git
cd next-elysia

# ========== ติดตั้ง Dependencies ==========
cd back-end/app && npm install && cd ../..
cd front-end/my-app && npm install && cd ../..

# ========== เข้าไป Back-end ==========
cd back-end/app

# ========== แก้ไข Detached HEAD ==========
git checkout main
git pull origin main

# ========== แก้ไขโค้ด, Commit, Push ==========
git add .
git commit -m "Your message"
git push origin main

# ========== กลับไป Root และ Update ==========
cd ../..
git add back-end/app
git commit -m "Update backend submodule"
git push origin main

# ========== เข้าไป Front-end (ทำแบบเดียวกัน) ==========
cd front-end/my-app
git checkout main
git pull origin main
git add .
git commit -m "Your message"
git push origin main
cd ../..
git add front-end/my-app
git commit -m "Update frontend submodule"
git push origin main
```


กรณีอื่นๆ

# Complete Git Submodules Setup & Workflow Guide

สำหรับการสร้างโปรเจค Monorepo ด้วย Git Submodules ตั้งแต่เริ่มต้นจนจบ

---

## Part 1: สร้าง Repository ใหม่จาก Scratch

### ขั้นตอนที่ 1: สร้าง 3 Repositories บน GitHub

#### 1.1 สร้าง Root Repository
- ไปที่ GitHub และสร้าง repository ใหม่
- ชื่อ: `my-project` (หรือชื่ออื่นตามต้องการ)
- ตั้ง Public/Private ตามต้องการ
- ไม่ต้อง initialize README

#### 1.2 สร้าง Back-end Repository
- ชื่อ: `my-project-backend`
- ตั้ง Public/Private เช่นเดียวกัน

#### 1.3 สร้าง Front-end Repository
- ชื่อ: `my-project-frontend`
- ตั้ง Public/Private เช่นเดียวกัน

---

### ขั้นตอนที่ 2: สร้างโฟลเดอร์โปรเจคในเครื่อง

```bash
# สร้างโฟลเดอร์โปรเจค
mkdir my-project
cd my-project

# Initialize root repository
git init
git branch -M main
git remote add origin https://github.com/your-username/my-project.git

# สร้าง README
echo "# My Project" > README.md
git add README.md
git commit -m "Initial commit"
git push -u origin main
```

---

### ขั้นตอนที่ 3: สร้าง Back-end Submodule

```bash
# สร้างโฟลเดอร์ back-end
mkdir -p back-end/app
cd back-end/app

# Initialize back-end repository
git init
git branch -M main
git remote add origin https://github.com/your-username/my-project-backend.git

# สร้าง package.json (ตัวอย่าง)
cat > package.json << 'EOF'
{
  "name": "my-project-backend",
  "version": "1.0.0",
  "description": "Backend API",
  "main": "index.ts",
  "scripts": {
    "dev": "tsx watch index.ts",
    "build": "tsc"
  }
}
EOF

# สร้าง README
echo "# Backend API" > README.md

# Commit
git add .
git commit -m "Initial backend setup"
git push -u origin main

# กลับไปที่ root
cd ../..
```

---

### ขั้นตอนที่ 4: สร้าง Front-end Submodule

```bash
# สร้างโฟลเดอร์ front-end
mkdir -p front-end/my-app
cd front-end/my-app

# Initialize front-end repository
git init
git branch -M main
git remote add origin https://github.com/your-username/my-project-frontend.git

# สร้าง package.json (ตัวอย่าง Next.js)
cat > package.json << 'EOF'
{
  "name": "my-project-frontend",
  "version": "1.0.0",
  "description": "Frontend App",
  "scripts": {
    "dev": "next dev",
    "build": "next build"
  },
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0"
  }
}
EOF

# สร้าง README
echo "# Frontend App" > README.md

# Commit
git add .
git commit -m "Initial frontend setup"
git push -u origin main

# กลับไปที่ root
cd ../..
```

---

### ขั้นตอนที่ 5: เพิ่ม Submodules ไปที่ Root Repository

กลับไปที่ root directory และเพิ่ม submodules:

```bash
# ตรวจสอบว่าอยู่ที่ root folder
pwd
# ควรเห็น: /path/to/my-project

# เพิ่ม back-end submodule
git submodule add https://github.com/your-username/my-project-backend.git back-end/app

# เพิ่ม front-end submodule
git submodule add https://github.com/your-username/my-project-frontend.git front-end/my-app

# ดูการเปลี่ยนแปลง
git status
```

จะเห็น:
```
new file:   .gitmodules
new file:   back-end/app
new file:   front-end/my-app
```

---

### ขั้นตอนที่ 6: Commit Submodules ไปที่ Root

```bash
git add .
git commit -m "Add back-end and front-end submodules"
git push origin main
```

✅ **เสร็จแล้ว!** ตอนนี้คุณมี 3 repositories ที่เชื่อมกันแล้ว

---

## Part 2: Clone โปรเจคที่สร้างเสร็จแล้ว

### ขั้นตอนที่ 1: Clone พร้อม Submodules

```bash
git clone --recurse-submodules https://github.com/your-username/my-project.git
cd my-project
```

### ขั้นตอนที่ 2: ติดตั้ง Dependencies

```bash
# Back-end
cd back-end/app
npm install
cd ../..

# Front-end
cd front-end/my-app
npm install
cd ../..
```

### ขั้นตอนที่ 3: รัน Development Servers

**Terminal 1 - Back-end:**
```bash
cd back-end/app
npm run dev
```

**Terminal 2 - Front-end:**
```bash
cd front-end/my-app
npm run dev
```

---

## Part 3: การทำงานประจำวัน - แก้ไขโค้ดและ Push

### สถานการณ์ A: แก้ไข Back-end เท่านั้น

```bash
# 1. เข้าไปในโฟลเดอร์ back-end
cd back-end/app

# 2. ตรวจสอบการเปลี่ยนแปลง
git status

# 3. เพิ่มไฟล์
git add .

# 4. Commit
git commit -m "Fix API endpoint for user authentication"

# 5. Push ไปยัง back-end repository
git push origin main

# 6. ตรวจสอบว่า push สำเร็จ
# ข้อมูลจะปรากฏใน https://github.com/your-username/my-project-backend

# 7. กลับไปที่ root
cd ../..

# 8. Update root repository (เก็บ reference)
git add back-end/app
git commit -m "Update backend submodule"
git push origin main
```

---

### สถานการณ์ B: แก้ไข Front-end เท่านั้น

```bash
# 1. เข้าไปในโฟลเดอร์ front-end
cd front-end/my-app

# 2. ตรวจสอบการเปลี่ยนแปลง
git status

# 3. เพิ่มไฟล์
git add .

# 4. Commit
git commit -m "Add user profile component"

# 5. Push ไปยัง front-end repository
git push origin main

# 6. ตรวจสอบว่า push สำเร็จ
# ข้อมูลจะปรากฏใน https://github.com/your-username/my-project-frontend

# 7. กลับไปที่ root
cd ../..

# 8. Update root repository
git add front-end/my-app
git commit -m "Update frontend submodule"
git push origin main
```

---

### สถานการณ์ C: แก้ไขทั้ง Back-end และ Front-end

```bash
# ===== STEP 1: Push Back-end =====
cd back-end/app
git add .
git commit -m "Add new API endpoint"
git push origin main
cd ../..

# ===== STEP 2: Push Front-end =====
cd front-end/my-app
git add .
git commit -m "Add form to call new API"
git push origin main
cd ../..

# ===== STEP 3: Update Root Repository =====
git add back-end/app front-end/my-app
git commit -m "Update both submodules: new API and form"
git push origin main
```

---

## Part 4: ใช้โปรเจคนี้เป็น Base สำหรับโปรเจคใหม่

สมมุติว่าคุณ clone โปรเจคนี้มาแล้ว และต้องการใช้เป็น base สำหรับโปรเจคใหม่

### ขั้นตอนที่ 1: สร้าง 3 Repositories ใหม่บน GitHub

สำหรับโปรเจคใหม่ เช่น `my-new-project`:
- `my-new-project` (root)
- `my-new-project-backend`
- `my-new-project-frontend`

### ขั้นตอนที่ 2: Clone Base Project

```bash
# Clone โปรเจคเดิม
git clone --recurse-submodules https://github.com/your-username/my-project.git my-new-project
cd my-new-project
```

### ขั้นตอนที่ 3: เปลี่ยน Remote ของ Root Repository

```bash
# ลบ remote เดิม
git remote remove origin

# เพิ่ม remote ใหม่
git remote add origin https://github.com/your-username/my-new-project.git

# Push ไปยัง repository ใหม่
git push -u origin main
```

### ขั้นตอนที่ 4: เปลี่ยน Remote ของ Back-end Submodule

```bash
cd back-end/app

# ลบ remote เดิม
git remote remove origin

# เพิ่ม remote ใหม่
git remote add origin https://github.com/your-username/my-new-project-backend.git

# Push ไปยัง repository ใหม่
git push -u origin main

# กลับไปที่ root
cd ../..

# Update root repository
git add back-end/app
git commit -m "Update backend remote"
git push origin main
```

### ขั้นตอนที่ 5: เปลี่ยน Remote ของ Front-end Submodule

```bash
cd front-end/my-app

# ลบ remote เดิม
git remote remove origin

# เพิ่ม remote ใหม่
git remote add origin https://github.com/your-username/my-new-project-frontend.git

# Push ไปยัง repository ใหม่
git push -u origin main

# กลับไปที่ root
cd ../..

# Update root repository
git add front-end/my-app
git commit -m "Update frontend remote"
git push origin main
```

### ขั้นตอนที่ 6: ตรวจสอบว่าสำเร็จ

```bash
# ตรวจสอบ remote ของ root
git remote -v

# ตรวจสอบ remote ของ back-end
cd back-end/app
git remote -v
cd ../..

# ตรวจสอบ remote ของ front-end
cd front-end/my-app
git remote -v
cd ../..
```

ควรเห็น remote ทั้งหมดชี้ไปยัง `my-new-project-*` แทน `my-project-*`

---

## Part 5: ข้อสำคัญและ Tips

### ✅ ทำได้

1. **ตรวจสอบสถานะ submodules**
   ```bash
   git submodule status
   ```

2. **Pull ทั้งหมด (root + submodules)**
   ```bash
   git pull --recurse-submodules
   ```

3. **Update submodules ให้เป็นเวอร์ชันล่าสุด**
   ```bash
   git submodule update --remote
   ```

4. **ถ้า submodule ติด (Detached HEAD)**
   ```bash
   cd back-end/app
   git checkout main
   git pull origin main
   cd ../..
   ```

### ❌ อย่าลืม

1. **ต้องอยู่ใน main branch ก่อน push**
   ```bash
   git status
   # ควรเห็น "On branch main" ไม่ใช่ "HEAD detached"
   ```

2. **ต้อง push ทั้ง 3 repositories** ไม่เช่นนั้นจะไม่ sync

3. **Push submodules ก่อน แล้วค่อย push root** ตามลำดับ

4. **Commit message ให้ชัดเจน** เพื่อให้ทีมเข้าใจ

---

## Quick Reference - คำสั่งที่ใช้บ่อยที่สุด

```bash
# ===== Clone =====
git clone --recurse-submodules https://github.com/username/repo.git

# ===== Update Submodules =====
git submodule update --init --recursive
git submodule update --remote

# ===== Push Back-end =====
cd back-end/app
git add .
git commit -m "message"
git push origin main
cd ../..

# ===== Push Front-end =====
cd front-end/my-app
git add .
git commit -m "message"
git push origin main
cd ../..

# ===== Update Root =====
git add back-end/app front-end/my-app
git commit -m "Update submodules"
git push origin main

# ===== Check Status =====
git submodule status
git remote -v

# ===== Fix Detached HEAD =====
git checkout main
git pull origin main
```

---

## Troubleshooting

### ปัญหา 1: Detached HEAD State
**อาการ:** `HEAD detached at a1b2c3d`

**แก้:**
```bash
git checkout main
git pull origin main
```

### ปัญหา 2: Submodule ว่างเปล่า
**อาการ:** โฟลเดอร์ back-end/app หรือ front-end/my-app ว่างเปล่า

**แก้:**
```bash
git submodule update --init --recursive
```

### ปัญหา 3: Remote ผิด
**อาการ:** Push ไปแล้วแต่ไม่ปรากฏใน GitHub

**แก้:**
```bash
# ตรวจสอบ remote
git remote -v

# ถ้าผิด ให้เปลี่ยน
git remote remove origin
git remote add origin https://github.com/username/correct-repo.git
```

### ปัญหา 4: Push ไปแล้วแต่ root ยังไม่อัพเดท
**อาการ:** `Everything up-to-date`

**แก้:**
```bash
# กลับไป root
cd ../..
git add back-end/app front-end/my-app
git commit -m "Update submodules"
git push origin main
```

---

## สรุป

1. **สร้าง 3 repositories** (root + back-end + front-end)
2. **เพิ่ม submodules** ไปที่ root
3. **Clone --recurse-submodules** เวลาที่ต้องการเอาไปใช้
4. **ทำงาน:** แก้ back-end → push → แก้ front-end → push → update root → push
5. **ใช้เป็น base:** เปลี่ยน remote ของ 3 repositories ให้ชี้ไปยัง repo ใหม่

