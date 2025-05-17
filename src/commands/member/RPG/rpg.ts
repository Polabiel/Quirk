import { general } from "../../../configuration/general";
import { ICommand } from "../../../interfaces/ICommand";
import { PrismaClient } from "@prisma/client";
import { InvalidParameterError } from "../../../errors/InvalidParameterError";
import { menuRPGMessage } from "../../../utils/messages";

const prisma = new PrismaClient();

const command: ICommand = {
 name: "Menu do RPG",
 description: "Menu do RPG",
 commands: ["rpg", "rpgmenu", "rpgmenu"],
 usage: `${general.PREFIX}rpg`,
 handle: async (data) => {
   for (const host of general.GROUP_SECURE) {
     if (data.remoteJid?.includes(host)) {
       return await data.sendSuccessReply(await menuRPGMessage());
     }
   }
   return await data.sendSuccessReply(await menuRPGMessage());
 }
}