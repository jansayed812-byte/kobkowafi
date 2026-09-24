/**
 * Authentication Manager - Handle login, registration, and session
 */

const AuthManager = (() => {
  const showAuthModal = (mode = 'login') => {
    const html = mode === 'login' ? getLoginHTML() : getRegisterHTML();
    const modal = document.createElement('div');
    modal.className = 'auth-modal-overlay';
    modal.innerHTML = html;
    document.body.appendChild(modal);

    setupAuthListeners(modal, mode);
    modal.querySelector('.auth-input-email').focus();
  };

  const getLoginHTML = () => `
    <div class="auth-modal">
      <div class="auth-modal-content">
        <h2>ورود به حساب</h2>
        <form class="auth-form">
          <div class="form-group">
            <label>ایمیل</label>
            <input type="email" class="auth-input-email" required>
          </div>
          <div class="form-group">
            <label>رمزعبور</label>
            <input type="password" class="auth-input-password" required>
          </div>
          <button type="submit" class="btn-login">ورود</button>
        </form>
        <p class="auth-toggle">
          حساب ندارید؟ <a href="#" onclick="event.preventDefault(); location.reload()">ثبت نام کنید</a>
        </p>
      </div>
    </div>
  `;

  const getRegisterHTML = () => `
    <div class="auth-modal">
      <div class="auth-modal-content">
        <h2>ثبت نام</h2>
        <form class="auth-form">
          <div class="form-group">
            <label>ایمیل</label>
            <input type="email" class="auth-input-email" required>
          </div>
          <div class="form-group">
            <label>رمزعبور</label>
            <input type="password" class="auth-input-password" required>
            <small>حداقل 8 کاراکتر شامل حروف بزرگ، کوچک، عدد و نماد</small>
          </div>
          <button type="submit" class="btn-register">ثبت نام</button>
        </form>
        <p class="auth-toggle">
          حساب دارید؟ <a href="#" onclick="event.preventDefault(); location.reload()">وارد شوید</a>
        </p>
      </div>
    </div>
  `;

  const setupAuthListeners = (modal, mode) => {
    const form = modal.querySelector('.auth-form');
    const emailInput = modal.querySelector('.auth-input-email');
    const passwordInput = modal.querySelector('.auth-input-password');
    const submitBtn = mode === 'login' ? modal.querySelector('.btn-login') : modal.querySelector('.btn-register');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const email = emailInput.value.trim();
      const password = passwordInput.value;

      if (!email || !password) {
        showNotification('لطفاً تمام فیلدها را پر کنید', 'error');
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = mode === 'login' ? 'درحال ورود...' : 'درحال ثبت نام...';

      try {
        let response;
        if (mode === 'login') {
          response = await APIClient.auth.login(email, password);
        } else {
          response = await APIClient.auth.register(email, password);
          if (response.success) {
            showNotification('ثبت نام موفق! اکنون وارد شوید', 'success');
            setTimeout(() => location.reload(), 1500);
            return;
          }
        }

        if (response.success) {
          const { token, refreshToken } = response.data;
          APIClient.setToken(token, refreshToken);
          showNotification(`خوش آمدید ${email}!`, 'success');
          setTimeout(() => location.reload(), 1500);
        } else {
          showNotification(response.error || 'خطایی رخ داد', 'error');
        }
      } catch (error) {
        showNotification(error.message, 'error');
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = mode === 'login' ? 'ورود' : 'ثبت نام';
      }
    });

    // Close on background click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });
  };

  const checkAuthentication = async () => {
    if (!APIClient.isAuthenticated()) {
      // Determine if user has account
      const hasAccount = localStorage.getItem('userEmail');
      showAuthModal(hasAccount ? 'login' : 'register');
      return false;
    }

    try {
      const profile = await APIClient.auth.getProfile();
      if (profile.success) {
        localStorage.setItem('userEmail', profile.data.email);
        localStorage.setItem('userId', profile.data.id);
        return true;
      }
    } catch (error) {
      APIClient.logout();
      showAuthModal('login');
      return false;
    }
  };

  const logout = () => {
    APIClient.logout();
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userId');
    location.reload();
  };

  const getCurrentUser = () => ({
    email: localStorage.getItem('userEmail'),
    id: localStorage.getItem('userId'),
  });

  return {
    showAuthModal,
    checkAuthentication,
    logout,
    getCurrentUser,
  };
})();

// Export for use
window.AuthManager = AuthManager;
