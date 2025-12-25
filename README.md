 🏃‍♂️ Fitness Tracker Web Application

A modern, real-time fitness tracking dashboard built with React and AWS serverless architecture. Track your daily steps, calories burned/consumed, heart rate, and monitor your progress toward fitness goals.
(Built as a learning-focused project to explore AWS serverless architecture and authentication flows.)

## ✨ Features

- **Real-time Metrics Tracking**
  - Live heart rate monitoring (simulated stream every 3 seconds)
  - Step counting with automatic increments
  - Calories burned tracking
  - Calorie intake logging

- **Goal Progress Visualization**
  - Animated progress bars with shimmer effects
  - Daily step goal (10,000 steps)
  - Calorie burn goal (500 kcal)
  - Net calorie balance (surplus/deficit)

- **User Authentication**
  - AWS Cognito integration for secure login
  - Custom display names
  - Individual user data isolation

- **Smart Data Persistence**
  - Auto-save every 60 seconds
  - Save on browser close/refresh
  - Daily reset at midnight
  - Date-based session management

- **Responsive UI**
  - Clean, modern design with DM Sans font
  - Time-based greetings (Good Morning/Afternoon/Evening)
  - User profile with initials
  - Elegant card-based layout

## 🛠️ Tech Stack

**Frontend:**
- React 18 with Vite
- Tailwind CSS for styling
- Lucide React for icons
- Recharts for data visualization
- AWS Amplify for authentication

**Backend:**
- AWS Lambda (Node.js)
- AWS DynamoDB for data storage
- AWS API Gateway for REST endpoints
- AWS Cognito for user management

## 📋 Prerequisites

- Node.js (v16 or higher)
- AWS Account
- npm or yarn package manager

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/fitness-tracker.git
cd fitness-tracker
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure AWS Services

#### DynamoDB Table
Create a table with:
- Table name: `MeGoodMetrics`
- Partition key: `userId` (String)
- Sort key: `date` (String, format: YYYY-MM-DD)

#### Lambda Functions
Deploy three Lambda functions:
1. **getMetrics** - Retrieves user's metrics for a specific date
2. **updateMetrics** - Saves/updates daily metrics
3. **simulateHeart** - Simulates heart rate data stream

#### Cognito User Pool
Set up authentication:
- Sign-in option: Email
- Required attributes: `preferred_username`
- Self-registration: Enabled
- Update `awsconfig.js` with your User Pool details

### 4. Update Configuration

Edit `src/components/awsconfig.js`:
```javascript
const config = {
  Auth: {
    Cognito: {
      userPoolId: 'YOUR_USER_POOL_ID',
      userPoolClientId: 'YOUR_APP_CLIENT_ID',
      loginWith: {
        oauth: {
          domain: 'YOUR_COGNITO_DOMAIN',
          // ... other settings
        }
      }
    }
  }
};
```

Edit `src/api/metrics.js` with your API Gateway endpoints.

### 5. Run Development Server
```bash
npm run dev
```

Visit `http://localhost:5173`

## 📁 Project Structure

```
fitness-tracker/
├── src/
│   ├── components/
│   │   ├── AuthWrapper.jsx          # Authentication wrapper
│   │   ├── Dashboard.jsx            # Main dashboard component
│   │   ├── Header.jsx               # Header with greeting & logout
│   │   ├── MetricsCard.jsx          # Reusable metrics display
│   │   ├── CaloriesBurnedCard.jsx   # Calories burned display
│   │   ├── CaloriesConsumedCard.jsx # Calorie input card
│   │   ├── GoalProgress.jsx         # Progress bars component
│   │   ├── ActivityChart.jsx        # Chart visualization (deprecated)
│   │   ├── awsconfig.js             # AWS Amplify configuration
│   │   └── ui/
│   │       └── Card.jsx             # Base card component
│   ├── api/
│   │   └── metrics.js               # API functions for backend
│   ├── App.jsx
│   └── main.jsx
├── lambda/
│   ├── getMetrics.js
│   ├── updateMetrics.js
│   └── simulateHeart.js
└── package.json
```

## 🔑 Key Features Explained

### Auto-Save System
- Metrics save automatically every 60 seconds
- Data persists on page refresh
- Uses DynamoDB with composite key (userId + date)
- Each day's data overwrites the previous save

### Midnight Reset
- Checks if loaded data timestamp matches current day
- Starts fresh at midnight with zero values
- Previous day's data preserved in database

### User Isolation
- Each user's data stored separately using Cognito userId
- No cross-user data access
- Secure authentication flow

## 🎨 UI Components

- **Header**: Displays greeting, user name, navigation menu, and sign-out button
- **Metrics Cards**: Show heart rate and step count in real-time
- **Calories Cards**: Track calories burned and consumed
- **Goal Progress**: Animated progress bars for daily goals
- **Calorie Balance**: Shows net calorie surplus/deficit

## 🔒 Security

- AWS Cognito handles authentication
- Email verification required
- Secure password requirements
- JWT tokens for API authorization
- User data isolated by Cognito userId

## 🚧 Known Issues

- React 19 compatibility: Use React 18 for best compatibility with AWS Amplify UI.
- Email verification with Amplify: Unable to make this work, planning to switch to AWS Hosted UI instead for this.

## 📝 Future Enhancements

- [ ] Weekly/monthly trend charts
- [ ] Custom goal setting
- [ ] Activity type tracking (running, cycling, etc.)
- [ ] Social features (friends, leaderboards)
- [ ] Mobile app version
- [ ] Wearable device integration
- [ ] Nutrition tracking
- [ ] Exercise recommendations

## 🤝 Contributing

Contributions are welcome!


## 👨‍💻 Author

Built by Jabali Muriithi. (Learning Project)

## 🙏 Acknowledgments

- AWS for serverless infrastructure
- Amplify team for authentication library
- Lucide for beautiful icons
- Tailwind CSS for styling utilities
