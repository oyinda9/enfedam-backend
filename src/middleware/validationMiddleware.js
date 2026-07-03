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
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateParams = exports.validateQuery = exports.validateRequest = void 0;
const validateRequest = (schema) => {
    return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const validated = yield schema.parseAsync(req.body);
            req.body = validated;
            next();
        }
        catch (error) {
            next(error);
        }
    });
};
exports.validateRequest = validateRequest;
const validateQuery = (schema) => {
    return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const validated = yield schema.parseAsync(req.query);
            req.query = validated;
            next();
        }
        catch (error) {
            next(error);
        }
    });
};
exports.validateQuery = validateQuery;
const validateParams = (schema) => {
    return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const validated = yield schema.parseAsync(req.params);
            req.params = validated;
            next();
        }
        catch (error) {
            next(error);
        }
    });
};
exports.validateParams = validateParams;
