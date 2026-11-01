# WeatherGPT_Forge

WeatherGPT_Forge is an AI-powered weather platform designed to give users personalized, context-aware weather experiences. Instead of only showing raw weather conditions, the app combines location intelligence, contextual user profiles, and a conversational assistant to provide weather insights tailored to occupation, environment, and user intent.

The project blends a modern React frontend with a lightweight Node.js/Express backend. The UI supports location search, weather visualization, personalized occupation-based views, and a chatbot interface that can answer weather-related questions using contextual data from the current place and user prompt.

## Project highlights

- Personalized weather experience based on occupation and activity context
- Location search with autocomplete and geocoding support
- Current weather retrieval using Google Weather APIs
- Reverse geocoding for detecting the user’s location from coordinates
- Conversational AI assistant for weather and planning questions
- Server-side API proxy layer to protect keys and avoid browser-side CORS issues

## Tech stack

### Frontend

- React 18
- TypeScript
- Vite
- CSS / styled UI layer
- React Router for navigation
- Browser-side state and UI interactions for weather, location, and chatbot flows

### Backend

- Node.js
- Express.js
- dotenv for environment configuration
- Google Geocoding API
- Google Places Autocomplete API
- Google Current Conditions API
- Activepieces webhook integration for the agentic chatbot workflow

## Application architecture

This project follows a client-server architecture:

1. The frontend is served by Vite and provides the main weather dashboard and chatbot interface.
2. User actions such as selecting a city, searching for a place, or asking a question trigger API requests to the backend.
3. The backend acts as a secure proxy layer to external services and exposes a small set of REST endpoints.
4. The chatbot flow is routed through an Activepieces automation/webhook, allowing the app to orchestrate AI logic without embedding sensitive service credentials in the browser.

## Backend pipeline

The backend is implemented in `server.js` and exposes these key routes:

- `GET /api/geocode`
  - Converts a text address into coordinates using the Google Geocoding API.

- `GET /api/reverse-geocode`
  - Converts latitude/longitude into a human-readable place name and address.

- `GET /api/weather`
  - Fetches the current weather conditions for a given latitude and longitude.

- `GET /api/suggestions`
  - Returns place autocomplete results for city search suggestions.

- `POST /api/chat`
  - Forwards chatbot requests to the Activepieces webhook and returns the response to the frontend.

The backend pipeline is designed as follows:

1. Incoming request arrives from the frontend.
2. The server validates required query/body parameters.
3. It reads API keys from environment variables (`.env` / `.env.local`).
4. It adds the correct referer/origin headers needed for Google API access.
5. It calls the Google API or Activepieces webhook.
6. It parses the response safely and returns structured JSON to the client.
7. Errors are returned in a controlled, user-friendly format.

This keeps API credentials server-side and prevents direct client access to third-party services.

## Agentic workflow of the RAG-style chatbot

The chatbot in WeatherGPT_Forge follows an agentic, context-aware workflow rather than a simple static prompt-response model.

1. User enters a natural-language question in the chat UI.
2. The frontend sends the message to the backend through `/api/chat`.
3. The Express server forwards the payload to an Activepieces webhook.
4. The webhook-based workflow gathers context such as:
   - current weather information
   - selected location or detected city
   - user’s occupation or use-case context
   - app-specific domain information from the current session
5. The workflow then passes the enriched prompt to an AI model or orchestration layer for reasoning.
6. The LLM generates a contextual answer, such as:
   - weather recommendations
   - clothing or travel suggestions
   - occupational considerations
   - localized advice based on the current place or region
7. The final response is returned to the frontend and displayed in the chatbot interface.

Even though the app is described as a RAG-style experience, the current implementation is best understood as a context-enriched agentic pipeline: it gathers real-time weather/location context, injects it into the prompt, and then uses an external workflow automation service to reason over that data before responding.

## How the app works in practice

A typical user journey is:

1. Open the platform and choose a location or allow current location detection.
2. The app resolves the city and coordinates using geocoding services.
3. It fetches current weather and context for the selected area.
4. The user may choose an occupation-based view or ask natural-language questions such as:
   - “Should I carry an umbrella today?”
   - “What weather should a farmer expect in this region?”
   - “Is this suitable for outdoor work?”
5. The chatbot combines weather conditions with location and occupation context to answer in a personalized way.

## Local development

```bash
npm install
npm run dev
```

This starts the Express backend and the Vite frontend together.

## Production notes

The project is set up to run as a full-stack app with a Vite frontend and a Node.js API layer. Environment variables such as Google API keys and webhook credentials should be stored securely in `.env` or `.env.local` and never exposed in client-side code.

## Summary

WeatherGPT_Forge is a modern AI weather application that combines geospatial data, a personalized user experience, and an agentic conversational assistant. It brings together frontend interactivity, backend API orchestration, and external AI automation into a single weather intelligence platform.
