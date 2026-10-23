// adminDom.js - Модуль манипуляций с DOM в панели администратора

export function formatMoney(num) {
  if (!num && num !== 0) return '0';
  return Number(num).toLocaleString('ru-RU');
}

// Отрисовка таблицы автомобилей
export function renderCarsTable(cars, handlers = {}) {
  const tbody = document.getElementById('carsTableBody');
  if (!tbody) return;

  if (!cars || cars.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align: center; padding: 40px; color: var(--text-muted);">
          <div style="font-size: 32px; margin-bottom: 8px;">📭</div>
          <div style="font-weight: 600;">Автомобили не найдены</div>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = cars.map(car => `
    <tr data-car-id="${car.id}">
      <td>
        <img 
          src="${car.image || ''}" 
          alt="${car.brand} ${car.model}" 
          class="car-thumb"
          onerror="this.src='https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=700&q=80'"
        >
      </td>
      <td>
        <div style="font-weight: 700; color: var(--text-main);">${car.brand} ${car.model}</div>
        <div style="font-size: 12px; color: var(--text-muted);">${car.year || 2023} г. | ${car.color || 'Стандарт'}</div>
      </td>
      <td>
        <div style="font-weight: 600;">${car.trim}</div>
        <div style="font-size: 12px; color: var(--text-muted);">${car.horsepower || 0} л.с. | ${car.transmission || '—'}</div>
      </td>
      <td style="font-weight: 700; color: var(--text-main);">
        ${formatMoney(car.price)} ₽
      </td>
      <td style="color: var(--text-muted); font-size: 13px;">
        ${car.creditPrice ? `${formatMoney(car.creditPrice)} ₽` : '—'}
      </td>
      <td>
        <span class="badge-status ${car.inStock ? 'badge-in-stock' : 'badge-out-of-stock'}">
          ${car.inStock ? 'В наличии' : 'Под заказ'}
        </span>
      </td>
      <td>
        ${car.isDayOffer ? '<span class="badge-status badge-day-yes">🔥 Акция</span>' : '<span style="color: var(--text-muted); font-size: 12px;">—</span>'}
      </td>
      <td>
        <div class="action-buttons">
          <button type="button" class="btn-action" data-action="info" data-id="${car.id}" title="Просмотр информации">
            ℹ️ Инфо
          </button>
          <button type="button" class="btn-action btn-action-edit" data-action="edit" data-id="${car.id}" title="Редактировать авто">
            ✏️ Изменить
          </button>
          <button type="button" class="btn-action btn-action-delete" data-action="delete" data-id="${car.id}" title="Удалить авто">
            🗑️ Удалить
          </button>
        </div>
      </td>
    </tr>
  `).join('');

  // Привязка обработчиков событий
  attachTableEvents(tbody, handlers);
}

function attachTableEvents(tbody, handlers) {
  tbody.querySelectorAll('[data-action="info"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      if (handlers.onInfo) handlers.onInfo(id);
    });
  });

  tbody.querySelectorAll('[data-action="edit"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      if (handlers.onEdit) handlers.onEdit(id);
    });
  });

  tbody.querySelectorAll('[data-action="delete"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      if (handlers.onDelete) handlers.onDelete(id);
    });
  });
}

// Обновление карточек статистики
export function updateDashboardStats(cars = []) {
  const totalEl = document.getElementById('statTotalCars');
  const dayOffersEl = document.getElementById('statDayOffers');
  const inStockEl = document.getElementById('statInStock');
  const avgPriceEl = document.getElementById('statAvgPrice');

  const total = cars.length;
  const dayOffers = cars.filter(c => c.isDayOffer).length;
  const inStock = cars.filter(c => c.inStock).length;
  const avgPrice = total > 0 ? Math.round(cars.reduce((acc, c) => acc + Number(c.price || 0), 0) / total) : 0;

  if (totalEl) totalEl.textContent = total;
  if (dayOffersEl) dayOffersEl.textContent = dayOffers;
  if (inStockEl) inStockEl.textContent = inStock;
  if (avgPriceEl) avgPriceEl.textContent = `${formatMoney(avgPrice)} ₽`;
}

// Заполнение формы данными авто для редактирования (PUT)
export function fillForm(car) {
  document.getElementById('modalFormTitle').textContent = `Редактирование: ${car.brand} ${car.model}`;
  document.getElementById('carIdInput').value = car.id || '';
  document.getElementById('brandInput').value = car.brand || '';
  document.getElementById('modelInput').value = car.model || '';
  document.getElementById('trimInput').value = car.trim || '';
  document.getElementById('priceInput').value = car.price || '';
  document.getElementById('creditPriceInput').value = car.creditPrice || '';
  document.getElementById('discountInput').value = car.discount || '';
  document.getElementById('horsepowerInput').value = car.horsepower || '';
  document.getElementById('consumptionInput').value = car.consumption || '';
  document.getElementById('maxSpeedInput').value = car.maxSpeed || '';
  document.getElementById('accelerationInput').value = car.acceleration || '';
  document.getElementById('yearInput').value = car.year || 2023;
  document.getElementById('transmissionSelect').value = car.transmission || 'Автомат';
  document.getElementById('colorInput').value = car.color || '';
  document.getElementById('imageInput').value = car.image || '';
  document.getElementById('descriptionInput').value = car.description || '';

  // Чекбоксы
  document.getElementById('isDayOfferCheckbox').checked = Boolean(car.isDayOffer);
  document.getElementById('inStockCheckbox').checked = Boolean(car.inStock);
  document.getElementById('equipmentGiftCheckbox').checked = Boolean(car.equipmentGift);
  document.getElementById('kaskoGiftCheckbox').checked = Boolean(car.kaskoGift);
  document.getElementById('tiresGiftCheckbox').checked = Boolean(car.tiresGift);
}

