import { Router } from "express";
import { ClerkExpressRequireAuth } from "@clerk/clerk-sdk-node";
import { 
  createPayment,
  getUserPayments,
  getPaymentById,
  updatePaymentStatus,
  getAllPayments,
  deletePayment,
  createPaymentReminder
} from "../controllers/payment.controller";

const paymentRouter = Router();

// Create a new payment - requires authenticated user
paymentRouter.route('/create').post(
  ClerkExpressRequireAuth(),
  createPayment
);

// Get user's payments - requires authenticated user
paymentRouter.route('/').get(
  ClerkExpressRequireAuth(),
  getUserPayments
);

// Get payment by ID - requires authenticated user
paymentRouter.route('/:id').get(
  ClerkExpressRequireAuth(),
  getPaymentById
);

// Update payment status - requires authenticated user
paymentRouter.route('/:id/status').patch(
  ClerkExpressRequireAuth(),
  updatePaymentStatus
);

// Admin: Get all payments - requires authenticated user (admin check in controller)
paymentRouter.route('/admin/all').get(
  ClerkExpressRequireAuth(),
  getAllPayments
);

// Admin: Delete a payment - requires authenticated user (admin check in controller)
paymentRouter.route('/admin/:id').delete(
  ClerkExpressRequireAuth(),
  deletePayment
);

// Create payment reminder - requires authenticated user
paymentRouter.route('/reminder/create').post(
  ClerkExpressRequireAuth(),
  createPaymentReminder
);

export default paymentRouter;