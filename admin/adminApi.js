// adminApi.js - Модуль API запросов для администратора через axios (GET, POST, PUT, DELETE)

const API_CARS_URL = 'http://localhost:3000/cars';
const API_ORDERS_URL = 'http://localhost:3000/orders';
const API_PROFILE_URL = 'http://localhost:3000/profile';

const LOCAL_STORAGE_CARS_KEY = 'autodealer_cars_cache';
const LOCAL_STORAGE_ORDERS_KEY = 'autodealer_orders';
const LOCAL_STORAGE_PROFILE_KEY = 'autodealer_business_profile';

// Резервный список авто для автономного режима
const DEFAULT_CARS = [
  {
    id: "1",
    brand: "Skoda",
    model: "Octavia",
    trim: "1.6 MPI MT Active",
    price: 1615000,
    creditPrice: 115000,
    discount: 300000,
    isDayOffer: true,
    equipmentGift: true,
    kaskoGift: true,
    tiresGift: true,
    horsepower: 132,
    consumption: "5.3 л/100км",
    maxSpeed: 189,
    acceleration: "10.3 с.",
    image: "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=700&q=80",
    inStock: true,
    likes: 3,
    year: 2023,
    transmission: "Механика",
    fuel: "Бензин",
    color: "Черный металлик",
    description: "Skoda Octavia 1.6 MPI MT Active — практичный, безопасный и невероятно вместительный лифтбек."
  },
  {
    id: "2",
    brand: "Skoda",
    model: "Octavia",
    trim: "2.0 TSI DSG Style Plus",
    price: 2450000,
    creditPrice: 145000,
    discount: 250000,
    isDayOffer: true,
    equipmentGift: true,
    kaskoGift: true,
    tiresGift: false,
    horsepower: 190,
    consumption: "6.2 л/100км",
    maxSpeed: 235,
    acceleration: "7.4 с.",
    image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=700&q=80",
    inStock: true,
    likes: 5,
    year: 2024,
    transmission: "Робот (DSG)",
    fuel: "Бензин",
    color: "Серый графит",
    description: "Топовая комплектация Style Plus с матричной оптикой и премиальной отделкой салона."
  },
  {
    id: "3",
    brand: "Volkswagen",
    model: "Polo",
    trim: "1.4 TSI DSG Exclusive",
    price: 1490000,
    creditPrice: 98000,
    discount: 180000,
    isDayOffer: false,
    equipmentGift: true,
    kaskoGift: false,
    tiresGift: true,
    horsepower: 125,
    consumption: "5.7 л/100км",
    maxSpeed: 204,
    acceleration: "9.0 с.",
    image: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=700&q=80",
    inStock: true,
    likes: 1,
    year: 2023,
    transmission: "Робот (DSG)",
    fuel: "Бензин",
    color: "Белый перламутр",
    description: "Элегантный и динамичный лифтбек для города."
  },
  {
    id: "4",
    brand: "Toyota",
    model: "Camry",
    trim: "2.5 AT Prestige Safety",
    price: 3100000,
    creditPrice: 185000,
    discount: 350000,
    isDayOffer: true,
    equipmentGift: true,
    kaskoGift: true,
    tiresGift: true,
    horsepower: 200,
    consumption: "7.1 л/100км",
    maxSpeed: 210,
    acceleration: "8.7 с.",
    image: "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&w=700&q=80",
    inStock: true,
    likes: 8,
    year: 2024,
    transmission: "Автомат (8 ст.)",
    fuel: "Бензин",
    color: "Черный",
    description: "Бизнес-класс с бескомпромиссным уровнем комфорта."
  },
  {
    id: "5",
    brand: "Kia",
    model: "K5",
    trim: "2.0 AT Style",
    price: 2290000,
    creditPrice: 135000,
    discount: 200000,
    isDayOffer: false,
    equipmentGift: false,
    kaskoGift: true,
    tiresGift: true,
    horsepower: 150,
    consumption: "7.2 л/100км",
    maxSpeed: 210,
    acceleration: "10.6 с.",
    image: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=700&q=80",
    inStock: true,
    likes: 3,
    year: 2023,
    transmission: "Автомат",
    fuel: "Бензин",
    color: "Темно-синий",
    description: "Стильный спортивный седан с богатым пакетом опций."
  },
  {
    id: "6",
    brand: "Hyundai",
    model: "Tucson",
    trim: "2.0 AT 4WD Lifestyle",
    price: 2850000,
    creditPrice: 165000,
    discount: 220000,
    isDayOffer: true,
    equipmentGift: true,
    kaskoGift: false,
    tiresGift: true,
    horsepower: 150,
    consumption: "7.9 л/100км",
    maxSpeed: 181,
    acceleration: "11.1 с.",
    image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=700&q=80",
    inStock: false,
    likes: 4,
    year: 2024,
    transmission: "Автомат",
    fuel: "Бензин",
    color: "Серебристый металлик",
    description: "Практичный семейный кроссовер с полным приводом."
  }
];

