class DangerError extends Error {
  constructor(message: string | undefined) {
    super(message);
    this.name = "DangerError";
  }
}

module.exports = {
  DangerError,
};