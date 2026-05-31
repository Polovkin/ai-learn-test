# jwt-concurrent-refresh-learning

Minimal full-stack learning project for JWT auth and the intentional concurrent refresh bug.

## Structure
- `backend` - NestJS + Prisma + SQLite
- `frontend` - Vue 3 + Vite + TypeScript

## Backend setup
1. `cd backend`
2. `npm install`
3. `cp .env.example .env`
4. `npx prisma migrate dev`
5. `npx prisma db seed`
6. `npm run start:dev`

## Frontend setup
1. `cd frontend`
2. `npm install`
3. `cp .env.example .env`
4. `npm run dev`

## Test scenario
1. Open frontend.
2. Login with:
   - `demo@example.com`
   - `password123`
3. Click `Load profile` to verify protected request works.
4. Wait 6 seconds for the access token to expire.
5. Click `Load all protected data`.
6. Observe multiple refresh calls in backend logs.
7. Observe multiple refresh attempts in frontend UI logs.
8. This is the intentional bug that will be fixed later.
