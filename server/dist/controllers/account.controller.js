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
exports.getAllAccounts = exports.getAccountTransactions = exports.transferFunds = exports.withdrawFunds = exports.depositFunds = exports.updateAccountStatus = exports.getAccountById = exports.getUserAccounts = exports.createAccount = void 0;
const client_1 = require("@prisma/client");
const AsyncHandler_1 = __importDefault(require("../utils/AsyncHandler"));
const ApiResponse_1 = __importDefault(require("../utils/ApiResponse"));
const prisma = new client_1.PrismaClient();
exports.createAccount = (0, AsyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { accountNumber, type, currency, balance } = req.body;
    const authUserId = (_a = req.auth) === null || _a === void 0 ? void 0 : _a.userId;
    if (!authUserId) {
        return res.status(401).json(new ApiResponse_1.default(401, {}, 'Unauthorized Request', false));
    }
    try {
        const user = yield prisma.user.findFirst({
            where: {
                userId: authUserId
            }
        });
        if (!user) {
            return res.status(404).json(new ApiResponse_1.default(404, {}, 'User not found', false));
        }
        const newAccount = yield prisma.account.create({
            data: {
                accountNumber,
                type,
                currency: currency || 'INR',
                balance: balance || 0,
                isActive: true,
                userId: user.id
            }
        });
        // Create notification for new account
        yield prisma.notification.create({
            data: {
                title: 'New Account Added',
                message: `Your ${type} account has been successfully created.`,
                type: 'ACCOUNT_UPDATE',
                userId: user.id
            }
        });
        return res.status(201).json(new ApiResponse_1.default(201, newAccount, 'Account created successfully', true));
    }
    catch (error) {
        console.error('Error creating account:', error);
        return res.status(500).json(new ApiResponse_1.default(500, {}, 'Error creating account', false));
    }
}));
exports.getUserAccounts = (0, AsyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const authUserId = (_a = req.auth) === null || _a === void 0 ? void 0 : _a.userId;
    if (!authUserId) {
        return res.status(401).json(new ApiResponse_1.default(401, {}, 'Unauthorized Request', false));
    }
    try {
        // Find user by Clerk userId
        const user = yield prisma.user.findFirst({
            where: {
                userId: authUserId
            }
        });
        if (!user) {
            return res.status(404).json(new ApiResponse_1.default(404, {}, 'User not found', false));
        }
        const accounts = yield prisma.account.findMany({
            where: {
                userId: user.id
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        return res.status(200).json(new ApiResponse_1.default(200, accounts, 'Accounts retrieved successfully', true));
    }
    catch (error) {
        console.error('Error fetching accounts:', error);
        return res.status(500).json(new ApiResponse_1.default(500, {}, 'Error fetching accounts', false));
    }
}));
// Get account by ID
exports.getAccountById = (0, AsyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { id } = req.params;
    const authUserId = (_a = req.auth) === null || _a === void 0 ? void 0 : _a.userId;
    if (!authUserId) {
        return res.status(401).json(new ApiResponse_1.default(401, {}, 'Unauthorized Request', false));
    }
    try {
        // Find user by Clerk userId
        const user = yield prisma.user.findFirst({
            where: {
                userId: authUserId
            }
        });
        if (!user) {
            return res.status(404).json(new ApiResponse_1.default(404, {}, 'User not found', false));
        }
        const account = yield prisma.account.findFirst({
            where: {
                id,
                userId: user.id
            },
            include: {
                transactions: {
                    orderBy: {
                        createdAt: 'desc'
                    },
                    take: 10
                }
            }
        });
        if (!account) {
            return res.status(404).json(new ApiResponse_1.default(404, {}, 'Account not found or access denied', false));
        }
        return res.status(200).json(new ApiResponse_1.default(200, account, 'Account retrieved successfully', true));
    }
    catch (error) {
        console.error('Error fetching account:', error);
        return res.status(500).json(new ApiResponse_1.default(500, {}, 'Error fetching account', false));
    }
}));
// Update account status (activate/deactivate)
exports.updateAccountStatus = (0, AsyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { id } = req.params;
    const { isActive } = req.body;
    const authUserId = (_a = req.auth) === null || _a === void 0 ? void 0 : _a.userId;
    if (!authUserId) {
        return res.status(401).json(new ApiResponse_1.default(401, {}, 'Unauthorized Request', false));
    }
    try {
        // Find user by Clerk userId
        const user = yield prisma.user.findFirst({
            where: {
                userId: authUserId
            }
        });
        // Check if user exists
        if (!user) {
            return res.status(404).json(new ApiResponse_1.default(404, {}, 'User not found', false));
        }
        // First, find the account
        const account = yield prisma.account.findFirst({
            where: {
                id,
            }
        });
        if (!account) {
            return res.status(404).json(new ApiResponse_1.default(404, {}, 'Account not found', false));
        }
        // Allow access if the user is the account owner OR if the user is an admin
        const isOwner = account.userId === user.id;
        const isAdmin = user.role === client_1.Role.ADMIN;
        if (!isOwner && !isAdmin) {
            return res.status(403).json(new ApiResponse_1.default(403, {}, 'Permission denied', false));
        }
        const updatedAccount = yield prisma.account.update({
            where: { id },
            data: { isActive }
        });
        // Create notification for account status change
        yield prisma.notification.create({
            data: {
                title: isActive ? 'Account Activated' : 'Account Deactivated',
                message: `Your ${account.type} account has been ${isActive ? 'activated' : 'deactivated'}.`,
                type: 'ACCOUNT_UPDATE',
                userId: user.id
            }
        });
        return res.status(200).json(new ApiResponse_1.default(200, updatedAccount, `Account ${isActive ? 'activated' : 'deactivated'} successfully`, true));
    }
    catch (error) {
        console.error('Error updating account status:', error);
        return res.status(500).json(new ApiResponse_1.default(500, {}, 'Error updating account status', false));
    }
}));
// Deposit funds to account
exports.depositFunds = (0, AsyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { id } = req.params;
    const { amount, description } = req.body;
    const authUserId = (_a = req.auth) === null || _a === void 0 ? void 0 : _a.userId;
    if (!authUserId) {
        return res.status(401).json(new ApiResponse_1.default(401, {}, 'Unauthorized Request', false));
    }
    if (!amount || amount <= 0) {
        return res.status(400).json(new ApiResponse_1.default(400, {}, 'Invalid amount', false));
    }
    try {
        // Find user by Clerk userId
        const user = yield prisma.user.findFirst({
            where: {
                userId: authUserId
            }
        });
        if (!user) {
            return res.status(404).json(new ApiResponse_1.default(404, {}, 'User not found', false));
        }
        const account = yield prisma.account.findFirst({
            where: {
                id,
                userId: user.id,
                isActive: true
            }
        });
        if (!account) {
            return res.status(404).json(new ApiResponse_1.default(404, {}, 'Account not found, inactive, or access denied', false));
        }
        // Start transaction
        const result = yield prisma.$transaction((prisma) => __awaiter(void 0, void 0, void 0, function* () {
            // Update account balance
            const updatedAccount = yield prisma.account.update({
                where: { id },
                data: { balance: { increment: amount } }
            });
            // Create transaction record
            const transaction = yield prisma.transaction.create({
                data: {
                    amount,
                    type: 'DEPOSIT',
                    description: description || 'Deposit',
                    status: 'COMPLETED',
                    accountId: id
                }
            });
            // Create notification
            yield prisma.notification.create({
                data: {
                    title: 'Deposit Successful',
                    message: `${account.currency} ${amount.toFixed(2)} has been deposited to your account.`,
                    type: 'ACCOUNT_UPDATE',
                    userId: user.id
                }
            });
            return { updatedAccount, transaction };
        }));
        return res.status(200).json(new ApiResponse_1.default(200, result, 'Funds deposited successfully', true));
    }
    catch (error) {
        console.error('Error depositing funds:', error);
        return res.status(500).json(new ApiResponse_1.default(500, {}, 'Error depositing funds', false));
    }
}));
// Withdraw funds from account
exports.withdrawFunds = (0, AsyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { id } = req.params;
    const { amount, description } = req.body;
    const authUserId = (_a = req.auth) === null || _a === void 0 ? void 0 : _a.userId;
    if (!authUserId) {
        return res.status(401).json(new ApiResponse_1.default(401, {}, 'Unauthorized Request', false));
    }
    if (!amount || amount <= 0) {
        return res.status(400).json(new ApiResponse_1.default(400, {}, 'Invalid amount', false));
    }
    try {
        // Find user by Clerk userId
        const user = yield prisma.user.findFirst({
            where: {
                userId: authUserId
            }
        });
        if (!user) {
            return res.status(404).json(new ApiResponse_1.default(404, {}, 'User not found', false));
        }
        const account = yield prisma.account.findFirst({
            where: {
                id,
                userId: user.id,
                isActive: true
            }
        });
        if (!account) {
            return res.status(404).json(new ApiResponse_1.default(404, {}, 'Account not found, inactive, or access denied', false));
        }
        if (account.balance < amount) {
            return res.status(400).json(new ApiResponse_1.default(400, {}, 'Insufficient funds', false));
        }
        // Start transaction
        const result = yield prisma.$transaction((prisma) => __awaiter(void 0, void 0, void 0, function* () {
            // Update account balance
            const updatedAccount = yield prisma.account.update({
                where: { id },
                data: { balance: { decrement: amount } }
            });
            // Create transaction record
            const transaction = yield prisma.transaction.create({
                data: {
                    amount,
                    type: 'WITHDRAWAL',
                    description: description || 'Withdrawal',
                    status: 'COMPLETED',
                    accountId: id
                }
            });
            // Create notification
            yield prisma.notification.create({
                data: {
                    title: 'Withdrawal Successful',
                    message: `${account.currency} ${amount.toFixed(2)} has been withdrawn from your account.`,
                    type: 'ACCOUNT_UPDATE',
                    userId: user.id
                }
            });
            return { updatedAccount, transaction };
        }));
        return res.status(200).json(new ApiResponse_1.default(200, result, 'Funds withdrawn successfully', true));
    }
    catch (error) {
        console.error('Error withdrawing funds:', error);
        return res.status(500).json(new ApiResponse_1.default(500, {}, 'Error withdrawing funds', false));
    }
}));
// Transfer funds between accounts
exports.transferFunds = (0, AsyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { sourceAccountId, targetAccountId, amount, description } = req.body;
    const authUserId = (_a = req.auth) === null || _a === void 0 ? void 0 : _a.userId;
    if (!authUserId) {
        return res.status(401).json(new ApiResponse_1.default(401, {}, 'Unauthorized Request', false));
    }
    if (!sourceAccountId || !targetAccountId || !amount || amount <= 0) {
        return res.status(400).json(new ApiResponse_1.default(400, {}, 'Invalid input parameters', false));
    }
    if (sourceAccountId === targetAccountId) {
        return res.status(400).json(new ApiResponse_1.default(400, {}, 'Source and target accounts cannot be the same', false));
    }
    try {
        // Find user by Clerk userId
        const user = yield prisma.user.findFirst({
            where: {
                userId: authUserId
            }
        });
        if (!user) {
            return res.status(404).json(new ApiResponse_1.default(404, {}, 'User not found', false));
        }
        const sourceAccount = yield prisma.account.findFirst({
            where: {
                id: sourceAccountId,
                userId: user.id,
                isActive: true
            }
        });
        if (!sourceAccount) {
            return res.status(404).json(new ApiResponse_1.default(404, {}, 'Source account not found, inactive, or access denied', false));
        }
        if (sourceAccount.balance < amount) {
            return res.status(400).json(new ApiResponse_1.default(400, {}, 'Insufficient funds in source account', false));
        }
        const targetAccount = yield prisma.account.findUnique({
            where: {
                id: targetAccountId,
                isActive: true
            }
        });
        if (!targetAccount) {
            return res.status(404).json(new ApiResponse_1.default(404, {}, 'Target account not found or inactive', false));
        }
        // Start transaction
        const result = yield prisma.$transaction((prisma) => __awaiter(void 0, void 0, void 0, function* () {
            // Deduct from source account
            const updatedSourceAccount = yield prisma.account.update({
                where: { id: sourceAccountId },
                data: { balance: { decrement: amount } }
            });
            // Add to target account
            const updatedTargetAccount = yield prisma.account.update({
                where: { id: targetAccountId },
                data: { balance: { increment: amount } }
            });
            // Create source transaction record
            const sourceTransaction = yield prisma.transaction.create({
                data: {
                    amount,
                    type: 'TRANSFER',
                    description: description || `Transfer to account ${targetAccount.accountNumber}`,
                    status: 'COMPLETED',
                    accountId: sourceAccountId
                }
            });
            // Create target transaction record
            const targetTransaction = yield prisma.transaction.create({
                data: {
                    amount,
                    type: 'TRANSFER',
                    description: description || `Transfer from account ${sourceAccount.accountNumber}`,
                    status: 'COMPLETED',
                    accountId: targetAccountId
                }
            });
            // Create notification
            yield prisma.notification.create({
                data: {
                    title: 'Transfer Successful',
                    message: `${sourceAccount.currency} ${amount.toFixed(2)} has been transferred from your account.`,
                    type: 'ACCOUNT_UPDATE',
                    userId: user.id
                }
            });
            return { updatedSourceAccount, updatedTargetAccount, sourceTransaction, targetTransaction };
        }));
        return res.status(200).json(new ApiResponse_1.default(200, result, 'Funds transferred successfully', true));
    }
    catch (error) {
        console.error('Error transferring funds:', error);
        return res.status(500).json(new ApiResponse_1.default(500, {}, 'Error transferring funds', false));
    }
}));
// Get account transactions
exports.getAccountTransactions = (0, AsyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const authUserId = (_a = req.auth) === null || _a === void 0 ? void 0 : _a.userId;
    if (!authUserId) {
        return res.status(401).json(new ApiResponse_1.default(401, {}, 'Unauthorized Request', false));
    }
    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const skip = (pageNumber - 1) * limitNumber;
    try {
        // Find user by Clerk userId
        const user = yield prisma.user.findFirst({
            where: {
                userId: authUserId
            }
        });
        if (!user) {
            return res.status(404).json(new ApiResponse_1.default(404, {}, 'User not found', false));
        }
        const account = yield prisma.account.findFirst({
            where: {
                id,
                userId: user.id
            }
        });
        if (!account) {
            return res.status(404).json(new ApiResponse_1.default(404, {}, 'Account not found or access denied', false));
        }
        const [transactions, totalCount] = yield Promise.all([
            prisma.transaction.findMany({
                where: {
                    accountId: id
                },
                orderBy: {
                    createdAt: 'desc'
                },
                skip,
                take: limitNumber
            }),
            prisma.transaction.count({
                where: {
                    accountId: id
                }
            })
        ]);
        const totalPages = Math.ceil(totalCount / limitNumber);
        return res.status(200).json(new ApiResponse_1.default(200, {
            transactions,
            pagination: {
                total: totalCount,
                pages: totalPages,
                page: pageNumber,
                limit: limitNumber
            }
        }, 'Transactions retrieved successfully', true));
    }
    catch (error) {
        console.error('Error fetching transactions:', error);
        return res.status(500).json(new ApiResponse_1.default(500, {}, 'Error fetching transactions', false));
    }
}));
// Admin: Get all accounts
exports.getAllAccounts = (0, AsyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { page = 1, limit = 10 } = req.query;
    const authUserId = (_a = req.auth) === null || _a === void 0 ? void 0 : _a.userId;
    if (!authUserId) {
        return res.status(401).json(new ApiResponse_1.default(401, {}, 'Unauthorized Request', false));
    }
    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const skip = (pageNumber - 1) * limitNumber;
    try {
        // Check if user is admin
        const user = yield prisma.user.findFirst({
            where: {
                userId: authUserId
            }
        });
        if (!user || user.role !== 'ADMIN') {
            return res.status(403).json(new ApiResponse_1.default(403, {}, 'Permission denied', false));
        }
        const [accounts, totalCount] = yield Promise.all([
            prisma.account.findMany({
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                },
                skip,
                take: limitNumber
            }),
            prisma.account.count()
        ]);
        const totalPages = Math.ceil(totalCount / limitNumber);
        return res.status(200).json(new ApiResponse_1.default(200, {
            accounts,
            pagination: {
                total: totalCount,
                pages: totalPages,
                page: pageNumber,
                limit: limitNumber
            }
        }, 'Accounts retrieved successfully', true));
    }
    catch (error) {
        console.error('Error fetching all accounts:', error);
        return res.status(500).json(new ApiResponse_1.default(500, {}, 'Error fetching all accounts', false));
    }
}));
