# Multi-stage Docker build for the ForwardEngineer monolith.
# Stage 1 builds the Vite frontend, then the final image runs the Express API
# and serves the built frontend files from the backend.

# --- Stage 1: build the frontend ---
# Install frontend dependencies separately first so Docker can reuse this layer
# when app code changes but package files stay the same.
FROM node:22-bookworm-slim AS frontend-build
WORKDIR /app/frontend

COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci --no-audit --no-fund

# Copy the rest of the frontend source and create the production Vite build.
COPY frontend/ ./

# Clerk publishable key is safe to pass at build time because it is public and
# becomes part of the client bundle.
ARG VITE_CLERK_PUBLISHABLE_KEY
ENV VITE_CLERK_PUBLISHABLE_KEY=$VITE_CLERK_PUBLISHABLE_KEY

RUN npm run build

# --- Stage 2: production runtime ---
# Keep the final image smaller by installing only backend production
# dependencies, then copy in the backend source and built frontend assets.
FROM node:22-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

# Install only the backend packages needed at runtime.
COPY backend/package.json backend/package-lock.json ./backend/
WORKDIR /app/backend
RUN npm ci --omit=dev --no-audit --no-fund && npm cache clean --force

# Copy backend source and the built frontend output that Express serves in
# production from ../../frontend/dist relative to backend/src/server.js.
COPY backend/src ./src
COPY --from=frontend-build /app/frontend/dist ../frontend/dist

# Render sets PORT automatically; the app listens on that env var.
EXPOSE 3001

# Start the Express API server, which also serves the frontend in production.
CMD ["node", "src/server.js"]
