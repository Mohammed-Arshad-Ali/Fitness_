# VITA:ON - AI Biological Operating System

![VITA:ON](https://img.shields.io/badge/VITA:ON-AI%20BioOS-blue?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.0-38bdf8?style=for-the-badge&logo=tailwindcss)

## 🧬 Overview

**VITA:ON** is an autonomous life optimization platform that unifies fitness, nutrition, sleep, and productivity under one intelligent biological umbrella. Powered by **Digital Twin AI** technology, it provides predictive health insights and personalized protocol optimization.

## ✨ Key Features

### 🔐 Single Device Login Enforcement
- Users can only be logged in on **one device at a time**
- Logging in from a new device automatically terminates the previous session
- Enhanced security for sensitive health data

### 🫀 Real-Time Biometrics
- Heart rate, HRV, blood glucose monitoring
- Sleep analysis and recovery scoring
- Integration with Oura, Whoop, Dexcom, Apple Health, and more

### 🧠 Digital Twin AI
- Personal biological simulation
- 24-hour predictions for energy, cognition, and performance
- Real-time protocol optimization

### 🎯 Smart Protocols
- Workout, nutrition, sleep, and recovery schedules
- AI-optimized timing based on circadian rhythms
- Commitment deposits for accountability

### 💳 Subscription Tiers
- **Free**: Basic biometric tracking
- **Essential** ($29/mo): AI recommendations
- **Protocol** ($49/mo): Digital Twin predictions + commitment deposits
- **Concierge** ($199/mo): Personal health coaching

## 🚀 Getting Started

### Prerequisites
- Node.js 18.x or higher
- npm or yarn

### Installation

```bash
# Clone the repository
cd vitaon-portal

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Demo Credentials
```
Email: demo@vitaon.ai
Password: Demo123!
```

## 📁 Project Structure

```
vitaon-portal/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API Routes
│   │   │   └── auth/          # Authentication endpoints
│   │   ├── dashboard/         # Protected dashboard pages
│   │   │   ├── biometrics/
│   │   │   ├── protocols/
│   │   │   └── settings/
│   │   ├── login/             # Login page
│   │   ├── signup/            # Signup page
│   │   └── page.tsx           # Landing page
│   ├── components/
│   │   └── ui/                # Reusable UI components
│   ├── lib/
│   │   ├── auth.ts            # Authentication logic
│   │   ├── types.ts           # TypeScript definitions
│   │   └── utils.ts           # Utility functions
│   └── store/                 # Zustand state management
├── tailwind.config.ts         # Tailwind configuration
└── package.json
```

## 🔒 Authentication System

### Single Device Enforcement
The authentication system enforces single-device login:

1. When a user logs in, a unique session is created with device fingerprinting
2. The session ID is mapped to the user ID (one-to-one)
3. If the user logs in from another device, the previous session is automatically terminated
4. API calls validate the session on every request
5. If a session is invalidated, the user is redirected to login

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/login` | POST | Authenticate user, create session |
| `/api/auth/signup` | POST | Create new user account |
| `/api/auth/logout` | POST | Terminate current session |
| `/api/auth/validate` | GET | Validate session, return user data |

## 🎨 Design System

### Colors
- **Primary**: Sky blue (`#0ea5e9`)
- **Accent**: Violet (`#8b5cf6`)
- **Bio Green**: Emerald (`#10b981`)
- **Bio Red**: Rose (`#ef4444`)

### Typography
- **Display**: Outfit (headings)
- **Body**: Inter (text)
- **Mono**: JetBrains Mono (code)

### Components
- Glassmorphism cards with backdrop blur
- Gradient buttons with glow effects
- Progress rings for biometric scores
- Animated micro-interactions

## 🛠 Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Zustand** - State management
- **Lucide React** - Icons

### Backend (API Routes)
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT tokens
- **uuid** - Unique identifiers

### Production Stack (Future)
- **PostgreSQL** - User data, protocols
- **InfluxDB** - Time-series biometrics
- **Redis** - Session cache
- **Kafka** - Event streaming
- **Stripe** - Payments

## 📱 Pages

### Public
- `/` - Landing page with features, pricing, testimonials
- `/login` - User authentication
- `/signup` - New user registration

### Protected (Dashboard)
- `/dashboard` - Main biometric overview
- `/dashboard/biometrics` - Detailed health metrics
- `/dashboard/protocols` - Active protocols management
- `/dashboard/settings` - Account settings

## 🔐 Security Features

1. **HIPAA-Compliant Design** - Encrypted health data
2. **HttpOnly Cookies** - Secure session tokens
3. **Password Hashing** - bcrypt with salt rounds
4. **Single Device Sessions** - Prevents unauthorized access
5. **MFA Ready** - Two-factor authentication support

## 📄 License

This project is proprietary software. All rights reserved.

---

Built with ❤️ by the VITA:ON Team
