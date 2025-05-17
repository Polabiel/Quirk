import { general } from '../../../configuration/general';
import { ICommand } from '../../../interfaces/ICommand';
import { PrismaClient } from '@prisma/client';
import { InvalidParameterError } from '../../../errors/InvalidParameterError';

const prisma = new PrismaClient();

const command: ICommand = {
  name: 'Lutar',
  description: 'Comando para lutar com outro usuário',
  commands: ['lutar'],
  usage: `${general.PREFIX}lutar @551998102256`,
  handle: async (data) => {
    await data.sendWaitReply('⚔️ Iniciando a batalha...');

    const mentionedJids =
      (data.baileysMessage.message as any).extendedTextMessage?.contextInfo
        ?.mentionedJid || [];
    if (mentionedJids.length === 0) {
      throw new InvalidParameterError(
        'Você precisa mencionar um usuário para lutar!',
      );
    }

    const challengerId = data.user!;
    const opponentId = mentionedJids[0];

    await prisma.user.upsert({
      where: { number: challengerId },
      update: {},
      create: { number: challengerId, name: data.nickName || challengerId },
    });
    await prisma.user.upsert({
      where: { number: opponentId },
      update: {},
      create: { number: opponentId, name: opponentId },
    });

    const challengerStats = await prisma.playerStats.upsert({
      where: { number: challengerId },
      update: {},
      create: { number: challengerId },
    });
    const opponentStats = await prisma.playerStats.upsert({
      where: { number: opponentId },
      update: {},
      create: { number: opponentId },
    });

    let hpA = challengerStats.hp;
    let hpB = opponentStats.hp;
    const atkA = challengerStats.strength;
    const defA = challengerStats.defense;
    const atkB = opponentStats.strength;
    const defB = opponentStats.defense;
    let turn = 1;

    while (hpA > 0 && hpB > 0) {
      if (turn % 2 === 1) {
        hpB -= Math.max(1, atkA - defB);
      } else {
        hpA -= Math.max(1, atkB - defA);
      }
      turn++;
    }

    const winnerId = hpA > 0 ? challengerId : opponentId;
    const loserId = hpA > 0 ? opponentId : challengerId;

    await prisma.playerStats.update({
      where: { number: challengerId },
      data: { hp: Math.max(0, hpA) },
    });
    await prisma.playerStats.update({
      where: { number: opponentId },
      data: { hp: Math.max(0, hpB) },
    });
    await prisma.playerStats.update({
      where: { number: winnerId },
      data: { xp: { increment: 10 } },
    });
    await prisma.playerStats.update({
      where: { number: loserId },
      data: { xp: { increment: 5 } },
    });

    const mention = [winnerId];
    await data.sendReplyWithMentions(
      `🏆 Parabéns <@${winnerId}>! Você ganhou a batalha e obteve +10 XP.`,
      mention,
    );
  },
};

export default command;
