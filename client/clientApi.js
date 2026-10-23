// clientApi.js - Модуль запросов к серверу для клиентской части через axios

const API_CARS_URL = 'http://localhost:3000/cars';
const LOCAL_STORAGE_CARS_KEY = 'autodealer_cars_cache';

// Резервный список авто на случай, если json-server не запущен
const FALLBACK_CARS = [
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
    description: "Skoda Octavia 1.6 MPI MT Active — практичный, безопасный и невероятно вместительный лифтбек. Проверенный надежный атмосферный двигатель 1.6 л в сочетании с надежной коробкой передач."
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
    description: "Топовая комплектация Style Plus. Динамичный двигатель 2.0 TSI, матричная оптика и полный комплекс электронных ассистентов водителя."
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
    description: "Элегантный и динамичный Volkswagen Polo Exclusive для ценителей немецкого комфорта и продуманной эргономики."
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
    description: "Легендарный японский комфорт, плавность хода и бескомпромиссная надежность в каждой детали."
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
    description: "Стильный спортивный седан с агрессивной светодиодной оптикой и богатым набором опций комфорта."
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
    description: "Надежный кроссовер для всей семьи с полным приводом и просторным салоном."
  }
];

// Получить список всех автомобилей (GET)
export async function getCars() {
  try {
    const response = await axios.get(API_CARS_URL, { timeout: 2500 });
    // Кэшируем для надежности
    localStorage.setItem(LOCAL_STORAGE_CARS_KEY, JSON.stringify(response.data));
    return response.data;
  } catch (error) {
    console.warn('Сервер недоступен, загружаются данные из кэша / fallback данных');
    const cached = localStorage.getItem(LOCAL_STORAGE_CARS_KEY);
    if (cached) {
      return JSON.parse(cached);
    }
    localStorage.setItem(LOCAL_STORAGE_CARS_KEY, JSON.stringify(FALLBACK_CARS));
    return FALLBACK_CARS;
  }
}

// Получить один автомобиль по id (GET)
export async function getCarById(id) {
  try {
    const response = await axios.get(`${API_CARS_URL}/${id}`, { timeout: 2500 });
    return response.data;
  } catch (error) {
    const cars = await getCars();
    return cars.find(car => String(car.id) === String(id));
  }
}

// Обновить количество лайков (PATCH / PUT)
export async function updateCarLikes(id, newLikes) {
  try {
    await axios.patch(`${API_CARS_URL}/${id}`, { likes: newLikes }, { timeout: 2500 });
  } catch (error) {
    // Обновляем локальный кэш, если сервер выключен
    const cached = localStorage.getItem(LOCAL_STORAGE_CARS_KEY);
    if (cached) {
      const list = JSON.parse(cached);
      const target = list.find(c => String(c.id) === String(id));
      if (target) {
        target.likes = newLikes;
        localStorage.setItem(LOCAL_STORAGE_CARS_KEY, JSON.stringify(list));
      }
    }
  }
}
