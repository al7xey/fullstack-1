// server.js - основной файл Express-приложения интернет-магазина

const express = require('express');
const cors = require('cors');
const { nanoid } = require('nanoid');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const app = express();
const PORT = 3000;

// ===== Middleware =====

// Парсинг JSON-тел запросов
app.use(express.json());

// Простое логирование запросов
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(
      `${req.method} ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`
    );
  });
  next();
});

// CORS – разрешаем запросы только с http://localhost:3001
app.use(
  cors({
    origin: 'http://localhost:3001',
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type']
  })
);

// ===== Модель и "база данных" в памяти =====

/**
 * @typedef {Object} Product
 * @property {string} id
 * @property {string} name
 * @property {string} category
 * @property {string} description
 * @property {number} price
 * @property {number} stock
 * @property {number} [rating]
 * @property {string} [imageUrl]
 */

/** @type {Product[]} */
let products = [
  {
    id: nanoid(6),
    name: 'Смартфон Galaxy X1',
    category: 'Электроника',
    description: '6.5" AMOLED, 128 ГБ памяти, 5G',
    price: 39999,
    stock: 15,
    rating: 4.5,
    imageUrl: 'https://via.placeholder.com/300x200?text=Galaxy+X1'
  },
  {
    id: nanoid(6),
    name: 'Ноутбук UltraBook 14',
    category: 'Электроника',
    description: 'Лёгкий ноутбук 14", 16 ГБ RAM, 512 ГБ SSD',
    price: 79999,
    stock: 8,
    rating: 4.7,
    imageUrl: 'https://via.placeholder.com/300x200?text=UltraBook+14'
  },
  {
    id: nanoid(6),
    name: 'Футболка Basic',
    category: 'Одежда',
    description: 'Хлопковая футболка, разные размеры и цвета',
    price: 999,
    stock: 120,
    rating: 4.2,
    imageUrl: 'https://via.placeholder.com/300x200?text=T-Shirt'
  },
  {
    id: nanoid(6),
    name: 'Кроссовки RunPro',
    category: 'Спорт',
    description: 'Лёгкие беговые кроссовки для тренировок',
    price: 5499,
    stock: 35,
    rating: 4.6,
    imageUrl: 'https://via.placeholder.com/300x200?text=RunPro'
  },
  {
    id: nanoid(6),
    name: 'Книга "JavaScript для начинающих"',
    category: 'Книги',
    description: 'Пошаговое руководство по JavaScript',
    price: 1499,
    stock: 45,
    rating: 4.8,
    imageUrl: 'https://via.placeholder.com/300x200?text=JS+Book'
  },
  {
    id: nanoid(6),
    name: 'Электрический чайник HomeHeat',
    category: 'Дом',
    description: '1.7 л, автоотключение, защита от перегрева',
    price: 2599,
    stock: 60,
    rating: 4.4,
    imageUrl: 'https://via.placeholder.com/300x200?text=Kettle'
  },
  {
    id: nanoid(6),
    name: 'Гантели 2x5 кг',
    category: 'Спорт',
    description: 'Набор гантелей по 5 кг с неоскользящим покрытием',
    price: 2999,
    stock: 25,
    rating: 4.3,
    imageUrl: 'https://via.placeholder.com/300x200?text=Dumbbells'
  },
  {
    id: nanoid(6),
    name: 'Плед SoftTouch',
    category: 'Дом',
    description: 'Мягкий флисовый плед 150x200 см',
    price: 1899,
    stock: 40,
    rating: 4.9,
    imageUrl: 'https://via.placeholder.com/300x200?text=Plaid'
  },
  {
    id: nanoid(6),
    name: 'Наушники MusicPro',
    category: 'Электроника',
    description: 'Беспроводные наушники с шумоподавлением',
    price: 5999,
    stock: 22,
    rating: 4.5,
    imageUrl: 'https://via.placeholder.com/300x200?text=Headphones'
  },
  {
    id: nanoid(6),
    name: 'Рюкзак CityPack',
    category: 'Одежда',
    description: 'Городской рюкзак объёмом 20 л',
    price: 3499,
    stock: 30,
    rating: 4.1,
    imageUrl: 'https://via.placeholder.com/300x200?text=Backpack'
  }
];

// Вспомогательная функция поиска товара или 404
function findProductOr404(req, res) {
  const { id } = req.params;
  const product = products.find((p) => p.id === id);
  if (!product) {
    res.status(404).json({ message: 'Product not found' });
    return null;
  }
  return product;
}

// Простая валидация тела запроса для товара
function validateProductPayload(payload, isPartial = false) {
  const errors = [];

  const fields = ['name', 'category', 'description', 'price', 'stock'];

  fields.forEach((field) => {
    if (!isPartial || field in payload) {
      if (payload[field] === undefined || payload[field] === null || payload[field] === '') {
        errors.push(`Field "${field}" is required`);
      }
    }
  });

  if ((!isPartial || 'price' in payload) && typeof payload.price !== 'number') {
    errors.push('Field "price" must be a number');
  }
  if ((!isPartial || 'stock' in payload) && typeof payload.stock !== 'number') {
    errors.push('Field "stock" must be a number');
  }

  if ('rating' in payload && payload.rating !== undefined) {
    if (typeof payload.rating !== 'number' || payload.rating < 0 || payload.rating > 5) {
      errors.push('Field "rating" must be a number between 0 and 5');
    }
  }

  return errors;
}

