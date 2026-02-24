# Fragments microservice Dockerfile (optimized, multi-stage, small runtime image)

# ----------------------------------------------------------------------------
# Stage 1: deps (prod only)
# ----------------------------------------------------------------------------
FROM node:22.12.0-alpine@sha256:51eff88af6dff26f59316b6e356188ffa2c422bd3c3b76f2556a2e7e89d080bd AS deps
WORKDIR /app

# npm noise + faster/cleaner install
ENV NODE_ENV=production \
    NPM_CONFIG_LOGLEVEL=warn \
    NPM_CONFIG_COLOR=false

# Only copy package manifests first to leverage Docker cache
COPY package*.json ./

# Install ONLY production deps (exact versions from lock file)
RUN npm ci --omit=dev && npm cache clean --force

# ----------------------------------------------------------------------------
# Stage 2: runtime (small)
# ----------------------------------------------------------------------------
FROM node:22.12.0-alpine@sha256:51eff88af6dff26f59316b6e356188ffa2c422bd3c3b76f2556a2e7e89d080bd AS runtime
WORKDIR /app

ENV NODE_ENV=production

# Copy package manifests (for metadata) and prod node_modules from deps stage
COPY package*.json ./

# Copy prod node_modules from deps stage
COPY --chown=node:node --from=deps /app/node_modules ./node_modules

# Copy only the server source
COPY --chown=node:node ./src ./src

COPY --chown=node:node ./tests/.htpasswd ./tests/.htpasswd

USER node

EXPOSE 8080
CMD ["node", "src/index.js"]
