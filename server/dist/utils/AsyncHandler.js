"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AsyncHandler = (resquestHandler) => {
    return (req, res, next) => {
        Promise.resolve(resquestHandler(req, res, next))
            .catch((err) => next(err));
    };
};
exports.default = AsyncHandler;
