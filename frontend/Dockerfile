FROM node:18-alpine AS angular_builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

RUN npm run build --configuration frontend

FROM nginx:alpine

RUN rm -f /etc/nginx/conf.d/default.conf && \
    rm -rf /usr/share/nginx/html/*

COPY --from=angular_builder /app/dist/frontend/browser /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]