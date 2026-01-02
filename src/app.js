'use strict';
const cors = require('cors');
const SwaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const express = require('express');
const { buildHandlers } = require('./modules');
const { handlers } = buildHandlers();

const port = Number(process.env.PORT || 8089);

const path = require('path');

const postRoutes = require('./modules/routes/Post/postRoutes');
const userRoutes = require('./modules/routes/User/userRoutes');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const whitelist = [
  'http://localhost:8081',
  'http://127.0.0.1:8081',
  'http://localhost:8089',
  'http://127.0.0.1:8089',
]

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    const allowed = whitelist.indexOf(origin) !== -1
    if (allowed) return callback(null, true);

    callback(new Error('Not allowed by CORS'))
  }
}))

app.use('/api/v1/docs', SwaggerUi.serve, SwaggerUi.setup(YAML.load(path.join(__dirname, 'config/swagger.yaml'))));
app.use('/api/v1/post', postRoutes);
app.use('/api/v1/user', userRoutes);


// 'Health check' da aplicação
app.get('/', (req, res) => {
  res.send('Aplicação de teste prático junior fullstack - Contele');
});

app.listen(port, () => {
  console.info('Server running', { port });
});

module.exports = {
  app,
  ...handlers
};
