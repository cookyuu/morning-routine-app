export interface Weather {
    city: string;
    temperature: number;
    condition: string;
    icon: string;
  }
  
  export interface WeatherDetails extends Weather {
    humidity: number;
    windSpeed: number;
  }