// Сброс полей формы (для добавления нового авто POST)
export function resetForm() {
  document.getElementById('modalFormTitle').textContent = 'Добавить автомобиль';
  document.getElementById('carForm').reset();
  document.getElementById('carIdInput').value = '';
  document.getElementById('yearInput').value = 2024;
  document.getElementById('inStockCheckbox').checked = true;
}

// Сбор данных из формы в JS объект
export function getFormData() {
  return {
    brand: document.getElementById('brandInput').value.trim(),
    model: document.getElementById('modelInput').value.trim(),
    trim: document.getElementById('trimInput').value.trim(),
    price: Number(document.getElementById('priceInput').value) || 0,
    creditPrice: Number(document.getElementById('creditPriceInput').value) || 0,
    discount: Number(document.getElementById('discountInput').value) || 0,
    horsepower: Number(document.getElementById('horsepowerInput').value) || 0,
    consumption: document.getElementById('consumptionInput').value.trim() || '6.0 л/100км',
    maxSpeed: Number(document.getElementById('maxSpeedInput').value) || 200,
    acceleration: document.getElementById('accelerationInput').value.trim() || '9.5 с.',
    year: Number(document.getElementById('yearInput').value) || 2024,
    transmission: document.getElementById('transmissionSelect').value,
    color: document.getElementById('colorInput').value.trim() || 'Стандарт',
    image: document.getElementById('imageInput').value.trim(),
    description: document.getElementById('descriptionInput').value.trim(),
    isDayOffer: document.getElementById('isDayOfferCheckbox').checked,
    inStock: document.getElementById('inStockCheckbox').checked,
    equipmentGift: document.getElementById('equipmentGiftCheckbox').checked,
    kaskoGift: document.getElementById('kaskoGiftCheckbox').checked,
    tiresGift: document.getElementById('tiresGiftCheckbox').checked
  };
}

// Открытие модального окна
export function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.add('open');
}

// Закрытие модального окна
export function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove('open');
}

// Рендер детальной информации (info)
export function renderAdminInfo(car) {
  const body = document.getElementById('adminInfoModalBody');
  if (!body || !car) return;

  body.innerHTML = `
    <div style="text-align: center; margin-bottom: 16px;">
      <img 
        src="${car.image || ''}" 
        alt="${car.brand} ${car.model}" 
        style="max-width: 100%; max-height: 240px; border-radius: 12px; object-fit: cover;"
        onerror="this.src='https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=700&q=80'"
      >
    </div>
    <h3 style="font-size: 22px; font-weight: 800; margin-bottom: 4px;">${car.brand} ${car.model}</h3>
    <div style="color: var(--text-muted); font-size: 14px; margin-bottom: 14px;">${car.trim} (${car.year || 2024} г.)</div>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; background: var(--bg-subtle); padding: 14px; border-radius: 10px; margin-bottom: 14px; font-size: 13px;">
      <div><strong>Стоимость:</strong> ${formatMoney(car.price)} ₽</div>
      <div><strong>Кредит:</strong> от ${formatMoney(car.creditPrice)} ₽/мес.</div>
      <div><strong>Мощность:</strong> ${car.horsepower} л.с.</div>
      <div><strong>Расход:</strong> ${car.consumption}</div>
      <div><strong>Макс. скорость:</strong> ${car.maxSpeed} км/ч</div>
      <div><strong>Разгон 0-100:</strong> ${car.acceleration}</div>
      <div><strong>КПП:</strong> ${car.transmission}</div>
      <div><strong>Цвет:</strong> ${car.color}</div>
      <div><strong>В наличии:</strong> ${car.inStock ? 'Да' : 'Нет'}</div>
      <div><strong>Спецпредложение:</strong> ${car.isDayOffer ? 'Да' : 'Нет'}</div>
    </div>

    <p style="font-size: 13.5px; line-height: 1.5; color: var(--text-main); margin-bottom: 16px;">
      ${car.description || 'Описание отсутствует.'}
    </p>
  `;
  openModal('adminInfoModal');
}

// Показ уведомления Toast
export function showToast(message, type = 'success') {
  const toast = document.getElementById('toastBox');
  if (!toast) return;

  toast.textContent = message;
  toast.className = `toast-box ${type === 'error' ? 'toast-error' : ''}`;
  toast.style.display = 'block';

  setTimeout(() => {
    toast.style.display = 'none';
  }, 3200);
}
