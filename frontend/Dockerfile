FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json tsconfig.json build.mjs index.html ./
RUN npm install

COPY src ./src
RUN npm run build

FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]