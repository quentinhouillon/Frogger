FROM node:22-alpine AS build

WORKDIR /workspace/frontend

RUN corepack enable

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --no-frozen-lockfile

COPY . .

ARG VITE_WS_URL=ws://localhost:1234
ENV VITE_WS_URL=${VITE_WS_URL}

RUN pnpm build

FROM nginx:1.27-alpine AS runtime

COPY --from=build /workspace/frontend/dist /usr/share/nginx/html
COPY default.conf /etc/nginx/conf.d/default.conf

EXPOSE 1267

CMD ["nginx", "-g", "daemon off;"]