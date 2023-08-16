export default function hasTypeOrCommand(
  type: string,
  command: string
): boolean {
  return !!type && !!command;
}
