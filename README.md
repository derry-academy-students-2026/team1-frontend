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
## Docker
The Docker image uses a multi-stage build: it compiles the TypeScript application
in a build image, then runs the compiled output with production dependencies
only. The Nunjucks views and static assets are included in the runtime image.

Build the image from the frontend directory:
```bash
docker build -t team1-frontend .
```

Run it on port 3000, setting the backend URL reachable from the container:
```bash
docker run --rm -p 3000:3000 \
  -e API_BASE_URL="http://host.docker.internal:4000" \
  -e SESSION_SECRET="$(openssl rand -hex 32)" \
	-e SESSION_COOKIE_SECURE=false \
  team1-frontend
```

On macOS, `host.docker.internal` lets the container reach a backend running on
your host machine. If both applications are attached to the same Docker
network, use the backend container's service name instead, for example
`API_BASE_URL="http://team1-backend:4000"`. Open `http://localhost:3000` after
the container starts. `SESSION_COOKIE_SECURE=false` is required when accessing
the container directly over HTTP. For an HTTPS deployment, omit it or set it to
`true`.
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

`FEATURE_REGISTRATION_ENABLED` toggles user registration and defaults to `true`.
When `false`, `/register` returns 404 and the link is hidden on the login page.
In Azure it is set from `feature_registration_enabled` in the environment's
`.tfvars`, so it can be changed without rebuilding the image.

## Azure deployment

Infrastructure lives in `my-infrastructure/` and is applied by the CI pipeline.
The frontend runs as an Azure Container App, pulling its image from ACR and
reading `SESSION_SECRET` from Key Vault using a user-assigned managed identity.

### Required manual step for a new environment

Terraform creates the Key Vault but **does not create the secret inside it**.
Before the first apply in any new environment, add the secret by hand:

1. Open the vault `<project_name>-kv-<environment>` in the Azure portal
   (for example `team1-frontend-kv-dev`)
2. Go to **Objects → Secrets → + Generate/Import**
3. Name it `session-secret` — this must match `var.session_secret_name`
4. Use a long random value, for example from `openssl rand -base64 48`

Skipping this step is not obvious: `terraform apply` succeeds, but every
container revision then fails to start because the secret reference cannot be
resolved. Rotating the secret requires restarting the revision, and logs every
user out.

## Build
```bash
npm run build
```
## Testing
Unit tests:
```bash
npm test
```

Integration tests:
```bash
npm run test:integration
```

BDD tests:
```bash
npm run test:bdd
npm run test:bdd:report
```

Test UI and coverage:
```bash
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
