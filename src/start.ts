import onMessagesUpsert from "./middlewares/onMessagesUpsert";
require("dotenv").config();

async function start(): Promise<void> {
  console.clear();
  console.log("🟡 Iniciando...\n");
  await onMessagesUpsert();

  setTimeout(() => {
    restart();
  }, 1 * 60 * 60 * 1000);
}

function restart(): void {
  if (!process.env.SQUARECLOUD || !process.env.APP_ID) return;

  const options = {
    method: "POST",
    headers: {
      Authorization: process.env.SQUARECLOUD,
    },
  };

  fetch(
    `https://api.squarecloud.app/v2/apps/${process.env.APP_ID}/restart`,
    options
  )
    .then((response) => response.json())
    .then((response) => console.log(response))
    .catch((err) => console.error(err));
}

start();
