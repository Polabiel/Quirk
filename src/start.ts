import { connect } from "./connection";
import { load } from "./loader";

async function start() {
  const bot = await connect();
  console.clear();
  console.log("🤖 Bot Conectado!\n");
  load(bot);
  console.log("💻 Eventos Carregados!\n");
}

start();