// Дефолтный профиль Ganiev Muhammad
const DEFAULT_BUSINESS_PROFILE = {
  owner: "Ganiev Muhammad",
  company: "AutoDealer Motors",
  phone: "+998 90 123 45 67",
  email: "ganiev.muhammad@autodealer.uz",
  city: "г. Ташкент",
  address: "ул. Сергели, 45, Автосалон AutoDealer",
  workingHours: "Пн-Вс: 09:00 - 20:00",
  description: "Официальный дилерский центр продаж и обслуживания сертифицированных автомобилей.",
  verified: true
};

// Дефолтные заявки
const DEFAULT_ORDERS = [
  {
    id: "ord-1",
    carId: "1",
    carName: "Skoda Octavia 1.6 MPI",
    carPrice: 1615000,
    clientName: "Иван Иванов",
    clientPhone: "+998 91 555-44-33",
    type: "Резерв онлайн",
    status: "Новая",
    date: "23.10.2026, 19:40",
    comment: "Интересует покупка в кредит на 3 года"
  },
  {
    id: "ord-2",
    carId: "4",
    carName: "Toyota Camry 2.5 AT",
    carPrice: 3100000,
    clientName: "Рустам Каримов",
    clientPhone: "+998 93 777-88-99",
    type: "Покупка",
    status: "В работе",
    date: "23.10.2026, 20:15",
    comment: "Готов приехать на тест-драйв завтра в 11:00"
  }
];

// Вспомогательные функции для кэша авто
function getLocalCache() {
  const cached = localStorage.getItem(LOCAL_STORAGE_CARS_KEY);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch (e) {
      // ignore
    }
  }
  localStorage.setItem(LOCAL_STORAGE_CARS_KEY, JSON.stringify(DEFAULT_CARS));
  return DEFAULT_CARS;
}

function setLocalCache(cars) {
  localStorage.setItem(LOCAL_STORAGE_CARS_KEY, JSON.stringify(cars));
}

// 1. GET - Получение всех автомобилей
export async function getCars() {
  try {
    const response = await axios.get(API_CARS_URL, { timeout: 2500 });
    setLocalCache(response.data);
    return response.data;
  } catch (error) {
    console.warn('Сервер недоступен, данные получены из localStorage:', error.message);
    return getLocalCache();
  }
}

// 2. GET by ID - Получение одного авто по ID (info)
export async function getCarById(id) {
  try {
    const response = await axios.get(`${API_CARS_URL}/${id}`, { timeout: 2500 });
    return response.data;
  } catch (error) {
    const cache = getLocalCache();
    return cache.find(c => String(c.id) === String(id)) || null;
  }
}

// 3. POST - Создание нового авто
export async function createCar(carData) {
  const carWithDefaults = {
    ...carData,
    likes: 0
  };

  try {
    const response = await axios.post(API_CARS_URL, carWithDefaults, { timeout: 2500 });
    const cache = getLocalCache();
    cache.push(response.data);
    setLocalCache(cache);
    return response.data;
  } catch (error) {
    console.warn('Сервер недоступен, сохранено в localStorage');
    const cache = getLocalCache();
    const newCar = {
      ...carWithDefaults,
      id: String(Date.now())
    };
    cache.push(newCar);
    setLocalCache(cache);
    return newCar;
  }
}

// 4. PUT - Полное обновление существующего авто
export async function updateCar(id, carData) {
  const cache = getLocalCache();
  const existing = cache.find(c => String(c.id) === String(id)) || {};
  
  const payload = {
    ...existing,
    ...carData,
    id: String(id),
    likes: existing.likes || 0
  };

  try {
    const response = await axios.put(`${API_CARS_URL}/${id}`, payload, { timeout: 2500 });
    const index = cache.findIndex(c => String(c.id) === String(id));
    if (index !== -1) {
      cache[index] = response.data;
      setLocalCache(cache);
    }
    return response.data;
  } catch (error) {
    console.warn('Сервер недоступен, обновлено в localStorage');
    const index = cache.findIndex(c => String(c.id) === String(id));
    if (index !== -1) {
      cache[index] = payload;
    } else {
      cache.push(payload);
    }
    setLocalCache(cache);
    return payload;
  }
}

