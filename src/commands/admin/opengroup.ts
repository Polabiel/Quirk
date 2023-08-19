import { general } from "../../configuration/general";
import { ICommand } from "../../interfaces/ICommand";

const command: ICommand = {
  name: "Abrir grupo",
  description: "Abrir o grupo",
  commands: ["abrir", "open", "opened"],
  usage: `${general.PREFIX}abrir`,
  handle: async (data) => {
    await data.bot!.groupSettingUpdate(data.remoteJid!, "not_announcement");
    return data.sendSuccessReply("Grupo aberto com sucesso!");
  },
};

export default command;
