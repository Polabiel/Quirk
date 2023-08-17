import {
  findCommandImport,
  verifyIfIsAdmin,
  verifyIfIsGroupSecure,
  VerifyIfIsOwner,
} from ".";
import { logCreate } from "../errors/createLog";
import { DangerError } from "../errors/DangerError";
import { InvalidParameterError } from "../errors/InvalidParameterError";
import { WarningError } from "../errors/WarningError";
import { IBotData } from "../interfaces/IBotData";
import hasTypeOrCommand from "../middlewares/hasTypeOrCommand";
import verifyPrefix from "../middlewares/verifyPrefix";

export default async function (paramsHandler: IBotData) {
  const {
    bot,
    baileysMessage,
    commandName,
    prefix,
    sendWarningReply,
    sendErrorReply,
    sendLogOwner,
    isGroup,
  } = paramsHandler;
  const { type, command } = await findCommandImport(commandName!);

  if (!verifyPrefix(prefix!) || !hasTypeOrCommand(type, command)) {
    return;
  }

  const valueAdmin = await verifyIfIsAdmin(type, bot, baileysMessage);

  if (!valueAdmin) {
    if (!isGroup) {
      return await sendWarningReply(
        "Este comando só pode ser executado em grupos!"
      );
    }
    return await sendWarningReply(
      "Você não tem permissão para executar este comando!"
    );
  }

  const valueOwner = await VerifyIfIsOwner(type, baileysMessage);

  if (!valueOwner) {
    return;
  }

  const groupSecure = await verifyIfIsGroupSecure(type, baileysMessage);

  if (!groupSecure) {
    return await sendWarningReply(
      "Este grupo não está na lista de grupos permitidos!"
    );
  }

  try {
    await command.default.handle({
      ...paramsHandler,
      type,
    });
  } catch (error: any) {
    console.error(error.message);
    if (error instanceof InvalidParameterError) {
      await sendWarningReply(`Parâmetros inválidos! ${error.message}`);
    } else if (error instanceof WarningError) {
      logCreate(error);
      await sendWarningReply(error.message);
    } else if (error instanceof DangerError) {
      logCreate(error);
      await sendErrorReply(error.message);
    } else if (error.message == "not-authorized") {
      await sendWarningReply("Eu não sou administrador do grupo!");
    } else if (error.message == "Request failed with status code 429") {
      await sendWarningReply(
        "A OpenAI Bloqueiou o Zanoni-bot temporariamente\nEstamos resolvendo isso"
      );
    } else {
      logCreate(error);
      await sendErrorReply(
        `Ocorreu um erro ao executar o comando ${command.name}! O desenvolvedor foi notificado!\n\n📄 *Detalhes*: ${error.message}`
      );
      await sendLogOwner(
        `Ocorreu um erro ao executar o comando ${command.name}!\n\n📄 *Detalhes*: ${error.message}`
      );
    }
  }
}
