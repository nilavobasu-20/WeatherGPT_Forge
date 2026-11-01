import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Link, Route, Routes, useNavigate, useParams } from 'react-router-dom';

type OccupationKey = 'farmer' | 'marine' | 'aviation' | 'others';

type WeatherApiResponse = {
  name: string;
  sys: { country: string; sunrise: number; sunset: number };
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
    pressure: number;
    temp_min: number;
    temp_max: number;
  };
  weather: Array<{ main: string; description: string; icon: string }>;
  wind: { speed: number; deg: number };
  clouds: { all: number };
  coord: { lon: number; lat: number };
};

type OccupationProfile = {
  title: string;
  subtitle: string;
  icon: string;
  accent: string;
  defaultCity: string;
  suggestions: string[];
};

const occupationProfiles: Record<OccupationKey, OccupationProfile> = {
  farmer: {
    title: 'Farmer',
    subtitle: 'Crop and field intelligence',
    icon: '🌾',
    accent: '#8bd66c',
    defaultCity: 'Nashik',
    suggestions: [
      'Rain probability for the next 12 hours',
      'Soil drying and irrigation timing',
      'Wind conditions for spraying',
      'Temperature thresholds for crop stress',
    ],
  },
  marine: {
    title: 'Fisherman / Marine',
    subtitle: 'Ocean safety and sea state',
    icon: '🌊',
    accent: '#5ac6ff',
    defaultCity: 'Goa',
    suggestions: [
      'Wave height and swell trends',
      'Strong wind alert windows',
      'Fishing route safety guidance',
      'Storm and lightning risk outlook',
    ],
  },
  aviation: {
    title: 'Aviation Personnel',
    subtitle: 'Flight readiness and visibility',
    icon: '✈️',
    accent: '#9d8cff',
    defaultCity: 'Delhi',
    suggestions: [
      'Visibility and ceiling conditions',
      'Turbulence and icing risk',
      'Crosswind and runway impact',
      'Departure and arrival planning guidance',
    ],
  },
  others: {
    title: 'Others',
    subtitle: 'Daily weather guidance',
    icon: '☀️',
    accent: '#ffc863',
    defaultCity: 'Bengaluru',
    suggestions: [
      'Comfort and outdoor activity planning',
      'Travel and commute guidance',
      'Air quality and temperature advises',
      'Personal preparation for the day',
    ],
  },
};

const apiKey = import.meta.env.VITE_WEATHER_API_KEY as string | undefined;

function App() {
  return (
    <Routes>
      <Route path="/" element={<OccupationSelector />} />
      <Route path="/:occupation" element={<OccupationPage />} />
    </Routes>
  );
}

