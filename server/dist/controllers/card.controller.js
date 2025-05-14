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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllCards = exports.getCardTransactions = exports.deleteCard = exports.toggleCardStatus = exports.updateCard = exports.getCardById = exports.getUserCards = exports.createCard = void 0;
const client_1 = require("@prisma/client");
const AsyncHandler_1 = __importDefault(require("../utils/AsyncHandler"));
const ApiResponse_1 = __importDefault(require("../utils/ApiResponse"));
const prisma = new client_1.PrismaClient();
/**
 * Create a new card for the authenticated user
 */
exports.createCard = (0, AsyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { cardholderName, cardNumber, cvv, expiryMonth, balance, expiryYear, type, limit } = req.body;
    const userId = (_a = req.auth) === null || _a === void 0 ? void 0 : _a.userId;
    if (!userId) {
        return res.status(401).json(new ApiResponse_1.default(401, {}, 'Unauthorized Request', false));
    }
    // Validate input data
    if (!cardholderName || !cardNumber || !cvv || !expiryMonth || !expiryYear || !type) {
        return res.status(400).json(new ApiResponse_1.default(400, {}, 'Missing required fields', false));
    }
    // Validate card type
    if (!Object.values(client_1.CardType).includes(type)) {
        return res.status(400).json(new ApiResponse_1.default(400, {}, 'Invalid card type', false));
    }
    try {
        // Find user by userId
        const user = yield prisma.user.findFirst({
            where: { userId }
        });
        if (!user) {
            return res.status(404).json(new ApiResponse_1.default(404, {}, 'User not found', false));
        }
        // Create new card
        const newCard = yield prisma.card.create({
            data: {
                cardNumber,
                cardholderName,
                expiryMonth,
                expiryYear,
                cvv,
                type,
                limit: type === client_1.CardType.CREDIT ? limit : null,
                balance: balance || 0,
                userId: user.id
            }
        });
        // Remove sensitive data before sending response
        const { cvv: _ } = newCard, cardResponse = __rest(newCard, ["cvv"]);
        return res.status(201).json(new ApiResponse_1.default(201, cardResponse, 'Card added successfully', true));
    }
    catch (error) {
        console.error('Error creating card:', error);
        return res.status(500).json(new ApiResponse_1.default(500, {}, 'Error creating card', false));
    }
}));
/**
 * Get all cards for the authenticated user
 */
exports.getUserCards = (0, AsyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.auth) === null || _a === void 0 ? void 0 : _a.userId;
    if (!userId) {
        return res.status(401).json(new ApiResponse_1.default(401, {}, 'Unauthorized Request', false));
    }
    try {
        // Find user by userId
        const user = yield prisma.user.findFirst({
            where: { userId }
        });
        if (!user) {
            return res.status(404).json(new ApiResponse_1.default(404, {}, 'User not found', false));
        }
        // Get user's cards
        const cards = yield prisma.card.findMany({
            where: {
                userId: user.id
            },
            select: {
                id: true,
                cardNumber: true,
                cardholderName: true,
                expiryMonth: true,
                expiryYear: true,
                type: true,
                limit: true,
                balance: true,
                isActive: true,
                createdAt: true,
                updatedAt: true
            }
        });
        return res.status(200).json(new ApiResponse_1.default(200, cards, 'Cards retrieved successfully', true));
    }
    catch (error) {
        console.error('Error fetching cards:', error);
        return res.status(500).json(new ApiResponse_1.default(500, {}, 'Error fetching cards', false));
    }
}));
/**
 * Get card details by ID
 */
exports.getCardById = (0, AsyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { cardId } = req.params;
    const userId = (_a = req.auth) === null || _a === void 0 ? void 0 : _a.userId;
    if (!userId) {
        return res.status(401).json(new ApiResponse_1.default(401, {}, 'Unauthorized Request', false));
    }
    try {
        // Find user by userId
        const user = yield prisma.user.findFirst({
            where: { userId }
        });
        if (!user) {
            return res.status(404).json(new ApiResponse_1.default(404, {}, 'User not found', false));
        }
        // Find card by ID and ensure it belongs to the user
        const card = yield prisma.card.findFirst({
            where: {
                id: cardId,
                userId: user.id
            },
            select: {
                id: true,
                cardNumber: true,
                cardholderName: true,
                expiryMonth: true,
                expiryYear: true,
                type: true,
                limit: true,
                balance: true,
                isActive: true,
                createdAt: true,
                updatedAt: true
            }
        });
        if (!card) {
            return res.status(404).json(new ApiResponse_1.default(404, {}, 'Card not found or not authorized to access', false));
        }
        return res.status(200).json(new ApiResponse_1.default(200, card, 'Card retrieved successfully', true));
    }
    catch (error) {
        console.error('Error fetching card:', error);
        return res.status(500).json(new ApiResponse_1.default(500, {}, 'Error fetching card', false));
    }
}));
/**
 * Update card details
 */
