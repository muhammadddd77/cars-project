// adminMain.js - Главный контроллер панели администратора / бизнес-кабинета (ES Module)

import { 
  getCars, 
  getCarById, 
  createCar, 
  updateCar, 
  deleteCar,
  getOrders,
  updateOrderStatus,
  deleteOrder,
  clearDoneOrders,
  getBusinessProfile,
  saveBusinessProfile
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
  showToast,
  renderOrdersTable,
  renderBusinessProfileBanner,
  fillProfileForm,
  getProfileFormData
} from './adminDom.js';

// Список всех авто и заказов в памяти
let adminCars = [];
let adminOrders = [];
let businessProfile = {};

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
      alert('Доступ запрещен. Эта страница только для администраторов и владельцев бизнес-аккаунтов!');
      window.location.href = '../index.html';
      return null;
    }

    const adminNameEl = document.getElementById('adminName');
    if (adminNameEl) {
      adminNameEl.textContent = user.name || 'Ganiev Muhammad';
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
      const text = `${car.brand || ''} ${car.model || ''} ${car.trim || ''}`.toLowerCase();
      if (!text.includes(query)) return false;
    }

    // 2. Селект по марке (Select Search)
    if (selectedBrand && car.brand && car.brand.toLowerCase() !== selectedBrand.toLowerCase()) {
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
    updateDashboardStats(adminCars, adminOrders);
    filterAdminCars();
  } catch (error) {
    console.error('Ошибка загрузки авто:', error);
    showToast('Ошибка загрузки данных', 'error');
  }
}

// Загрузка списка входящих заявок (Orders CRM)
async function loadOrders() {
  try {
    adminOrders = await getOrders();
    updateDashboardStats(adminCars, adminOrders);
    renderOrdersTable(adminOrders, {
      onStatusChange: handleOrderStatusChange,
      onDeleteOrder: handleDeleteOrder
    });
  } catch (error) {
    console.error('Ошибка загрузки заявок:', error);
  }
}

// Загрузка бизнес-профиля Ganiev Muhammad
async function loadProfile() {
  try {
    businessProfile = await getBusinessProfile();
    renderBusinessProfileBanner(businessProfile);
  } catch (error) {
    console.error('Ошибка загрузки профиля:', error);
  }
}

// Изменение статуса заявки
async function handleOrderStatusChange(orderId, newStatus) {
  try {
    adminOrders = await updateOrderStatus(orderId, newStatus);
    showToast(`Статус заявки обновлен: ${newStatus}`);
    renderOrdersTable(adminOrders, {
      onStatusChange: handleOrderStatusChange,
      onDeleteOrder: handleDeleteOrder
    });
    updateDashboardStats(adminCars, adminOrders);
  } catch (e) {
    showToast('Ошибка обновления статуса', 'error');
  }
}

// Удаление заявки
async function handleDeleteOrder(orderId) {
  if (!confirm('Удалить эту заявку?')) return;
  try {
    adminOrders = await deleteOrder(orderId);
    showToast('Заявка удалена');
    renderOrdersTable(adminOrders, {
      onStatusChange: handleOrderStatusChange,
      onDeleteOrder: handleDeleteOrder
    });
    updateDashboardStats(adminCars, adminOrders);
  } catch (e) {
    showToast('Ошибка удаления заявки', 'error');
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

// Обработка отправки формы авто (POST для добавления / PUT для обновления)
async function handleCarFormSubmit(e) {
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

// Сохранение бизнес-профиля Ganiev Muhammad ("svoyu info potom dobavlu")
async function handleProfileFormSubmit(e) {
  e.preventDefault();
  const formData = getProfileFormData();

  try {
    businessProfile = await saveBusinessProfile(formData);
    renderBusinessProfileBanner(businessProfile);
    closeModal('businessProfileModal');
    showToast('Бизнес-профиль успешно сохранен!');
  } catch (error) {
    console.error('Ошибка сохранения профиля:', error);
    showToast('Ошибка сохранения профиля', 'error');
  }
}

// Переключение вкладок CRM (Автопарк vs Заявки)
function setupTabs() {
  const tabCarsBtn = document.getElementById('tabCarsBtn');
  const tabOrdersBtn = document.getElementById('tabOrdersBtn');
  const carsSection = document.getElementById('carsTabSection');
  const ordersSection = document.getElementById('ordersTabSection');

  tabCarsBtn.addEventListener('click', () => {
    tabCarsBtn.classList.add('active');
    tabOrdersBtn.classList.remove('active');
    carsSection.style.display = 'block';
    ordersSection.style.display = 'none';
  });

  tabOrdersBtn.addEventListener('click', () => {
    tabOrdersBtn.classList.add('active');
    tabCarsBtn.classList.remove('active');
    carsSection.style.display = 'none';
    ordersSection.style.display = 'block';
  });
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
  const admin = checkAdminAuth();
  if (!admin) return;

  setupTheme();
  setupTabs();

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

  // Открытие модалки бизнес-профиля
  const openProfile = () => {
    fillProfileForm(businessProfile);
    openModal('businessProfileModal');
  };
  document.getElementById('btnOpenProfileModal').addEventListener('click', openProfile);
  document.getElementById('btnEditProfileBanner').addEventListener('click', openProfile);
  document.getElementById('adminUserBadge').addEventListener('click', openProfile);

  // Закрытие модалок
  document.getElementById('closeCarModalBtn').addEventListener('click', () => closeModal('carModal'));
  document.getElementById('cancelCarModalBtn').addEventListener('click', () => closeModal('carModal'));
  document.getElementById('closeAdminInfoModalBtn').addEventListener('click', () => closeModal('adminInfoModal'));
  document.getElementById('closeProfileModalBtn').addEventListener('click', () => closeModal('businessProfileModal'));
  document.getElementById('cancelProfileModalBtn').addEventListener('click', () => closeModal('businessProfileModal'));

  // Очистка завершенных заказов
  const clearOrdersBtn = document.getElementById('btnClearOrdersBtn');
  if (clearOrdersBtn) {
    clearOrdersBtn.addEventListener('click', async () => {
      adminOrders = await clearDoneOrders();
      renderOrdersTable(adminOrders, {
        onStatusChange: handleOrderStatusChange,
        onDeleteOrder: handleDeleteOrder
      });
      updateDashboardStats(adminCars, adminOrders);
      showToast('Завершенные заявки очищены');
    });
  }

  // Закрытие по клику вне модалки
  ['carModal', 'adminInfoModal', 'businessProfileModal'].forEach(modalId => {
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
      closeModal('businessProfileModal');
    }
  });

  // Обработка форм
  document.getElementById('carForm').addEventListener('submit', handleCarFormSubmit);
  document.getElementById('profileForm').addEventListener('submit', handleProfileFormSubmit);

  // Фильтры
  document.getElementById('adminSearchInput').addEventListener('input', filterAdminCars);
  document.getElementById('adminBrandSelect').addEventListener('change', filterAdminCars);
  document.getElementById('adminDayOfferOnly').addEventListener('change', filterAdminCars);
  document.getElementById('adminInStockOnly').addEventListener('change', filterAdminCars);

  // Начальная загрузка данных
  loadProfile();
  loadOrders();
  loadCars();
});
