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
## Linting
```bash
npm run lint
npm run lint:fix
```
## Troubleshooting
- Set `PORT` if the default port is already in use.
- Check `API_BASE_URL` when job-role pages cannot load.
- Run `npm ci` if dependencies or tests are failing unexpectedly.
## Contributing
```bash
git switch -c <branch-name>
git add .
git commit -m "message"
git push -u origin <branch-name>
```

Run `npm test` and `npm run lint` before opening a pull request to `main`.
