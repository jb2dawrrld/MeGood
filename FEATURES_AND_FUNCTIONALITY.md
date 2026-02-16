# MeGood Web App — Features & Functionality Overview

A **health and fitness tracking dashboard** built with React and AWS Amplify. Users can monitor daily metrics (steps, heart rate, calories burned/consumed), set goals, and track progress over time.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | React 18 |
| **Build Tool** | Vite (Rolldown) |
| **Auth** | AWS Amplify / Amazon Cognito |
| **Styling** | Tailwind CSS 4 |
| **Charts** | Recharts |
| **Routing** | Wouter |
| **Icons** | Lucide React |
| **HTTP** | Axios |

---

## Core Features

### 1. Authentication (AWS Cognito)

- **Sign up / Sign in** — Email-based login via AWS Cognito
- **Sign up fields**: Full Name, Display Name, Email, Password
- **User attributes**: `preferred_username`, `name`, `email`
- **Sign out** — Logout via profile dropdown
- **OAuth** — Cognito configured with OAuth (openid, email, profile scopes)

### 2. Dashboard

Main view for logged-in users. Includes:

- **Time-based greeting** — “Good Morning/Afternoon/Evening” based on time of day
- **User profile** — Avatar with initials and dropdown (Sign Out)

### 3. Health Metrics Tracking

| Metric | Description | Data Source |
|--------|-------------|-------------|
| **Heart Rate** | Live BPM display (pulsing icon) | Fetched every 3 seconds from `/metrics/heart-rate-stream` |
| **Steps** | Daily step count | Simulated increments + stored metrics API |
| **Calories Burned** | kcal burned | Simulated increments + stored metrics API |
| **Calories Consumed** | kcal eaten | User input + stored metrics API |

- Metrics are **user-specific** and **date-specific**
- Loaded on mount and persisted via API
- Steps and calories burned get small random increments every 3 seconds for demo/realism
- Heart rate is polled live from backend

### 4. Calories Consumed (Cal Count)

- **Display** — Total calories consumed today
- **Add calories** — Input field + “Add More Calories” button
- **Validation** — Numeric, positive values only
- **Persistence** — Saves immediately after adding
- Uses card layout with utensils icon

### 5. Calories Burned

- **Display** — Total calories burned today
- **Read-only** — Updated by simulated activity, not manual entry
- Uses flame icon

### 6. Goal Progress

- **Daily steps goal** — 10,000 steps
  - Progress bar (0–100%)
  - Current vs goal
- **Calories burned goal** — 500 kcal
  - Progress bar (0–100%)
  - Current vs goal
- **Calorie balance** — `consumed − burned`
  - Surplus (green) if positive
  - Deficit (red) if negative
- **Shimmer effect** — Animated highlight on progress bars
- **Date** — Current weekday and date shown

### 7. Data Persistence & Sync

- **Load on mount** — Fetches today’s metrics for the user
- **Auto-save** — Every 60 seconds
- **Save on close** — `beforeunload` saves current metrics
- **Save on add** — Calories consumed saved immediately when user adds
- Uses `VITE_API_BASE` for backend URL

---

## API Integration

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/metrics` | GET | Load metrics (params: `userId`, `date`) |
| `/metrics` | POST | Update/create metrics (body: `userId`, `date`, `steps`, `caloriesBurned`, `caloriesConsumed`, `heartRate`, `timestamp`) |
| `/metrics/heart-rate-stream` | GET | Live heart rate |

---

## UI Components

| Component | Role |
|-----------|------|
| **AuthWrapper** | Cognito `Authenticator`; wraps app; shows sign-in/sign-up |
| **Dashboard** | Main layout; fetches/saves metrics; orchestrates cards |
| **Header** | Greeting, user name, nav button, profile dropdown |
| **MetricsCard** | Icon + label + value + unit (used for Heart Rate, Steps) |
| **CaloriesConsumedCard** | Display + “add calories” input and button |
| **CaloriesBurnedCard** | Display of calories burned |
| **GoalProgress** | Progress bars and calorie balance |
| **Card** | Reusable white rounded container with shadow |

---

## Layout

- **Responsive grid** — 3 columns on desktop
- **Left column (2/3)**: Heart Rate + Steps, Calories Burned
- **Right column (1/3)**: Calories Consumed
- **Full width**: Goal Progress
- **Font**: DM Sans (via `fontFamily` in styles)

---

## Configuration

- **AWS Cognito** — User Pool + App Client in `us-east-2`
- **OAuth redirects** — `http://localhost:5173/` for sign-in/sign-out
- **API base** — `VITE_API_BASE` environment variable
- **Dev server** — Default Vite port 5173

---

## File Structure (Relevant Paths)

```
me-good/src/
├── main.jsx           # Entry; Amplify config
├── App.jsx            # Root app; AuthWrapper
├── awsconfig.js       # Cognito config
├── index.css          # Tailwind import
├── api/
│   └── metrics.js     # Metrics API client
└── components/
    ├── AuthWrapper.jsx
    ├── Dashboard.jsx
    ├── Header.jsx
    ├── MetricsCard.jsx
    ├── CaloriesConsumedCard.jsx
    ├── CaloriesBurnedCard.jsx
    ├── GoalProgress.jsx
    └── ui/
        └── Card.jsx
```
