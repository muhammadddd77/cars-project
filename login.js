// login.js - Авторизация с использованием axios и localStorage

const API_USERS_URL = 'http://localhost:3000/users';

// Запасные пользователи на случай, если json-server еще не запущен
const FALLBACK_USERS = [
  { 
    id: '1', 
    username: 'admin', 
    password: '123', 
    name: 'Ganiev Muhammad', 
    role: 'admin',
    accountType: 'business',
    company: 'AutoDealer Motors',
    phone: '+998 90 123 45 67',
    email: 'ganiev.muhammad@autodealer.uz',
    address: 'г. Ташкент, автосалон AutoDealer',
    description: 'Официальный бизнес-аккаунт руководителя автосалона'
  },
  { 
    id: '2', 
    username: 'client', 
    password: '123', 
    name: 'Иван Иванов', 
    role: 'client' 
  },
  { 
    id: '3', 
    username: 'ganiev', 
    password: '123', 
    name: 'Ganiev Muhammad', 
    role: 'admin',
    accountType: 'business',
    company: 'AutoDealer Motors',
    phone: '+998 90 123 45 67',
    email: 'ganiev.muhammad@autodealer.uz',
    address: 'г. Ташкент, автосалон AutoDealer',
    description: 'Официальный бизнес-аккаунт руководителя автосалона'
  }
];

// Инициализация темы
function initTheme() {
  const savedTheme = localStorage.getItem('theme') || 'light';
  applyTheme(savedTheme);

  const themeBtn = document.getElementById('themeToggleBtn');
  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const isDark = document.body.classList.contains('dark-theme');
      const nextTheme = isDark ? 'light' : 'dark';
      applyTheme(nextTheme);
      localStorage.setItem('theme', nextTheme);
    });
  }
}

function applyTheme(theme) {
  const icon = document.getElementById('themeIcon');
  const label = document.getElementById('themeLabel');
  if (theme === 'dark') {
    document.body.classList.add('dark-theme');
    if (icon) icon.textContent = '☀️';
    if (label) label.textContent = 'Светлая тема';
  } else {
    document.body.classList.remove('dark-theme');
    if (icon) icon.textContent = '🌙';
    if (label) label.textContent = 'Темная тема';
  }
}

// Получение списка пользователей через axios
async function fetchUsers() {
  try {
    const response = await axios.get(API_USERS_URL, { timeout: 2000 });
    return response.data;
  } catch (error) {
    console.warn('Сервер json-server недоступен на localhost:3000, используется локальная база пользователей.');
    return FALLBACK_USERS;
  }
}

// Показ сообщения об ошибке
function showAlert(message) {
  const alertBox = document.getElementById('alertBox');
  if (alertBox) {
    alertBox.textContent = message;
    alertBox.style.display = 'block';
  }
}

function hideAlert() {
  const alertBox = document.getElementById('alertBox');
  if (alertBox) {
    alertBox.style.display = 'none';
  }
}

// Проверка сессии при открытии
function checkExistingSession() {
  const currentUserStr = localStorage.getItem('currentUser');
  if (currentUserStr) {
    try {
      const user = JSON.parse(currentUserStr);
      if (user.role === 'admin') {
        window.location.href = './admin/admin.html';
      } else if (user.role === 'client') {
        window.location.href = './index.html';
      }
    } catch (e) {
      localStorage.removeItem('currentUser');
    }
  }
}

// Обработка авторизации
async function handleLogin(username, password) {
  hideAlert();
  const users = await fetchUsers();

  const user = users.find(
    u => u.username.trim().toLowerCase() === username.trim().toLowerCase() && u.password === password
  );

  if (!user) {
    showAlert('Неверный логин или пароль!');
    return;
  }

  // Сохраняем пользователя в localStorage со всеми полями бизнес-аккаунта
  localStorage.setItem('currentUser', JSON.stringify({
    id: user.id,
    username: user.username,
    name: user.name,
    role: user.role,
    accountType: user.accountType || (user.role === 'admin' ? 'business' : 'personal'),
    company: user.company || 'AutoDealer Motors',
    phone: user.phone || '+998 90 123 45 67',
    email: user.email || 'ganiev.muhammad@autodealer.uz',
    address: user.address || 'г. Ташкент, автосалон AutoDealer',
    description: user.description || 'Официальный бизнес-аккаунт автодилера'
  }));

  // Перенаправление по роли
  if (user.role === 'admin') {
    window.location.href = './admin/admin.html';
  } else {
    window.location.href = './index.html';
  }
}

// Инициализация страницы
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  checkExistingSession();

  const loginForm = document.getElementById('loginForm');
  const usernameInput = document.getElementById('usernameInput');
  const passwordInput = document.getElementById('passwordInput');

  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    handleLogin(usernameInput.value, passwordInput.value);
  });

  // Быстрые кнопки для удобства проверки
  document.getElementById('btnAdminQuick').addEventListener('click', () => {
    usernameInput.value = 'admin';
    passwordInput.value = '123';
    handleLogin('admin', '123');
  });

  document.getElementById('btnClientQuick').addEventListener('click', () => {
    usernameInput.value = 'client';
    passwordInput.value = '123';
    handleLogin('client', '123');
  });
});