// ===== Swagger настройка =====

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Simple Shop API',
      version: '1.0.0',
      description: 'API интернет-магазина с CRUD для товаров'
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Local server'
      }
    ]
  },
  apis: [__filename] // Используем этот файл для JSDoc-комментариев
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       required:
 *         - id
 *         - name
 *         - category
 *         - description
 *         - price
 *         - stock
 *       properties:
 *         id:
 *           type: string
 *           description: Уникальный идентификатор товара
 *           example: "a1b2c3"
 *         name:
 *           type: string
 *           description: Название товара
 *           example: "Смартфон Galaxy X1"
 *         category:
 *           type: string
 *           description: Категория товара
 *           example: "Электроника"
 *         description:
 *           type: string
 *           description: Описание товара
 *           example: "6.5\" AMOLED, 128 ГБ памяти, 5G"
 *         price:
 *           type: number
 *           description: Цена товара
 *           example: 39999
 *         stock:
 *           type: number
 *           description: Количество на складе
 *           example: 10
 *         rating:
 *           type: number
 *           description: Рейтинг товара (0-5)
 *           minimum: 0
 *           maximum: 5
 *           example: 4.5
 *         imageUrl:
 *           type: string
 *           description: Ссылка на изображение товара
 *           example: "https://via.placeholder.com/300x200?text=Product"
 */

/**
 * @swagger
 * tags:
 *   - name: Products
 *     description: Операции с товарами
 */

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Получить список всех товаров
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Список товаров успешно получен
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 *       500:
 *         description: Внутренняя ошибка сервера
 */
app.get('/api/products', (req, res, next) => {
  try {
    res.json(products);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Получить товар по ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID товара
 *     responses:
 *       200:
 *         description: Товар найден
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Товар не найден
 *       500:
 *         description: Внутренняя ошибка сервера
 */
app.get('/api/products/:id', (req, res, next) => {
  try {
    const product = findProductOr404(req, res);
    if (!product) return;
    res.json(product);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Создать новый товар
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               category:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               stock:
 *                 type: number
 *               rating:
 *                 type: number
 *               imageUrl:
 *                 type: string
 *           example:
 *             name: "Новый товар"
 *             category: "Электроника"
 *             description: "Описание нового товара"
 *             price: 12345
 *             stock: 5
 *             rating: 4.5
 *             imageUrl: "https://via.placeholder.com/300x200?text=New"
 *     responses:
 *       201:
 *         description: Товар успешно создан
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Невалидные данные
 *       500:
 *         description: Внутренняя ошибка сервера
 */
app.post('/api/products', (req, res, next) => {
  try {
    const errors = validateProductPayload(req.body, false);
    if (errors.length > 0) {
      return res.status(400).json({ message: 'Validation failed', errors });
    }

    const newProduct = {
      id: nanoid(6),
      name: req.body.name,
      category: req.body.category,
      description: req.body.description,
      price: req.body.price,
      stock: req.body.stock,
      rating: req.body.rating,
      imageUrl: req.body.imageUrl
    };

    products.push(newProduct);
    res.status(201).json(newProduct);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/products/{id}:
 *   patch:
 *     summary: Обновить данные товара
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID товара
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               category:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               stock:
 *                 type: number
 *               rating:
 *                 type: number
 *               imageUrl:
 *                 type: string
 *           example:
 *             price: 14999
 *             stock: 20
 *     responses:
 *       200:
 *         description: Товар успешно обновлён
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Невалидные данные
 *       404:
 *         description: Товар не найден
 *       500:
 *         description: Внутренняя ошибка сервера
 */
app.patch('/api/products/:id', (req, res, next) => {
  try {
    const product = findProductOr404(req, res);
    if (!product) return;

    const errors = validateProductPayload(req.body, true);
    if (errors.length > 0) {
      return res.status(400).json({ message: 'Validation failed', errors });
    }

    Object.assign(product, req.body);
    res.json(product);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Удалить товар
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID товара
 *     responses:
 *       200:
 *         description: Товар успешно удалён
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: Товар не найден
 *       500:
 *         description: Внутренняя ошибка сервера
 */
app.delete('/api/products/:id', (req, res, next) => {
  try {
    const { id } = req.params;
    const index = products.findIndex((p) => p.id === id);
    if (index === -1) {
      return res.status(404).json({ message: 'Product not found' });
    }
    products.splice(index, 1);
    res.json({ message: 'Product deleted' });
  } catch (err) {
    next(err);
  }
});

// ===== Обработка неизвестных маршрутов =====

app.use((req, res, next) => {
  res.status(404).json({ message: 'Route not found' });
});

// ===== Глобальный обработчик ошибок =====

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('Unexpected error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

// ===== Запуск сервера =====

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Swagger UI is available at http://localhost:${PORT}/api-docs`);
});

