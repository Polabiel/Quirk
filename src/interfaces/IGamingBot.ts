export interface IResourcesGameOptions {
  raca: {
    [key: string]: string;
  };
  sexo: {
    [key: string]: string;
  };
  classe: {
    [key: string]: {
      [key: string]: string | number;
    };
  };
}

export interface IResourcesGameRanks {
  [key: string]: {
    [key: string]: string;
  };
}

export interface IGuildGame {
  [key: string]: {
    name: string;
    owner: string;
    members: string[];
    rank: string;
    money: number;
  };
}
