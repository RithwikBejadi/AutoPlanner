# AutoPlanner

AutoPlanner is a full-stack timetable planning platform for schools and colleges.
It helps administrators manage teachers, subjects, rooms, class groups, and timeslots, then generate optimized timetables using a constraint-based scheduling engine.

## Features

- Google OAuth authentication
- Entity management for teachers, rooms, subjects, class groups, and timeslots
- Constraint-based timetable generation
- Timetable viewer with filtering by class, teacher, and room
- PostgreSQL persistence with Prisma ORM
- Modern React dashboard UI

## Tech Stack

- Frontend: React, Vite, Tailwind CSS, React Router, Axios, React Hook Form, Zod
- Backend: Node.js, TypeScript, Express
- Database: PostgreSQL + Prisma
- Auth: Google OAuth 2.0 + JWT cookie session

## Project Structure

```
AutoPlanner/
	frontend/        # React + Vite web app
	server/          # Express + TypeScript API and scheduler engine
	plan_diagrams/   # UML and planning diagrams
```

## Prerequisites

- Node.js 18+ (Node.js 20+ recommended)
- npm 9+
- PostgreSQL database
- Google OAuth client (Web application)

## Environment Variables

### Backend (`server/.env`)

Create `server/.env` and configure:

```env
DATABASE_URL="postgresql://<user>:<password>@<host>:<port>/<db>?sslmode=require"

GOOGLE_CLIENT_ID="<google-client-id>"
GOOGLE_CLIENT_SECRET="<google-client-secret>"
GOOGLE_REDIRECT_URI="http://localhost:4000/api/auth/google/callback"

JWT_SECRET="<long-random-secret-at-least-32-chars>"
JWT_EXPIRES_IN="7d"

NODE_ENV="development"
PORT=4000
CORS_ORIGIN="http://localhost:3000"
FRONTEND_URL="http://localhost:3000"
```

Notes:

- `CORS_ORIGIN` supports comma-separated origins in production.
- `FRONTEND_URL` is used for OAuth success redirect target.

### Frontend (`frontend/.env`)

```env
VITE_API_URL=http://localhost:4000/api
```

For production builds, use `frontend/.env.production`:

```env
VITE_API_URL=https://<your-backend-domain>/api
```

## Google OAuth Setup

In Google Cloud Console (OAuth client type: Web application):

- Authorized JavaScript origins:
	- `http://localhost:3000`
	- Your production frontend URL
- Authorized redirect URIs:
	- `http://localhost:4000/api/auth/google/callback`
	- `https://<your-backend-domain>/api/auth/google/callback`

## Local Development

1. Install backend dependencies:

```bash
cd server
npm install
```

2. Install frontend dependencies:

```bash
cd ../frontend
npm install
```

3. Set up database and Prisma (from `server/`):

```bash
npm run db:generate
npm run db:migrate
# Optional seed
npm run db:seed
```

4. Start backend (from `server/`):

```bash
npm run dev
```

5. Start frontend (from `frontend/`):

```bash
npm run dev
```

6. Open the app:

`http://localhost:3000`

## Available Scripts

### Backend (`server/package.json`)

- `npm run dev` - Run API in development mode with auto-reload
- `npm run build` - Compile TypeScript to `dist/`
- `npm run start` - Run compiled API
- `npm run lint` - Type-check without emit
- `npm run db:generate` - Generate Prisma client
- `npm run db:migrate` - Run Prisma migrations in dev
- `npm run db:push` - Push schema directly to DB
- `npm run db:seed` - Seed database
- `npm run db:studio` - Open Prisma Studio
- `npm run db:reset` - Reset DB and reseed

### Frontend (`frontend/package.json`)

- `npm run dev` - Start Vite dev server
- `npm run build` - Build production assets
- `npm run preview` - Preview production build locally

## API Overview

Base URL: `/api`

- `GET /health`
- `GET /api/auth/google`
- `GET /api/auth/google/callback`
- `GET /api/auth/me`
- `POST /api/auth/logout`
- `GET|POST|PUT|DELETE /api/teachers`
- `GET|POST|PUT|DELETE /api/rooms`
- `GET|POST|PUT|DELETE /api/subjects`
- `GET|POST|PUT|DELETE /api/class-groups`
- `GET|POST|PUT|DELETE /api/timeslots`
- `GET|POST|DELETE /api/timetables` (+ latest/entries/generate helpers)

Most non-auth routes require an authenticated session cookie.

## Scheduling Constraints

The scheduler validates assignments against these constraints:

- Teacher availability
- Teacher time conflicts
- Room capacity
- Room time conflicts
- Class group time conflicts
- Subject daily session limit

## Deployment Notes

- Deploy frontend and backend as separate services if needed.
- Set `VITE_API_URL` to backend API URL in frontend production env.
- Set backend `CORS_ORIGIN` to frontend URL(s).
- Set backend `GOOGLE_REDIRECT_URI` to deployed backend callback URL.
- Set backend `FRONTEND_URL` to deployed frontend URL.
- In production, auth cookies are configured for cross-origin usage (`Secure` + `SameSite=None`).

## Troubleshooting

- Login succeeds but user returns to login page:
	- Verify `VITE_API_URL`, `CORS_ORIGIN`, `GOOGLE_REDIRECT_URI`, and `FRONTEND_URL`.
	- Ensure frontend and backend domains match your OAuth and CORS settings.
- CORS errors in browser console:
	- Add the exact frontend origin to `CORS_ORIGIN`.
- Database connection issues:
	- Confirm `DATABASE_URL` and database network/SSL configuration.

## License

ISC
