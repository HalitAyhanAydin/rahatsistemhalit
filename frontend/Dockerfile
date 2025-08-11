# Frontend Dockerfile
FROM node:18-alpine as build

WORKDIR /app

# Package files kopyala
COPY package*.json ./
RUN npm ci

# Uygulama dosyalarını kopyala ve build et
COPY . .
RUN npm run build

# Nginx ile serve et
FROM nginx:alpine

COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
