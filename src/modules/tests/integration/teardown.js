import { closeDatabase } from './setup.js';

export const teardown = async () => {
  try {
    await closeDatabase();
  } catch (error) {
    console.error('Erro no teardown dos testes:', error);
    throw error;
  }
};
