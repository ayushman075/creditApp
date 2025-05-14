import { Router } from "express";
import { ClerkExpressRequireAuth } from "@clerk/clerk-sdk-node";
import { 
  createAccount,
  getUserAccounts,
  getAccountById,
  updateAccountStatus,
  depositFunds,
  withdrawFunds,
  transferFunds,
  getAccountTransactions,
  getAllAccounts
} from "../controllers/account.controller";

const accountRouter = Router();

// Create a new account - requires authenticated user
accountRouter.route('/create').post(
  ClerkExpressRequireAuth(),
  createAccount
);

// Get all accounts for authenticated user
accountRouter.route('/').get(
  ClerkExpressRequireAuth(),
  getUserAccounts
);

// Get specific account by ID
accountRouter.route('/:id').get(
  ClerkExpressRequireAuth(),
  getAccountById
);

// Update account status (activate/deactivate)
accountRouter.route('/:id/status').patch(
  ClerkExpressRequireAuth(),
  updateAccountStatus
);

// Deposit funds to account
accountRouter.route('/:id/deposit').post(
  ClerkExpressRequireAuth(),
  depositFunds
);

// Withdraw funds from account
accountRouter.route('/:id/withdraw').post(
  ClerkExpressRequireAuth(),
  withdrawFunds
);

// Transfer funds between accounts
accountRouter.route('/transfer').post(
  ClerkExpressRequireAuth(),
  transferFunds
);

// Get account transactions with pagination
accountRouter.route('/:id/transactions').get(
  ClerkExpressRequireAuth(),
  getAccountTransactions
);

// Admin route: Get all accounts (admin check happens in controller)
accountRouter.route('/admin/all').get(
  ClerkExpressRequireAuth(),
  getAllAccounts
);

export default accountRouter;