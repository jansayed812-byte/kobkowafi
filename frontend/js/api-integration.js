/**
 * API Integration - Connect frontend to backend API
 * Extends existing BruteForcerPro functionality with real backend
 */

const APIIntegration = (() => {
  // Initialize on page load
  const init = async () => {
    // Check authentication
    const isAuth = await AuthManager.checkAuthentication();
    if (!isAuth) return;

    // Load user data
    await loadUserData();

    // Setup event listeners for CRUD operations
    setupOperationsListeners();
    setupTargetsListeners();
    setupWordlistsListeners();
    setupSettingsListeners();

    // Load initial data
    await refreshOperations();
    await refreshTargets();
    await refreshWordlists();
    await loadSettings();

    console.log('✅ API Integration initialized');
  };

  const loadUserData = async () => {
    try {
      const profile = await APIClient.auth.getProfile();
      if (profile.success) {
        updateUserDisplay(profile.data);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const updateUserDisplay = (user) => {
    const userEmail = document.querySelector('[data-user-email]');
    if (userEmail) {
      userEmail.textContent = user.email;
      userEmail.title = `ID: ${user.id}`;
    }
  };

  // ============ Operations Management ============

  const setupOperationsListeners = () => {
    const createBtn = document.querySelector('[data-action="create-operation"]');
    const startBtn = document.querySelector('[data-action="start-operation"]');
    const pauseBtn = document.querySelector('[data-action="pause-operation"]');
    const stopBtn = document.querySelector('[data-action="stop-operation"]');
    const deleteBtn = document.querySelector('[data-action="delete-operation"]');

    if (createBtn) {
      createBtn.addEventListener('click', () => showCreateOperationModal());
    }
    if (startBtn) {
      startBtn.addEventListener('click', () => startSelectedOperation());
    }
    if (pauseBtn) {
      pauseBtn.addEventListener('click', () => pauseSelectedOperation());
    }
    if (stopBtn) {
      stopBtn.addEventListener('click', () => stopSelectedOperation());
    }
    if (deleteBtn) {
      deleteBtn.addEventListener('click', () => deleteSelectedOperation());
    }
  };

  const showCreateOperationModal = () => {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-content">
        <h2>عملیات جدید</h2>
        <form id="operationForm">
          <div class="form-group">
            <label>نام</label>
            <input type="text" id="opName" required>
          </div>
          <div class="form-group">
            <label>توضیح</label>
            <textarea id="opDescription"></textarea>
          </div>
          <div class="form-group">
            <label>هدف</label>
            <input type="text" id="opTarget" placeholder="http://example.com" required>
          </div>
          <div class="form-group">
            <label>نوع حمله</label>
            <select id="opType" required>
              <option value="dictionary">فرهنگ‌لغت</option>
              <option value="brute_force">brute force</option>
              <option value="hybrid">ترکیبی</option>
              <option value="mask">ماسک</option>
              <option value="rules">قوانین</option>
            </select>
          </div>
          <div class="modal-buttons">
            <button type="submit" class="btn-primary">ایجاد</button>
            <button type="button" class="btn-secondary" onclick="this.closest('.modal-overlay').remove()">
              انصراف
            </button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(modal);

    modal.querySelector('#operationForm').addEventListener('submit', async (e) => {
      e.preventDefault();

      try {
        const result = await APIClient.operations.create({
          name: document.querySelector('#opName').value,
          description: document.querySelector('#opDescription').value,
          target: document.querySelector('#opTarget').value,
          type: document.querySelector('#opType').value,
        });

        if (result.success) {
          showNotification('عملیات ایجاد شد', 'success');
          modal.remove();
          await refreshOperations();
        }
      } catch (error) {
        showNotification(error.message, 'error');
      }
    });
  };

  const refreshOperations = async () => {
    try {
      const result = await APIClient.operations.list(1, 50);
      if (result.success) {
        updateOperationsTable(result.data);
      }
    } catch (error) {
      console.error('Error loading operations:', error);
    }
  };

  const updateOperationsTable = (operations) => {
    const tbody = document.querySelector('[data-table="operations"] tbody');
    if (!tbody) return;

    tbody.innerHTML = operations.map((op) => `
      <tr data-operation-id="${op.id}">
        <td>${op.name}</td>
        <td>${op.type}</td>
        <td>${op.target}</td>
        <td>
          <span class="badge badge-${op.status}">${op.status}</span>
        </td>
        <td>${op.progress}%</td>
        <td>${op.successful_attempts}</td>
        <td>
          <button class="btn-small" onclick="APIIntegration.startOperation('${op.id}')">
            شروع
          </button>
          <button class="btn-small" onclick="APIIntegration.pauseOperation('${op.id}')">
            مکث
          </button>
          <button class="btn-small btn-danger" onclick="APIIntegration.deleteOperation('${op.id}')">
            حذف
          </button>
        </td>
      </tr>
    `).join('');
  };

  const startSelectedOperation = async () => {
    const selected = document.querySelector('[data-table="operations"] tbody tr.selected');
    if (!selected) {
      showNotification('عملیات را انتخاب کنید', 'warning');
      return;
    }

    const operationId = selected.getAttribute('data-operation-id');
    await startOperation(operationId);
  };

  const startOperation = async (operationId) => {
    try {
      const result = await APIClient.operations.start(operationId, {
        wordlist: ['admin', 'password', 'test', '123456'],
        threads: 4,
        delay: 100,
      });

      if (result.success) {
        showNotification('عملیات شروع شد', 'success');
        await refreshOperations();
      }
    } catch (error) {
      showNotification(error.message, 'error');
    }
  };

  const pauseSelectedOperation = async () => {
    const selected = document.querySelector('[data-table="operations"] tbody tr.selected');
    if (!selected) {
      showNotification('عملیات را انتخاب کنید', 'warning');
      return;
    }

    const operationId = selected.getAttribute('data-operation-id');
    await pauseOperation(operationId);
  };

  const pauseOperation = async (operationId) => {
    try {
      const result = await APIClient.operations.pause(operationId);
      if (result.success) {
        showNotification('عملیات متوقف شد', 'success');
        await refreshOperations();
      }
    } catch (error) {
      showNotification(error.message, 'error');
    }
  };

  const stopSelectedOperation = async () => {
    const selected = document.querySelector('[data-table="operations"] tbody tr.selected');
    if (!selected) {
      showNotification('عملیات را انتخاب کنید', 'warning');
      return;
    }

    const operationId = selected.getAttribute('data-operation-id');
    if (confirm('آیا مطمئن هستید؟')) {
      try {
        const result = await APIClient.operations.cancel(operationId);
        if (result.success) {
          showNotification('عملیات لغو شد', 'success');
          await refreshOperations();
        }
      } catch (error) {
        showNotification(error.message, 'error');
      }
    }
  };

  const deleteSelectedOperation = async () => {
    const selected = document.querySelector('[data-table="operations"] tbody tr.selected');
    if (!selected) {
      showNotification('عملیات را انتخاب کنید', 'warning');
      return;
    }

    const operationId = selected.getAttribute('data-operation-id');
    await deleteOperation(operationId);
  };

  const deleteOperation = async (operationId) => {
    if (confirm('آیا مطمئن هستید؟')) {
      try {
        const result = await APIClient.operations.delete(operationId);
        if (result.success) {
          showNotification('عملیات حذف شد', 'success');
          await refreshOperations();
        }
      } catch (error) {
        showNotification(error.message, 'error');
      }
    }
  };

  // ============ Targets Management ============

  const setupTargetsListeners = () => {
    const createBtn = document.querySelector('[data-action="create-target"]');
    if (createBtn) {
      createBtn.addEventListener('click', () => showCreateTargetModal());
    }
  };

  const showCreateTargetModal = () => {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-content">
        <h2>هدف جدید</h2>
        <form id="targetForm">
          <div class="form-group">
            <label>نام</label>
            <input type="text" id="targetName" required>
          </div>
          <div class="form-group">
            <label>پروتکل</label>
            <select id="targetProtocol" required>
              <option value="http">HTTP</option>
              <option value="https">HTTPS</option>
              <option value="ssh">SSH</option>
              <option value="ftp">FTP</option>
              <option value="custom">سفارشی</option>
            </select>
          </div>
          <div class="form-group">
            <label>میزبان</label>
            <input type="text" id="targetHost" placeholder="example.com" required>
          </div>
          <div class="form-group">
            <label>درگاه</label>
            <input type="number" id="targetPort" placeholder="80">
          </div>
          <div class="form-group">
            <label>نام‌کاربری</label>
            <input type="text" id="targetUsername">
          </div>
          <div class="modal-buttons">
            <button type="submit" class="btn-primary">ایجاد</button>
            <button type="button" class="btn-secondary" onclick="this.closest('.modal-overlay').remove()">
              انصراف
            </button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(modal);

    modal.querySelector('#targetForm').addEventListener('submit', async (e) => {
      e.preventDefault();

      try {
        const result = await APIClient.targets.create({
          name: document.querySelector('#targetName').value,
          protocol: document.querySelector('#targetProtocol').value,
          host: document.querySelector('#targetHost').value,
          port: parseInt(document.querySelector('#targetPort').value) || null,
          username: document.querySelector('#targetUsername').value,
        });

        if (result.success) {
          showNotification('هدف ایجاد شد', 'success');
          modal.remove();
          await refreshTargets();
        }
      } catch (error) {
        showNotification(error.message, 'error');
      }
    });
  };

  const refreshTargets = async () => {
    try {
      const result = await APIClient.targets.list(1, 50);
      if (result.success) {
        updateTargetsTable(result.data);
      }
    } catch (error) {
      console.error('Error loading targets:', error);
    }
  };

  const updateTargetsTable = (targets) => {
    const tbody = document.querySelector('[data-table="targets"] tbody');
    if (!tbody) return;

    tbody.innerHTML = targets.map((target) => `
      <tr data-target-id="${target.id}">
        <td>${target.name}</td>
        <td>${target.protocol}</td>
        <td>${target.host}:${target.port || '—'}</td>
        <td>${target.username || '—'}</td>
        <td>
          <button class="btn-small" onclick="APIIntegration.editTarget('${target.id}')">
            ویرایش
          </button>
          <button class="btn-small btn-danger" onclick="APIIntegration.deleteTarget('${target.id}')">
            حذف
          </button>
        </td>
      </tr>
    `).join('');
  };

  const deleteTarget = async (targetId) => {
    if (confirm('آیا مطمئن هستید؟')) {
      try {
        const result = await APIClient.targets.delete(targetId);
        if (result.success) {
          showNotification('هدف حذف شد', 'success');
          await refreshTargets();
        }
      } catch (error) {
        showNotification(error.message, 'error');
      }
    }
  };

  // ============ Wordlists Management ============

  const setupWordlistsListeners = () => {
    const uploadBtn = document.querySelector('[data-action="upload-wordlist"]');
    if (uploadBtn) {
      uploadBtn.addEventListener('click', () => showUploadWordlistModal());
    }
  };

  const showUploadWordlistModal = () => {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-content">
        <h2>آپلود فهرست کلمات</h2>
        <form id="wordlistForm">
          <div class="form-group">
            <label>نام</label>
            <input type="text" id="wordlistName" required>
          </div>
          <div class="form-group">
            <label>توضیح</label>
            <textarea id="wordlistDescription"></textarea>
          </div>
          <div class="form-group">
            <label>فایل</label>
            <input type="file" id="wordlistFile" accept=".txt" required>
          </div>
          <div class="modal-buttons">
            <button type="submit" class="btn-primary">آپلود</button>
            <button type="button" class="btn-secondary" onclick="this.closest('.modal-overlay').remove()">
              انصراف
            </button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(modal);

    modal.querySelector('#wordlistForm').addEventListener('submit', async (e) => {
      e.preventDefault();

      const file = document.querySelector('#wordlistFile').files[0];
      if (!file) {
        showNotification('فایل را انتخاب کنید', 'error');
        return;
      }

      try {
        const result = await APIClient.wordlists.create(
          {
            name: document.querySelector('#wordlistName').value,
            description: document.querySelector('#wordlistDescription').value,
          },
          file,
        );

        if (result.success) {
          showNotification('فهرست کلمات آپلود شد', 'success');
          modal.remove();
          await refreshWordlists();
        }
      } catch (error) {
        showNotification(error.message, 'error');
      }
    });
  };

  const refreshWordlists = async () => {
    try {
      const result = await APIClient.wordlists.list(1, 50);
      if (result.success) {
        updateWordlistsTable(result.data);
      }
    } catch (error) {
      console.error('Error loading wordlists:', error);
    }
  };

  const updateWordlistsTable = (wordlists) => {
    const tbody = document.querySelector('[data-table="wordlists"] tbody');
    if (!tbody) return;

    tbody.innerHTML = wordlists.map((wl) => `
      <tr data-wordlist-id="${wl.id}">
        <td>${wl.name}</td>
        <td>${wl.line_count || '—'} کلمه</td>
        <td>${formatBytes(wl.file_size)}</td>
        <td>
          <button class="btn-small" onclick="APIIntegration.downloadWordlist('${wl.id}')">
            دانلود
          </button>
          <button class="btn-small btn-danger" onclick="APIIntegration.deleteWordlist('${wl.id}')">
            حذف
          </button>
        </td>
      </tr>
    `).join('');
  };

  const downloadWordlist = async (wordlistId) => {
    try {
      const response = await APIClient.wordlists.download(wordlistId);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `wordlist-${wordlistId}.txt`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      showNotification(error.message, 'error');
    }
  };

  const deleteWordlist = async (wordlistId) => {
    if (confirm('آیا مطمئن هستید؟')) {
      try {
        const result = await APIClient.wordlists.delete(wordlistId);
        if (result.success) {
          showNotification('فهرست کلمات حذف شد', 'success');
          await refreshWordlists();
        }
      } catch (error) {
        showNotification(error.message, 'error');
      }
    }
  };

  // ============ Settings Management ============

  const setupSettingsListeners = () => {
    const settingsForm = document.querySelector('#settingsForm');
    if (settingsForm) {
      settingsForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await saveSettings();
      });
    }
  };

  const loadSettings = async () => {
    try {
      const result = await APIClient.settings.get();
      if (result.success) {
        applySettings(result.data);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const applySettings = (settings) => {
    // Update UI with settings
    const themeSelect = document.querySelector('[name="theme"]');
    if (themeSelect) themeSelect.value = settings.theme;

    const fontSizeSelect = document.querySelector('[name="fontSize"]');
    if (fontSizeSelect) fontSizeSelect.value = settings.font_size;

    const primaryColor = document.querySelector('[name="primaryColor"]');
    if (primaryColor) primaryColor.value = settings.primary_color;

    const notifications = document.querySelector('[name="notifications"]');
    if (notifications) notifications.checked = settings.notifications_enabled;
  };

  const saveSettings = async () => {
    try {
      const theme = document.querySelector('[name="theme"]')?.value;
      const fontSize = parseInt(document.querySelector('[name="fontSize"]')?.value) || 16;
      const primaryColor = document.querySelector('[name="primaryColor"]')?.value;
      const notifications = document.querySelector('[name="notifications"]')?.checked;

      const result = await APIClient.settings.update({
        theme,
        fontSize,
        primaryColor,
        notificationsEnabled: notifications,
      });

      if (result.success) {
        showNotification('تنظیمات ذخیره شد', 'success');
      }
    } catch (error) {
      showNotification(error.message, 'error');
    }
  };

  // ============ Utilities ============

  const formatBytes = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return {
    init,
    startOperation,
    pauseOperation,
    deleteOperation,
    deleteTarget,
    downloadWordlist,
    deleteWordlist,
    editTarget: (id) => console.log('Edit target:', id),
  };
})();

// Auto-initialize on document load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => APIIntegration.init());
} else {
  APIIntegration.init();
}

// Export for use
window.APIIntegration = APIIntegration;
