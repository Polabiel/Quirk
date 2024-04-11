import onMessagesUpsert from "./middlewares/onMessagesUpsert";

async function start(): Promise<void> {
  console.clear();
  console.log("🤖 Bot Conectado!\n");
  await onMessagesUpsert();
  console.log("💻 Eventos Carregados!\n");

  setTimeout(() => {
    restart();
  }, 2 * 60 * 60 * 1000);
}

function restart(): void {
  if (!process.env.SQUARECLOUD || !process.env.APP_id) return;

  const options = {
    method: "POST",
    headers: { Authorization: process.env.SQUARECLOUD },
  };

  fetch(
    `https://api.squarecloud.app/v2/apps/${process.env.APP_id}/restart`,
    options
  )
    .then((response) => {
      console.log(response);
      console.log("✅ Notificação enviada!");
    })
    .catch((err) => console.error(err));
}

start();
