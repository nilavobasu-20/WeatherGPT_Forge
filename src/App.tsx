import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Link, Route, Routes, useNavigate, useParams } from 'react-router-dom';

type OccupationKey = 'farmer' | 'marine' | 'aviation' | 'others';

type WeatherData = {
  locationName: string;
  country: string;
  temperatureC: number;
  feelsLikeC: number;
  humidity: number;
  pressure: number;
  windKmh: number;
  condition: string;
  iconUrl: string;
  sunriseText: string;
  sunsetText: string;
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

const googleApiKey = import.meta.env.VITE_GOOGLE_API_KEY as string | undefined;
const activepiecesWebhookUrl = (import.meta.env.VITE_ACTIVEPIECES_WEBHOOK_URL as string | undefined) ?? '';

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
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchWeatherForCoordinates = async (lat: number, lng: number, label: string) => {
    if (!googleApiKey) {
      setError('Add VITE_GOOGLE_API_KEY in your .env.local file to enable live weather data.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(
        `https://weather.googleapis.com/v1/currentConditions:lookup?key=${googleApiKey}&location.latitude=${lat}&location.longitude=${lng}`,
      );

      const data = await response.json();

      if (data?.error) {
        throw new Error(data.error.message || 'Google Weather API request failed.');
      }

      const current = data.currentConditions ?? {};
      const temperatureC = Number(current.temperature?.celsius ?? 0);
      const feelsLikeC = Number(current.feelsLikeTemperature?.celsius ?? temperatureC);
      const humidity = Number(current.relativeHumidity ?? 0);
      const windKmh = Number(current.wind?.speed?.kilometersPerHour ?? 0);
      const pressure = Number(current.airPressure?.meanSeaLevelMillibars ?? current.airPressure?.millibars ?? 0);
      const conditionText = current.weatherCondition?.description?.text ?? 'Weather update';
      const iconUrl = current.weatherCondition?.iconBaseUri
        ? `${current.weatherCondition.iconBaseUri}_s.png`
        : 'https://maps.gstatic.com/tactile/weather/png/72/sunny.png';

      setWeather({
        locationName: label,
        country: 'Current location',
        temperatureC,
        feelsLikeC,
        humidity,
        pressure,
        windKmh,
        condition: conditionText,
        iconUrl,
        sunriseText: '--',
        sunsetText: '--',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong while fetching weather data.');
    } finally {
      setLoading(false);
    }
  };

  const fetchWeather = async (location: string) => {
    if (!googleApiKey) {
      setError('Add VITE_GOOGLE_API_KEY in your .env.local file to enable live weather data.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const geocodeResponse = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(location)}&key=${googleApiKey}`,
      );

      const geocodeData = await geocodeResponse.json();

      if (geocodeData.status !== 'OK' || !geocodeData.results?.length) {
        throw new Error('Could not resolve that city or location in Google Maps.');
      }

      const place = geocodeData.results[0];
      const lat = place.geometry.location.lat;
      const lng = place.geometry.location.lng;
      const locationText = place.formatted_address || location;
      const country =
        place.address_components?.find((component: { types?: string[]; long_name?: string }) =>
          component.types?.includes('country'),
        )?.long_name ?? 'Unknown';

      const weatherResponse = await fetch(
        `https://weather.googleapis.com/v1/currentConditions:lookup?key=${googleApiKey}&location.latitude=${lat}&location.longitude=${lng}`,
      );

      const weatherData = await weatherResponse.json();

      if (weatherData?.error) {
        throw new Error(weatherData.error.message || 'Google Weather API request failed.');
      }

      const current = weatherData.currentConditions ?? {};
      const temperatureC = Number(current.temperature?.celsius ?? 0);
      const feelsLikeC = Number(current.feelsLikeTemperature?.celsius ?? temperatureC);
      const humidity = Number(current.relativeHumidity ?? 0);
      const windKmh = Number(current.wind?.speed?.kilometersPerHour ?? 0);
      const pressure = Number(current.airPressure?.meanSeaLevelMillibars ?? current.airPressure?.millibars ?? 0);
      const conditionText = current.weatherCondition?.description?.text ?? 'Weather update';
      const iconUrl = current.weatherCondition?.iconBaseUri
        ? `${current.weatherCondition.iconBaseUri}_s.png`
        : 'https://maps.gstatic.com/tactile/weather/png/72/sunny.png';

      setWeather({
        locationName: locationText,
        country,
        temperatureC,
        feelsLikeC,
        humidity,
        pressure,
        windKmh,
        condition: conditionText,
        iconUrl,
        sunriseText: '--',
        sunsetText: '--',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong while fetching weather data.');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLocationWeather = async () => {
    if (!navigator.geolocation) {
      setCity(profile.defaultCity);
      await fetchWeather(profile.defaultCity);
      return;
    }

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 600000,
        });
      });

      setCity('Current location');
      await fetchWeatherForCoordinates(
        position.coords.latitude,
        position.coords.longitude,
        'Current location',
      );
    } catch {
      setCity(profile.defaultCity);
      await fetchWeather(profile.defaultCity);
    }
  };

  useEffect(() => {
    const nextCity = profile.defaultCity;
    setCity(nextCity);
    void getCurrentLocationWeather();
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
                    {weather.locationName}, {weather.country}
                  </p>
                  <h1>{Math.round(weather.temperatureC)}°C</h1>
                  <p className="condition">{weather.condition}</p>
                </div>

                <div className="weather-icon">
                  <img src={weather.iconUrl} alt={weather.condition} />
                </div>
              </div>

              <div className="stats-grid">
                <MetricCard label="Feels like" value={`${Math.round(weather.feelsLikeC)}°C`} />
                <MetricCard label="Humidity" value={`${Math.round(weather.humidity)}%`} />
                <MetricCard label="Wind" value={`${Math.round(weather.windKmh)} km/h`} />
                <MetricCard label="Pressure" value={`${Math.round(weather.pressure)} hPa`} />
                <MetricCard label="Sunrise" value={weather.sunriseText} />
                <MetricCard label="Sunset" value={weather.sunsetText} />
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
          <Chatbot occupation={safeOccupation} />
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

function Chatbot({ occupation }: { occupation: OccupationKey }) {
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: 'Hi! I can help with weather guidance, operational planning, and risk-based advice.',
    },
  ]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || isSending) return;

    const userMessage = { sender: 'user', text: trimmed };
    setMessages((previous) => [...previous, userMessage]);
    setInput('');
    setIsSending(true);

    try {
      if (occupation === 'farmer' && activepiecesWebhookUrl) {
        const response = await fetch(activepiecesWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: trimmed,
            query: trimmed,
            occupation: 'farmer',
            role: 'Farmer',
            source: 'WeatherGPT_Forge',
            timestamp: new Date().toISOString(),
          }),
        });

        let botText = `Weather GPT: I connected to your Activepieces farmer bot for “${trimmed}”.`;

        if (response.ok) {
          const contentType = response.headers.get('content-type') ?? '';
          if (contentType.includes('application/json')) {
            const data = await response.json();
            const candidate =
              data?.answer ??
              data?.reply ??
              data?.message ??
              data?.output ??
              data?.response ??
              data?.result ??
              data?.text;
            if (typeof candidate === 'string' && candidate.trim()) {
              botText = candidate.trim();
            } else if (data && typeof data === 'object') {
              botText = JSON.stringify(data, null, 2);
            }
          } else {
            const text = await response.text();
            if (text.trim()) {
              botText = text.trim();
            }
          }
        } else {
          botText = `Weather GPT: Your Activepieces flow returned an error (${response.status}). Check the published webhook and ensure the flow is active.`;
        }

        setMessages((previous) => [...previous, { sender: 'bot', text: botText }]);
        return;
      }

      const fallbackReply = `Weather GPT: Based on the current conditions, here is a suggested answer for “${trimmed}”. Connect your RAG backend here for dynamic AI responses.`;
      setMessages((previous) => [...previous, { sender: 'bot', text: fallbackReply }]);
    } catch (error) {
      const fallbackReply =
        error instanceof Error
          ? `Weather GPT: Error while contacting Activepieces: ${error.message}`
          : 'Weather GPT: There was an issue contacting the chatbot service.';
      setMessages((previous) => [...previous, { sender: 'bot', text: fallbackReply }]);
    } finally {
      setIsSending(false);
    }
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
          placeholder={occupation === 'farmer' ? 'Ask the farmer weather assistant...' : 'Ask about weather, risk, or planning...'}
          disabled={isSending}
        />
        <button type="button" onClick={() => void sendMessage()} disabled={isSending}>
          {isSending ? 'Sending...' : 'Send'}
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
