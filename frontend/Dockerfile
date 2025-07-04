# Stage 1: build the frontend
FROM node:20-alpine AS build
ENV VITE_BACKEND_URL=http://localhost:8000
WORKDIR /app
COPY package.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: serve the static files
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
EXPOSE 80
CMD ["/entrypoint.sh"]
