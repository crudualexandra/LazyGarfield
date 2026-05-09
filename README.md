# LazyGarfield

LazyGarfield is a TV series tracker built across two labs:

- **Lab 6 (Front-end):** React + Vite single-page app
- **Lab 7 (Back-end):** Express REST API with JWT auth + Swagger + SQLite persistence

## Lab 6 Front-end (React + Vite)

The front-end is a React application that lets you manage a list of TV series (favorites, ratings, episodes, etc.).

### Run the frontend

In a terminal at the project root:

```bash
npm install
npm run dev
```

Frontend URL:

- http://localhost:5173

## Lab 7 Back-end

LazyGarfield now includes a **protected REST API** for the **Series** entity. The API is secured with **JWT authorization** and supports role/permission-based access.

### Backend Tech Stack

- Node.js
- Express
- JWT
- Swagger UI
- SQLite
- better-sqlite3
- CORS

Backend URL:

- http://localhost:4000

Swagger UI URL:

- http://localhost:4000/api-docs

### Backend Features

- CRUD API for Series
- JWT authorization
- Role and permission-based access
- Token expiration in 1 minute
- Swagger API documentation
- Pagination with `limit` and `skip`
- SQLite persistence
- Frontend-backend integration

### API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | /token | Generate JWT token |
| GET | /api/series | Get paginated series |
| GET | /api/series/:id | Get one series by id |
| POST | /api/series | Create a new series |
| PUT | /api/series/:id | Update a series |
| DELETE | /api/series/:id | Delete a series |

### Run the backend

In a second terminal:

```bash
cd backend
npm install
npm run dev
```

### Permissions (quick summary)

The JWT contains a `role` and a list of `permissions`.

- **READ** is required for GET routes
- **WRITE** is required for POST and PUT routes
- **DELETE** is required for DELETE route

### SQLite persistence

The backend stores series in `backend/data/lazygarfield.db`, so created, updated, and deleted series remain available after restarting the backend server.

### JWT demo (cURL)

1) Generate a token (expires in 1 minute):

```bash
curl -X POST http://localhost:4000/token \
  -H "Content-Type: application/json" \
  -d '{"role":"ADMIN","permissions":["READ","WRITE","DELETE"]}'
```

2) Call a protected endpoint using the token:

```bash
curl "http://localhost:4000/api/series?limit=3&skip=0" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Frontend ↔ backend integration

The React frontend can connect to the protected backend API from the **Insights** page. When **API mode** is active, Series CRUD operations are sent to the backend.

- LocalStorage remains for theme, filters, active page, and offline fallback.

---

Expected manual commit message:

- Update README for Lab 7 backend and SQLite