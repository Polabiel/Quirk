import { general } from "../../configuration/general";
import { Forbidden } from "../../errors/Forbidden";
import { WarningError } from "../../errors/WarningError";
import { ICommand } from "../../interfaces/ICommand";

const command: ICommand = {
  name: "Everyone",
  description: "Marca todo mundo do grupo",
  commands: ["everyone", "tagall", "marcar", "all", "tag"],
  usage: `${general.PREFIX}everyone`,
  handle: async (data) => {
    await data.sendWaitReact();
    try {
      const groupMetadata = await data.bot!.groupMetadata(data.remoteJid!);
      const mentions = groupMetadata.participants.map((participant) => {
        return {
          tag: "@",
          userId: participant.id.split("@")[0],
        };
      });

      if (!data.args[0]) {
        const message = {
          text: "Marcando todos os cornos(as)",
          mentions: mentions.map((m) => `${m.userId}@s.whatsapp.net`),
        };

        return await data.sendMentionReply(message.text, message.mentions);
      }
      const message = {
        text: data.args.join(" "),
        mentions: mentions.map((m) => `${m.userId}@s.whatsapp.net`),
      };
      await data.sendMentionReply(message.text, message.mentions);
    } catch (error: any) {
      if (error.message === "not-authorized") throw new Forbidden("Você não tem permissão para banir este usuário!");
      throw new WarningError("Não foi possível marcar todos os usuários!");
    }
  },
};

export default command;
