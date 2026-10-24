// clientDom.js - Модуль отрисовки DOM для клиентской витрины

// Форматирование чисел в денежный формат
export function formatMoney(num) {
  if (!num && num !== 0) return '0';
  return Number(num).toLocaleString('ru-RU');
}

// Рендер карточек автомобилей в сетку
export function renderCarCards(cars, favoritesList = [], handlers = {}) {
  const container = document.getElementById('carsGrid');
  if (!container) return;

  if (!cars || cars.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🚗🔍</div>
        <h3 style="font-size: 20px; font-weight: 700; margin-bottom: 8px;">Автомобили не найдены</h3>
        <p style="color: var(--text-muted); font-size: 14px;">Попробуйте изменить параметры поиска или сбросить фильтры.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = cars.map(car => {
    const isFav = favoritesList.includes(String(car.id));
    const likesCount = Number(car.likes) || 0;
    const likesDisplay = (likesCount < 10 && likesCount >= 0) ? `0${likesCount}` : `${likesCount}`;

    return `
      <article class="car-card" data-car-id="${car.id}">
        <!-- Верх: Название и избранное -->
        <div>
          <div class="card-header">
            <div class="car-title-group">
              <h2 class="car-brand-model">${car.brand} ${car.model}</h2>
              <div class="car-trim">${car.trim}</div>
            </div>
            <button 
              type="button" 
              class="btn-fav ${isFav ? 'active' : ''}" 
              data-id="${car.id}" 
              title="${isFav ? 'Удалить из избранного' : 'Добавить в избранное'}"
            >
              <svg viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
              <span>${likesDisplay}</span>
            </button>
          </div>

          <!-- Бейджи: Спецпредложение и выгода -->
          <div class="badges-row">
            ${car.isDayOffer ? '<span class="badge-day-offer">🔥 Предложение дня</span>' : ''}
            ${car.discount ? `<span class="badge-benefit">Выгода до ${formatMoney(car.discount)} ₽</span>` : ''}
          </div>

          <!-- Центр: Список подарков и фото автомобиля -->
          <div class="card-visual-row">
            <div class="gifts-list">
              ${car.equipmentGift ? `
                <div class="gift-item">
                  <span class="gift-icon-bubble">🎁</span>
                  <span>Оборудование в подарок</span>
                </div>
              ` : ''}
              ${car.kaskoGift ? `
                <div class="gift-item">
                  <span class="gift-icon-bubble">🛡️</span>
                  <span>КАСКО в подарок</span>
                </div>
              ` : ''}
              ${car.tiresGift ? `
                <div class="gift-item">
                  <span class="gift-icon-bubble">🛞</span>
                  <span>Комплект резины в подарок</span>
                </div>
              ` : ''}
            </div>

            <div class="car-image-container">
              <img 
                src="${car.image || 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=700&q=80'}" 
                alt="${car.brand} ${car.model}" 
                class="car-img" 
                loading="lazy"
                onerror="this.src='https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=700&q=80'"
              >
            </div>
          </div>
        </div>

        <!-- Низ: Стоимость, характеристики и 3 кнопки -->
        <div>
          <div class="pricing-row">
            <div class="price-main">от ${formatMoney(car.price)} ₽</div>
            <div class="price-credit">Кредит от ${formatMoney(car.creditPrice)} ₽/мес.</div>
          </div>

          <div class="specs-pills-row">
            <div class="spec-pill" title="Мощность двигателя">
              <span>🐎</span> ${car.horsepower || 0} л.с.
            </div>
            <div class="spec-pill" title="Расход топлива">
              <span>⛽</span> ${car.consumption || '—'}
            </div>
            <div class="spec-pill" title="Максимальная скорость">
              <span>⏲️</span> ${car.maxSpeed || 0} км/ч
            </div>
            <div class="spec-pill" title="Разгон до 100 км/ч">
              <span>⏱️</span> ${car.acceleration || '—'}
            </div>
          </div>

          <div class="actions-row">
            <button type="button" class="btn-card btn-reserve" data-action="reserve" data-id="${car.id}">
              Резерв онлайн
            </button>
            <button type="button" class="btn-card btn-buy" data-action="buy" data-id="${car.id}">
              Купить
            </button>
            <button type="button" class="btn-card btn-details" data-action="details" data-id="${car.id}">
              Подробнее
            </button>
          </div>
        </div>
      </article>
    `;
  }).join('');

  attachCardEvents(container, handlers);
}

// Привязка событий к карточкам
function attachCardEvents(container, handlers) {
  container.querySelectorAll('.btn-fav').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const carId = btn.getAttribute('data-id');
      if (handlers.onToggleFavorite) handlers.onToggleFavorite(carId);
    });
  });

  container.querySelectorAll('[data-action="reserve"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const carId = btn.getAttribute('data-id');
      if (handlers.onReserve) handlers.onReserve(carId);
    });
  });

  container.querySelectorAll('[data-action="buy"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const carId = btn.getAttribute('data-id');
      if (handlers.onBuy) handlers.onBuy(carId);
    });
  });

  container.querySelectorAll('[data-action="details"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const carId = btn.getAttribute('data-id');
      if (handlers.onDetails) handlers.onDetails(carId);
    });
  });
}

