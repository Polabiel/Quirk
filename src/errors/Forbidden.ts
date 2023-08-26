export class Forbidden extends Error {
  constructor(message: string | undefined) {
    super(message);
    this.name = "forbidden";
  }
}
