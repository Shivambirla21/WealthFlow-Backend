# WealthFlow Backend

Basic Node.js + Express MVC backend structure.

## Structure

```text
config/        app configuration
controllers/   request handlers
models/        data and business logic
routes/        API route definitions
common/        shared middleware and utilities
server.js      server entry file
app.js         Express app setup
```

## Start

```bash
npm install
copy .env.example .env
npm run dev
```

API base URL:

```text
http://localhost:5000/api
```

## Current Endpoints

- `GET /api/health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/users/me`
- `GET /api/dashboard`
- `GET /api/transactions`
- `POST /api/transactions`
