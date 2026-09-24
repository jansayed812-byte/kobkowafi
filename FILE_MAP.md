# 📑 جدول محتویات و نقشه‌ی مرجع

## 🗂️ ساختار پروژه کامل

```
Brute Forcer Pro UI/UX
│
├── 📄 فایل‌های اصلی
│   ├── index.html              → صفحه‌ی اصلی
│   ├── README.md               → مستندات جامع
│   ├── GUIDE.md                → راهنمای تفصیلی
│   ├── QUICKSTART.md           → شروع سریع (5 دقیقه)
│   ├── SUMMARY.md              → خلاصه‌ی پروژه
│   ├── TERMS_OF_USE.md         → شرایط استفاده
│   └── FILE_MAP.md             → این فایل
│
├── 🎨 فایل‌های سبک (CSS)
│   └── styles/
│       ├── variables.css       → متغیرهای طراحی (Color, Typography)
│       ├── global.css          → سبک‌های عمومی (Fonts, Reset)
│       ├── components.css      → اجزای UI (Buttons, Cards, Forms)
│       └── layout.css          → سبک‌های تخصصی (Layout, Dashboard)
│
└── 🔧 فایل‌های جاوا‌اسکریپت
    └── js/
        └── main.js             → اسکریپت اصلی (8 کلاس)
```

---

## 📖 راهنمای فایل‌ها

### 📄 فایل‌های مستندات

| فایل | توضیح | هدف | زمان مطالعه |
|------|-------|------|-----------|
| `QUICKSTART.md` | شروع سریع 5 دقیقه‌ای | شروع فوری | ⏱️ 5 دقیقه |
| `README.md` | مستندات جامع و کامل | آشنایی دقیق | ⏱️ 15 دقیقه |
| `GUIDE.md` | دستور‌العمل تفصیلی | یادگیری عمیق | ⏱️ 30 دقیقه |
| `SUMMARY.md` | خلاصه‌ی پروژه | نمای کلی | ⏱️ 10 دقیقه |
| `TERMS_OF_USE.md` | شرایط و قوانین | مسائل قانونی | ⏱️ 10 دقیقه |
| `FILE_MAP.md` | نقشه‌ی فایل‌ها | مرجع | ⏱️ 5 دقیقه |

---

## 🎯 نقشه‌ی استفاده

### برای شروع فوری
```
1️⃣ QUICKSTART.md (5 دقیقه)
   ↓
2️⃣ index.html (باز کردن در مرورگر)
   ↓
3️⃣ کاوش رابط
   ↓
4️⃣ درخواست کمک از README.md
```

### برای یادگیری عمیق
```
1️⃣ README.md (معرفی اصلی)
   ↓
2️⃣ GUIDE.md (تفاصیل هر بخش)
   ↓
3️⃣ TERMS_OF_USE.md (شرایط و قوانین)
   ↓
4️⃣ مطالعه کد (CSS و JS)
   ↓
5️⃣ کاستوم‌سازی و توسعه
```

### برای توسعه‌دهندگان
```
1️⃣ SUMMARY.md (نمای کلی فناوری)
   ↓
2️⃣ کد CSS (styles/)
   ↓
3️⃣ کد JS (js/main.js)
   ↓
4️⃣ توسعه و بهتری
   ↓
5️⃣ تست و بسته‌سازی
```

---

## 🎨 فایل‌های CSS - تفصیل

### `styles/variables.css` (320+ سطر)

**محتوای اصلی:**
```css
:root {
  /* رنگ‌ها */
  --primary-color: #6366f1
  --secondary-color: #8b5cf6
  --accent-color: #ec4899
  --success-color: #10b981
  --error-color: #ef4444
  --warning-color: #f59e0b
  --info-color: #3b82f6
  
  /* اندازه‌ها و فونت */
  --font-size-xs/sm/base/lg/xl/2xl/3xl/4xl
  --font-weight-light/normal/medium/semibold/bold/extrabold
  
  /* Spacing و Radius */
  --spacing-xs/sm/md/lg/xl/2xl/3xl
  --radius-sm/md/lg/xl/2xl/3xl/full
  
  /* Shadow و Effects */
  --shadow-sm/md/lg/xl/2xl
  --glass-bg / --glass-border
  
  /* Transitions و Z-index */
  --transition-fast/normal/slow
  --z-dropdown/sticky/fixed/modal-bg/modal/tooltip
}

[data-theme="dark"] {
  /* متغیرهای تم تاریک */
}
```

**کاربرد:** بنیاد تمام طراحی و رنگ‌ها

---

### `styles/global.css` (450+ سطر)

