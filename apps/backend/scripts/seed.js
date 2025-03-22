import { runAllSeeds } from '../src/infrastructure/database/seeds/index.js';
import { logger } from '../src/infrastructure/config/logger.js';

runAllSeeds()
  .then(() => {
    logger.debug('Seeds executados com sucesso!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Erro ao executar seeds:', err);
    process.exit(1);
  });