function OccupationSelector() {
  const navigate = useNavigate();

  const cards = useMemo(
    () =>
      (Object.entries(occupationProfiles) as Array<[OccupationKey, OccupationProfile]>).map(
        ([key, value]) => ({ key, ...value }),
      ),
    [],
  );

  return (
    <div className="app-shell">
      <div className="selection-container">
        <div className="glow glow-one" />
        <div className="glow glow-two" />

        <header className="topbar">
          <div className="brand">
            <span className="brand-mark">W</span>
            <span>Weather GPT</span>
          </div>
          <div className="tag">Personalized weather intelligence</div>
        </header>

        <main className="hero">
          <div className="hero-copy">
            <p className="eyebrow">AI-powered weather guidance</p>
            <h1>Weather insights tailored for your work.</h1>
            <p className="subcopy">
              Select your profession and receive specialized weather guidance, risk alerts,
              and AI-powered planning recommendations designed around your daily decisions.
            </p>
          </div>

          <div className="occupation-grid">
            {cards.map((item) => (
              <button
                key={item.key}
                type="button"
                className="occupation-card"
                onClick={() => navigate(`/${item.key}`)}
                style={{ ['--accent' as string]: item.accent }}
              >
                <div className="card-icon">{item.icon}</div>
                <div className="card-copy">
                  <h3>{item.title}</h3>
                  <p>{item.subtitle}</p>
                </div>
                <div className="arrow">→</div>
              </button>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}

function OccupationPage() {
  const { occupation } = useParams<{ occupation?: string }>();
  const safeOccupation = (occupation as OccupationKey | undefined) ?? 'others';
  const profile = occupationProfiles[safeOccupation] ?? occupationProfiles.others;

  const [city, setCity] = useState(profile.defaultCity);
  const [weather, setWeather] = useState<WeatherApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchWeather = async (location: string) => {
    if (!apiKey) {
      setError('Add VITE_WEATHER_API_KEY in your .env.local file to enable live weather data.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
          location,
        )}&appid=${apiKey}&units=metric`,
      );

      if (!response.ok) {
        throw new Error('Weather data could not be fetched for this location.');
      }

      const data = (await response.json()) as WeatherApiResponse;
      setWeather(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong while fetching weather data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const nextCity = profile.defaultCity;
    setCity(nextCity);
    void fetchWeather(nextCity);
  }, [safeOccupation]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void fetchWeather(city);
  };

  return (
    <div className="page-shell">
      <div className="page-bg" />

      <header className="dashboard-header">
        <Link to="/" className="ghost-button">
          ← Back
        </Link>

        <div className="header-profile">
          <span className="profile-icon">{profile.icon}</span>
          <div>
            <p className="label">Profile</p>
            <h2>{profile.title}</h2>
          </div>
        </div>
      </header>

      <main className="dashboard-grid">
        <section className="weather-panel glass-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow light">Live weather</p>
              <h3>{profile.title} dashboard</h3>
            </div>
            <div className="status-dot">Live</div>
          </div>

          <form className="search-bar" onSubmit={handleSubmit}>
            <input
              type="text"
              value={city}
              onChange={(event) => setCity(event.target.value)}
              placeholder="Search city or region"
            />
            <button type="submit" className="primary-button">
              Update
            </button>
          </form>

          {error && <div className="error-banner">{error}</div>}

          {loading && !weather ? (
            <div className="empty-state">Fetching weather data...</div>
          ) : weather ? (
            <>
              <div className="weather-top">
                <div>
                  <p className="location">
                    {weather.name}, {weather.sys.country}
                  </p>
                  <h1>{Math.round(weather.main.temp)}°C</h1>
                  <p className="condition">
                    {weather.weather[0].main} • {weather.weather[0].description}
                  </p>
                </div>

                <div className="weather-icon">
                  <img
                    src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
                    alt={weather.weather[0].description}
                  />
                </div>
              </div>

              <div className="stats-grid">
                <MetricCard label="Feels like" value={`${Math.round(weather.main.feels_like)}°C`} />
                <MetricCard label="Humidity" value={`${weather.main.humidity}%`} />
                <MetricCard label="Wind" value={`${weather.wind.speed} m/s`} />
                <MetricCard label="Pressure" value={`${weather.main.pressure} hPa`} />
                <MetricCard label="Sunrise" value={formatTime(weather.sys.sunrise)} />
                <MetricCard label="Sunset" value={formatTime(weather.sys.sunset)} />
              </div>
            </>
          ) : (
            <div className="empty-state">Weather will appear here.</div>
          )}
        </section>

        <aside className="insights-panel glass-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow light">AI insights</p>
              <h3>{profile.subtitle}</h3>
            </div>
          </div>

          <div className="suggestion-list">
            {profile.suggestions.map((item, index) => (
              <div key={`${item}-${index}`} className="suggestion-item">
                <span className="bullet">•</span>
                <span>{item}</span>
              </div>
            ))}
          </div>

          <div className="summary-box">
            <p className="summary-label">Operational note</p>
            <p>
              Use these live weather insights to support decisions in the field, at sea, in flight,
              or during everyday travel and planning.
            </p>
          </div>
        </aside>

        <section className="chat-panel glass-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow light">Assistant</p>
              <h3>RAG chatbot</h3>
            </div>
          </div>
          <Chatbot />
        </section>
      </main>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="metric-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Chatbot() {
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: 'Hi! I can help with weather guidance, operational planning, and risk-based advice.',
    },
  ]);
  const [input, setInput] = useState('');

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    const userMessage = { sender: 'user', text: trimmed };
    setMessages((previous) => [...previous, userMessage]);
    setInput('');

    const replyText = `Weather GPT: Based on current weather and your role context, here is a suggested answer for “${trimmed}”. Connect your real RAG backend here for dynamic AI responses.`;

    setTimeout(() => {
      setMessages((previous) => [...previous, { sender: 'bot', text: replyText }]);
    }, 350);
  };

  return (
    <div className="chatbox">
      <div className="chat-messages">
        {messages.map((message, index) => (
          <div key={`${message.sender}-${index}`} className={`message ${message.sender}`}>
            {message.text}
          </div>
        ))}
      </div>

      <div className="chat-input-row">
        <input
          type="text"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              void sendMessage();
            }
          }}
          placeholder="Ask about weather, risk, or planning..."
        />
        <button type="button" onClick={() => void sendMessage()}>
          Send
        </button>
      </div>
    </div>
  );
}

function formatTime(timestamp: number) {
  return new Date(timestamp * 1000).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default App;
