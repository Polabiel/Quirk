import onMessagesUpsert from "./middlewares/onMessagesUpsert";

async function start(): Promise<void> {
  console.clear();
  console.log("🤖 Bot Conectado!\n");
  await onMessagesUpsert();
  console.log("💻 Eventos Carregados!\n");
}

start();
