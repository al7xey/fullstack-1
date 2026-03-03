# Frontend интернет-магазина (React)

Это простое демо-приложение на React, которое подключается к backend на Express
по адресу `http://localhost:3000/api` и реализует полный CRUD для товаров.

## Скрипты

- `npm start` — запуск dev-сервера (порт 3001, настроено в `package.json`)
- `npm run sass` — разовая компиляция SCSS в CSS
- `npm run dev` — параллельно запускает `sass` и `start` (под Windows используется `&`)

## Запуск

1. Установите зависимости:
   - `cd frontend`
   - `npm install`
2. Убедитесь, что backend запущен на порту 3000.
3. Запустите фронтенд:
   - `npm run dev`