// Отображение плашки официального дилера
export function renderDealerStrip(profile = {}) {
  const strip = document.getElementById('dealerStrip');
  if (!strip) return;

  const owner = profile.owner || 'Ganiev Muhammad';
  const company = profile.company || 'AutoDealer Motors';
  const phone = profile.phone || '+998 90 123 45 67';
  const city = profile.city || 'г. Ташкент';

  strip.innerHTML = `
    <div class="dealer-strip-info">
      <span class="dealer-tag-business">🏢 БИЗНЕС-АККАУНТ ДИЛЕРА</span>
      <span>Официальный дилер: <strong>${owner}</strong> (${company})</span>
      <span>📞 ${phone}</span>
      <span>📍 ${city}</span>
    </div>
    <div style="font-size: 12px; color: var(--text-muted);">
      ✅ Сертифицированные авто с гарантией
    </div>
  `;
}

// Отображение модального окна подробной информации (info)
export function openInfoModal(car, handlers = {}) {
  const modal = document.getElementById('detailsModal');
  const modalBody = document.getElementById('modalBody');
  if (!modal || !modalBody || !car) return;

  modalBody.innerHTML = `
    <img 
      src="${car.image || ''}" 
      alt="${car.brand} ${car.model}" 
      class="modal-car-img"
      onerror="this.src='https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=700&q=80'"
    >
    <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 6px;">
      <h2 class="modal-title">${car.brand} ${car.model}</h2>
      ${car.isDayOffer ? '<span class="badge-day-offer" style="font-size: 13px;">🔥 Предложение дня</span>' : ''}
    </div>
    <div class="modal-trim">${car.trim} (${car.year || 2024} г.в.)</div>

    <div class="modal-specs-grid">
      <div class="modal-spec-item">
        <div class="modal-spec-label">Мощность двигателя</div>
        <div class="modal-spec-value">🐎 ${car.horsepower} л.с.</div>
      </div>
      <div class="modal-spec-item">
        <div class="modal-spec-label">Расход топлива</div>
        <div class="modal-spec-value">⛽ ${car.consumption}</div>
      </div>
      <div class="modal-spec-item">
        <div class="modal-spec-label">Максимальная скорость</div>
        <div class="modal-spec-value">⏲️ ${car.maxSpeed} км/ч</div>
      </div>
      <div class="modal-spec-item">
        <div class="modal-spec-label">Разгон 0-100 км/ч</div>
        <div class="modal-spec-value">⏱️ ${car.acceleration}</div>
      </div>
      <div class="modal-spec-item">
        <div class="modal-spec-label">Коробка передач</div>
        <div class="modal-spec-value">⚙️ ${car.transmission || 'Автомат'}</div>
      </div>
      <div class="modal-spec-item">
        <div class="modal-spec-label">Тип топлива / Цвет</div>
        <div class="modal-spec-value">🎨 ${car.fuel || 'Бензин'} / ${car.color || 'Стандарт'}</div>
      </div>
    </div>

    <!-- Подарки к авто -->
    <div style="margin-bottom: 18px;">
      <h4 style="font-size: 14px; font-weight: 700; margin-bottom: 8px;">Включенные подарки и бонусы:</h4>
      <div style="display: flex; flex-direction: column; gap: 6px;">
        ${car.equipmentGift ? '<div style="font-size: 13px;">🎁 Оборудование в подарок установленное у дилера</div>' : ''}
        ${car.kaskoGift ? '<div style="font-size: 13px;">🛡️ Полис КАСКО на 1 год в подарок</div>' : ''}
        ${car.tiresGift ? '<div style="font-size: 13px;">🛞 Комплект премиальной сезонной резины</div>' : ''}
      </div>
    </div>

    <!-- Описание -->
    <p class="modal-description">${car.description || 'Надежный, комфортный и проверенный автомобиль в дилерском центре с полной гарантией.'}</p>

    <!-- Подвал модалки -->
    <div class="modal-footer">
      <div>
        <div style="font-size: 12px; color: var(--text-muted);">Итоговая стоимость:</div>
        <div class="modal-price-big">от ${formatMoney(car.price)} ₽</div>
        <div style="font-size: 13px; color: var(--text-muted);">Кредит от ${formatMoney(car.creditPrice)} ₽/мес.</div>
      </div>

      <div style="display: flex; gap: 10px;">
        <button type="button" id="modalReserveBtn" class="btn-card btn-reserve" style="padding: 10px 18px;">
          Забронировать онлайн
        </button>
      </div>
    </div>
  `;

  const modalReserveBtn = document.getElementById('modalReserveBtn');
  if (modalReserveBtn) {
    modalReserveBtn.addEventListener('click', () => {
      closeInfoModal();
      if (handlers.onReserve) handlers.onReserve(car.id);
    });
  }

  modal.classList.add('open');
}

