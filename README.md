# FareShare

Ride sharing app

## Quick Start

### Prerequisites

- Python 3.8+ (the script will automatically create a virtual environment)
- Node.js 16+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/Flapjacck/FareShare.git
cd FareShare

# One-time setup (installs npm dependencies for root and frontend)
npm run setup
```

### Running the Application

#### Option 1: Start Both Servers (Recommended)

```bash
npm start
# or
npm run dev
```

**The script will automatically:**

- Create a Python virtual environment (if not present)
- Upgrade pip to the latest version
- Install backend dependencies from requirements.txt
- Start the FastAPI backend on `http://localhost:8000`
- Start the Vite frontend on `http://localhost:5173`

#### Option 2: Start Servers Individually

```bash
# Backend only
npm run dev:backend

# Frontend only  
npm run dev:frontend
```

### Project Structure

- `backend/` - FastAPI backend server
- `frontend/` - React + Vite frontend

For more detailed information:

- [Backend README](./backend/README.md)
- [Frontend README](./frontend/README.md)
