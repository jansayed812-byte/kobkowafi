/* ==========================================
   اسکریپت اصلی - Main JavaScript
   ========================================== */

// ============ Theme Management ============

const STORAGE_KEY = 'bf-pro-theme';
const FONT_SIZE_KEY = 'bf-pro-font-size';

class ThemeManager {
  constructor() {
    this.darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    this.init();
  }

  init() {
    // بارگذاری تم ذخیره‌شده یا سیستم
    const savedTheme = localStorage.getItem(STORAGE_KEY);
    if (savedTheme) {
      this.setTheme(savedTheme);
    } else if (this.darkModeQuery.matches) {
      this.setTheme('dark');
    } else {
      this.setTheme('light');
    }

    // گوش‌دادن به تغییرات سیستمی
    this.darkModeQuery.addEventListener('change', (e) => {
      if (!localStorage.getItem(STORAGE_KEY)) {
        this.setTheme(e.matches ? 'dark' : 'light');
      }
    });

    // بارگذاری اندازه فونت
    const savedFontSize = localStorage.getItem(FONT_SIZE_KEY);
    if (savedFontSize) {
      this.setFontSize(parseInt(savedFontSize));
    }
  }

  setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);
    this.updateThemeIcon();
  }

  toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const newTheme = current === 'dark' ? 'light' : 'dark';
    this.setTheme(newTheme);
  }

  updateThemeIcon() {
    const themeToggle = document.getElementById('themeToggle');
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    themeToggle.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
  }

  setFontSize(size) {
    const root = document.documentElement;
    root.style.fontSize = size + 'px';
    localStorage.setItem(FONT_SIZE_KEY, size.toString());
  }

  getFontSize() {
    return parseInt(localStorage.getItem(FONT_SIZE_KEY)) || 16;
  }
}

// ============ Navigation Management ============

class NavigationManager {
  constructor() {
    this.init();
  }

  init() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach((item) => {
      item.addEventListener('click', (e) => {
        if (item.href && item.href.includes('#')) {
          e.preventDefault();
          this.navigateToSection(item.href.substring(1));
        }
      });
    });

    // Handle window hash change
    window.addEventListener('hashchange', () => {
      const hash = window.location.hash.substring(1);
      if (hash) {
        this.navigateToSection(hash);
      }
    });

    // Initialize first section
    this.navigateToSection('dashboard');
  }

  navigateToSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('[id^=""]').forEach((section) => {
      if (section.classList.contains('section') || 
          section.id === 'dashboard' || 
          section.id === 'control' ||
          section.id === 'input' ||
          section.id === 'output' ||
          section.id === 'logs' ||
          section.id === 'settings') {
        section.style.display = 'none';
      }
    });

    // Show target section
    const targetSection = document.querySelector(`[id*="${sectionId}"]`);
    if (targetSection) {
      targetSection.style.display = 'block';
      
      // Scroll to top
      document.querySelector('.content').scrollTop = 0;
    }

    // Update active nav item
    document.querySelectorAll('.nav-item').forEach((item) => {
      item.classList.remove('active');
      if (item.href && item.href.includes('#' + sectionId)) {
        item.classList.add('active');
      }
    });
  }
}

// ============ Chart Management ============

class ChartManager {
  constructor() {
    this.charts = {};
    this.initCharts();
  }

  initCharts() {
    this.createPerformanceChart();
    this.createSuccessRateChart();
  }

  createPerformanceChart() {
    const ctx = document.getElementById('performanceChart');
    if (!ctx) return;

    this.charts.performance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['روز 1', 'روز 2', 'روز 3', 'روز 4', 'روز 5', 'روز 6', 'روز 7'],
        datasets: [
          {
            label: 'تلاش‌های موفق',
            data: [120, 150, 180, 220, 250, 280, 320],
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointRadius: 5,
            pointHoverRadius: 7,
            pointBackgroundColor: '#10b981',
          },
          {
            label: 'تلاش‌های ناموفق',
            data: [200, 180, 160, 140, 120, 100, 80],
            borderColor: '#ef4444',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointRadius: 5,
            pointHoverRadius: 7,
            pointBackgroundColor: '#ef4444',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              font: { size: 12, weight: 'bold' },
              usePointStyle: true,
              padding: 15,
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              drawBorder: false,
              color: 'rgba(0, 0, 0, 0.05)',
            },
          },
          x: {
            grid: { display: false },
          },
        },
      },
    });
  }

  createSuccessRateChart() {
    const ctx = document.getElementById('successRateChart');
    if (!ctx) return;

    this.charts.successRate = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['موفق', 'ناموفق'],
        datasets: [
          {
            data: [65, 35],
            backgroundColor: ['#10b981', '#ef4444'],
            borderColor: 'var(--bg-secondary)',
            borderWidth: 3,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              font: { size: 12, weight: 'bold' },
              padding: 15,
            },
          },
        },
      },
    });
  }

  updateCharts() {
    // Simulate chart updates
    if (this.charts.performance) {
      // Update with new data
      const newValue = Math.floor(Math.random() * 400) + 100;
      this.charts.performance.data.datasets[0].data.shift();
      this.charts.performance.data.datasets[0].data.push(newValue);
      this.charts.performance.update('none');
    }
  }
}

// ============ Button Actions ============

class ButtonManager {
  constructor() {
    this.init();
  }

