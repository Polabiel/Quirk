"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DangerError = void 0;
class DangerError extends Error {
    constructor(message) {
        super(message);
        this.name = "DangerError";
    }
}
exports.DangerError = DangerError;
