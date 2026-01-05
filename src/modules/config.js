import 'dotenv/config';

const config = {
  server: {
    port: Number(process.env.PORT || 8089),
  },
  database: {
    host: process.env.WRITER_MYSQL_HOST,
    user: process.env.WRITER_MYSQL_USER,
    port: process.env.WRITER_MYSQL_PORT,
    password: process.env.WRITER_MYSQL_PASS,
    database: process.env.WRITER_MYSQL_DATABASE,
  },
  logger: {
    dir: process.env.LOG_DIR || 'logs',
    level: process.env.LOG_LEVEL || 'info',
  },
  cors: {
    whitelist: process.env.CORS_WHITELIST?.split(',').map((url) => url.trim()) || [],
  },
};

export default config;

