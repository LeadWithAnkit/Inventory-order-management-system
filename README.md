# Inventory System

A simple full-stack inventory and order management app for a small electronics shop.

This project combines a React frontend with a FastAPI backend and PostgreSQL, all orchestrated by Docker Compose.

## What this project does

- Manage product listings with stock, price, SKU, and active status.
- Manage customers with unique email validation.
- Create orders for a customer using multiple products.
- Prevent orders when stock is insufficient.
- Automatically deduct inventory when an order is created.
- Calculate the order total on the backend.
- Return clear error responses with proper HTTP status codes.

## Project structure

```text
inventory-system/
  backend/
    app/
      api/v1/endpoints/   # FastAPI routes
      core/               # config and database setup
      models/             # SQLAlchemy models
      schemas/            # Pydantic request/response schemas
      services/           # business logic
      db_init.py          # database seeding and refresh logic
      main.py             # FastAPI app entrypoint
    Dockerfile
    requirements.txt
    alembic.ini

  frontend/
    src/
      components/         # UI components and layout
      pages/              # main app pages
      services/           # API client helper
      utils/              # shared helpers
    Dockerfile
    nginx.conf
    package.json

  docker-compose.yml
```

## Run the app

From the repository root:

```bash
docker compose up --build
```

Then open:

- Frontend: `http://localhost:8080`
- Backend docs: `http://localhost:8000/docs`
- Health: `http://localhost:8000/health`

If you want to use a different frontend port:

```bash
FRONTEND_PORT=5173 docker compose up --build
```

## Backend environment

The backend expects these database variables inside Docker:

```ini
POSTGRES_SERVER=db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=inventory_db
POSTGRES_PORT=5432
```

## Manual image build

```bash
docker build -t inventory-backend ./backend
docker build -t inventory-frontend ./frontend
```

## Deployment on Render and Vercel

### 1. Deploy PostgreSQL on Render

1. Sign in to Render and create a new PostgreSQL database.
2. Use these values:
   - Database name: `inventory_db`
   - User: `postgres`
   - Password: set a strong password
   - Port: `5432`
3. Copy the database connection details from Render.

### 2. Deploy the backend on Render

1. Create a new Web Service on Render.
2. Select Docker and connect your GitHub repo.
3. Set the build command to use the existing Dockerfile in `backend/`.
4. Set the start command to:

```bash
python app/db_init.py && uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

5. Add these environment variables in Render:
   - `POSTGRES_SERVER`: your Render DB host
   - `POSTGRES_USER`: your Render DB user
   - `POSTGRES_PASSWORD`: your Render DB password
   - `POSTGRES_DB`: `inventory_db`
   - `POSTGRES_PORT`: `5432`
   - `PORT`: `10000`

6. Deploy the backend and note the service URL.

### 3. Deploy the frontend on Vercel

1. Create a new Vercel project and point it to the `frontend/` directory.
2. Use the default build command: `npm run build`.
3. Set the output directory to `dist`.
4. Add an environment variable:
   - `VITE_API_URL`: `https://<your-render-backend-url>/api/v1`

5. Deploy the frontend.

### 4. Final notes

- The backend container uses a `PORT` environment variable, so Render can route traffic properly.
- The frontend build uses `VITE_API_URL` to call the deployed backend.
- If you use a custom backend domain, update `VITE_API_URL` accordingly.

## API overview

### Products
- `GET /api/v1/products`
- `POST /api/v1/products`
- `GET /api/v1/products/{id}`
- `PUT /api/v1/products/{id}`
- `DELETE /api/v1/products/{id}`

### Customers
- `GET /api/v1/customers`
- `POST /api/v1/customers`
- `GET /api/v1/customers/{id}`
- `PUT /api/v1/customers/{id}`
- `DELETE /api/v1/customers/{id}`

### Orders
- `GET /api/v1/orders`
- `POST /api/v1/orders`
- `GET /api/v1/orders/{id}`
- `PUT /api/v1/orders/{id}/status`
- `DELETE /api/v1/orders/{id}`

## Notes for GitHub

- The app is packaged for Docker Compose and ready to run.
- The backend seed script refreshes demo data safely if the database already exists.
- Frontend and backend ports are defined in `docker-compose.yml`.
- The repository is ready for push after this README update.
