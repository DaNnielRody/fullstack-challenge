import knexLib from 'knex';
import config from '#modules/config.js';

const knex = knexLib({
  client: 'mysql2',
  connection: {
    host: config.database.host,
    user: config.database.user,
    port: config.database.port,
    password: config.database.password,
    database: config.database.database,
  },
  pool: {
    min: 1,
    max: 4,
  },
});

const getTransaction = async () => {
    const transaction = await knex.transaction()
    return {transaction};
}

const commitTransaction = ({ transaction }) => transaction.commit();

const rollbackTransaction = ({ transaction }) => transaction.rollback();

export { getTransaction, commitTransaction, rollbackTransaction, knex };

