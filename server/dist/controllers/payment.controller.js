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
exports.createPaymentReminder = exports.deletePayment = exports.getAllPayments = exports.updatePaymentStatus = exports.getPaymentById = exports.getUserPayments = exports.createPayment = void 0;
const client_1 = require("@prisma/client");
const AsyncHandler_1 = __importDefault(require("../utils/AsyncHandler"));
const ApiResponse_1 = __importDefault(require("../utils/ApiResponse"));
const prisma = new client_1.PrismaClient();
// Create a new payment
exports.createPayment = (0, AsyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { amount, paymentMethod, dueDate, description, loanId } = req.body;
    const userId = (_a = req.auth) === null || _a === void 0 ? void 0 : _a.userId;
    if (!userId) {
        return res.status(401).json(new ApiResponse_1.default(401, {}, 'Unauthorized Request', false));
    }
    if (!amount || !paymentMethod) {
        return res.status(400).json(new ApiResponse_1.default(400, {}, 'Amount and payment method are required', false));
    }
    try {
        // Find user by userId (from Clerk)
        const user = yield prisma.user.findFirst({
            where: {
                userId: userId
            }
        });
        if (!user) {
            return res.status(404).json(new ApiResponse_1.default(404, {}, 'User not found', false));
        }
        // If loan ID is provided, verify it exists and belongs to the user
        if (loanId) {
            const loan = yield prisma.loan.findFirst({
                where: {
                    id: loanId,
                    application: {
                        userId: user.id
                    }
                }
            });
            if (!loan) {
                return res.status(404).json(new ApiResponse_1.default(404, {}, 'Loan not found or does not belong to user', false));
            }
        }
        // Create payment
        const payment = yield prisma.payment.create({
            data: {
                amount: parseFloat(amount),
                paymentMethod: paymentMethod,
                status: client_1.PaymentStatus.PENDING,
                dueDate: dueDate ? new Date(dueDate) : undefined,
                description,
                userId: user.id,
                loanId: loanId || undefined,
            }
        });
        // Create a transaction for this payment
        if (payment) {
            yield prisma.transaction.create({
                data: {
                    amount: parseFloat(amount),
                    type: 'PAYMENT',
                    description: description || 'Payment transaction',
                    status: 'PENDING',
                    paymentId: payment.id
                }
            });
        }
        return res.status(201).json(new ApiResponse_1.default(201, payment, 'Payment created successfully', true));
    }
    catch (error) {
        console.error('Error creating payment:', error);
        return res.status(500).json(new ApiResponse_1.default(500, {}, 'Error creating payment', false));
    }
}));
// Get a user's payments
exports.getUserPayments = (0, AsyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.auth) === null || _a === void 0 ? void 0 : _a.userId;
    const { status, loanId } = req.query;
    if (!userId) {
        return res.status(401).json(new ApiResponse_1.default(401, {}, 'Unauthorized Request', false));
    }
    try {
        // Find user by userId (from Clerk)
        const user = yield prisma.user.findFirst({
            where: {
                userId: userId
            }
        });
        if (!user) {
            return res.status(404).json(new ApiResponse_1.default(404, {}, 'User not found', false));
        }
        // Build filter conditions
        const whereConditions = {
            userId: user.id
        };
        if (status) {
            whereConditions.status = status;
        }
        if (loanId) {
            whereConditions.loanId = loanId;
        }
        // Get payments
        const payments = yield prisma.payment.findMany({
            where: whereConditions,
            include: {
                loan: true,
                transaction: true
            },
            orderBy: {
                paymentDate: 'desc'
            }
        });
        return res.status(200).json(new ApiResponse_1.default(200, payments, 'Payments retrieved successfully', true));
    }
    catch (error) {
        console.error('Error fetching payments:', error);
        return res.status(500).json(new ApiResponse_1.default(500, {}, 'Error fetching payments', false));
    }
}));
// Get payment by ID
exports.getPaymentById = (0, AsyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { id } = req.params;
    const userId = (_a = req.auth) === null || _a === void 0 ? void 0 : _a.userId;
    if (!userId) {
        return res.status(401).json(new ApiResponse_1.default(401, {}, 'Unauthorized Request', false));
    }
    try {
        // Find user by userId (from Clerk)
        const user = yield prisma.user.findFirst({
            where: {
                userId: userId
            }
        });
        if (!user) {
            return res.status(404).json(new ApiResponse_1.default(404, {}, 'User not found', false));
        }
        // Get payment
        const payment = yield prisma.payment.findFirst({
            where: {
                id,
                userId: user.id
            },
            include: {
                loan: true,
                transaction: true
            }
        });
        if (!payment) {
            return res.status(404).json(new ApiResponse_1.default(404, {}, 'Payment not found', false));
        }
        return res.status(200).json(new ApiResponse_1.default(200, payment, 'Payment retrieved successfully', true));
    }
    catch (error) {
        console.error('Error fetching payment:', error);
        return res.status(500).json(new ApiResponse_1.default(500, {}, 'Error fetching payment', false));
    }
}));
// Update payment status
exports.updatePaymentStatus = (0, AsyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { id } = req.params;
    const { status } = req.body;
    const userId = (_a = req.auth) === null || _a === void 0 ? void 0 : _a.userId;
    if (!userId) {
        return res.status(401).json(new ApiResponse_1.default(401, {}, 'Unauthorized Request', false));
    }
    if (!status || !Object.values(client_1.PaymentStatus).includes(status)) {
        return res.status(400).json(new ApiResponse_1.default(400, {}, 'Valid status is required', false));
    }
    try {
        // Find user by userId (from Clerk)
        const user = yield prisma.user.findFirst({
            where: {
                userId: userId
            }
        });
        if (!user) {
            return res.status(404).json(new ApiResponse_1.default(404, {}, 'User not found', false));
        }
        // Check if payment exists and belongs to user
        const existingPayment = yield prisma.payment.findFirst({
            where: {
                id,
                userId: user.id
            },
            include: {
                transaction: true
            }
        });
        if (!existingPayment) {
            return res.status(404).json(new ApiResponse_1.default(404, {}, 'Payment not found or unauthorized', false));
        }
        // Update payment status
        const updatedPayment = yield prisma.payment.update({
            where: { id },
            data: {
                status: status,
            },
            include: {
                transaction: true,
                loan: true
            }
        });
        // If there's an associated transaction, update its status too
        if (existingPayment.transaction) {
            yield prisma.transaction.update({
                where: { id: existingPayment.transaction.id },
                data: {
                    status: status === 'COMPLETED' ? 'COMPLETED' : status === 'FAILED' ? 'FAILED' : status === 'CANCELLED' ? 'CANCELLED' : 'PENDING'
                }
            });
        }
        // If payment is completed and linked to a loan, update the loan's outstanding amount
        if (status === 'COMPLETED' && updatedPayment.loanId) {
            const loan = yield prisma.loan.findUnique({
                where: { id: updatedPayment.loanId }
            });
            if (loan) {
                const newOutstandingAmount = Math.max(0, loan.outstandingAmount - updatedPayment.amount);
                yield prisma.loan.update({
                    where: { id: updatedPayment.loanId },
                    data: {
                        outstandingAmount: newOutstandingAmount,
                        status: newOutstandingAmount <= 0 ? 'PAID' : 'ACTIVE'
                    }
                });
            }
        }
        // Create notification for payment status update
        yield prisma.notification.create({
            data: {
                title: `Payment ${status.toLowerCase()}`,
                message: `Your payment of ${updatedPayment.amount} has been ${status.toLowerCase()}.`,
                type: 'PAYMENT_CONFIRMATION',
                userId: user.id
            }
        });
        return res.status(200).json(new ApiResponse_1.default(200, updatedPayment, 'Payment status updated successfully', true));
    }
    catch (error) {
        console.error('Error updating payment status:', error);
        return res.status(500).json(new ApiResponse_1.default(500, {}, 'Error updating payment status', false));
    }
}));
// Admin: Get all payments
exports.getAllPayments = (0, AsyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const authUserId = (_a = req.auth) === null || _a === void 0 ? void 0 : _a.userId;
    const { status, userId: queryUserId, loanId } = req.query;
    if (!authUserId) {
        return res.status(401).json(new ApiResponse_1.default(401, {}, 'Unauthorized Request', false));
    }
    try {
        // Check if requester is admin
        const requester = yield prisma.user.findFirst({
            where: { userId: authUserId }
        });
        if (!requester) {
            return res.status(404).json(new ApiResponse_1.default(404, {}, 'User not found', false));
        }
        if (requester.role !== 'ADMIN') {
            return res.status(403).json(new ApiResponse_1.default(403, {}, 'Permission denied', false));
        }
        // Build filter conditions
        const whereConditions = {};
        if (status) {
            whereConditions.status = status;
        }
        if (queryUserId) {
            whereConditions.userId = queryUserId;
        }
        if (loanId) {
            whereConditions.loanId = loanId;
        }
        // Get all payments
        const payments = yield prisma.payment.findMany({
            where: whereConditions,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                loan: true,
                transaction: true
            },
            orderBy: {
                paymentDate: 'desc'
            }
        });
        return res.status(200).json(new ApiResponse_1.default(200, payments, 'All payments retrieved successfully', true));
    }
    catch (error) {
        console.error('Error fetching payments:', error);
        return res.status(500).json(new ApiResponse_1.default(500, {}, 'Error fetching payments', false));
    }
}));
// Delete a payment (admin only)
exports.deletePayment = (0, AsyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { id } = req.params;
    const authUserId = (_a = req.auth) === null || _a === void 0 ? void 0 : _a.userId;
    if (!authUserId) {
        return res.status(401).json(new ApiResponse_1.default(401, {}, 'Unauthorized Request', false));
    }
    try {
        // Check if requester is admin
        const requester = yield prisma.user.findFirst({
            where: { userId: authUserId }
        });
        if (!requester) {
            return res.status(404).json(new ApiResponse_1.default(404, {}, 'User not found', false));
        }
        if (requester.role !== 'ADMIN') {
            return res.status(403).json(new ApiResponse_1.default(403, {}, 'Permission denied', false));
        }
        // Find the payment first
        const payment = yield prisma.payment.findUnique({
            where: { id },
            include: {
                transaction: true
            }
        });
        if (!payment) {
            return res.status(404).json(new ApiResponse_1.default(404, {}, 'Payment not found', false));
        }
        // Delete the associated transaction first if it exists
        if (payment.transaction) {
            yield prisma.transaction.delete({
                where: { id: payment.transaction.id }
            });
        }
        // Delete the payment
        yield prisma.payment.delete({
            where: { id }
        });
        return res.status(200).json(new ApiResponse_1.default(200, {}, 'Payment deleted successfully', true));
    }
    catch (error) {
        console.error('Error deleting payment:', error);
        return res.status(500).json(new ApiResponse_1.default(500, {}, 'Error deleting payment', false));
    }
}));
// Create payment reminder for a loan
exports.createPaymentReminder = (0, AsyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { loanId, dueDate, amount, description } = req.body;
    const userId = (_a = req.auth) === null || _a === void 0 ? void 0 : _a.userId;
    if (!userId) {
        return res.status(401).json(new ApiResponse_1.default(401, {}, 'Unauthorized Request', false));
    }
    if (!loanId || !dueDate || !amount) {
        return res.status(400).json(new ApiResponse_1.default(400, {}, 'Loan ID, due date, and amount are required', false));
    }
    try {
        // Find user by userId (from Clerk)
        const user = yield prisma.user.findFirst({
            where: {
                userId: userId
            }
        });
        if (!user) {
            return res.status(404).json(new ApiResponse_1.default(404, {}, 'User not found', false));
        }
        // Verify loan exists and belongs to user
        const loan = yield prisma.loan.findFirst({
            where: {
                id: loanId,
                application: {
                    userId: user.id
                }
            }
        });
        if (!loan) {
            return res.status(404).json(new ApiResponse_1.default(404, {}, 'Loan not found or does not belong to user', false));
        }
        // Create payment with future due date
        const payment = yield prisma.payment.create({
            data: {
                amount: parseFloat(amount),
                paymentMethod: client_1.PaymentMethod.AUTOMATIC_DEBIT,
                status: client_1.PaymentStatus.PENDING,
                dueDate: new Date(dueDate),
                description: description || `Scheduled payment for loan ${loan.loanNumber}`,
                userId: user.id,
                loanId: loanId
            }
        });
        // Create notification
        yield prisma.notification.create({
            data: {
                title: 'Payment Reminder Created',
                message: `A payment reminder of ${amount} has been set for ${new Date(dueDate).toLocaleDateString()}.`,
                type: 'PAYMENT_REMINDER',
                userId: user.id
            }
        });
        return res.status(201).json(new ApiResponse_1.default(201, payment, 'Payment reminder created successfully', true));
    }
    catch (error) {
        console.error('Error creating payment reminder:', error);
        return res.status(500).json(new ApiResponse_1.default(500, {}, 'Error creating payment reminder', false));
    }
}));
