
# FareShare Backend

Contains the backend for FareShare.

## Getting Started

### Prerequisites

- [Python 3.8+](https://www.python.org/downloads/)
- [PostgreSQL 13+](https://www.postgresql.org/download/) with PostGIS extension
- Database URL in `.env` file (see `.env.example`)

### Setting up the Backend

```bash
# Navigate to the backend directory
cd backend

# Create a virtual environment named 'venv'
python -m venv venv

# Activate the virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
# source venv/bin/activate

# Upgrade pip inside the venv
python -m pip install --upgrade pip

# Install dependencies
pip install -r requirements.txt

# Create .env file (copy from example and edit)
copy .env.example .env
# On macOS/Linux:
# cp .env.example .env

# Edit .env with your database credentials
# For local development:
# DATABASE_URL=postgresql://username:password@localhost:5432/fareshare
# Make sure to use your actual PostgreSQL username, password, and database name

# Set up a local PostgreSQL database with PostGIS extension:
# 1. Install PostgreSQL and PostGIS on your local machine
# 2. Create a database: CREATE DATABASE fareshare;
# 3. Install extensions: 
#    CREATE EXTENSION postgis;
#    CREATE EXTENSION pgcrypto;
# 4. Update .env to point to your local database

# Run the database connectivity test to verify
python -m scripts.db_test

# Create database tables
python -m scripts.create_tables

# (Optional) Seed the database with test data
python -m scripts.seed_db
```

### Running the Backend Server

```bash
# Make sure your virtual environment is activated
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
# source venv/bin/activate

# Start the server in development mode (auto-reload on code changes)
uvicorn app:app --reload

# Or start in production mode
uvicorn app:app --host 0.0.0.0 --port 8000
```

The server will start on `http://localhost:8000` by default. You can access:

- API root: `http://localhost:8000/`
- Health check: `http://localhost:8000/health`
- Interactive API docs: `http://localhost:8000/docs`
- Alternative API docs: `http://localhost:8000/redoc`

### Database Commands

```bash
# Reset and recreate all database tables 
python -m scripts.create_tables

# Run database connection test
python -m scripts.db_test

# Seed database with sample data
python -m scripts.seed_db
```

### API Documentation

Once the server is running, you can access the interactive API documentation:

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

### Deactivating the Environment

When you're done working on the project:

```bash
# Deactivate the virtual environment
deactivate
```
