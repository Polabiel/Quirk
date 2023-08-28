import { IGuildGame, IResourcesGameOptions } from "../interfaces/IGamingBot";

export const OptionsGaming: IResourcesGameOptions = {
  raca: {
    humano: "👨‍🦰",
    elfo: "🧝‍♂️",
    anjo: "👼",
    demônio: "😈",
    vampiro: "🧛‍♂️",
    lobisomem: "🐺",
  },
  sexo: {
    masculino: "👨‍🦰",
    feminino: "👩",
  },
  classe: {
    guerreiro: {
      Arma: "🗡️",
      Escudo: "🛡️",
      Armadura: 15,
    },
    mago: {
      Arma: "🪄",
      Armadura: 5,
    },
    arqueiro: {
      Arma: "🏹",
      Armadura: 10,
    },
  },
};

export const ranks = {
  gold: {
    positon: 4,
    name: "Gold",
    emoji: "🥇",
  },
  bronze: {
    positon: 6,
    name: "Bronze",
    emoji: "🥉",
  },
  silver: {
    positon: 5,
    name: "Silver",
    emoji: "🥈",
  },
  platinum: {
    position: 3,
    name: "Platinum",
    emoji: "🏆",
  },
  diamond: {
    position: 2,
    name: "Diamond",
    emoji: "💎",
  },
  master: {
    position: 1,
    name: "Master",
    emoji: "👑",
  },
};

export const guilds: IGuildGame = {
  Iluministas: {
    name: "Iluministas",
    owner: "",
    members: [],
    rank: ranks.gold.name,
    money: 0,
  },
  "Os 4 Cavaleiros": {
    name: "Os 4 Cavaleiros",
    owner: "",
    members: [],
    rank: ranks.bronze.name,
    money: 0,
  },
};
