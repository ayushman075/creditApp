"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ApiResponse {
    constructor(statusCode, data, message = "Success", status) {
        this.statusCode = statusCode;
        this.data = data;
        this.message = message;
        this.success = status || statusCode < 400;
    }
}
exports.default = ApiResponse;
