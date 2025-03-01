# Используем официальный образ Node.js для сборки
FROM node:18 as build

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем файлы проекта
COPY package.json package-lock.json ./
RUN npm install

COPY . .

# Сборка React-приложения
RUN npm run build

# Используем Nginx для сервинга статических файлов
FROM nginx:1.21-alpine

# Копируем собранное приложение
COPY --from=build /app/build /usr/share/nginx/html

# Копируем кастомный конфиг Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Открываем порт 80
EXPOSE 80

# Запуск Nginx
CMD ["nginx", "-g", "daemon off;"]