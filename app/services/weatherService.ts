const API_KEY = 'a8fe3125fdca88ccbc2a42423a7e4a5d';
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

export interface WeatherData {
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  location: string;
  icon: string;
}

export const getWeatherByCoords = async (latitude: number, longitude: number): Promise<WeatherData> => {
  try {
    const response = await fetch(
      `${BASE_URL}/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${API_KEY}`
    );
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch weather data');
    }

    return {
      temperature: Math.round(data.main.temp),
      condition: data.weather[0].main,
      humidity: data.main.humidity,
      windSpeed: data.wind.speed,
      location: data.name,
      icon: data.weather[0].icon,
    };
  } catch (error) {
    console.error('Weather fetch error:', error);
    throw error;
  }
};

export const getWeatherByCity = async (city: string): Promise<WeatherData> => {
  try {
    const response = await fetch(
      `${BASE_URL}/weather?q=${city}&units=metric&appid=${API_KEY}`
    );
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch weather data');
    }

    return {
      temperature: Math.round(data.main.temp),
      condition: data.weather[0].main,
      humidity: data.main.humidity,
      windSpeed: data.wind.speed,
      location: data.name,
      icon: data.weather[0].icon,
    };
  } catch (error) {
    console.error('Weather fetch error:', error);
    throw error;
  }
};

const weatherService = {
  getWeatherByCoords,
  getWeatherByCity,
};

export default weatherService; 