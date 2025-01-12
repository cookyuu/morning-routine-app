import { useState, useEffect } from "react";
import { getWeatherList } from "../services/weatherService";
import { Weather } from "../types/WeatherTypes";

const useWeather = () => {
  const [weatherList, setWeatherList] = useState<Weather[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchWeather = async () => {
      setLoading(true);
      const data = await getWeatherList();
      setWeatherList(data);
      setLoading(false);
    };

    fetchWeather();
  }, []);

  return { weatherList, loading };
};

export default useWeather;
