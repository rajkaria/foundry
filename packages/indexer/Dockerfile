FROM node:22-bookworm-slim AS deps
ENV PNPM_HOME="/usr/local/share/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@9 --activate
WORKDIR /app
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages/indexer/package.json packages/indexer/
RUN pnpm install --frozen-lockfile

FROM deps AS build
COPY packages/indexer packages/indexer
COPY contracts/deployments contracts/deployments
RUN pnpm --filter @foundryprotocol/indexer build

FROM node:22-bookworm-slim AS runtime
ENV PNPM_HOME="/usr/local/share/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV NODE_ENV=production
ENV INDEXER_PORT=4000
RUN corepack enable && corepack prepare pnpm@9 --activate
WORKDIR /app
COPY --from=build /app /app
EXPOSE 4000
WORKDIR /app/packages/indexer
CMD ["node", "dist/index.js"]
