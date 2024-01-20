"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WarningError = void 0;
class WarningError extends Error {
    constructor(message) {
        super(message);
        this.name = "WarningError";
    }
}
exports.WarningError = WarningError;
