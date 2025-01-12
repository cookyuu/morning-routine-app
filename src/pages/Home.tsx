import React, { useEffect, useState } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import '../styles/Home.css';

interface DraggableItem {
  id: string;
  component: JSX.Element;
}

const Home: React.FC = () => {
  // Define the sections
  const [sections, setSections] = useState<DraggableItem[]>([
    { id: 'weather', component: <WeatherSection /> },
    { id: 'stocks', component: <StocksSection /> },
  ]);

  // Handle drag and drop reordering
  const moveSection = (dragIndex: number, hoverIndex: number) => {
    const updatedSections = [...sections];
    const [removed] = updatedSections.splice(dragIndex, 1);
    updatedSections.splice(hoverIndex, 0, removed);
    setSections(updatedSections);
  };

  // 현재 날짜 포맷팅 함수
  const formatDate = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const weekDay = ['일', '월', '화', '수', '목', '금', '토'][date.getDay()];
    
    return `${year}.${month}.${day} (${weekDay})`;
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="home">
        <h1>{formatDate()}</h1>
        <div className="sections">
          {sections.map((section, index) => (
            <DraggableSection
              key={section.id}
              index={index}
              id={section.id}
              moveSection={moveSection}
            >
              {section.component}
            </DraggableSection>
          ))}
        </div>
      </div>
    </DndProvider>
  );
};

// 위경도를 기상청 격자 좌표로 변환하는 함수
const convertToGrid = (lat: number, lon: number) => {
  const RE = 6371.00877; // 지구 반경(km)
  const GRID = 5.0; // 격자 간격(km)
  const SLAT1 = 30.0; // 투영 위도1(degree)
  const SLAT2 = 60.0; // 투영 위도2(degree)
  const OLON = 126.0; // 기준점 경도(degree)
  const OLAT = 38.0; // 기준점 위도(degree)
  const XO = 43; // 기준점 X좌표(GRID)
  const YO = 136; // 기준점 Y좌표(GRID)

  const DEGRAD = Math.PI / 180.0;
  const re = RE / GRID;
  const slat1 = SLAT1 * DEGRAD;
  const slat2 = SLAT2 * DEGRAD;
  const olon = OLON * DEGRAD;
  const olat = OLAT * DEGRAD;

  let sn = Math.tan(Math.PI * 0.25 + slat2 * 0.5) / Math.tan(Math.PI * 0.25 + slat1 * 0.5);
  sn = Math.log(Math.cos(slat1) / Math.cos(slat2)) / Math.log(sn);
  let sf = Math.tan(Math.PI * 0.25 + slat1 * 0.5);
  sf = Math.pow(sf, sn) * Math.cos(slat1) / sn;
  let ro = Math.tan(Math.PI * 0.25 + olat * 0.5);
  ro = re * sf / Math.pow(ro, sn);

  let ra = Math.tan(Math.PI * 0.25 + (lat) * DEGRAD * 0.5);
  ra = re * sf / Math.pow(ra, sn);
  let theta = lon * DEGRAD - olon;
  if (theta > Math.PI) theta -= 2.0 * Math.PI;
  if (theta < -Math.PI) theta += 2.0 * Math.PI;
  theta *= sn;

  let x = Math.floor(ra * Math.sin(theta) + XO + 0.5);
  let y = Math.floor(ro - ra * Math.cos(theta) + YO + 0.5);

  return { x, y };
};

// Weather section
interface WeatherInfo {
    baseTime: string;
    pcp: string;
    pop: string;
    pty: string;
    reh: string;
    sky: string;
    sno: string;
    tmn: string;
    tmp: string;
    tmx: string;
    uuu: string;
    vec: string;
    vvv: string;
    wav: string;
    wsd: string;
}

interface WeatherData {
  code: string;
  data: {
    baseDate: string;
    regionCode: string;
    regionFullName: string;
    weatherInfoList: WeatherInfo[];
  }
}

// 날씨 카테고리 정보를 위한 인터페이스
interface WeatherCategory {
  name: string;
  unit: string;
}




