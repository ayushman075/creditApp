"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const clerk_sdk_node_1 = require("@clerk/clerk-sdk-node");
const account_controller_1 = require("../controllers/account.controller");
const accountRouter = (0, express_1.Router)();
// Create a new account - requires authenticated user
accountRouter.route('/create').post((0, clerk_sdk_node_1.ClerkExpressRequireAuth)(), account_controller_1.createAccount);
// Get all accounts for authenticated user
accountRouter.route('/').get((0, clerk_sdk_node_1.ClerkExpressRequireAuth)(), account_controller_1.getUserAccounts);
// Get specific account by ID
accountRouter.route('/:id').get((0, clerk_sdk_node_1.ClerkExpressRequireAuth)(), account_controller_1.getAccountById);
// Update account status (activate/deactivate)
accountRouter.route('/:id/status').patch((0, clerk_sdk_node_1.ClerkExpressRequireAuth)(), account_controller_1.updateAccountStatus);
// Deposit funds to account
accountRouter.route('/:id/deposit').post((0, clerk_sdk_node_1.ClerkExpressRequireAuth)(), account_controller_1.depositFunds);
// Withdraw funds from account
accountRouter.route('/:id/withdraw').post((0, clerk_sdk_node_1.ClerkExpressRequireAuth)(), account_controller_1.withdrawFunds);
// Transfer funds between accounts
accountRouter.route('/transfer').post((0, clerk_sdk_node_1.ClerkExpressRequireAuth)(), account_controller_1.transferFunds);
// Get account transactions with pagination
accountRouter.route('/:id/transactions').get((0, clerk_sdk_node_1.ClerkExpressRequireAuth)(), account_controller_1.getAccountTransactions);
// Admin route: Get all accounts (admin check happens in controller)
accountRouter.route('/admin/all').get((0, clerk_sdk_node_1.ClerkExpressRequireAuth)(), account_controller_1.getAllAccounts);
exports.default = accountRouter;
