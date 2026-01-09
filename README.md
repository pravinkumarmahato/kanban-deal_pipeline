# Deal Pipeline Management System

A full-stack web application for managing investment deal pipelines with role-based access control, activity tracking, and IC memo management with versioning.

---

## 📸 Screenshots & Demo

### Screenshots


### Screen Recording


---

## 🚀 Features

### Core Features
- ✅ **Deal Pipeline Management**: Track deals through multiple stages (Sourced → Screen → Diligence → IC → Invested/Passed)
- ✅ **Role-Based Access Control**: Three user roles (Admin, Analyst, Partner) with different permissions
- ✅ **IC Memo Management**: Create and manage investment committee memos with full version history
- ✅ **Activity Tracking**: Comprehensive activity log for all deal-related actions
- ✅ **User Management**: Admin panel for user creation
- ✅ **Comments & Voting**: Partners can add comments and vote on deals
- ✅ **Deal Approval/Decline**: Partners can approve or decline deals in IC stage

### User Roles
- **Admin**: Full system access, can manage all users, deals, and memos
- **Analyst**: Can create/edit deals and memos, view all deals
- **Partner**: Can view deals, add comments, vote, and approve/decline deals

---

## 🏗️ Architecture

### System Architecture

```
┌─────────────────┐
│   React Frontend │  ( TypeScript, TailwindCSS)
│   Port: 5173     │
└────────┬─────────┘
         │ HTTP/REST API
         │ JWT Authentication
┌────────▼─────────┐
│  FastAPI Backend │  (Python 3.8+)
│   Port: 8000     │
└────────┬─────────┘
         │ SQLAlchemy ORM
┌────────▼─────────┐
│  PostgreSQL DB   │
│   Port: 5432     │
└──────────────────┘
```

### Technology Stack

#### Backend
- **Framework**: FastAPI
- **Database**: PostgreSQL
- **ORM**: SQLAlchemy
- **Authentication**: JWT (python-jose)
- **Password Hashing**: bcrypt
- **API Documentation**: Auto-generated Swagger/OpenAPI

#### Frontend
- **Framework**: React
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **Routing**: React Router DOM
- **Build Tool**: Vite
- **State Management**: React Context API

---

## 📁 Project Structure

```
deal-pipeline/
│
├── backend/                    # FastAPI Backend Application
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py            # FastAPI application entry point
│   │   │
│   │   ├── core/              # Core configuration and utilities
│   │   │   ├── config.py      # Application settings
│   │   │   ├── database.py    # Database connection and session
│   │   │   ├── dependencies.py # Dependency injection (auth, roles)
│   │   │   └── security.py    # JWT and password hashing
│   │   │
│   │   ├── users/             # User management module
│   │   │   ├── models.py      # User database models
│   │   │   ├── schemas.py     # Pydantic schemas
│   │   │   ├── routes.py      # User API endpoints
│   │   │   └── service.py     # Business logic
│   │   │
│   │   ├── deals/             # Deal management module
│   │   │   ├── models.py      # Deal database models
│   │   │   ├── schemas.py     # Pydantic schemas
│   │   │   ├── routes.py      # Deal API endpoints
│   │   │   └── service.py     # Business logic
│   │   │
│   │   ├── activities/        # Activity tracking module
│   │   │   ├── models.py      # Activity database models
│   │   │   ├── schemas.py     # Pydantic schemas
│   │   │   ├── routes.py      # Activity API endpoints
│   │   │   └── service.py     # Business logic
│   │   │
│   │   └── memos/             # Memo management module
│   │       ├── models.py      # Memo database models
│   │       ├── schemas.py     # Pydantic schemas
│   │       ├── routes.py      # Memo API endpoints
│   │       └── service.py     # Business logic
│   │
│   ├── main.py                # Application entry point
│   ├── requirements.txt       # Python dependencies
│   └── API_DOCUMENTATION.md   # Complete API documentation
│
├── frontend/                   # React Frontend Application
│   ├── src/
│   │   ├── components/        # Reusable React components
│   │   │   ├── DealModal.tsx  # Deal creation/editing modal
│   │   │   └── Layout.tsx     # Main layout component
│   │   │
│   │   ├── pages/             # Page components
│   │   │   ├── Login.tsx      # Login/Registration page
│   │   │   ├── Pipeline.tsx   # Main pipeline board view
│   │   │   ├── MemoViewer.tsx # Memo viewer/editor
│   │   │   └── AdminUsers.tsx # Admin user management
│   │   │
│   │   ├── context/           # React Context providers
│   │   │   └── AuthContext.tsx # Authentication context
│   │   │
│   │   ├── services/          # API service layer
│   │   │   └── api.ts         # API client functions
│   │   │
│   │   ├── types/             # TypeScript type definitions
│   │   │   └── index.ts       # Shared types and interfaces
│   │   │
│   │   ├── constants/         # Application constants
│   │   │   └── index.ts       # Constants and enums
│   │   │
│   │   ├── App.tsx            # Main application component
│   │   ├── App.css            # Application styles
│   │   ├── main.tsx           # React entry point
│   │   └── index.css          # Global styles
│   │
│   ├── public/                # Static assets
│   ├── package.json           # Node.js dependencies
│   ├── tsconfig.json          # TypeScript configuration
│   ├── vite.config.ts         # Vite configuration
│   └── README.md              # Frontend-specific documentation
│
└── README.md                   # This file
```

