# Team 1 Frontend
## Overview
Team 1 Frontend is a TypeScript web application for browsing job roles. Express
serves the application, Nunjucks renders the views, and Axios retrieves job-role
data for the frontend pages.
## Tech Stack
- TypeScript
- Node.js and Express
- Nunjucks
- Axios
- Morgan
- Winston
- Vitest and Supertest
- Biome
## Architecture
```text
Browser
  -> Express app
	  -> Router
		  -> Controller
			  -> Service
				  -> API client
					  -> Job Roles API (API_BASE_URL)

Controller -> Nunjucks views -> HTML response
```
Server bootstrap loads environment variables and starts the Express server.
Logging middleware captures request logs and application logs.
Static assets are served on `/assets`.
## Project Structure
```text
src/
	config/       API and request configuration
	controllers/  Request handlers
	models/       TypeScript data models
	public/       Images and stylesheets
	routes/       Express routes
	services/     API service functions
	views/        Nunjucks and HTML views
tests/
	controllers/  Controller tests
	routes/       Route tests
	services/     Service tests
```
## Prerequisites
- Node.js 20
- npm
- Access to the API used for job-role pages
## Installation & Running
```bash
npm ci
npm run dev
```
The development server runs on `http://localhost:3000` by default.
## Environment Variables
Set these variables in a local `.env` file when needed:
```env
API_BASE_URL="http://localhost:4000"
PORT="3000"
NODE_ENV="development"
SESSION_SECRET="replace-with-a-strong-random-value"
AUTH_LOGIN_PATH="/auth/login"
```

`API_BASE_URL` and `PORT` use the shown defaults when unset. `NODE_ENV` defaults
to `development`. `AUTH_LOGIN_PATH` defaults to `/auth/login` when unset.
`SESSION_SECRET` must be set to a strong random value in production; a
development fallback is used otherwise, but this should never be relied on
outside local development.
## Build
```bash
npm run build
```
## Testing
```bash
npm test
npm run test:ui
npm run test:coverage
```
## End-to-End Tests (Playwright)
The e2e suite drives the app through a real browser against the real backend
API (no mocking). It lives under `e2e/`:
```text
e2e/
	fixtures/         Test user credentials and job-role data matching the
	                  backend's prisma/seed.ts
	pages/            Page objects (login, job roles list, job role detail)
	tests/            Spec files
	global-setup.ts   Checks the backend is reachable and seeded before the
	                  suite runs
	global-teardown.ts  Runs once after the suite finishes
```
### Prerequisites
- The real backend API must already be running and seeded (its seed script
  must create the test user and job roles referenced in
  `e2e/fixtures/test-data.ts`).
- Set `BACKEND_URL` if the backend isn't on the default `http://localhost:4000`.

Playwright starts the frontend itself (`npx tsx src/index.ts`) pointed at
`BACKEND_URL`; you don't need to run `npm run dev` separately.

### Running
```bash
npm run test:e2e          # headless, all browsers
npm run test:e2e:ui       # interactive UI mode
npm run test:e2e:headed   # headed browser windows
npm run test:e2e:report   # open the last HTML report
```
`global-setup.ts` logs in as the seeded test user before any spec runs and
fails fast with a clear error if the backend is unreachable or unseeded.
`global-teardown.ts` runs once after the suite completes.
## Linting
```bash
npm run lint
npm run lint:fix
```
## Troubleshooting
- Set `PORT` if the default port is already in use.
- Check `API_BASE_URL` when job-role pages cannot load.
- Run `npm ci` if dependencies or tests are failing unexpectedly.
- For e2e failures, confirm the real backend is running and seeded, and check
  `BACKEND_URL` matches its address.
## Contributing
```bash
git switch -c <branch-name>
git add .
git commit -m "message"
git push -u origin <branch-name>
```

Run `npm test` and `npm run lint` before opening a pull request to `main`.
