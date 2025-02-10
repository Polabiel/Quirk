import { MessageUpsertType, proto } from '@whiskeysockets/baileys';
import { connect } from '../connection';
import InstanceCommand from '../utils/InstanceCommand';
import autoCommand from '../utils/autoCommand';
import repositories from '../database';

let init: number = 0;

export default async () => {
  const bot = await connect();

  if (init === 0) {
    console.log('🧾Seus comandos estão prontos para ser usado\n');
    init = 1;
  }

  bot.ev.on(
    'messages.upsert',
    async (message: {
      messages: proto.IWebMessageInfo[];
      type: MessageUpsertType;
    }) => {
      const baileysMessage = message.messages[0];
      if (!baileysMessage) return;
      await bot.readMessages([baileysMessage.key]);
      await repositories(bot, baileysMessage);
      await InstanceCommand(bot, baileysMessage);
      await autoCommand(bot, baileysMessage);
    },
  );
};
