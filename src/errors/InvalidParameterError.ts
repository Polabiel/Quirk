export class InvalidParameterError extends Error {
  constructor(message: string | undefined) {
    super(message);
    this.name = "InvalidParameterError";
  }
}
