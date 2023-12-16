import { IBotData } from "./IBotData";

export interface ICommand {
  name: string;
  description: string;
  commands: string[];
  usage: string;
  handle: (data: IBotData) => Promise<any>;
}

export interface IDefaultCommand {
  default: ICommand;
}

export interface ICommandImports {
  [subdir: string]: IDefaultCommand[];
}
