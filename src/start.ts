import onMessagesUpsert from "./middlewares/onMessagesUpsert";
import { logger } from "./utils/logger";
require("dotenv").config();

async function start(): Promise<void> {
  logger.info("🟡 Iniciando...\n");
  await onMessagesUpsert();

}

start();
