# Attendly

A modern attendance management system built with React, TypeScript, and Node.js. Attendly simplifies attendance tracking for educational institutions with QR code-based check-ins, real-time analytics, and comprehensive reporting.

## 🚀 Features

### For Teachers
- **Course Management**: Create and manage courses with ease
- **Session Management**: Start attendance sessions with QR codes
- **Real-time Analytics**: Track attendance patterns and student engagement
- **Student Management**: View enrolled students and their attendance records
- **QR Code Generation**: Secure, time-limited QR codes for each session

### For Students
- **Easy Check-in**: Scan QR codes to mark attendance
- **Course Dashboard**: View enrolled courses and attendance history
- **Performance Analytics**: Track personal attendance statistics
- **Session Discovery**: Find and join available courses

### For Administrators
- **User Management**: Manage teachers and students
- **System Overview**: Comprehensive attendance reports
- **Data Export**: Export attendance data for analysis

## 🛠 Tech Stack

### Frontend
- **React 18** - Modern UI framework
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Beautiful, accessible UI components
- **Lucide React** - Professional icon library
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls
- **React Hook Form** - Form management
- **Recharts** - Data visualization

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **PostgreSQL** - Robust relational database
- **JWT** - Secure authentication
- **bcrypt** - Password hashing
- **QRCodes** - QR code generation

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** (v9 or higher)
- **PostgreSQL** (v14 or higher)
- **Git** for version control

### Installation

```bash
# Install Node.js (using nvm recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18

# Verify installation
node --version
npm --version
```

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/attendly.git
cd attendly
```

### 2. Install Dependencies

```bash
# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

### 3. Environment Setup

Create a `.env` file in the backend directory:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=attendly
DB_USER=your_username
DB_PASSWORD=your_password

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=5000
NODE_ENV=development
```

### 4. Database Setup

```bash
# Create database
createdb attendly

# Run migrations
cd backend
npm run migrate

# (Optional) Seed with sample data
npm run seed
```

### 5. Start the Application

```bash
# Start backend server (terminal 1)
cd backend
npm run dev

# Start frontend server (terminal 2)
cd frontend
npm run dev
```

Visit `http://localhost:5175` to access Attendly.

## 📁 Project Structure

```
attendly/
├── backend/                 # Node.js API server
│   ├── controllers/         # Request handlers
│   ├── middleware/         # Express middleware
│   ├── routes/            # API routes
│   ├── database/          # Database configuration
│   └── package.json
├── frontend/               # React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utility functions
│   │   └── pages/          # Route components
│   ├── public/             # Static assets
│   └── package.json
└── README.md
```

## 🔧 Available Scripts

### Frontend Scripts

```bash
npm run dev          # Start development server
npm run build         # Build for production
npm run build:dev     # Build for development
npm run lint          # Run ESLint
npm run preview       # Preview production build
npm run test          # Run tests
npm run test:watch    # Run tests in watch mode
```

### Backend Scripts

```bash
npm run dev          # Start development server with hot reload
npm run start        # Start production server
npm run migrate       # Run database migrations
npm run seed          # Seed database with sample data
npm run test          # Run backend tests
```

## 🎯 Core Features

### Attendance System
- **QR Code Generation**: Each session generates a unique, time-limited QR code
- **Real-time Validation**: QR codes expire after session duration
- **Secure Check-ins**: Prevents duplicate attendance marking
- **Session History**: Complete attendance records for all courses

### User Roles
- **Teachers**: Create courses, manage sessions, view analytics
- **Students**: Join courses, mark attendance, view progress
- **Administrators**: System management, user administration

### Analytics & Reporting
- **Attendance Trends**: Visualize attendance patterns over time
- **Course Performance**: Track engagement per course
- **Student Statistics**: Individual attendance metrics
- **Export Data**: CSV/Excel export capabilities

## 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt for secure password storage
- **Role-based Access**: Different permissions for teachers/students/admins
- **QR Code Expiration**: Time-limited access prevents fraud
- **Input Validation**: Comprehensive data validation

## 🧪 Testing

```bash
# Frontend tests
cd frontend
npm run test

# Backend tests
cd backend
npm run test

# Run tests in watch mode
npm run test:watch
```

## 📦 Deployment

### Frontend Deployment

```bash
# Build for production
cd frontend
npm run build

# Deploy the dist/ folder to your hosting provider
```

### Backend Deployment

```bash
# Build for production
cd backend
npm run build

# Set production environment variables
export NODE_ENV=production
export DB_HOST=your_production_db_host
export DB_PASSWORD=your_production_db_password

# Start production server
npm start
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines

- Follow the existing code style
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Use TypeScript for type safety

## 📝 API Documentation

### Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout

### Course Endpoints
- `GET /api/courses` - Get all courses
- `POST /api/courses` - Create course (teachers)
- `GET /api/courses/enrolled` - Get enrolled courses (students)
- `GET /api/courses/:id` - Get course details

### Session Endpoints
- `POST /api/sessions` - Create session (teachers)
- `GET /api/sessions/active` - Get active sessions (students)
- `GET /api/sessions/:id` - Get session details
- `POST /api/attendance/mark` - Mark attendance (students)

## 🐛 Troubleshooting

### Common Issues

**Database Connection Error**
```bash
# Check if PostgreSQL is running
pg_isready

# Check connection details in .env file
```

**Port Already in Use**
```bash
# Find process using port
lsof -i :5000

# Kill process
kill -9 <PID>
```

**Frontend Build Errors**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [React](https://reactjs.org/) - The UI framework
- [Tailwind CSS](https://tailwindcss.com/) - The CSS framework
- [shadcn/ui](https://ui.shadcn.com/) - The component library
- [Lucide](https://lucide.dev/) - The icon library
- [Express.js](https://expressjs.com/) - The backend framework

---

**Attendly** - Making attendance tracking simple and secure. 🎓✨
