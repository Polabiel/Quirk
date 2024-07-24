import { ICommand } from "../../interfaces/ICommand";
import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import { general } from "../../configuration/general";
const prisma = new PrismaClient();

const time = new Map<string, number>();

const command: ICommand = {
  name: "Random Sticker",
  description: "Comando para conversar com o bot",
  commands: [],
  usage: ``,
  handle: async (data) => {
    if (data.fromMe) return;

    const currentTime = new Date();
    const lastSentTime = time.get("global") ?? 0;
    const cooldown = 1 * 60 * 1000;

    if (currentTime.getTime() - lastSentTime < cooldown) {
      console.warn("Too soon to send another sticker");
      return;
    }

    time.set("global", currentTime.getTime());

    try {
      const stickers = await prisma.stickers.findMany();
      const randomSticker =
        stickers[Math.floor(Math.random() * stickers.length)];
      const stickerBuffer = Buffer.from(randomSticker.url_sticker, "base64");
      const stickerFilePath = path.join(
        general.TEMP_DIR,
        `random_sticker_${Date.now()}.webp`
      );

      fs.writeFileSync(stickerFilePath, stickerBuffer);

      await data.sendStickerFromFile(stickerFilePath);

      return fs.unlinkSync(stickerFilePath);
    } catch (error) {
      console.error("Erro ao enviar sticker:", error);
    }
  },
};

export default command;
