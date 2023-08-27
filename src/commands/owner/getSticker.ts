import { general } from "../../configuration/general";
import { ICommand } from "../../interfaces/ICommand";
import { PrismaClient } from "@prisma/client";
import { downloadSticker } from "../../utils";
import fs from "fs";
import { InvalidParameterError } from "../../errors/InvalidParameterError";
const prisma = new PrismaClient();

const command: ICommand = {
  name: "Capturar sticker",
  description: "Comando para pegar um sticker selecionado",
  commands: ["getsticker", "pegarsticker", "pegar-sticker", "get-sticker"],
  usage: `${general.PREFIX}getsticker <nome do sticker>`,
  handle: async (data) => {
    if (data.isSticker && data.args[0]) {
      await data.sendWaitReact();
      const stickerPath = await downloadSticker(data.baileysMessage);
      const nameSticker = data.args[0];
      const imageBase64 = fs.readFileSync(stickerPath!, {
        encoding: "base64",
      });

      try {
        await prisma.stickers.create({
          data: {
            url_sticker: imageBase64,
            name: nameSticker,
            criador: data.user,
          },
        });
        fs.unlinkSync(stickerPath!);
        return data.sendSuccessReply("Sticker adicionado com sucesso!");
      } catch (error) {
        fs.unlinkSync(stickerPath!);
        console.error("Erro ao adicionar sticker:", error);
        return await data.sendErrorReply("Erro ao adicionar sticker.");
      }
    }
    throw new InvalidParameterError(
      "Você precisa enviar um sticker e o nome dele!"
    );
  },
};

export default command;
