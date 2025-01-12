import { Weather, WeatherDetails } from "../types/WeatherTypes";

const mockWeatherData: Weather[] = [
  { city: "Seoul", temperature: 12, condition: "Cloudy", icon: "/cloudy.png" },
  { city: "New York", temperature: 7, condition: "Sunny", icon: "/sunny.png" },
  { city: "Tokyo", temperature: 15, condition: "Rainy", icon: "/rainy.png" },
];

const mockWeatherDetail: WeatherDetails = {
  city: "Seoul",
  temperature: 12,
  condition: "Cloudy",
  icon: "/cloudy.png",
  humidity: 65,
  windSpeed: 5,
};

export const getWeatherList = async (): Promise<Weather[]> => {
  return new Promise((resolve) => setTimeout(() => resolve(mockWeatherData), 1000));
};

export const getWeatherDetails = async (city: string): Promise<WeatherDetails> => {
  return new Promise((resolve) => setTimeout(() => resolve(mockWeatherDetail), 1000));
};