  init() {
    // Theme toggle
    document.getElementById('themeToggle').addEventListener('click', () => {
      themeManager.toggleTheme();
    });

    // Control buttons
    document.getElementById('startBtn').addEventListener('click', () => {
      this.showNotification('عملیات شروع شد', 'success');
      this.setButtonLoading(document.getElementById('startBtn'), true);
    });

    document.getElementById('pauseBtn').addEventListener('click', () => {
      this.showNotification('عملیات متوقف شد', 'warning');
    });

    document.getElementById('stopBtn').addEventListener('click', () => {
      this.showNotification('عملیات کامل متوقف شد', 'error');
      this.setButtonLoading(document.getElementById('startBtn'), false);
    });

    document.getElementById('resetBtn').addEventListener('click', () => {
      if (confirm('آیا مطمئن هستید؟')) {
        this.showNotification('تمام داده‌ها ریست شدند', 'info');
      }
    });

    // Add more event listeners as needed
  }

  setButtonLoading(button, isLoading) {
    if (isLoading) {
      button.classList.add('is-loading');
      button.disabled = true;
    } else {
      button.classList.remove('is-loading');
      button.disabled = false;
    }
  }

  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `alert alert-${type}`;
    notification.style.cssText = `
      position: fixed;
      top: 100px;
      right: 20px;
      z-index: 1500;
      min-width: 300px;
      animation: slideInFromRight var(--transition-normal);
    `;
    notification.innerHTML = `
      <span style="flex: 1;">${message}</span>
      <button class="alert-close">×</button>
    `;
    
    document.body.appendChild(notification);

    notification.querySelector('.alert-close').addEventListener('click', () => {
      notification.remove();
    });

    setTimeout(() => {
      notification.remove();
    }, 4000);
  }
}

// ============ Form Management ============

class FormManager {
  constructor() {
    this.init();
  }

  init() {
    // Add form validation
    document.querySelectorAll('.input-field').forEach((field) => {
      field.addEventListener('change', () => {
        this.validateField(field);
      });
    });
  }

  validateField(field) {
    if (field.value.trim() === '') {
      field.classList.remove('has-error');
    }
  }

  getFormData(formElement) {
    const formData = new FormData(formElement);
    return Object.fromEntries(formData);
  }
}

// ============ Utility Functions ============

class Utils {
  static debounce(func, wait) {
    let timeout;
    return function (...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  static throttle(func, limit) {
    let inThrottle;
    return function (...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  }

  static formatNumber(num) {
    return num.toLocaleString('fa-IR');
  }

  static formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  static getRelativeTime(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'همین‌الان';
    if (diffMins < 60) return `${diffMins} دقیقه پیش`;
    if (diffHours < 24) return `${diffHours} ساعت پیش`;
    return `${diffDays} روز پیش`;
  }
}

// ============ Performance Monitor ============

class PerformanceMonitor {
  constructor() {
    this.init();
  }

  init() {
    // Update performance metrics every 2 seconds
    setInterval(() => {
      this.updateMetrics();
    }, 2000);
  }

  updateMetrics() {
    // Simulate CPU and memory usage
    const cpuUsage = Math.floor(Math.random() * 30) + 30;
    const memUsage = Math.floor(Math.random() * 20) + 60;

    // Update UI (would be connected to actual metrics in production)
    console.log(`CPU: ${cpuUsage}%, Memory: ${memUsage}%`);
  }

  getSystemInfo() {
    return {
      cpu: Math.floor(Math.random() * 100),
      memory: Math.floor(Math.random() * 100),
      network: 'متصل',
      uptime: '24:45:30',
    };
  }
}

// ============ Storage Manager ============

class StorageManager {
  static save(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Storage error:', error);
      return false;
    }
  }

  static load(key) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Storage error:', error);
      return null;
    }
  }

  static remove(key) {
    localStorage.removeItem(key);
  }

  static clear() {
    localStorage.clear();
  }
}

// ============ Accessibility ============

class AccessibilityManager {
  constructor() {
    this.init();
  }

  init() {
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeModals();
      }
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 's') {
          e.preventDefault();
          this.saveSettings();
        }
      }
    });

    // Tab navigation
    this.setupTabNavigation();
  }

  setupTabNavigation() {
    const focusableElements = document.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Tab') return;

      const index = Array.from(focusableElements).indexOf(document.activeElement);
      let nextIndex = index + (e.shiftKey ? -1 : 1);

      if (nextIndex >= focusableElements.length) nextIndex = 0;
      if (nextIndex < 0) nextIndex = focusableElements.length - 1;

      focusableElements[nextIndex].focus();
      e.preventDefault();
    });
  }

  closeModals() {
    document.querySelectorAll('.modal-overlay').forEach((modal) => {
      modal.style.display = 'none';
    });
  }

  saveSettings() {
    console.log('تنظیمات ذخیره شد');
  }
}

// ============ Initialization ============

// Global instances
let themeManager;
let navigationManager;
let chartManager;
let buttonManager;
let formManager;
let performanceMonitor;
let accessibilityManager;

document.addEventListener('DOMContentLoaded', () => {
  // Initialize all managers
  themeManager = new ThemeManager();
  navigationManager = new NavigationManager();
  chartManager = new ChartManager();
  buttonManager = new ButtonManager();
  formManager = new FormManager();
  performanceMonitor = new PerformanceMonitor();
  accessibilityManager = new AccessibilityManager();

  console.log('✓ Brute Forcer Pro UI Initialized');

  // Update charts periodically
  setInterval(() => {
    chartManager.updateCharts();
  }, 5000);

  // Set initial active nav
  document.querySelector('.nav-item').classList.add('active');
});

// ============ Export for external use ============

window.BruteForcerPro = {
  Utils,
  StorageManager,
  showNotification: (msg, type) => buttonManager?.showNotification(msg, type),
  navigateTo: (section) => navigationManager?.navigateToSection(section),
};
