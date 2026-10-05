FROM node:22-alpine
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY frontend ./frontend
COPY shared ./shared
RUN pnpm install --frozen-lockfile
ARG NEXT_PUBLIC_DATA_MODE=api
ARG NEXT_PUBLIC_API_URL=http://localhost:8000
ENV NEXT_PUBLIC_DATA_MODE=$NEXT_PUBLIC_DATA_MODE
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
RUN pnpm build
EXPOSE 3000
CMD ["pnpm", "--filter", "frontend", "start"]
