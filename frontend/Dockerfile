# ----------- Builder Stage -----------
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# VITE_ vars are baked in at build time; pass empty string so nginx handles proxying
ARG VITE_API_BASE_URL=""
ARG VITE_DEMO_EMAIL=admin@ikn.com
ARG VITE_DEMO_PASSWORD=ikn123
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_DEMO_EMAIL=$VITE_DEMO_EMAIL
ENV VITE_DEMO_PASSWORD=$VITE_DEMO_PASSWORD

RUN npm run build

# ----------- Development Stage -----------
FROM node:20-alpine AS dev

WORKDIR /app

COPY package*.json ./
RUN npm ci

# Source is mounted as volume in docker-compose; don't copy here
EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# ----------- Production Stage -----------
FROM nginx:alpine AS prod

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
