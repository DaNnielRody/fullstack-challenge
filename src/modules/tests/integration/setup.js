import { knex } from '#common/infrastructure/database/index.js';

export const setup = async () => {
  try {
    await knex('posts').del();
    await knex('users').del();
  } catch (error) {
    console.error('Erro ao fazer setup dos testes:', error);
    throw error;
  }
};

export const cleanup = async () => {
  try {
    await knex('posts').del();
    await knex('users').del();
  } catch (error) {
    console.error('Erro ao fazer cleanup dos testes:', error);
    throw error;
  }
};

export const closeDatabase = async () => {
  try {
    await knex.destroy();
  } catch (error) {
    console.error('Erro ao fechar conexão com banco:', error);
    throw error;
  }
};
