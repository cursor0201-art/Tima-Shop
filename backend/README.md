# TIMA_SHOP API Backend

This is the backend for TIMA_SHOP e-commerce, built with Django and Django REST Framework.

## Features
- PostgreSQL Database
- Public API (read-only for products/categories, order creation)
- Admin-only API (JWT protected, includes `china_price` and margins)
- Swagger OpenAPI Docs (`/api/schema/`, `/api/docs/`)

## How to run locally (Virtual Environment)
1. Navigate to the `backend` folder.
2. Create virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # Or venv\Scripts\activate on Windows
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Create an `.env` file from `.env.example`:
   ```bash
   cp .env.example .env
   # Make sure DB_HOST is set to 127.0.0.1 or localhost in .env for local run
   ```
5. Apply migrations:
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```
6. Create superuser and seed demo data:
   ```bash
   python manage.py createsuperuser
   python manage.py seed_demo
   ```
7. Run the server:
   ```bash
   python manage.py runserver
   ```

## How to run via Docker Compose
1. Go to the `backend` folder:
   ```bash
   docker-compose up --build -d
   ```
2. Run database migrations inside the container:
   ```bash
   docker-compose exec backend python manage.py migrate
   ```
3. Load demo data and create a superuser:
   ```bash
   docker-compose exec backend python manage.py createsuperuser
   docker-compose exec backend python manage.py seed_demo
   ```

## Connecting to Frontend
If you have a frontend app like React/Vite, use an environment variable to set the API endpoint.
In your Vite frontend `.env` file:
```env
VITE_API_BASE_URL=http://localhost:8000/api
```

### Security Verification (`china_price` hiding)
To verify that `china_price` is NOT returned in the public API, you can test via `curl`:
```bash
curl -X GET http://localhost:8000/api/products/
```
Check the JSON response; you will not see `china_price` or `margin`.

To see `china_price` via Admin API, you must get a token first:
```bash
curl -X POST http://localhost:8000/api/admin/token/ \
     -H "Content-Type: application/json" \
     -d '{"username": "your_admin", "password": "your_password"}'
```
Then use the token:
```bash
curl -X GET http://localhost:8000/api/admin/products/ \
     -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Adding Products Manually
You can navigate to `http://localhost:8000/admin/` to log in under the superuser account. From there, you can view and edit `Category`, `Brand`, `Product`, `SKU`, and `Order` entries. 
Orders will show history and snapshot data safely.
