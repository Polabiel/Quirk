import onMessagesUpsert from "./middlewares/onMessagesUpsert";
import { logger } from "./utils/logger";
require("dotenv").config();

process.on('uncaughtException', (error) => {
  logger.error('Erro não capturado:', error);
  process.exit(1); 
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Promise rejeitada não tratada:', reason);
  process.exit(1);
});

async function start(): Promise<void> {
  try {
    logger.info("🟡 Iniciando...\n");
    await onMessagesUpsert();
  } catch (error) {
    logger.error('Erro durante a inicialização:', error);
    process.exit(1); 
  }
}

start();
