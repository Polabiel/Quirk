"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Forbidden = void 0;
class Forbidden extends Error {
    constructor(message) {
        super(message);
        this.name = "forbidden";
    }
}
exports.Forbidden = Forbidden;
