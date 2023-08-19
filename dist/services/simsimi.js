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
const axios_1 = __importDefault(require("axios"));
function default_1(content) {
    var _a, _b, _c, _d, _e, _f;
    return __awaiter(this, void 0, void 0, function* () {
        if (!content || content.length <= 1)
            throw new Error("Invalid text");
        const simsimiUrl = "https://api.simsimi.vn/v2/simtalk";
        const requestBody = new URLSearchParams({
            text: content,
            lc: "pt",
            cf: false,
        }).toString();
        const contentLength = Buffer.byteLength(requestBody, "utf8");
        try {
            const response = yield axios_1.default.post(simsimiUrl, requestBody, {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "Content-Length": contentLength,
                },
            });
            if (!((_a = response === null || response === void 0 ? void 0 : response.data) === null || _a === void 0 ? void 0 : _a.message)) {
                throw new Error("Invalid response");
            }
            return (_b = response === null || response === void 0 ? void 0 : response.data) === null || _b === void 0 ? void 0 : _b.message;
        }
        catch (error) {
            if ((_d = (_c = error === null || error === void 0 ? void 0 : error.response) === null || _c === void 0 ? void 0 : _c.data) === null || _d === void 0 ? void 0 : _d.message) {
                return (_f = (_e = error === null || error === void 0 ? void 0 : error.response) === null || _e === void 0 ? void 0 : _e.data) === null || _f === void 0 ? void 0 : _f.message;
            }
            console.error(error);
            throw new Error(error);
        }
    });
}
exports.default = default_1;
