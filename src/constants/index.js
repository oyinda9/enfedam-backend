"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PAGINATION = exports.FILE_UPLOAD = exports.PASSWORD_REQUIREMENTS = exports.ERROR_MESSAGES = exports.HTTP_STATUS = void 0;
exports.HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    INTERNAL_SERVER_ERROR: 500,
};
exports.ERROR_MESSAGES = {
    UNAUTHORIZED: "Unauthorized access",
    FORBIDDEN: "Access forbidden",
    NOT_FOUND: "Resource not found",
    INVALID_CREDENTIALS: "Invalid username or password",
    DUPLICATE_ENTRY: "This entry already exists",
    SERVER_ERROR: "Internal server error",
    VALIDATION_ERROR: "Validation error",
    TOKEN_EXPIRED: "Token has expired",
    INVALID_TOKEN: "Invalid token",
    MISSING_TOKEN: "No token provided",
};
exports.PASSWORD_REQUIREMENTS = {
    MIN_LENGTH: 8,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBERS: true,
    REQUIRE_SPECIAL_CHARS: true,
};
exports.FILE_UPLOAD = {
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_MIME_TYPES: ["image/jpeg", "image/png", "application/pdf"],
    ALLOWED_EXTENSIONS: [".jpg", ".jpeg", ".png", ".pdf"],
};
exports.PAGINATION = {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100,
};
