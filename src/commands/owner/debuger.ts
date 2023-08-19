import { general } from "../../configuration/general";
import { InvalidParameterError } from "../../errors/InvalidParameterError";
import { WarningError } from "../../errors/WarningError";
import { ICommand } from "../../interfaces/ICommand";

const command: ICommand = {
  name: "Degugger",
  description: "Comando para Debuggar e verificar algumas coisas",
  commands: ["debugger", "debugar", "debug"],
  usage: `${general.PREFIX}debugger <args?>`,
  handle: async (data) => {
    switch (data.args[0]) {
      case "grupo":
      case "grupos":
      case "group":
        try {
          const metadata = await data.bot!.groupMetadata(data.remoteJid!);
          for (const i of metadata.participants) {
            console.log(i.id);
            return i.id;
          }
          await data.sendSuccessReply(
            `Grupo: ${metadata?.subject}\nDescrição: ${metadata?.desc}\nCriado por: ${metadata?.owner}\nMembros: ${metadata.participants}\nRemoteJid: ${data.remoteJid}`
          );
        } catch (error) {
          throw new WarningError("Não foi possível debuggar o grupo");
        }
        break;
      case "debug":
      case "debugar":
      case "debugger":
      case "baileys":
        try {
          const messageString = JSON.stringify(data.baileysMessage, null, 2);
          return await data.sendSuccessReply(
            `BaileysMessage Debug\n${messageString}`
          );
        } catch (error) {
          throw new InvalidParameterError(
            "Não foi possível debuggar o baileysMessage"
          );
        }
      default:
        throw new InvalidParameterError(
          "Você precisa especificar o que deseja debuggar!"
        );
    }
  },
};

export default command;
