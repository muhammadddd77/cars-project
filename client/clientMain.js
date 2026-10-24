// clientMain.js - Главный контроллер клиентской страницы (ES Module)

import { getCars, getCarById, updateCarLikes, getDealerProfile, createOrder } from './clientApi.js';
import { 
  renderCarCards, 
  openInfoModal, 
  closeInfoModal, 
  openOrderModal,
  closeOrderModal,
  renderDealerStrip,
  showToast, 
  updateResultsCount, 
  updateFavoritesCount 
} from './clientDom.js';

// Определение относительных путей в зависимости от места загрузки (в корне index.html или в папке /client/client.html)
const isSubfolder = window.location.pathname.replace(/\\/g, '/').includes('/client/');
const LOGIN_PAGE_URL = isSubfolder ? '../login.html' : './login.html';
const ADMIN_PAGE_URL = isSubfolder ? '../admin/admin.html' : './admin/admin.html';

// Состояние приложения
let allCars = [];
let favorites = [];
let currentUser = null;

// Проверка авторизации
function checkAuth() {
  const userJson = localStorage.getItem('currentUser');
  if (!userJson) {
    window.location.href = LOGIN_PAGE_URL;
    return null;
  }

  try {
    const user = JSON.parse(userJson);
    currentUser = user;

    const userNameEl = document.getElementById('userName');
    if (userNameEl) userNameEl.textContent = user.name || user.username;

    // Если вошел админ / бизнес-аккаунт, показываем кнопку перехода в админку
    if (user.role === 'admin') {
      const adminLink = document.getElementById('adminLink');
      if (adminLink) {
        adminLink.href = ADMIN_PAGE_URL;
        adminLink.style.display = 'inline-flex';
      }
    }

    return user;
  } catch (e) {
    localStorage.removeItem('currentUser');
    window.location.href = LOGIN_PAGE_URL;
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

// Загрузка избранного из localStorage
function loadFavorites() {
  try {
    favorites = JSON.parse(localStorage.getItem('favorites')) || [];
  } catch (e) {
    favorites = [];
  }
  updateFavoritesCount(favorites.length);
}

// Переключение избранного (лайка)
async function handleToggleFavorite(carId) {
  const idStr = String(carId);
  const targetCar = allCars.find(c => String(c.id) === idStr);
  if (!targetCar) return;

  const index = favorites.indexOf(idStr);
  let newLikes = Number(targetCar.likes) || 0;

  if (index > -1) {
    favorites.splice(index, 1);
    newLikes = Math.max(0, newLikes - 1);
    showToast(`Удалено из избранного: ${targetCar.brand} ${targetCar.model}`);
  } else {
    favorites.push(idStr);
    newLikes += 1;
    showToast(`Добавлено в избранное: ${targetCar.brand} ${targetCar.model}`);
  }

  targetCar.likes = newLikes;
  localStorage.setItem('favorites', JSON.stringify(favorites));
  updateFavoritesCount(favorites.length);

  // Обновляем на сервере через API
  await updateCarLikes(idStr, newLikes);

  // Перерисовываем с учетом текущих фильтров
  applyFilters();
}

// Открытие модалки оформления заявки
function handleStartOrder(carId, defaultType = 'Резерв онлайн') {
  const car = allCars.find(c => String(c.id) === String(carId));
  if (!car) return;

  openOrderModal(car, currentUser || {}, async (orderData) => {
    try {
      await createOrder({
        ...orderData,
        type: orderData.type || defaultType
      });
      showToast(`Заявка на ${car.brand} ${car.model} успешно отправлена в салон!`);
    } catch (e) {
      showToast('Ошибка отправки заявки', 'error');
    }
  });
}

// Фильтрация и поиск (Search, Select Search, Checkbox)
function applyFilters() {
  const query = document.getElementById('searchInput').value.trim().toLowerCase();
  const selectedBrand = document.getElementById('brandSelect').value;
  const sortType = document.getElementById('sortSelect').value;
  const onlyDayOffer = document.getElementById('dayOfferCheckbox').checked;
  const onlyInStock = document.getElementById('inStockCheckbox').checked;
  const onlyKasko = document.getElementById('kaskoCheckbox').checked;

  let filtered = allCars.filter(car => {
    // 1. Поиск по тексту (Search)
    if (query) {
      const fullSearchText = `${car.brand || ''} ${car.model || ''} ${car.trim || ''} ${car.description || ''}`.toLowerCase();
      if (!fullSearchText.includes(query)) return false;
    }

    // 2. Фильтр по марке (Select Search)
    if (selectedBrand && car.brand && car.brand.toLowerCase() !== selectedBrand.toLowerCase()) {
      return false;
    }

    // 3. Чекбокс: Предложение дня
    if (onlyDayOffer && !car.isDayOffer) {
      return false;
    }

    // 4. Чекбокс: В наличии
    if (onlyInStock && !car.inStock) {
      return false;
    }

    // 5. Чекбокс: КАСКО в подарок
    if (onlyKasko && !car.kaskoGift) {
      return false;
    }

    return true;
  });

  // 6. Сортировка (Select Search)
  if (sortType === 'price-asc') {
    filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
  } else if (sortType === 'price-desc') {
    filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
  } else if (sortType === 'power-desc') {
    filtered.sort((a, b) => (b.horsepower || 0) - (a.horsepower || 0));
  }

  updateResultsCount(filtered.length);

  renderCarCards(filtered, favorites, {
    onToggleFavorite: handleToggleFavorite,
    onReserve: (id) => handleStartOrder(id, 'Резерв онлайн'),
    onBuy: (id) => handleStartOrder(id, 'Покупка автомобиля'),
    onDetails: async (id) => {
      const car = await getCarById(id);
      if (car) {
        openInfoModal(car, {
          onReserve: (resId) => handleStartOrder(resId, 'Резерв онлайн')
        });
      }
    }
  });
}

// Сброс фильтров
function resetFilters() {
  document.getElementById('searchInput').value = '';
  document.getElementById('brandSelect').value = '';
  document.getElementById('sortSelect').value = 'default';
  document.getElementById('dayOfferCheckbox').checked = false;
  document.getElementById('inStockCheckbox').checked = false;
  document.getElementById('kaskoCheckbox').checked = false;
  applyFilters();
}

// Инициализация страницы
async function init() {
  const user = checkAuth();
  if (!user) return;

  setupTheme();
  loadFavorites();

  // Загрузка плашки дилера (Ganiev Muhammad)
  try {
    const profile = await getDealerProfile();
    renderDealerStrip(profile);
  } catch (e) {}

  // Выход из системы
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('currentUser');
      window.location.href = LOGIN_PAGE_URL;
    });
  }

  // Привязка событий фильтрации
  document.getElementById('searchInput').addEventListener('input', applyFilters);
  document.getElementById('brandSelect').addEventListener('change', applyFilters);
  document.getElementById('sortSelect').addEventListener('change', applyFilters);
  document.getElementById('dayOfferCheckbox').addEventListener('change', applyFilters);
  document.getElementById('inStockCheckbox').addEventListener('change', applyFilters);
  document.getElementById('kaskoCheckbox').addEventListener('change', applyFilters);
  document.getElementById('resetFiltersBtn').addEventListener('click', resetFilters);

  // Закрытие модалок
  const closeModalBtn = document.getElementById('closeModalBtn');
  const detailsModal = document.getElementById('detailsModal');
  const closeOrderModalBtn = document.getElementById('closeOrderModalBtn');
  const orderModal = document.getElementById('orderModal');

  if (closeModalBtn) closeModalBtn.addEventListener('click', closeInfoModal);
  if (closeOrderModalBtn) closeOrderModalBtn.addEventListener('click', closeOrderModal);

  if (detailsModal) {
    detailsModal.addEventListener('click', (e) => {
      if (e.target === detailsModal) closeInfoModal();
    });
  }

  if (orderModal) {
    orderModal.addEventListener('click', (e) => {
      if (e.target === orderModal) closeOrderModal();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeInfoModal();
      closeOrderModal();
    }
  });

  // Загрузка автомобилей через axios GET
  try {
    allCars = await getCars();
    applyFilters();
  } catch (error) {
    console.error('Ошибка загрузки авто:', error);
  }
}

document.addEventListener('DOMContentLoaded', init);
