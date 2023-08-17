import { IBotData } from "./IBotData";

export interface ICommand {
  name: string;
  description: string;
  commands: string[];
  usage: string;
  handle: (data: IBotData) => Promise<void>;
}