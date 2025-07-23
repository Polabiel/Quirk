import { general } from '../../configuration/general';
import { ICommand } from '../../interfaces/ICommand';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
const prisma = new PrismaClient();

const command: ICommand = {
  name: 'Sticker aleatório',
  description: 'Envia um sticker aleatório salvo no banco de dados',
  commands: [
    'randomsticker',
    'stickeraleatorio',
    'sticker-aleatorio',
    'random-sticker',
  ],
  usage: `${general.PREFIX}randomsticker`,
  handle: async (data) => {
    try {
      const stickers = await prisma.stickers.findMany();
      if (!stickers.length) {
        return await data.sendErrorReply(
          'Nenhum sticker encontrado no banco de dados.',
        );
      }
      const randomIndex = Math.floor(Math.random() * stickers.length);
      const sticker = stickers[randomIndex];
      await data.sendWaitReact();
      const tempDir = general.TEMP_DIR;
      const tempFile = path.join(tempDir, `sticker_${Date.now()}.webp`);
      fs.writeFileSync(tempFile, Buffer.from(sticker.url_sticker, 'base64'));
      const result = await data.sendStickerFromFile(tempFile);
      fs.unlinkSync(tempFile);
      return result;
    } catch (error) {
      console.error('Erro ao buscar/enviar sticker aleatório:', error);
      return await data.sendErrorReply(
        'Erro ao buscar/enviar sticker aleatório.',
      );
    }
  },
};

export default command;
