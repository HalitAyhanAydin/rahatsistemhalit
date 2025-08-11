# Backend Dockerfile
FROM node:18-alpine

WORKDIR /app

# Package files kopyala
COPY package*.json ./
RUN npm ci --only=production

# Prisma schema kopyala
COPY prisma ./prisma/
RUN npx prisma generate

# Uygulama dosyalarını kopyala
COPY . .

EXPOSE 3001

CMD ["node", "server.js"]
