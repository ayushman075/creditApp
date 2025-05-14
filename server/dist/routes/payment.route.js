"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const clerk_sdk_node_1 = require("@clerk/clerk-sdk-node");
const payment_controller_1 = require("../controllers/payment.controller");
const paymentRouter = (0, express_1.Router)();
// Create a new payment - requires authenticated user
paymentRouter.route('/create').post((0, clerk_sdk_node_1.ClerkExpressRequireAuth)(), payment_controller_1.createPayment);
// Get user's payments - requires authenticated user
paymentRouter.route('/').get((0, clerk_sdk_node_1.ClerkExpressRequireAuth)(), payment_controller_1.getUserPayments);
// Get payment by ID - requires authenticated user
paymentRouter.route('/:id').get((0, clerk_sdk_node_1.ClerkExpressRequireAuth)(), payment_controller_1.getPaymentById);
// Update payment status - requires authenticated user
paymentRouter.route('/:id/status').patch((0, clerk_sdk_node_1.ClerkExpressRequireAuth)(), payment_controller_1.updatePaymentStatus);
// Admin: Get all payments - requires authenticated user (admin check in controller)
paymentRouter.route('/admin/all').get((0, clerk_sdk_node_1.ClerkExpressRequireAuth)(), payment_controller_1.getAllPayments);
// Admin: Delete a payment - requires authenticated user (admin check in controller)
paymentRouter.route('/admin/:id').delete((0, clerk_sdk_node_1.ClerkExpressRequireAuth)(), payment_controller_1.deletePayment);
// Create payment reminder - requires authenticated user
paymentRouter.route('/reminder/create').post((0, clerk_sdk_node_1.ClerkExpressRequireAuth)(), payment_controller_1.createPaymentReminder);
exports.default = paymentRouter;
