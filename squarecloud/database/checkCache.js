"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addCache = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const general_1 = require("../configuration/general");
const cachePath = path_1.default.resolve(general_1.general.CACHE_DIR, "cache.json");
if (!fs_1.default.existsSync(cachePath)) {
    fs_1.default.writeFileSync(cachePath, "[]");
}
function default_1(remoteJid) {
    return __awaiter(this, void 0, void 0, function* () {
        const cache = JSON.parse(fs_1.default.readFileSync(cachePath, "utf-8"));
        if (cache.includes(remoteJid)) {
            return true;
        }
        else {
            return false;
        }
    });
}
exports.default = default_1;
function addCache(remoteJid) {
    return __awaiter(this, void 0, void 0, function* () {
        const cache = JSON.parse(fs_1.default.readFileSync(cachePath, "utf-8"));
        cache.push(remoteJid);
        fs_1.default.writeFileSync(cachePath, JSON.stringify(cache));
    });
}
exports.addCache = addCache;
