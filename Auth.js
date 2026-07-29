// ===== ระบบสมาชิก (Supabase Auth) =====
const SUPABASE_URL = 'https://wvvcphoffxunpbkgjihz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind2dmNwaG9mZnh1bnBia2dqaWh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUzMDUyNzQsImV4cCI6MjEwMDg4MTI3NH0.r321PfixvUJAbM14ngGfR424cINyhTRmOhUdaW0YAxg';

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const authWidget = document.getElementById('authWidget');
const authModalOverlay = document.getElementById('authModalOverlay');
const authModalClose = document.getElementById('authModalClose');
const authTabs = document.querySelectorAll('.auth-tab');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const loginError = document.getElementById('loginError');
const signupError = document.getElementById('signupError');
const signupSuccess = document.getElementById('signupSuccess');

function openAuthModal(tab) {
  if (!authModalOverlay) return;
  authModalOverlay.classList.add('open');
  switchAuthTab(tab || 'login');
}

function closeAuthModal() {
  if (!authModalOverlay) return;
  authModalOverlay.classList.remove('open');
  if (loginError) loginError.textContent = '';
  if (signupError) signupError.textContent = '';
  if (signupSuccess) signupSuccess.textContent = '';
}

function switchAuthTab(tab) {
  authTabs.forEach(btn => btn.classList.toggle('active', btn.dataset.tab === tab));
  if (loginForm) loginForm.style.display = tab === 'login' ? 'flex' : 'none';
  if (signupForm) signupForm.style.display = tab === 'signup' ? 'flex' : 'none';
}

function bindAuthTrigger() {
  const trigger = document.getElementById('authTrigger');
  if (trigger) {
    trigger.addEventListener('click', () => openAuthModal('login'));
  }
}
bindAuthTrigger();

if (authModalClose) {
  authModalClose.addEventListener('click', closeAuthModal);
}
if (authModalOverlay) {
  authModalOverlay.addEventListener('click', (e) => {
    if (e.target === authModalOverlay) closeAuthModal();
  });
}
authTabs.forEach(btn => {
  btn.addEventListener('click', () => switchAuthTab(btn.dataset.tab));
});

function renderAuthWidget(user) {
  if (!authWidget) return;

  if (user) {
    const name = (user.user_metadata && user.user_metadata.full_name) ? user.user_metadata.full_name : user.email;
    authWidget.innerHTML = `
      <div class="user-chip">
        <span class="user-name">${name}</span>
        <button type="button" class="logout-btn" id="logoutBtn">ออกจากระบบ</button>
      </div>
    `;
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', async () => {
        await supabaseClient.auth.signOut();
      });
    }
  } else {
    authWidget.innerHTML = `<button type="button" class="nav-cta" id="authTrigger">เข้าสู่ระบบ</button>`;
    bindAuthTrigger();
  }
}

if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    loginError.textContent = '';
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
    if (error) {
      loginError.textContent = 'เข้าสู่ระบบไม่สำเร็จ: อีเมลหรือรหัสผ่านไม่ถูกต้อง';
      return;
    }
    closeAuthModal();
    loginForm.reset();
  });
}

if (signupForm) {
  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    signupError.textContent = '';
    signupSuccess.textContent = '';

    const name = document.getElementById('signupName').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value;

    if (password.length < 6) {
      signupError.textContent = 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร';
      return;
    }

    const { error } = await supabaseClient.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } }
    });

    if (error) {
      signupError.textContent = 'สมัครสมาชิกไม่สำเร็จ: ' + error.message;
      return;
    }

    signupSuccess.textContent = 'สมัครสำเร็จ! กรุณายืนยันอีเมล (เช็คกล่องจดหมาย) ก่อนเข้าสู่ระบบ';
    signupForm.reset();
  });
}

// เช็คสถานะล็อกอินตอนโหลดหน้า + คอยฟังการเปลี่ยนแปลงสถานะ (login/logout/token refresh)
supabaseClient.auth.getSession().then(({ data }) => {
  renderAuthWidget(data.session ? data.session.user : null);
});

supabaseClient.auth.onAuthStateChange((_event, session) => {
  renderAuthWidget(session ? session.user : null);
});