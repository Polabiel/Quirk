import { proto, WASocket } from "@whiskeysockets/baileys";
import { RandomfindCommandImport } from ".";
import loadCommomFunctions from "./loadCommomFunctions";

export default async function (
  bot: WASocket,
  baileysMessage: proto.IWebMessageInfo
) {
  // if (Math.random() < 0.03) return;

  const { ...data } = loadCommomFunctions(bot, baileysMessage);
  const { command } = await RandomfindCommandImport();

  try {
    await command?.handle({
      ...data,
    });
  } catch (error: any) {
    console.log(error);
  }
}