export function closeInfoModal() {
  const modal = document.getElementById('detailsModal');
  if (modal) modal.classList.remove('open');
}

// Отображение модального окна заявки (Order Modal)
export function openOrderModal(car, user = {}, onSubmitOrder) {
  const modal = document.getElementById('orderModal');
  const body = document.getElementById('orderModalBody');
  if (!modal || !body || !car) return;

  body.innerHTML = `
    <div class="order-car-preview">
      <img src="${car.image || ''}" alt="${car.brand} ${car.model}" onerror="this.src='https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=700&q=80'">
      <div>
        <div style="font-weight: 800; font-size: 16px;">${car.brand} ${car.model}</div>
        <div style="font-size: 12px; color: var(--text-muted);">${car.trim}</div>
        <div style="font-weight: 700; color: var(--primary-red); margin-top: 4px;">${formatMoney(car.price)} ₽</div>
      </div>
    </div>

    <form id="orderFormSubmit" class="order-modal-form">
      <div class="order-form-group">
        <label for="orderClientName">Ваше имя *</label>
        <input type="text" id="orderClientName" class="order-form-input" value="${user.name || ''}" placeholder="Иван Иванов" required>
      </div>

      <div class="order-form-group">
        <label for="orderClientPhone">Номер телефона для связи *</label>
        <input type="tel" id="orderClientPhone" class="order-form-input" value="${user.phone || ''}" placeholder="+998 90 123 45 67" required>
      </div>

      <div class="order-form-group">
        <label for="orderDealType">Желаемый формат сделки</label>
        <select id="orderDealType" class="order-form-select">
          <option value="Резерв онлайн">Резерв онлайн на 3 дня</option>
          <option value="Покупка автомобиля">Прямая покупка в салоне</option>
          <option value="Автокредит">Покупка в кредит / рассрочку</option>
          <option value="Тест-драйв">Запись на тест-драйв</option>
        </select>
      </div>

      <div class="order-form-group">
        <label for="orderComment">Комментарий или пожелания</label>
        <textarea id="orderComment" class="order-form-textarea" rows="2" placeholder="Например: удобное время для звонка..."></textarea>
      </div>

      <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 10px;">
        <button type="button" id="cancelOrderModalBtn" class="btn-card" style="background: var(--bg-subtle); color: var(--text-main);">Отмена</button>
        <button type="submit" class="btn-card btn-buy">Отправить заявку</button>
      </div>
    </form>
  `;

  document.getElementById('cancelOrderModalBtn').addEventListener('click', closeOrderModal);

  document.getElementById('orderFormSubmit').addEventListener('submit', (e) => {
    e.preventDefault();
    const orderData = {
      carId: String(car.id),
      carName: `${car.brand} ${car.model}`,
      carPrice: Number(car.price) || 0,
      clientName: document.getElementById('orderClientName').value.trim(),
      clientPhone: document.getElementById('orderClientPhone').value.trim(),
      type: document.getElementById('orderDealType').value,
      comment: document.getElementById('orderComment').value.trim()
    };
    closeOrderModal();
    if (onSubmitOrder) onSubmitOrder(orderData);
  });

  modal.classList.add('open');
}

export function closeOrderModal() {
  const modal = document.getElementById('orderModal');
  if (modal) modal.classList.remove('open');
}

// Показ всплывающего уведомления (Toast)
export function showToast(message) {
  const toast = document.getElementById('toastBox');
  if (!toast) return;

  toast.textContent = message;
  toast.style.display = 'block';

  setTimeout(() => {
    toast.style.display = 'none';
  }, 3200);
}

// Обновление счетчиков
export function updateResultsCount(count) {
  const el = document.getElementById('resultsCount');
  if (el) el.textContent = `Найдено: ${count} авто`;
}

export function updateFavoritesCount(count) {
  const el = document.getElementById('favCount');
  if (el) el.textContent = count;
}