**محتوای اصلی:**
```css
/* Reset و Base */
* { margin: 0; padding: 0; box-sizing: border-box; }

/* Typography */
h1, h2, h3, h4, h5, h6 { ... }
p { ... }
a { ... }

/* Lists, Code, Pre */
ul, ol, code, pre { ... }

/* Scrollbar و Selection */
::-webkit-scrollbar { ... }
::selection { ... }

/* Focus Styles */
:focus-visible { ... }

/* Utilities */
.container { ... }
.sr-only { ... }

/* Animations */
@keyframes spin, pulse, shimmer, fadeIn, slideIn, bounce { ... }
```

**کاربرد:** سبک‌های پایه و انیمیشن‌های کلی

---

### `styles/components.css` (1000+ سطر)

**محتوای اصلی:**
```css
/* Buttons - 20+ variant */
.btn, .btn-primary, .btn-secondary, .btn-success, .btn-danger, .btn-warning
.btn-sm, .btn-lg, .btn-icon, .btn-icon-lg
.btn.is-loading

/* Input Fields */
.input-group, .input-label, .input-field, .input-hint

/* Cards */
.card, .card-header, .card-body, .card-footer

/* Badges */
.badge, .badge-primary, .badge-success, .badge-warning, .badge-error

/* Progress Bars */
.progress, .progress-bar

/* Alerts */
.alert, .alert-primary, .alert-success, .alert-warning, .alert-error

/* Tabs */
.tabs, .tab-button

/* Modals */
.modal-overlay, .modal, .modal-header, .modal-title, .modal-body, .modal-footer

/* Toggles */
.toggle, .toggle-thumb

/* Dropdown */
.dropdown-menu, .dropdown-item, .dropdown-divider

/* Skeleton Loading */
.skeleton, .skeleton-text, .skeleton-avatar

/* Tooltip */
.tooltip
```

**کاربرد:** تمام اجزای رابط کاربری

---

### `styles/layout.css` (1200+ سطر)

**محتوای اصلی:**
```css
/* Main Layout Grid */
.main-layout { display: grid; ... }

/* Header */
.main-header { ... }
.logo, .search-box, .header-right, .header-actions

/* Sidebar */
.sidebar, .nav-menu, .nav-item, .nav-icon

/* Content */
.content

/* Dashboard */
.dashboard-grid, .stat-card

/* Charts */
.charts-container, .chart-card

/* Control Panel */
.control-panel, .control-card, .control-buttons

/* Logs */
.logs-container, .log-entry

/* Responsive */
@media (max-width: 1024px) { ... }
@media (max-width: 768px) { ... }

/* Special Effects */
.glass-effect, .neon-glow
```

**کاربرد:** تخصیص Layout و صفحه‌بندی

---

## 🔧 فایل JavaScript

### `js/main.js` (500+ سطر)

**کلاس‌های اصلی (8 کلاس):**

```javascript
1. ThemeManager
   - init()
   - setTheme()
   - toggleTheme()
   - setFontSize()

2. NavigationManager
   - init()
   - navigateToSection()

3. ChartManager
   - initCharts()
   - createPerformanceChart()
   - createSuccessRateChart()
   - updateCharts()

4. ButtonManager
   - init()
   - setButtonLoading()
   - showNotification()

5. FormManager
   - init()
   - validateField()
   - getFormData()

6. PerformanceMonitor
   - init()
   - updateMetrics()
   - getSystemInfo()

7. StorageManager
   - save()
   - load()
   - remove()
   - clear()

8. AccessibilityManager
   - init()
   - setupTabNavigation()
   - closeModals()
   - saveSettings()
```

**استفاده‌های کلیدی:**
```javascript
// استفاده از رابط
BruteForcerPro.showNotification('پیام', 'success');
BruteForcerPro.navigateTo('dashboard');

// مدیریت پروژه
StorageManager.save('key', data);
const data = StorageManager.load('key');
```

---

## 📊 کمیت‌های پروژه

### کدها
```
HTML:        1 فایل     (33 KB)     (~900 سطر)
CSS:         4 فایل     (~2 KB)     (~2900 سطر)
JavaScript:  1 فایل     (~15 KB)    (~500 سطر)
Markdown:    6 فایل     (~100 KB)   (~3500 سطر)
─────────────────────────────────────────────
کل:          12 فایل    (~150 KB)   (~6800 سطر)
```

### رابط کاربری
```
بخش‌ها:          6 عدد
کارت‌های آمار:   4 عدد
نمودارها:       2 عدد
دکمه‌ها:        10+ عدد
ورودی‌های فرم:  20+ عدد
```

### طراحی
```
رنگ‌های اصلی:   7 عدد
Animations:    7 عدد
Shadows:       5 عدد
Border Radius: 7 عدد
```

