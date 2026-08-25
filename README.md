 🏃‍♂️ Fitness Tracker Web Application

A modern, real-time fitness tracking dashboard built with React and AWS serverless architecture. Track your daily steps, calories burned/consumed, heart rate, and monitor your progress toward fitness goals.
(Built as a learning-focused project to explore AWS serverless architecture and authentication flows. All metrics are simulated.)

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
  - Clean, modern design with DM Sans & Bagel Fat One fonts
  - Sticky header with time-based greetings (Good Morning/Afternoon/Evening)
  - User profile with initials and dropdown
  - Elegant card-based layout with minimal shadow

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

Source files live in [`lambda/`](lambda/). Deploy **four** functions (the dashboard also calls `getMetricsRange` for charts):

| Lambda | API Gateway route | Method |
|--------|-------------------|--------|
| `getMetrics` | `/metrics` | GET |
| `getMetricsRange` | `/metrics/range` | GET |
| `updateMetrics` | `/metrics` | POST |
| `simulateHeart` | `/metrics/heart-rate-stream` | GET |

**For each Lambda:**
- Runtime: **Node.js 18.x** or **20.x** (AWS SDK v3 is included in the runtime)
- Environment variable: `TABLE_NAME` = `MeGoodMetrics` (optional; defaults to `MeGoodMetrics`)
- IAM: allow `dynamodb:GetItem`, `PutItem`, and `Query` on your table ARN (`simulateHeart` needs no DynamoDB access)
- Enable **Lambda proxy integration** on API Gateway
- Enable **CORS** on API Gateway (or rely on the `OPTIONS` handlers in each function)

Set `VITE_API_BASE` in a `.env` file to your API Gateway stage URL, e.g. `https://abc123.execute-api.us-east-2.amazonaws.com/prod`

---

##### `lambda/getMetrics.js`

```javascript
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, GetCommand } = require("@aws-sdk/lib-dynamodb");

const docClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const TABLE_NAME = process.env.TABLE_NAME || "MeGoodMetrics";

const corsHeaders = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
  "Access-Control-Allow-Methods": "GET,OPTIONS",
};

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: corsHeaders, body: "" };
  }

  try {
    const userId = event.queryStringParameters?.userId;
    const date = event.queryStringParameters?.date;

    if (!userId || !date) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: "userId and date are required" }),
      };
    }

    const result = await docClient.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: { userId, date },
      }),
    );

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify(result.Item || {}),
    };
  } catch (error) {
    console.error("getMetrics error:", error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: "Failed to load metrics" }),
    };
  }
};
```

---

##### `lambda/updateMetrics.js`

```javascript
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand } = require("@aws-sdk/lib-dynamodb");

const docClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const TABLE_NAME = process.env.TABLE_NAME || "MeGoodMetrics";

const corsHeaders = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
  "Access-Control-Allow-Methods": "POST,OPTIONS",
};

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: corsHeaders, body: "" };
  }

  try {
    const body = event.body ? JSON.parse(event.body) : {};
    const {
      userId,
      date,
      steps = 0,
      caloriesBurned = 0,
      caloriesConsumed = 0,
      heartRate = 0,
      timestamp = Date.now(),
    } = body;

    if (!userId || !date) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: "userId and date are required" }),
      };
    }

    const item = {
      userId,
      date,
      steps: Number(steps),
      caloriesBurned: Number(caloriesBurned),
      caloriesConsumed: Number(caloriesConsumed),
      heartRate: Number(heartRate),
      timestamp: Number(timestamp),
    };

    await docClient.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: item,
      }),
    );

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ success: true, item }),
    };
  } catch (error) {
    console.error("updateMetrics error:", error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: "Failed to save metrics" }),
    };
  }
};
```

---

##### `lambda/simulateHeart.js`

```javascript
const corsHeaders = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
  "Access-Control-Allow-Methods": "GET,OPTIONS",
};

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: corsHeaders, body: "" };
  }

  try {
    const heartRate = Math.floor(Math.random() * (175 - 62 + 1)) + 62;

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ heartRate }),
    };
  } catch (error) {
    console.error("simulateHeart error:", error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: "Failed to simulate heart rate" }),
    };
  }
};
```

---

##### `lambda/getMetricsRange.js` (required for trend charts)

```javascript
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, QueryCommand } = require("@aws-sdk/lib-dynamodb");

const docClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const TABLE_NAME = process.env.TABLE_NAME || "MeGoodMetrics";

const corsHeaders = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
  "Access-Control-Allow-Methods": "GET,OPTIONS",
};

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: corsHeaders, body: "" };
  }

  try {
    const userId = event.queryStringParameters?.userId;
    const startDate = event.queryStringParameters?.startDate;
    const endDate = event.queryStringParameters?.endDate;

    if (!userId || !startDate || !endDate) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: "userId, startDate, and endDate are required" }),
      };
    }

    const result = await docClient.send(
      new QueryCommand({
        TableName: TABLE_NAME,
        KeyConditionExpression: "userId = :userId AND #date BETWEEN :startDate AND :endDate",
        ExpressionAttributeNames: { "#date": "date" },
        ExpressionAttributeValues: {
          ":userId": userId,
          ":startDate": startDate,
          ":endDate": endDate,
        },
      }),
    );

    const metrics = (result.Items || []).sort((a, b) => a.date.localeCompare(b.date));

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ metrics }),
    };
  } catch (error) {
    console.error("getMetricsRange error:", error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: "Failed to load metrics range" }),
    };
  }
};
```

#### Cognito User Pool
Set up authentication:
- Sign-in option: Email
- Required attributes: `preferred_username`, `name`, and `phone_number` (the signup form collects all three; they must be enabled on the user pool or signup fails)
- Self-registration: Enabled
- Update `awsconfig.js` with your User Pool details
- Cognito domain in `awsconfig.js` must be the hostname only (no `https://`); Amplify adds the protocol itself

### 4. Update Configuration

Edit `src/awsconfig.js`:
```javascript
const config = {
  Auth: {
    Cognito: {
      userPoolId: 'YOUR_USER_POOL_ID',
      userPoolClientId: 'YOUR_APP_CLIENT_ID',
      loginWith: {
        oauth: {
          domain: 'your-prefix.auth.region.amazoncognito.com', // hostname only, no https://
          // ... other settings
        }
      }
    }
  }
};
```

Create a `.env` file in the project root:

```
VITE_API_BASE=https://YOUR_API_ID.execute-api.YOUR_REGION.amazonaws.com/prod
```

The frontend reads this in `src/api/metrics.js` — do not hardcode the URL in source.

### 5. Run Development Server
```bash
npm run dev
```

Visit `http://localhost:5173`

## 📁 Project Structure

```
me-good/
├── src/
│   ├── components/
│   │   ├── AuthWrapper.jsx          # Authentication wrapper
│   │   ├── Dashboard.jsx            # Main dashboard component
│   │   ├── Header.jsx               # Header with greeting & logo
│   │   ├── MetricsCard.jsx          # Reusable metrics display
│   │   ├── CaloriesBurnedCard.jsx   # Calories burned display
│   │   ├── CaloriesConsumedCard.jsx # Calorie input card
│   │   ├── GoalProgress.jsx         # Progress bars component
│   │   └── ui/
│   │       └── Card.jsx             # Base card component
│   ├── api/
│   │   └── metrics.js               # API functions for backend
│   ├── awsconfig.js                 # AWS Amplify configuration
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── lambda/
│   ├── getMetrics.js
│   ├── getMetricsRange.js
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
