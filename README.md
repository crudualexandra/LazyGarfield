# LazyGarfield — Lab 6 & Lab 7 Summary

LazyGarfield is a TV series tracking web application built with React, Vite, Node.js, Express, SQLite, JWT authentication, and the TVmaze public API. The project started as a client-side Lab 6 tracker and was extended in Lab 7 into a full-stack web application with user accounts, personal libraries, episode ratings, comments, and public reviews.

---

## Lab 6 — Front-end Implementation

Lab 6 required a client-side web application for tracking TV series. The first version was implemented with React + Vite and localStorage.

Implemented Lab 6 features:

- Responsive React interface
- Dark/light theme
- Series cards with title, genres, status, rating, seasons, poster, and favorite button
- Add, delete, favorite, and rate series
- Search and filter by title, genre, and status
- Dashboard/Insights with statistics
- Episode rating support
- localStorage persistence for theme, filters, active page, and local data
- Custom LazyGarfield visual identity and mascot

This satisfied the Lab 6 requirement for a client-side-only TV series tracker.

---

## Lab 7 — Back-end Implementation

Lab 7 required a CRUD API for the Lab 6 entity, protected with JWT, documented with Swagger, and integrated with the frontend.

Implemented Lab 7 features:

- Node.js + Express REST API
- SQLite database using better-sqlite3
- JWT authentication and authorization
- /token endpoint for demo JWT generation
- Configurable JWT expiration:
  - JWT_EXPIRES_IN=1m for official lab demo
  - longer values such as 30m for development
- Swagger UI documentation at /api-docs
- Correct HTTP status codes
- Pagination with limit and skip
- Frontend-backend integration

Initial CRUD routes were implemented for the Series entity:

- GET /api/series
- GET /api/series/:id
- POST /api/series
- PUT /api/series/:id
- DELETE /api/series/:id

---

## Improved Final Version

After satisfying the basic Lab 7 requirements, the project was improved to work more like a real Letterboxd-style application for TV series.

Instead of one shared global list, the app now separates:

- Public series discovery
- Personal user libraries
- Episode ratings and comments
- Public community reviews

---

## Authentication

Users can register and log in.

Implemented routes:

- POST /auth/register
- POST /auth/login
- GET /auth/me

JWT stores:

- userId
- email
- role

Passwords are hashed with bcryptjs.

---

## TVmaze Integration

The app uses TVmaze as a public TV series catalog.

Implemented backend proxy routes:

- GET /api/discover/search?q=dark
- GET /api/discover/shows/:tvmazeId
- GET /api/discover/shows/:tvmazeId/episodes

Users can search real TV series, view real data, posters, genres, descriptions, and episode lists, then add selected shows to their personal library.

---

## Personal Library

Each logged-in user has their own library.

Implemented routes:

- GET /api/my-library
- POST /api/my-library
- PUT /api/my-library/:id
- DELETE /api/my-library/:id

Users can:

- Add shows from Discover
- Set status: Plan to Watch, Watching, Completed, Dropped
- Rate shows
- Favorite shows
- Remove shows from their own library

This is better than the original CRUD-only version because each user manages only their own saved series.

---

## Episode Ratings and Comments

Users can rate and comment on individual episodes.

Implemented routes:

- GET /api/my-library/:tvmazeId/episode-ratings
- POST /api/episode-ratings
- PUT /api/episode-ratings/:id
- DELETE /api/episode-ratings/:id

Users can:

- Mark episodes as watched
- Rate episodes from 1 to 5
- Write episode comments/reviews
- Delete episode ratings

---

## Public Reviews

Episode comments can be shown publicly as community reviews.

Implemented routes:

- GET /api/reviews
- GET /api/shows/:tvmazeId/reviews

The Insights page displays recent public episode notes written by users.

---

## Database Tables

The SQLite database contains:

- users
- user_library
- episode_ratings

This structure supports real accounts, personal libraries, and user-specific ratings/comments.

---

## Why the Final Version Is Better

The final version goes beyond a simple lab CRUD app by adding:

- Real user accounts
- Personal libraries per user
- Real TV series data from TVmaze
- SQLite persistence
- Episode-level tracking
- Public reviews
- Role-based user structure
- More realistic full-stack architecture

This makes LazyGarfield closer to a real web application rather than only a local tracker or simple CRUD demo.

---

## Run Locally

Install frontend dependencies:

```bash
npm install
```

Install backend dependencies:

```bash
cd backend
npm install
```

Run backend:

```bash
JWT_EXPIRES_IN=30m npm run dev
```

For official Lab 7 demo expiration:

```bash
JWT_EXPIRES_IN=1m npm run dev
```

Run frontend:

```bash
npm run dev
```

Frontend:

http://localhost:5173

Backend:

http://localhost:4000

Swagger:

http://localhost:4000/api-docs

---

## Demo Accounts

Demo User:

Email: user@lazygarfield.local
Password: user123
Role: USER

Demo Admin:

Email: admin@lazygarfield.local
Password: admin123
Role: ADMIN

---

## Future Work

Planned improvements:

- Dockerize frontend and backend
- Add deployment configuration
- Add admin panel for review moderation and user management
- Add public user profiles
- Add review likes and editing
- Add watch progress percentage
- Group episodes by season
- Add better recommendation system
- Move from SQLite to PostgreSQL for production
