FROM oven/bun:1.1-alpine

RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    nodejs

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

WORKDIR /app

COPY package.json bun.lockb ./

RUN bun install --frozen-lockfile --production

COPY src ./src
COPY tsconfig.json ./

RUN bun build src/index.ts --outdir dist --target bun

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD bun fetch http://localhost:3001/health || exit 1

CMD ["bun", "dist/index.js"]