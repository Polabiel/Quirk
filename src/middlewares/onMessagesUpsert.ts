import { MessageUpsertType, proto } from "@whiskeysockets/baileys";
import { connect } from "../connection";
import { getBotData } from "../functions";
import { isCommand } from "../utils";

export default async () => {
  const bot = await connect();

  bot.ev.on("messages.upsert", async (message: {
    messages: proto.IWebMessageInfo[];
    type: MessageUpsertType;
  }) => {

    const baileysMessage = message.messages[0] as proto.WebMessageInfo;

    if (!baileysMessage.key.fromMe) { bot.sendMessage(baileysMessage.key.remoteJid!, { text: "Estou em modo de desenvolvimento, não posso responder a mensagens." }); }

    const { command, ...data } = getBotData(bot, baileysMessage);

    if (!isCommand(command)) return bot.sendMessage(baileysMessage.key.remoteJid!, { text: "Estou em modo de desenvolvimento, não posso responder a mensagens." });

    // try {
    //   console.log(`Command: ${command} | Args: ${data.args}`);
    // } catch (error: any) {
    //   console.error(error);
    //   await data.reply(`❌ ${error.message}`)
    // }
  });
};