# 🚀 Brute Forcer Pro - رابط کاربری حرفه‌ای

> رابط کاربری مدرن، ریسپانسیو و قابل تعامل برای برنامه Brute Forcer با قابلیت‌های پیشرفته و طراحی جدید.

## ✨ ویژگی‌های اصلی

### 🎨 طراحی حرفه‌ای
- **Design System جامع** با متغیرهای رنگ، اندازه و فونت قابل تنظیم
- **تم روشن/تاریک** با ذخیره ترجیحات کاربر
- **Glassmorphism و Neon Effects** برای ظاهری مدرن
- **انیمیشن‌های روان** و بازخورد‌های بصری
- **ریسپانسیو و Mobile-Friendly** برای تمام دستگاه‌ها

### 📊 داشبورد اطلاعاتی
- **کارت‌های آمار** نمایش‌دهنده KPI‌های اصلی:
  - تعداد تلاش‌های موفق/ناموفق
  - سرعت اجرا (عملیات در ثانیه)
  - وضعیت اتصال به سرور
- **نمودارهای تعاملی** برای تصورّ عملکرد
  - نمودار خطی برای عملکرد در طول زمان
  - نمودار دونات برای نسبت موفقیت
- **آپدیت‌های زنده** و بازتازی‌های خودکار

### 🎛️ کنترل و مدیریت
- **دکمه‌های عملکردی** برای:
  - ▶️ شروع عملیات
  - ⏸️ مکث موقت
  - ⏹️ توقف کامل
  - 🔄 ریست سیستم
- **مانیتور وضعیت سیستم**:
  - استفاده از CPU
  - استفاده از حافظه (RAM)
  - اتصال شبکه
- **Progress Bars** تعاملی

### 📥 مدیریت ورودی‌ها
- آپلود و مدیریت فایل‌های ورودی
- پشتیبانی از فرمت‌های مختلف (.txt, .csv, .json)
- نمایش اطلاعات تفصیلی هر فایل
- حذف و دانلود سریع

### 📤 مدیریت خروجی‌ها
- انتخاب فرمت خروجی (txt, csv, json, xlsx)
- تنظیم مسیر ذخیره‌سازی
- فشرده‌سازی خودکار
- مدیریت فایل‌های کامل شده

### 📋 لاگ‌های سیستم
- نمایش تمام رویدادهای سیستم
- فیلتر بر اساس سطح لاگ (خطا، هشدار، اطلاع، موفقیت)
- جستجو در لاگ‌ها
- رنگ‌بندی بر اساس نوع رویداد

### ⚙️ تنظیمات قابل تنظیم
- تغییر تم ظاهری (روشن/تاریک/خودکار)
- تنظیم اندازه فونت
- انتخاب رنگ اصلی
- تنظیمات برنامه (حداکثر تلاش، تأخیر، تراد‌ها)
- توانائی‌های اختیاری

### ♿ دسترسی‌پذیری
- **صحیح‌سازی WCAG** برای دسترسی بیشتر
- **Tab Navigation** کامل
- **Keyboard Shortcuts**:
  - `Escape` برای بستن مودال‌ها
  - `Ctrl+S` برای ذخیره تنظیمات
- **Screen Reader Support**
- **Focus Management** مناسب

## 📁 ساختار پروژه

```
brute-forcer-pro/
├── index.html              # فایل HTML اصلی
├── styles/
│   ├── variables.css       # سیستم متغیرهای طراحی
│   ├── global.css          # سبک‌های عمومی
│   ├── components.css      # اجزای UI
│   └── layout.css          # سبک‌های تخصصی
├── js/
│   └── main.js             # اسکریپت اصلی
└── README.md               # این فایل
```

## 🎨 سیستم طراحی

### متغیرهای رنگ (CSS Variables)
```css
--primary-color: #6366f1          /* رنگ اصلی - Indigo */
--secondary-color: #8b5cf6        /* رنگ ثانویه - Purple */
--accent-color: #ec4899           /* رنگ تاکیدی - Pink */
--success-color: #10b981          /* رنگ موفقیت - Green */
--error-color: #ef4444            /* رنگ خطا - Red */
--warning-color: #f59e0b          /* رنگ هشدار - Amber */
--info-color: #3b82f6             /* رنگ اطلاع - Blue */
```

### انتقال‌ها و انیمیشن‌ها
```css
--transition-fast: 150ms
--transition-normal: 300ms
--transition-slow: 500ms
```

### Shadow و Effects
```css
--shadow-sm/md/lg/xl/2xl          /* سایه‌های مختلف */
--glass-bg / --glass-border       /* اثر Glassmorphism */
```

## 🚀 شروع کار

