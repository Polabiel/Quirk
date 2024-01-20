"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addFilter = exports.isFiltered = void 0;
const general_1 = require("../configuration/general");
const userFilter = new Map();
const isFiltered = (sender) => {
    if (!userFilter.has(sender)) {
        return false;
    }
    const { count, timeoutId } = userFilter.get(sender);
    return count >= 2 && timeoutId !== null;
};
exports.isFiltered = isFiltered;
const addFilter = (sender) => {
    if (!userFilter.has(sender)) {
        userFilter.set(sender, { count: 0, timeoutId: null });
    }
    const { count, timeoutId } = userFilter.get(sender);
    if (count < 2) {
        userFilter.set(sender, { count: count + 1, timeoutId });
        if (count === 0) {
            const newTimeoutId = setTimeout(() => {
                userFilter.set(sender, { count: 0, timeoutId: null });
                if (userFilter.get(sender).count === 0) {
                    userFilter.delete(sender);
                }
            }, general_1.general.TIMEOUT_IN_MILLISECONDS_BY_EVENT);
            userFilter.set(sender, { count: 1, timeoutId: newTimeoutId });
        }
    }
};
exports.addFilter = addFilter;