exports.updateCard = (0, AsyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { cardId } = req.params;
    const { cardholderName, expiryMonth, expiryYear, isActive, limit } = req.body;
    const userId = (_a = req.auth) === null || _a === void 0 ? void 0 : _a.userId;
    if (!userId) {
        return res.status(401).json(new ApiResponse_1.default(401, {}, 'Unauthorized Request', false));
    }
    try {
        // Find user by userId
        const user = yield prisma.user.findFirst({
            where: { userId }
        });
        if (!user) {
            return res.status(404).json(new ApiResponse_1.default(404, {}, 'User not found', false));
        }
        // Check if the card exists and belongs to the user
        const existingCard = yield prisma.card.findFirst({
            where: {
                id: cardId,
                userId: user.id
            }
        });
        if (!existingCard) {
            return res.status(404).json(new ApiResponse_1.default(404, {}, 'Card not found or not authorized to update', false));
        }
        // Update card
        const updatedCard = yield prisma.card.update({
            where: { id: cardId },
            data: {
                cardholderName: cardholderName || existingCard.cardholderName,
                expiryMonth: expiryMonth !== undefined ? expiryMonth : existingCard.expiryMonth,
                expiryYear: expiryYear !== undefined ? expiryYear : existingCard.expiryYear,
                isActive: isActive !== undefined ? isActive : existingCard.isActive,
                limit: existingCard.type === 'CREDIT' && limit !== undefined ? limit : existingCard.limit
            },
            select: {
                id: true,
                cardNumber: true,
                cardholderName: true,
                expiryMonth: true,
                expiryYear: true,
                type: true,
                limit: true,
                balance: true,
                isActive: true,
                createdAt: true,
                updatedAt: true
            }
        });
        return res.status(200).json(new ApiResponse_1.default(200, updatedCard, 'Card updated successfully', true));
    }
    catch (error) {
        console.error('Error updating card:', error);
        return res.status(500).json(new ApiResponse_1.default(500, {}, 'Error updating card', false));
    }
}));
/**
 * Block/unblock a card
 */
exports.toggleCardStatus = (0, AsyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { cardId } = req.params;
    const { isActive } = req.body;
    const userId = (_a = req.auth) === null || _a === void 0 ? void 0 : _a.userId;
    if (!userId) {
        return res.status(401).json(new ApiResponse_1.default(401, {}, 'Unauthorized Request', false));
    }
    if (isActive === undefined) {
        return res.status(400).json(new ApiResponse_1.default(400, {}, 'isActive field is required', false));
    }
    try {
        // Find user by userId
        const user = yield prisma.user.findFirst({
            where: { userId }
        });
        if (!user) {
            return res.status(404).json(new ApiResponse_1.default(404, {}, 'User not found', false));
        }
        // Check if the card exists and belongs to the user
        const existingCard = yield prisma.card.findFirst({
            where: {
                id: cardId,
            }
        });
        if (!existingCard) {
            return res.status(404).json(new ApiResponse_1.default(404, {}, 'Card not found or not authorized to update', false));
        }
        if (user.role !== 'ADMIN' && existingCard.userId !== user.id) {
            return res.status(403).json(new ApiResponse_1.default(403, {}, 'User not authorized to update the card', false));
        }
        // Toggle card status
        const updatedCard = yield prisma.card.update({
            where: { id: cardId },
            data: { isActive },
            select: {
                id: true,
                cardNumber: true,
                cardholderName: true,
                expiryMonth: true,
                expiryYear: true,
                type: true,
                limit: true,
                balance: true,
                isActive: true,
                createdAt: true,
                updatedAt: true
            }
        });
        const statusMessage = isActive ? 'activated' : 'deactivated';
        return res.status(200).json(new ApiResponse_1.default(200, updatedCard, `Card ${statusMessage} successfully`, true));
    }
    catch (error) {
        console.error('Error updating card status:', error);
        return res.status(500).json(new ApiResponse_1.default(500, {}, 'Error updating card status', false));
    }
}));
/**
 * Delete a card (For admins or account owners)
 */
