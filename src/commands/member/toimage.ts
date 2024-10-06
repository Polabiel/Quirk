import { general } from "../../configuration/general";
import fs from "fs";
import path from "path";
import { ICommand } from "../../interfaces/ICommand";
import { InvalidParameterError } from "../../errors/InvalidParameterError";
import { exec } from "child_process";
import { downloadSticker } from "../../utils";

const command: ICommand = {
  name: "toimage",
  description: "Transformo figurinhas estáticas em imagem",
  commands: [
    "toimage",
    "toimg",
    "toimagem",
    "toimg",
    "to-image",
    "to-img",
    "to-image",
    "to-img",
  ],
  usage: `${general.PREFIX}toimage <marque a figurinha>`,
  handle: async (data) => {
    await data.sendWaitReact();
    if (!data.isSticker) {
      throw new InvalidParameterError("Você precisa marcar uma figurinha");
    }

    const inputPath = await downloadSticker(data.baileysMessage);
    const outputPath = path.resolve(general.TEMP_DIR, "output.png");

    exec(`ffmpeg -i ${inputPath} ${outputPath}`, async (error) => {
      if (error) {
        return data.sendErrorReply("Error ao tentar converter a imagem, caso seja uma imagem animada, digite um /tovideo")
      }
      await data.sendSuccessReact();
      await data.sendImageFromFile(outputPath);

      fs.unlinkSync(inputPath!);
      return fs.unlinkSync(outputPath);
    });
  },
};

export default command;