---

## 🛠️ Prerequisites

Before you begin, ensure you have the following installed:

- **Python** 3.8 or higher
- **Node.js** 18.x or higher
- **npm** or **yarn**
- **PostgreSQL** 12 or higher
- **Git**

### Optional but Recommended
- **Docker** (for running PostgreSQL in a container)
- **Postman** or **Thunder Client** (for API testing)

---

## 📦 Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd deal-pipeline
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create a virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt
```

### 3. Database Setup

#### Option A: Using Docker (Recommended)

```bash
docker run -d \
  --name deal_pipeline_postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=deal_pipeline \
  -p 5432:5432 \
  postgres:latest
```

#### Option B: Using Local PostgreSQL

```bash
# Create database
createdb deal_pipeline

# Or using psql
psql -U postgres
CREATE DATABASE deal_pipeline;
```

### 4. Backend Configuration

Create a `.env` file in the `backend/` directory:

```bash
cd backend
touch .env
```

Add the following configuration:

```env
# Database Configuration
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/deal_pipeline

# JWT Configuration
SECRET_KEY=your-secret-key-change-in-production-use-a-strong-random-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Application
PROJECT_NAME=Deal Pipeline API
```

**⚠️ Important**: Change the `SECRET_KEY` to a strong, random string in production!

### 5. Frontend Setup

```bash
# Navigate to frontend directory (from project root)
cd frontend

# Install Node.js dependencies
npm install
# or
yarn install
```

---

## 🚀 Running the Project

### Start the Backend Server

```bash
# From the backend directory
cd backend

# Activate virtual environment if not already activated
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Run the application
python main.py

# Or using uvicorn directly
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Initial Admin User creation
curl -X 'POST' \
  'http://localhost:8000/users/register' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
  "email": "admin@kanban.com",
  "full_name": "Admin",
  "role": "admin",
  "password": "password"
}'
```

The backend API will be available at:
- **API**: http://localhost:8000
- **API Documentation (Swagger)**: http://localhost:8000/docs
- **Alternative API Docs (ReDoc)**: http://localhost:8000/redoc
- **Health Check**: http://localhost:8000/health

### Start the Frontend Development Server

```bash
# From the frontend directory
cd frontend

# Start the development server
npm run dev
# or
yarn dev
```

The frontend application will be available at:
- **Frontend**: http://localhost:5173


---

## 📋 Available Commands

### Backend Commands

```bash
# Run development server
python main.py

# Run with uvicorn (with auto-reload)
uvicorn app.main:app --reload

# Run with custom host/port
uvicorn app.main:app --host 0.0.0.0 --port 8000

# Run production server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

### Frontend Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

---

## 📚 API Documentation

Complete API documentation is available at:
- **Swagger UI**: http://localhost:8000/docs (Interactive API explorer)
- **ReDoc**: http://localhost:8000/redoc (Alternative documentation)
- **Markdown Docs**: See `backend/API_DOCUMENTATION.md` for detailed endpoint documentation

### Quick API Reference

#### Public Endpoints
- `GET /` - API information
- `GET /health` - Health check
- `POST /users/login` - User login
- `POST /users/register` - User registration

#### Authenticated Endpoints
- `GET /users/me` - Get current user
- `GET /deals` - List all deals
- `GET /deals/{id}` - Get deal by ID
- `POST /activities/comment` - Add comment
- `GET /memos/deal/{deal_id}` - Get memo by deal

#### Partner Only
- `POST /activities/deal/{deal_id}/vote` - Vote on deal
- `POST /activities/deal/{deal_id}/approve` - Approve deal
- `POST /activities/deal/{deal_id}/decline` - Decline deal

#### Admin Only
- `GET /users` - List all users
- `POST /users` - Create user
- `PUT /users/{id}` - Update user

#### Admin & Analyst
- `POST /deals` - Create deal
- `PUT /deals/{id}` - Update deal
- `DELETE /deals/{id}` - Delete deal
- `POST /memos` - Create memo
- `PUT /memos/{id}` - Update memo

For complete API documentation, see [API_DOCUMENTATION.md](backend/API_DOCUMENTATION.md)

---

## 🧪 Testing

### Backend API Testing

You can test the API using:
1. **Swagger UI**: http://localhost:8000/docs (Interactive testing)
2. **Postman**: Import the OpenAPI schema
3. **curl**: Command-line HTTP client

Example API call:
```bash
# Login
curl -X POST "http://localhost:8000/users/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123"}'

# Get deals (with auth token)
curl -X GET "http://localhost:8000/deals" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## 🗄️ Database Schema

### Main Tables
- **users**: User accounts and authentication
- **deals**: Deal pipeline entries
- **activities**: Activity log for all actions
- **memos**: Investment committee memos
- **memo_versions**: Version history for memos
- **votes**: Partner votes on deals

### Deal Stages
1. `sourced` - Initial deal sourcing
2. `screen` - Screening phase
3. `diligence` - Due diligence phase
4. `ic` - Investment committee review
5. `invested` - Deal completed/invested
6. `passed` - Deal rejected/passed

### Deal Status
- `active` - Active deal
- `approved` - Deal approved by partner
- `declined` - Deal declined by partner