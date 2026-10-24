// adminDom.js - Модуль манипуляций с DOM в панели администратора / бизнес-кабинете

export function formatMoney(num) {
  if (!num && num !== 0) return '0';
  return Number(num).toLocaleString('ru-RU');
}

// 1. Отрисовка таблицы автомобилей
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

// 2. Обновление карточек бизнес-статистики и счетчиков
export function updateDashboardStats(cars = [], orders = []) {
  const totalEl = document.getElementById('statTotalCars');
  const dayOffersEl = document.getElementById('statDayOffers');
  const inStockEl = document.getElementById('statInStock');
  const totalValueEl = document.getElementById('statTotalValue');
  const totalOrdersEl = document.getElementById('statTotalOrders');

  const tabCarsBadge = document.getElementById('tabCarsBadge');
  const tabOrdersBadge = document.getElementById('tabOrdersBadge');

  const total = cars.length;
  const dayOffers = cars.filter(c => c.isDayOffer).length;
  const inStock = cars.filter(c => c.inStock).length;
  const totalValue = cars.reduce((acc, c) => acc + Number(c.price || 0), 0);
  const totalOrders = orders.length;

  if (totalEl) totalEl.textContent = total;
  if (dayOffersEl) dayOffersEl.textContent = dayOffers;
  if (inStockEl) inStockEl.textContent = inStock;
  if (totalValueEl) totalValueEl.textContent = `${formatMoney(totalValue)} ₽`;
  if (totalOrdersEl) totalOrdersEl.textContent = totalOrders;

  if (tabCarsBadge) tabCarsBadge.textContent = total;
  if (tabOrdersBadge) tabOrdersBadge.textContent = totalOrders;
}

// 3. Отрисовка таблицы заказов и заявок (CRM)
export function renderOrdersTable(orders = [], handlers = {}) {
  const tbody = document.getElementById('ordersTableBody');
  if (!tbody) return;

  if (!orders || orders.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align: center; padding: 36px; color: var(--text-muted);">
          <div style="font-size: 28px; margin-bottom: 6px;">📝</div>
          <div style="font-weight: 600;">Входящих заявок пока нет</div>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = orders.map(ord => {
    let statusClass = 'badge-order-new';
    if (ord.status === 'В работе') statusClass = 'badge-order-process';
    if (ord.status === 'Завершена') statusClass = 'badge-order-done';

    return `
      <tr data-order-id="${ord.id}">
        <td style="font-size: 12px; color: var(--text-muted); white-space: nowrap;">
          ${ord.date || 'Сегодня'}
        </td>
        <td style="font-weight: 700; color: var(--text-main);">
          ${ord.clientName || 'Клиент'}
        </td>
        <td style="font-weight: 600; color: var(--primary);">
          ${ord.clientPhone || '—'}
        </td>
        <td>
          <div style="font-weight: 700;">${ord.carName || 'Автомобиль'}</div>
          <div style="font-size: 12px; color: var(--text-muted);">${formatMoney(ord.carPrice || 0)} ₽</div>
        </td>
        <td>
          <span style="font-size: 12px; font-weight: 700; background: var(--bg-subtle); padding: 3px 8px; border-radius: 6px;">
            ${ord.type || 'Заявка'}
          </span>
        </td>
        <td style="font-size: 12.5px; color: var(--text-muted); max-width: 220px;">
          ${ord.comment || '—'}
        </td>
        <td>
          <select class="select-filter order-status-select" data-id="${ord.id}" style="padding: 4px 8px; font-size: 12px; font-weight: 700; border-radius: 6px;">
            <option value="Новая" ${ord.status === 'Новая' ? 'selected' : ''}>🟡 Новая</option>
            <option value="В работе" ${ord.status === 'В работе' ? 'selected' : ''}>🔵 В работе</option>
            <option value="Завершена" ${ord.status === 'Завершена' ? 'selected' : ''}>🟢 Завершена</option>
          </select>
        </td>
        <td>
          <button type="button" class="btn-action btn-action-delete" data-action="delete-order" data-id="${ord.id}" title="Удалить заявку">
            🗑️ Удалить
          </button>
        </td>
      </tr>
    `;
  }).join('');

  // Обработчики статуса и удаления заказов
  tbody.querySelectorAll('.order-status-select').forEach(sel => {
    sel.addEventListener('change', () => {
      const id = sel.getAttribute('data-id');
      if (handlers.onStatusChange) handlers.onStatusChange(id, sel.value);
    });
  });

  tbody.querySelectorAll('[data-action="delete-order"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      if (handlers.onDeleteOrder) handlers.onDeleteOrder(id);
    });
  });
}

