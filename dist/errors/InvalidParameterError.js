"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidParameterError = void 0;
class InvalidParameterError extends Error {
    constructor(message) {
        super(message);
        this.name = "InvalidParameterError";
    }
}
exports.InvalidParameterError = InvalidParameterError;
