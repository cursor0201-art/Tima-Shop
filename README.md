# TIMA_SHOP (Frontend & Backend)

This repository contains both the **React Frontend** and the **Django Backend** for the TIMA_SHOP e-commerce platform.

## Project Structure
- `/backend`: Django REST Framework API, PostgreSQL models, Django Admin, and Swagger Docs
- `/frontend`: React/Vite frontend with TailwindCSS, shadcn/ui, and Zustand
- `docker-compose.yml`: Root script for unifying both the frontend, backend, and database in local development

## Run Everything with Docker Compose (Recommended)

To run the whole stack simultaneously with one command:
```bash
docker compose up --build -d
```

Once started:
1. Initialize the Database and Seed it:
   ```bash
   docker compose exec backend python manage.py migrate
   docker compose exec backend python manage.py createsuperuser
   docker compose exec backend python manage.py seed_demo
   ```

2. Access the Application:
   - **Frontend UI**: [http://localhost:8080](http://localhost:8080)
   - **Backend API Docs (Swagger)**: [http://localhost:8000/api/docs/](http://localhost:8000/api/docs/)
   - **Django Admin Panel**: [http://localhost:8000/admin/](http://localhost:8000/admin/)

## Manual Installation

If you prefer to run both independently without `docker-compose`:

### Backend (Terminal 1)
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python manage.py migrate
python manage.py runserver
```

### Frontend (Terminal 2)
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Both environments will securely communicate over the specified ports (`8000` for backend, `8080` for frontend).