const WeatherSection: React.FC = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [location, setLocation] = useState<{lat: number; lon: number} | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 날씨 카테고리 매핑  
  const WEATHER_CATEGORIES: { [key: string]: WeatherCategory } = {
    TMP: { name: "온도", unit: "°C" },
    UUU: { name: "풍속(동서)", unit: "m/s" },
    VVV: { name: "풍속(남북)", unit: "m/s" },
    VEC: { name: "풍향", unit: "deg" },
    WSD: { name: "풍속", unit: "m/s" },
    SKY: { name: "하늘상태", unit: "" },
    PTY: { name: "강수형태", unit: "" },
    POP: { name: "강수확률", unit: "%" },
    WAV: { name: "파고", unit: "M" },
    PCP: { name: "강수량", unit: "mm" },
    REH: { name: "습도", unit: "%" },
    SNO: { name: "적설량", unit: "cm" },
    TMX: { name: "최고기온", unit: "°C" },
    TMN: { name: "최저기온", unit: "°C" }
  };

  // 날짜 시간 포맷팅 함수 추가
  const formatDateTime = (date: string, time: string) => {
    const year = date.substring(0, 4);
    const month = date.substring(4, 6);
    const day = date.substring(6, 8);
    const hour = time.substring(0, 2);
    const minute = time.substring(2, 4);

    return `${year}-${month}-${day} ${hour}:${minute}`;
  };

  // 현재 위치 가져오기
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          console.log('현재 위치:', { lat, lon });
          setLocation({ lat, lon });
        },
        (error) => {
          console.error('위치 정보 에러:', error.message);
          setError("위치 정보를 가져올 수 없습니다.");
          setLoading(false);
        }
      );
    } else {
      setError("이 브라우저는 위치 정보를 지원하지 않습니다.");
      setLoading(false);
    }
  }, []);

  // 위치 정보가 있을 때 날씨 API 호출
  useEffect(() => {
    const fetchWeather = async () => {
      if (!location) return;

      // 위경도를 기상청 격자 좌표로 변환
      const grid = convertToGrid(location.lat, location.lon);
      console.log('격자 좌표 (x,y):', grid);

      try {
        const response = await fetch(
          `http://localhost:19596/api/weather?x=${grid.x}&y=${grid.y}`
        );
        if (!response.ok) {
          throw new Error('날씨 정보를 가져오는데 실패했습니다.');
        }
        const data = await response.json();
        console.log('날씨 데이터:', data);
        setWeather(data);
      } catch (err) {
        console.error('API 에러:', err);
        setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [location]);

  // 현재 시간에 따른 인덱스 결정 함수
  const getCurrentTimeIndex = () => {
    const now = new Date();
    const currentHour = now.getHours();
    
    // 05시 이전이면 전날 23시 데이터 사용
    if (currentHour < 5) {
      return weather?.data.weatherInfoList.findIndex(info => info.baseTime === '2300') ?? 0;
    }
    
    // 05시 이후면 현재 시간의 데이터 사용
    const currentTimeStr = String(currentHour).padStart(2, '0') + '00';
    return weather?.data.weatherInfoList.findIndex(info => info.baseTime === currentTimeStr) ?? 0;
  };

  if (loading) {
    return (
      <div className="section weather-section">
        <h2>현재 날씨</h2>
        <p>날씨 정보를 불러오는 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="section weather-section">
        <h2>현재 날씨</h2>
        <p className="error">{error}</p>
      </div>
    );
  }

  return (
    <div className="section weather-section">
      <h2>현재 날씨</h2>
      {weather && (
        <div className="weather-info">
          <div className="weather-header">
            <p>{weather.data.regionFullName}</p>
            <p className="datetime">
              {formatDateTime(weather.data.baseDate, weather.data.weatherInfoList[getCurrentTimeIndex()].baseTime)}
            </p>
          </div>
          <div className="weather-main-info">
            <div className="temperature">
              <span className="temp-value">
                {weather.data.weatherInfoList[getCurrentTimeIndex()].tmp}°C
              </span>
              <div className="temp-range">
                <span>최고 {weather.data.weatherInfoList[getCurrentTimeIndex()].tmx}°C</span>
                <span>최저 {weather.data.weatherInfoList[getCurrentTimeIndex()].tmn}°C</span>
              </div>
            </div>
            <div className="weather-sub-info">
              <div className="info-item">
                <span>습도 {weather.data.weatherInfoList[getCurrentTimeIndex()].reh}%</span>
                <span>강수확률 {weather.data.weatherInfoList[getCurrentTimeIndex()].pop}%</span>
              </div>
              <div className="info-item">
                <span>풍속 {weather.data.weatherInfoList[getCurrentTimeIndex()].wsd}m/s</span>
                <span>강수량 {weather.data.weatherInfoList[getCurrentTimeIndex()].pcp}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Stocks section
const StocksSection: React.FC = () => {
  const stocks = [
    { name: 'Apple', price: 154.65 },
    { name: 'Google', price: 2804.25 },
    { name: 'Amazon', price: 3446.57 },
    { name: 'Tesla', price: 762.32 },
    { name: 'Microsoft', price: 299.87 },
  ];

  return (
    <div className="section stocks-section">
      <h2>관심목록 주식</h2>
      <ul>
        {stocks.map((stock, index) => (
          <li key={index}>
            {stock.name}: ${stock.price.toFixed(2)}
          </li>
        ))}
      </ul>
    </div>
  );
};

// Draggable wrapper
interface DraggableSectionProps {
  id: string;
  index: number;
  moveSection: (dragIndex: number, hoverIndex: number) => void;
  children: React.ReactNode;
}

const DraggableSection: React.FC<DraggableSectionProps> = ({
  id,
  index,
  moveSection,
  children,
}) => {
  const [, ref] = useDrop({
    accept: 'SECTION',
    hover: (item: { index: number }) => {
      if (item.index !== index) {
        moveSection(item.index, index);
        item.index = index;
      }
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: 'SECTION',
    item: { id, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <div
      ref={(node) => drag(ref(node))}
      className={`draggable-section ${isDragging ? 'dragging' : ''}`}
    >
      {children}
    </div>
  );
};

export default Home;
