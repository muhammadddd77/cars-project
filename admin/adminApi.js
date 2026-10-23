// adminApi.js - Модуль API запросов для администратора через axios (GET, POST, PUT, DELETE)

const API_CARS_URL = 'http://localhost:3000/cars';
const LOCAL_STORAGE_CARS_KEY = 'autodealer_cars_cache';

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
    horsepower: 115,
    consumption: "5.3 л/100км",
    maxSpeed: 189,
    acceleration: "10.3 с.",
    image: "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=700&q=80",
    inStock: true,
    likes: 0,
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
    likes: 2,
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
    likes: 5,
    year: 2024,
    transmission: "Автомат",
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
    color: "Серебристый",
    description: "Практичный семейный кроссовер с полным приводом."
  }
];

// Вспомогательные функции для работы с локальным кэшем
function getLocalCache() {
  const cached = localStorage.getItem(LOCAL_STORAGE_CARS_KEY);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch (e) {
      // ошибка парсинга
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
  try {
    const response = await axios.post(API_CARS_URL, carData, { timeout: 2500 });
    // обновляем кэш
    const cache = getLocalCache();
    cache.push(response.data);
    setLocalCache(cache);
    return response.data;
  } catch (error) {
    console.warn('Сервер недоступен, сохранено в localStorage');
    const cache = getLocalCache();
    const newCar = {
      ...carData,
      id: String(Date.now()),
      likes: 0
    };
    cache.push(newCar);
    setLocalCache(cache);
    return newCar;
  }
}

// 4. PUT - Полное обновление существующего авто
export async function updateCar(id, carData) {
  try {
    const response = await axios.put(`${API_CARS_URL}/${id}`, carData, { timeout: 2500 });
    const cache = getLocalCache();
    const index = cache.findIndex(c => String(c.id) === String(id));
    if (index !== -1) {
      cache[index] = response.data;
      setLocalCache(cache);
    }
    return response.data;
  } catch (error) {
    console.warn('Сервер недоступен, обновлено в localStorage');
    const cache = getLocalCache();
    const index = cache.findIndex(c => String(c.id) === String(id));
    const updated = { ...carData, id: String(id) };
    if (index !== -1) {
      cache[index] = updated;
    } else {
      cache.push(updated);
    }
    setLocalCache(cache);
    return updated;
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
