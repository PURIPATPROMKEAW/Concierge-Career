FROM node:24-slim
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@11.19.0 --activate
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY frontend frontend
RUN pnpm build
EXPOSE 3000
CMD ["pnpm", "exec", "next", "start", "frontend", "--hostname", "0.0.0.0"]
