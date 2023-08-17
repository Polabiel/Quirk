import { proto, WASocket } from "@whiskeysockets/baileys";
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
import hasTypeOrCommand from "../middlewares/hasTypeOrCommand";
import verifyPrefix from "../middlewares/verifyPrefix";
import loadCommomFunctions from "./loadCommomFunctions";

export default async function (
  bot: WASocket,
  baileysMessage: proto.IWebMessageInfo
) {
  const { ...data } = loadCommomFunctions(bot, baileysMessage);
  const { type, command } = await findCommandImport(data.commandName!);

  if (!verifyPrefix(data.prefix!) || !hasTypeOrCommand(type, command)) {
    return;
  }

  const valueAdmin = await verifyIfIsAdmin(type, bot, baileysMessage);

  if (!valueAdmin) {
    if (!data.isGroup) {
      return await data.sendWarningReply(
        "Este comando só pode ser executado em grupos!"
      );
    }
    return await data.sendWarningReply(
      "Você não tem permissão para executar este comando!"
    );
  }

  const valueOwner = await VerifyIfIsOwner(type, baileysMessage);

  if (!valueOwner) {
    return;
  }

  const groupSecure = await verifyIfIsGroupSecure(type, baileysMessage);

  if (!groupSecure) {
    return await data.sendWarningReply(
      "Este grupo não está na lista de grupos permitidos!"
    );
  }

  try {
    await command.default.handle({
      ...data,
      type,
    });
  } catch (error: any) {
    console.error(error.message);
    if (error instanceof InvalidParameterError) {
      await data.sendWarningReply(`Parâmetros inválidos! ${error.message}`);
    } else if (error instanceof WarningError) {
      logCreate(error);
      await data.sendWarningReply(error.message);
    } else if (error instanceof DangerError) {
      logCreate(error);
      await data.sendErrorReply(error.message);
    } else if (error.message == "not-authorized") {
      await data.sendWarningReply("Eu não sou administrador do grupo!");
    } else if (error.message == "Request failed with status code 429") {
      await data.sendWarningReply(
        "A OpenAI Bloqueiou o Zanoni-bot temporariamente\nEstamos resolvendo isso"
      );
    } else {
      logCreate(error);
      await data.sendErrorReply(
        `Ocorreu um erro ao executar o comando ${command.name}! O desenvolvedor foi notificado!\n\n📄 *Detalhes*: ${error.message}`
      );
      await data.sendLogOwner(
        `Ocorreu um erro ao executar o comando ${command.name}!\n\n📄 *Detalhes*: ${error.message}`
      );
    }
  }
}
