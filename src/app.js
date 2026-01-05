import cors from 'cors';
import SwaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import config from '#modules/config.js';
import { buildHandlers } from '#modules/index.js';
import { loggerMiddleware } from './modules/common/middlewares/logger-middleware/logger-middleware.js';
import postRoutes from '#routes/Post/postRoutes.js';
import userRoutes from '#routes/User/userRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const { handlers } = buildHandlers();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(loggerMiddleware);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      const allowed = config.cors.whitelist.indexOf(origin) !== -1;
      if (allowed) return callback(null, true);

      callback(new Error('Not allowed by CORS'));
    },
  })
);

app.use(
  '/api/v1/docs',
  SwaggerUi.serve,
  SwaggerUi.setup(YAML.load(path.join(__dirname, 'config/swagger.yaml')))
);
app.use('/api/v1/post', postRoutes);
app.use('/api/v1/user', userRoutes);

// 'Health check' da aplicação
app.get('/', (req, res) => {
  res.send('Aplicação de teste prático junior fullstack - Contele');
});

export { app, handlers };