### نیازمندی‌ها
- مرورگر جدید (Chrome, Firefox, Safari, Edge)
- فایل‌های CSS و JS فعال
- JavaScript فعال

### نصب و اجرا

1. **کپی کردن فایل‌ها**:
```bash
# تمام فایل‌ها کپی شوند
cp -r brute-forcer-pro/* /your/server/path/
```

2. **استقرار بر روی وب‌سرور**:
```bash
# استفاده از Python
python -m http.server 8000

# یا با Node.js
npx serve

# یا به صورت مستقیم با Nginx/Apache
```

3. **دسترسی از طریق مرورگر**:
```
http://localhost:8000
```

## 💡 نحوه استفاده

### داشبورد
1. بخش اول برای نمایش آمار کلیدی
2. میله پیشرفت و نمودارهای بصری
3. اطلاعات زنده و به‌روز شده

### کنترل
1. شروع/توقف عملیات با دکمه‌ها
2. مانیتور وضعیت سیستم
3. کنترل پارامتر‌ها

### ورودی‌ها
1. آپلود فایل‌های ورودی
2. نمایش لیست فایل‌های موجود
3. حذف یا دانلود فایل‌ها

### خروجی‌ها
1. تنظیم فرمت و مسیر
2. مدیریت فایل‌های خروجی
3. دانلود نتایج

### لاگ‌ها
1. نمایش تمام رویدادهای سیستم
2. فیلتری برای جستجو
3. رنگ‌بندی براساس نوع رویداد

### تنظیمات
1. تغییر تم و ظاهر
2. تنظیمات برنامه
3. توانائی‌های سیستمی

## 🎯 ویژگی‌های پیشرفته

### Theme Customization
```javascript
// تغییر تم
themeManager.setTheme('dark');
themeManager.toggleTheme();

// تنظیم اندازه فونت
themeManager.setFontSize(18);
```

### Notifications
```javascript
// نمایش اطلاع
BruteForcerPro.showNotification('پیام', 'success');
BruteForcerPro.showNotification('خطا', 'error');
```

### Navigation
```javascript
// حرکت به بخش‌های مختلف
BruteForcerPro.navigateTo('dashboard');
BruteForcerPro.navigateTo('control');
```

### Storage
```javascript
// ذخیره داده
StorageManager.save('key', data);

// بازیابی داده
const data = StorageManager.load('key');
```

## 📊 نمودارها

### Chart.js Integration
- نمودار خطی برای عملکرد
- نمودار دونات برای نسبت‌ها
- آپدیت‌های زنده
- تعاملی و پاسخ‌گو

## 🔧 سفارشی‌سازی

### تغییر رنگ اصلی
در فایل `styles/variables.css`:
```css
:root {
  --primary-color: #your-color;
  --secondary-color: #your-color;
}
```

### افزودن بخش جدید
1. اضافه کردن nav item به HTML
2. ایجاد section جدید
3. بروزرسانی Navigation Manager

### توسعه اجزای جدید
الگو برای اجزای جدید:
```css
.new-component {
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  transition: all var(--transition-normal);
}
```

## 🐛 عیب‌یابی

### نمودارها نمایش نمی‌یابند
- بررسی بارگذاری Chart.js
- بررسی console برای خطا

### تم تغییر نمی‌کند
- بررسی localStorage
- بررسی data-theme attribute

### دکمه‌ها پاسخ نمی‌دهند
- بررسی فعال‌سازی JavaScript
- بررسی console

## 📈 بهینه‌سازی Performance

- استفاده از CSS Variables برای سریع‌تر
- Debounce/Throttle برای رویدادها
- Lazy loading برای تصاویر
- Minification برای Production

## 🌍 مرورگرهای پشتیبانی‌شده

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile browsers

## 📱 Responsive Breakpoints

- **Desktop**: 1024px+
- **Tablet**: 768px - 1024px
- **Mobile**: 0px - 768px

## 🔐 امنیت

- XSS Protection از طریق innerText
- CSRF Tokens در فرم‌ها
- Safe localStorage usage
- Input validation

## 📝 لایسنس

تمام کد و طراحی برای استفاده شخصی/تجاری قابل استفاده است.

## 👨‍💻 نویسندگان

ایجاد شده توسط **Brute Forcer Pro Development Team**

## 🙏 تشکر و قدردانی

- Font Awesome برای آیکون‌ها
- Chart.js برای نمودارها
- Google Fonts برای فونت‌ها

## 📞 ارتباط

برای سوالات و پشتیبانی تماس بگیرید.

---

**نسخه**: 1.0.0  
**آخرین بروزرسانی**: 2024  
**وضعیت**: فعال و در حال توسعه
