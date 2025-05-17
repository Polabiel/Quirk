import onMessagesUpsert from "./middlewares/onMessagesUpsert";
import { logger } from "./utils/logger";
import fs from "fs";
require("dotenv").config();

function createEnvironment() {
  if (!fs.existsSync("./.local.env")) {
    fs.writeFileSync("./.local.env", `NUMBER_HOST = "0000000000000@s.whatsapp.net"
POSTGRES_USER=postgres
POSTGRES_PASSWORD=home123
POSTGRES_DB=postgres
DATABASE_URL="postgresql://postgres:home123@localhost:5932/$postgres"
NUMBER_BOT = "0000000000000"
    `);
    logger.info("🟡 Arquivo de ambiente criado com sucesso! Por favor, preencha os dados corretamente.");
  }
}

async function start(): Promise<void> {
  createEnvironment();

  logger.info("🟡 Iniciando...\n");
  await onMessagesUpsert();

}

start();
