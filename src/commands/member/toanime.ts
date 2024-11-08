import { general } from "../../configuration/general";
import { DangerError } from "../../errors/DangerError";
import { InvalidParameterError } from "../../errors/InvalidParameterError";
import { ICommand } from "../../interfaces/ICommand";
import { downloadImage } from "../../utils";
const { toanime } = require("betabotz-tools");

const command: ICommand = {
  name: "toanime",
  description: "Comando para converter um vídeo em anime",
  commands: ["toanime", "anime", "converteranime"],
  usage: `${general.PREFIX}toanime`,
  handle: async (data) => {
    await data.sendWaitReact();

    if (!data.isImage && !data.isVideo) {
      throw new InvalidParameterError(
        "Você precisa marcar uma imagem"
      );
    }

    if (data.isImage) {
      const inputPath = await downloadImage(data.baileysMessage);

      const result: { image_data: string; image_size: string } = await toanime(
        inputPath
      );

      if (!result.image_data) {
        throw new DangerError("Ocorreu um erro ao converter a imagem em anime");
      }

      return data.sendImageFromFile(
        result.image_data,
        "Sua imagem foi convertida em anime",
        [data.user]
      );
    } else if (data.isVideo) {
      throw new InvalidParameterError(
        "Infelizmente ainda não é possível converter vídeos/gif em animes"
      );
    }
  },
};

export default command;