---

## 🛠️ نحوه استفاده از فایل‌ها

### شروع
```
1. index.html را در مرورگر باز کنید
2. تمام CSS فایل‌ها خودکار بارگذاری می‌شوند
3. JavaScript فعال می‌شود
4. رابط آماده است
```

### تغییر رنگ‌ها
```
1. styles/variables.css را باز کنید
2. رنگ--primary-color را تغییر دهید
3. صفحه refresh کنید
```

### اضافه‌کردن دکمه جدید
```
1. HTML جدید در index.html اضافه کنید
2. CSS class از components.css استفاده کنید
3. Event listener در js/main.js اضافه کنید
```

### ایجاد بخش جدید
```
1. <section> جدید در HTML
2. CSS در layout.css
3. Navigation در JavaScript
4. Event handlers در main.js
```

---

## 📚 جدول مراجعه سریع

| چیز | فایل | خط |
|-----|------|-----|
| رنگ‌های اصلی | variables.css | 1-20 |
| متغیرهای فونت | variables.css | 21-35 |
| سبک Typography | global.css | 20-50 |
| دکمه‌های UI | components.css | 50-120 |
| Progress Bar | components.css | 180-210 |
| Layout Grid | layout.css | 1-50 |
| Nav Sidebar | layout.css | 70-150 |
| Dashboard | layout.css | 180-280 |
| Theme Manager | main.js | 1-50 |
| Navigation | main.js | 51-80 |
| Charts | main.js | 81-130 |

---

## 🎓 برای مبتدیان

### فایل را اول بخوانید:
```
1️⃣ QUICKSTART.md      → شروع سریع
2️⃣ index.html         → ببینید چی هست
3️⃣ README.md          → بیشتر بدانید
4️⃣ GUIDE.md           → تمام جزئیات
```

### سپس کد را بخوانید:
```
1️⃣ styles/variables.css  → رنگ‌ها و اندازه‌ها
2️⃣ styles/components.css → اجزای UI
3️⃣ js/main.js            → عملکرد
```

---

## 👨‍💻 برای توسعه‌دهندگان

### بهترین ترتیب مطالعه:
```
1️⃣ SUMMARY.md           → نمای کلی
2️⃣ index.html           → ساختار HTML
3️⃣ styles/layout.css    → Grid و Layout
4️⃣ styles/components.css → اجزا
5️⃣ js/main.js           → منطق
6️⃣ README.md            → نتایج
```

### برای کاستوم‌سازی:
```
1️⃣ variables.css → رنگ و فونت تغییر دهید
2️⃣ components.css → اجزا را تغییر دهید
3️⃣ layout.css → Layout را تغییر دهید
4️⃣ main.js → عملکرد را توسعه دهید
```

---

## 🎯 مسیرهای یادگیری

### مسیر 1: شروع سریع (15 دقیقه)
```
QUICKSTART.md → index.html → دیدن رابط
```

### مسیر 2: درک کامل (1 ساعت)
```
README.md → GUIDE.md → TERMS_OF_USE.md → استفاده
```

### مسیر 3: توسعه (2 ساعت)
```
SUMMARY.md → CSS فایل‌ها → JS فایل → کاستوم کردن
```

### مسیر 4: مسلط شدن (4 ساعت)
```
تمام مستندات → تمام کد → پروژه خود → تکرار
```

---

## 📞 فهرست دسترسی

| نیاز | فایل |
|-----|------|
| شروع سریع | QUICKSTART.md |
| مسائل قانونی | TERMS_OF_USE.md |
| راهنمای تفصیلی | GUIDE.md |
| رنگ‌ها و فونت‌ها | styles/variables.css |
| اجزای UI | styles/components.css |
| بخش‌های اصلی | styles/layout.css |
| عملکرد | js/main.js |

---

## ✨ خلاصه

### این پروژه شامل:
- ✅ 1 فایل HTML اصلی
- ✅ 4 فایل CSS پیشرفته
- ✅ 1 فایل JavaScript قدرتمند
- ✅ 6 فایل مستندات جامع
- ✅ +150 KB کد و مستندات
- ✅ +6800 سطر تکمیل‌شده

### همه چیز برای:
- ✅ شروع فوری
- ✅ یادگیری عمیق
- ✅ توسعه و بهتری
- ✅ استفاده طول‌مدت

---

## 🚀 شروع الان

```
1. تمام فایل‌ها را دانلود کنید
2. QUICKSTART.md را بخوانید
3. index.html را باز کنید
4. کاوش کنید و لذت ببرید!
```

---

**نسخه**: 1.0.0  
**آخرین بروزرسانی**: 2024  
**وضعیت**: ✅ کامل و آماده برای استفاده
