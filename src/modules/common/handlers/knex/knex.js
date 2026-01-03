import knexLib from 'knex';

const knex = knexLib({
    client: 'mysql2',
    connection: {
      host: process.env.WRITER_MYSQL_HOST,
      user: process.env.WRITER_MYSQL_USER,
      port: process.env.WRITER_MYSQL_PORT,
      password: process.env.WRITER_MYSQL_PASS,
      database: process.env.WRITER_MYSQL_DATABASE
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
