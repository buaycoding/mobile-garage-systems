# Garage Booking and Management System for Uganda

## Overview
This project is a production-ready full-stack web application for connecting vehicle owners with garages across Uganda. It includes customer booking, garage owner management, admin oversight, secure authentication, payment readiness, analytics, and real-time updates.

## Architecture
- Backend: Node.js + Express.js
- Frontend: EJS + Bootstrap 5 + JavaScript
- Database: PostgreSQL + pg
- Real-time: Socket.IO
- Authentication: JWT + bcrypt
- Storage: Cloudinary-ready image upload support

## Project Structure
- src/config
- src/controllers
- src/middlewares
- src/models
- src/repositories
- src/services
- src/validators
- src/routes
- src/sockets
- src/utils
- src/views
- src/public
- src/uploads

## Setup
1. Install dependencies: npm install
2. Create a PostgreSQL database and update DATABASE_URL in .env
3. Run schema.sql to create tables
4. Optionally run seed.sql for demo data
5. Start the app: npm run dev

## API Notes
The application exposes basic endpoints at /api/auth, /api/garages, /api/bookings, and /api/dashboard.

## Render Deployment
1. Deploy using Render with Docker.
2. Use `Dockerfile` and `npm ci --omit=dev` to build.
3. Set `DATABASE_URL` from a Render PostgreSQL database service.
4. Set secure secrets: `JWT_SECRET` and `JWT_REFRESH_SECRET`.
5. Use `PORT=3000` or let Render assign the port.

## Next Steps
- Implement full JWT auth flow
- Add database-backed CRUD for garages and bookings
- Add image upload integration
- Add payment and notification services
