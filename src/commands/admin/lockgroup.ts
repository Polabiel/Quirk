import { general } from "../../configuration/general";
import { ICommand } from "../../interfaces/ICommand";

const command: ICommand = {
  name: "fechar grupo",
  description: "fechar um grupo",
  commands: ["fechar", "lock", "locked"],
  usage: `${general.PREFIX}fechar`,
  handle: async (data) => {
    await data.bot!.groupSettingUpdate(data.remoteJid!, "announcement");
    return data.sendSuccessReply("Grupo fechado com sucesso!");
  },
};

export default command;
