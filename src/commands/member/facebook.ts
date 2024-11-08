import { general } from "../../configuration/general";
import { InvalidParameterError } from "../../errors/InvalidParameterError";
import { WarningError } from "../../errors/WarningError";
import { ICommand } from "../../interfaces/ICommand";
import downloadFacebookVideo, { deletefile } from "../../services/facebook";
const { facebook } = require("betabotz-tools");

const command: ICommand = {
  name: "Facebook Downloader",
  description: "Comando para baixar vídeos do Facebook",
  commands: ["facebook", "fb"],
  usage: `${general.PREFIX}facebook https://www.facebook.com/9gag/videos/10155764773191840`,

  handle: async (data) => {
    await data.sendWaitReact();

    if (!data.argsJoined?.includes("www.facebook.com")) {
      throw new InvalidParameterError(
        "Você precisa informar um link do Facebook"
      );
    }

    const result = await downloadFacebookVideo(data.argsJoined) 

    await data.sendVideoFromFile(result.filePath, "🤖🎉 Vídeo baixado com sucesso");

    return deletefile(result.filePath);
  },
};

export default command;