// 4. Отрисовка баннера бизнес-профиля (Ganiev Muhammad)
export function renderBusinessProfileBanner(profile = {}) {
  const compEl = document.getElementById('bannerCompanyName');
  const ownerEl = document.getElementById('bannerOwnerName');
  const phoneEl = document.getElementById('bannerPhone');
  const cityEl = document.getElementById('bannerCity');
  const hoursEl = document.getElementById('bannerHours');
  const avatarEl = document.getElementById('businessAvatar');
  const adminNameEl = document.getElementById('adminName');

  const owner = profile.owner || 'Ganiev Muhammad';
  const company = profile.company || 'AutoDealer Motors';

  if (compEl) compEl.textContent = company;
  if (ownerEl) ownerEl.textContent = owner;
  if (phoneEl) phoneEl.textContent = profile.phone || '+998 90 123 45 67';
  if (cityEl) cityEl.textContent = profile.city || 'г. Ташкент';
  if (hoursEl) hoursEl.textContent = profile.workingHours || '09:00 - 20:00';
  if (adminNameEl) adminNameEl.textContent = owner;

  if (avatarEl) {
    const initials = owner.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase();
    avatarEl.textContent = initials || 'GM';
  }
}

// 5. Заполнение модального окна профиля компании
export function fillProfileForm(profile = {}) {
  document.getElementById('profileOwnerInput').value = profile.owner || 'Ganiev Muhammad';
  document.getElementById('profileCompanyInput').value = profile.company || 'AutoDealer Motors';
  document.getElementById('profilePhoneInput').value = profile.phone || '+998 90 123 45 67';
  document.getElementById('profileEmailInput').value = profile.email || 'ganiev.muhammad@autodealer.uz';
  document.getElementById('profileCityInput').value = profile.city || 'г. Ташкент';
  document.getElementById('profileHoursInput').value = profile.workingHours || 'Пн-Вс: 09:00 - 20:00';
  document.getElementById('profileAddressInput').value = profile.address || 'ул. Сергели, 45, Автосалон AutoDealer';
  document.getElementById('profileDescInput').value = profile.description || 'Официальный дилерский центр продаж и обслуживания сертифицированных автомобилей.';
}

export function getProfileFormData() {
  return {
    owner: document.getElementById('profileOwnerInput').value.trim() || 'Ganiev Muhammad',
    company: document.getElementById('profileCompanyInput').value.trim() || 'AutoDealer Motors',
    phone: document.getElementById('profilePhoneInput').value.trim(),
    email: document.getElementById('profileEmailInput').value.trim(),
    city: document.getElementById('profileCityInput').value.trim(),
    workingHours: document.getElementById('profileHoursInput').value.trim(),
    address: document.getElementById('profileAddressInput').value.trim(),
    description: document.getElementById('profileDescInput').value.trim()
  };
}

// 6. Заполнение формы авто для редактирования (PUT)
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

  const transSelect = document.getElementById('transmissionSelect');
  if (car.transmission) {
    let exists = Array.from(transSelect.options).some(o => o.value === car.transmission);
    if (!exists) {
      const opt = document.createElement('option');
      opt.value = car.transmission;
      opt.textContent = car.transmission;
      transSelect.appendChild(opt);
    }
    transSelect.value = car.transmission;
  }

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

// 7. Сброс полей формы (для POST)
export function resetForm() {
  document.getElementById('modalFormTitle').textContent = 'Добавить автомобиль в автопарк';
  document.getElementById('carForm').reset();
  document.getElementById('carIdInput').value = '';
  document.getElementById('yearInput').value = 2024;
  document.getElementById('inStockCheckbox').checked = true;
}

// 8. Сбор данных из формы авто
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

// 9. Открытие / закрытие модальных окон
export function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.add('open');
}

export function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove('open');
}

// 10. Рендер детальной информации (INFO)
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

// 11. Показ Toast-уведомлений
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
