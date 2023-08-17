export class WarningError extends Error {
  constructor(message: string | undefined) {
    super(message);
    this.name = "WarningError";
  }
}
