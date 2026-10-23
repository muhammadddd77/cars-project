// adminMain.js - Главный контроллер панели администратора (ES Module)

import { 
  getCars, 
  getCarById, 
  createCar, 
  updateCar, 
  deleteCar 
} from './adminApi.js';

import { 
  renderCarsTable, 
  updateDashboardStats, 
  fillForm, 
  resetForm, 
  getFormData, 
  openModal, 
  closeModal, 
  renderAdminInfo, 
  showToast 
} from './adminDom.js';

// Список всех авто в памяти
let adminCars = [];

// Проверка прав администратора
function checkAdminAuth() {
  const userJson = localStorage.getItem('currentUser');
  if (!userJson) {
    window.location.href = '../login.html';
    return null;
  }

  try {
    const user = JSON.parse(userJson);
    if (user.role !== 'admin') {
      alert('Доступ запрещен. Эта страница только для администраторов!');
      window.location.href = '../client/client.html';
      return null;
    }

    const adminNameEl = document.getElementById('adminName');
    if (adminNameEl) {
      adminNameEl.textContent = user.name || user.username;
    }
    return user;
  } catch (e) {
    localStorage.removeItem('currentUser');
    window.location.href = '../login.html';
    return null;
  }
}

// Управление темой (Dark / Light)
function setupTheme() {
  const theme = localStorage.getItem('theme') || 'light';
  applyTheme(theme);

  const themeBtn = document.getElementById('themeToggleBtn');
  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const isDark = document.body.classList.contains('dark-theme');
      const next = isDark ? 'light' : 'dark';
      applyTheme(next);
      localStorage.setItem('theme', next);
    });
  }
}

function applyTheme(theme) {
  const icon = document.getElementById('themeIcon');
  if (theme === 'dark') {
    document.body.classList.add('dark-theme');
    if (icon) icon.textContent = '☀️';
  } else {
    document.body.classList.remove('dark-theme');
    if (icon) icon.textContent = '🌙';
  }
}

// Фильтрация таблицы (Search, Select Search, Checkbox)
function filterAdminCars() {
  const query = document.getElementById('adminSearchInput').value.trim().toLowerCase();
  const selectedBrand = document.getElementById('adminBrandSelect').value;
  const dayOfferOnly = document.getElementById('adminDayOfferOnly').checked;
  const inStockOnly = document.getElementById('adminInStockOnly').checked;

  const filtered = adminCars.filter(car => {
    // 1. Поиск по тексту (Search)
    if (query) {
      const text = `${car.brand} ${car.model} ${car.trim}`.toLowerCase();
      if (!text.includes(query)) return false;
    }

    // 2. Селект по марке (Select Search)
    if (selectedBrand && car.brand.toLowerCase() !== selectedBrand.toLowerCase()) {
      return false;
    }

    // 3. Чекбокс: Только предложения дня
    if (dayOfferOnly && !car.isDayOffer) {
      return false;
    }

    // 4. Чекбокс: Только в наличии
    if (inStockOnly && !car.inStock) {
      return false;
    }

    return true;
  });

  renderCarsTable(filtered, {
    onInfo: handleInfoCar,
    onEdit: handleEditCar,
    onDelete: handleDeleteCar
  });
}

// Загрузка списка авто (GET)
async function loadCars() {
  try {
    adminCars = await getCars();
    updateDashboardStats(adminCars);
    filterAdminCars();
  } catch (error) {
    console.error('Ошибка загрузки авто:', error);
    showToast('Ошибка загрузки данных', 'error');
  }
}

// Обработка кнопки "Инфо" (INFO)
async function handleInfoCar(id) {
  const car = await getCarById(id);
  if (car) {
    renderAdminInfo(car);
  }
}

// Обработка кнопки "Редактировать" (Подготовка к PUT)
async function handleEditCar(id) {
  const car = await getCarById(id);
  if (car) {
    fillForm(car);
    openModal('carModal');
  }
}

// Обработка кнопки "Удалить" (DELETE)
async function handleDeleteCar(id) {
  const car = adminCars.find(c => String(c.id) === String(id));
  const carName = car ? `${car.brand} ${car.model}` : 'автомобиль';

  if (!confirm(`Вы действительно хотите удалить ${carName} из базы?`)) {
    return;
  }

  try {
    await deleteCar(id);
    showToast(`${carName} успешно удален!`);
    await loadCars();
  } catch (error) {
    console.error('Ошибка при удалении:', error);
    showToast('Не удалось удалить автомобиль', 'error');
  }
}

// Обработка отправки формы (POST для добавления / PUT для обновления)
async function handleFormSubmit(e) {
  e.preventDefault();
  const carId = document.getElementById('carIdInput').value;
  const formData = getFormData();

  try {
    if (carId) {
      // Режим обновления (PUT)
      await updateCar(carId, formData);
      showToast(`Автомобиль ${formData.brand} ${formData.model} обновлен!`);
    } else {
      // Режим добавления (POST)
      await createCar(formData);
      showToast(`Автомобиль ${formData.brand} ${formData.model} добавлен!`);
    }

    closeModal('carModal');
    resetForm();
    await loadCars();
  } catch (error) {
    console.error('Ошибка сохранения:', error);
    showToast('Ошибка при сохранении данных', 'error');
  }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
  const admin = checkAdminAuth();
  if (!admin) return;

  setupTheme();

  // Выход из системы
  document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('currentUser');
    window.location.href = '../login.html';
  });

  // Открытие модалки добавления (POST)
  document.getElementById('openAddModalBtn').addEventListener('click', () => {
    resetForm();
    openModal('carModal');
  });

  // Закрытие модалок
  document.getElementById('closeCarModalBtn').addEventListener('click', () => closeModal('carModal'));
  document.getElementById('cancelCarModalBtn').addEventListener('click', () => closeModal('carModal'));
  document.getElementById('closeAdminInfoModalBtn').addEventListener('click', () => closeModal('adminInfoModal'));

  // Закрытие по клику вне модалки
  ['carModal', 'adminInfoModal'].forEach(modalId => {
    const modalEl = document.getElementById(modalId);
    if (modalEl) {
      modalEl.addEventListener('click', (e) => {
        if (e.target === modalEl) closeModal(modalId);
      });
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal('carModal');
      closeModal('adminInfoModal');
    }
  });

  // Обработка формы
  document.getElementById('carForm').addEventListener('submit', handleFormSubmit);

  // Фильтры
  document.getElementById('adminSearchInput').addEventListener('input', filterAdminCars);
  document.getElementById('adminBrandSelect').addEventListener('change', filterAdminCars);
  document.getElementById('adminDayOfferOnly').addEventListener('change', filterAdminCars);
  document.getElementById('adminInStockOnly').addEventListener('change', filterAdminCars);

  // Начальная загрузка
  loadCars();
});
