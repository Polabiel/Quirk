export interface ICommand {
  name: string;
  description: string;
  commands: string[];
  usage: string;
  handle: () => Promise<void>;
}