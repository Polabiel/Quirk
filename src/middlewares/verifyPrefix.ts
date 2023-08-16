import { general } from "../configuration/general";

export default function (prefix: string): boolean {
  return general.PREFIX == prefix;
}
