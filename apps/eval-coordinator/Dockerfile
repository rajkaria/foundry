FROM node:22-bookworm-slim AS base
ENV PNPM_HOME="/usr/local/share/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@9 --activate
WORKDIR /app

# Stage 1: install + build (full workspace context).
FROM base AS build
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @foundryprotocol/sdk build
RUN pnpm --filter @foundryprotocol/eval-coordinator build
# Prune to production deps for the slim runtime stage.
RUN pnpm --filter @foundryprotocol/eval-coordinator deploy --prod /out

# Stage 2: minimal runtime.
FROM base AS runtime
ENV NODE_ENV=production
COPY --from=build /out /app
CMD ["node", "dist/index.js"]
