# Build the application in a temporary image that includes development tools.
FROM node:20-alpine AS build

# Use /app as the working directory for all following build commands.
WORKDIR /app

# Copy dependency manifests first so Docker can reuse this layer when only source changes.
COPY package.json package-lock.json ./
# Install the exact dependencies from the lockfile, including TypeScript for compilation.
RUN npm ci

# Copy the TypeScript configuration and application source, then compile to dist/.
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# Create a clean, smaller image containing only what is needed at runtime.
FROM node:20-alpine AS production

WORKDIR /app

# Enable production behavior in Node.js and its dependencies.
ENV NODE_ENV=production

# Install only the dependencies required to run the compiled application.
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy compiled JavaScript and the template/static files that TypeScript does not emit.
COPY --from=build /app/dist ./dist
COPY --from=build /app/src/views ./dist/views
COPY --from=build /app/src/public ./dist/public

# Document the port on which the Express application listens.
EXPOSE 3000

# Start the application via the package.json start script.
CMD ["npm", "start"]