// 5. DELETE - Удаление авто по ID
export async function deleteCar(id) {
  try {
    await axios.delete(`${API_CARS_URL}/${id}`, { timeout: 2500 });
    const cache = getLocalCache();
    const filtered = cache.filter(c => String(c.id) !== String(id));
    setLocalCache(filtered);
    return true;
  } catch (error) {
    console.warn('Сервер недоступен, удалено из localStorage');
    const cache = getLocalCache();
    const filtered = cache.filter(c => String(c.id) !== String(id));
    setLocalCache(filtered);
    return true;
  }
}

// ============================================================================
// УПРАВЛЕНИЕ ЗАЯВКАМИ КЛИЕНТОВ (ORDERS / LEADS)
// ============================================================================

export async function getOrders() {
  try {
    const response = await axios.get(API_ORDERS_URL, { timeout: 2000 });
    localStorage.setItem(LOCAL_STORAGE_ORDERS_KEY, JSON.stringify(response.data));
    return response.data;
  } catch (e) {
    const stored = localStorage.getItem(LOCAL_STORAGE_ORDERS_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (err) {}
    }
    localStorage.setItem(LOCAL_STORAGE_ORDERS_KEY, JSON.stringify(DEFAULT_ORDERS));
    return DEFAULT_ORDERS;
  }
}

export async function updateOrderStatus(orderId, newStatus) {
  const orders = await getOrders();
  const order = orders.find(o => String(o.id) === String(orderId));
  if (order) {
    order.status = newStatus;
  }
  localStorage.setItem(LOCAL_STORAGE_ORDERS_KEY, JSON.stringify(orders));

  try {
    await axios.patch(`${API_ORDERS_URL}/${orderId}`, { status: newStatus }, { timeout: 2000 });
  } catch (e) {
    // offline fallback handled via localStorage
  }
  return orders;
}

export async function deleteOrder(orderId) {
  let orders = await getOrders();
  orders = orders.filter(o => String(o.id) !== String(orderId));
  localStorage.setItem(LOCAL_STORAGE_ORDERS_KEY, JSON.stringify(orders));

  try {
    await axios.delete(`${API_ORDERS_URL}/${orderId}`, { timeout: 2000 });
  } catch (e) {}
  return orders;
}

export async function clearDoneOrders() {
  let orders = await getOrders();
  orders = orders.filter(o => o.status !== 'Завершена');
  localStorage.setItem(LOCAL_STORAGE_ORDERS_KEY, JSON.stringify(orders));
  return orders;
}

// ============================================================================
// УПРАВЛЕНИЕ БИЗНЕС-ПРОФИЛЕМ (BUSINESS PROFILE GANIEV MUHAMMAD)
// ============================================================================

export async function getBusinessProfile() {
  try {
    const response = await axios.get(API_PROFILE_URL, { timeout: 2000 });
    localStorage.setItem(LOCAL_STORAGE_PROFILE_KEY, JSON.stringify(response.data));
    return response.data;
  } catch (e) {
    const stored = localStorage.getItem(LOCAL_STORAGE_PROFILE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (err) {}
    }
    // Также проверим currentUser
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        if (u.name) {
          const profile = {
            ...DEFAULT_BUSINESS_PROFILE,
            owner: u.name,
            company: u.company || DEFAULT_BUSINESS_PROFILE.company,
            phone: u.phone || DEFAULT_BUSINESS_PROFILE.phone,
            email: u.email || DEFAULT_BUSINESS_PROFILE.email,
            address: u.address || DEFAULT_BUSINESS_PROFILE.address
          };
          localStorage.setItem(LOCAL_STORAGE_PROFILE_KEY, JSON.stringify(profile));
          return profile;
        }
      } catch (err) {}
    }

    localStorage.setItem(LOCAL_STORAGE_PROFILE_KEY, JSON.stringify(DEFAULT_BUSINESS_PROFILE));
    return DEFAULT_BUSINESS_PROFILE;
  }
}

export async function saveBusinessProfile(profileData) {
  const profile = {
    ...DEFAULT_BUSINESS_PROFILE,
    ...profileData,
    verified: true
  };
  localStorage.setItem(LOCAL_STORAGE_PROFILE_KEY, JSON.stringify(profile));

  // Синхронизируем с currentUser
  const userStr = localStorage.getItem('currentUser');
  if (userStr) {
    try {
      const u = JSON.parse(userStr);
      u.name = profile.owner;
      u.company = profile.company;
      u.phone = profile.phone;
      u.email = profile.email;
      u.address = profile.address;
      localStorage.setItem('currentUser', JSON.stringify(u));
    } catch (e) {}
  }

  try {
    await axios.put(API_PROFILE_URL, profile, { timeout: 2000 });
  } catch (e) {}

  return profile;
}