exports.deleteCard = (0, AsyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { cardId } = req.params;
    const userId = (_a = req.auth) === null || _a === void 0 ? void 0 : _a.userId;
    if (!userId) {
        return res.status(401).json(new ApiResponse_1.default(401, {}, 'Unauthorized Request', false));
    }
    try {
        // Find user by userId
        const user = yield prisma.user.findFirst({
            where: { userId }
        });
        if (!user) {
            return res.status(404).json(new ApiResponse_1.default(404, {}, 'User not found', false));
        }
        // Check if user is admin or card owner
        if (user.role !== 'ADMIN') {
            const card = yield prisma.card.findFirst({
                where: {
                    id: cardId,
                    userId: user.id
                }
            });
            if (!card) {
                return res.status(403).json(new ApiResponse_1.default(403, {}, 'Not authorized to delete this card', false));
            }
        }
        // Check if card exists before deletion
        const existingCard = yield prisma.card.findUnique({
            where: { id: cardId }
        });
        if (!existingCard) {
            return res.status(404).json(new ApiResponse_1.default(404, {}, 'Card not found', false));
        }
        // Delete the card
        yield prisma.card.delete({
            where: { id: cardId }
        });
        return res.status(200).json(new ApiResponse_1.default(200, {}, 'Card deleted successfully', true));
    }
    catch (error) {
        console.error('Error deleting card:', error);
        return res.status(500).json(new ApiResponse_1.default(500, {}, 'Error deleting card', false));
    }
}));
/**
 * Get all card transactions
 */
exports.getCardTransactions = (0, AsyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { cardId } = req.params;
    const userId = (_a = req.auth) === null || _a === void 0 ? void 0 : _a.userId;
    if (!userId) {
        return res.status(401).json(new ApiResponse_1.default(401, {}, 'Unauthorized Request', false));
    }
    try {
        // Find user by userId
        const user = yield prisma.user.findFirst({
            where: { userId }
        });
        if (!user) {
            return res.status(404).json(new ApiResponse_1.default(404, {}, 'User not found', false));
        }
        // Check if the card exists and belongs to the user
        const card = yield prisma.card.findFirst({
            where: {
                id: cardId,
                userId: user.id
            }
        });
        if (!card) {
            return res.status(404).json(new ApiResponse_1.default(404, {}, 'Card not found or not authorized to access', false));
        }
        // Get card transactions
        const transactions = yield prisma.transaction.findMany({
            where: { cardId },
            orderBy: { createdAt: 'desc' }
        });
        return res.status(200).json(new ApiResponse_1.default(200, transactions, 'Card transactions retrieved successfully', true));
    }
    catch (error) {
        console.error('Error fetching card transactions:', error);
        return res.status(500).json(new ApiResponse_1.default(500, {}, 'Error fetching card transactions', false));
    }
}));
/**
 * Admin: Get all cards in the system
 */
exports.getAllCards = (0, AsyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.auth) === null || _a === void 0 ? void 0 : _a.userId;
    if (!userId) {
        return res.status(401).json(new ApiResponse_1.default(401, {}, 'Unauthorized Request', false));
    }
    try {
        // Find user by userId and check if admin
        const user = yield prisma.user.findFirst({
            where: { userId }
        });
        if (!user) {
            return res.status(404).json(new ApiResponse_1.default(404, {}, 'User not found', false));
        }
        if (user.role !== 'ADMIN') {
            return res.status(403).json(new ApiResponse_1.default(403, {}, 'Admin permission required', false));
        }
        // Get all cards (admin only)
        const cards = yield prisma.card.findMany({
            select: {
                id: true,
                cardNumber: true,
                cardholderName: true,
                expiryMonth: true,
                expiryYear: true,
                type: true,
                limit: true,
                balance: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        });
        return res.status(200).json(new ApiResponse_1.default(200, cards, 'All cards retrieved successfully', true));
    }
    catch (error) {
        console.error('Error fetching all cards:', error);
        return res.status(500).json(new ApiResponse_1.default(500, {}, 'Error fetching all cards', false));
    }
}));
