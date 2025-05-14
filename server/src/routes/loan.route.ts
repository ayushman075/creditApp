import { Router } from "express";
import { ClerkExpressRequireAuth } from "@clerk/clerk-sdk-node";
import { 
  createLoanApplication, 
  uploadLoanDocuments, 
  getLoanApplicationById, 
  getUserLoanApplications, 
  updateLoanApplicationStatus, 
  getAllLoanApplications, 
  getLoanById, 
  getUserLoans, 
  getAllLoans, 
  makePayment, 
  updateLoanStatus 
} from "../controllers/loan.controller";
import { upload } from "../middlewares/multer.middleware";

const loanRouter = Router();

// Loan Application Routes
// Create new loan application - requires authenticated user
loanRouter.route('/applications/create').post(
  ClerkExpressRequireAuth(),
  upload.array('documents'),
  createLoanApplication
);

// Get all loan applications for the logged in user
loanRouter.route('/applications').get(
  ClerkExpressRequireAuth(),
  getUserLoanApplications
);

// Get all loan applications - admin only
loanRouter.route('/applications/all').get(
  ClerkExpressRequireAuth(),
  getAllLoanApplications
);

// Get specific loan application
loanRouter.route('/applications/:applicationId').get(
  ClerkExpressRequireAuth(),
  getLoanApplicationById
);

// Upload documents for loan application
loanRouter.route('/applications/:applicationId/documents').post(
  ClerkExpressRequireAuth(),
  upload.array('documents'), // Multer middleware to handle file uploads
  uploadLoanDocuments
);

// Update loan application status (admin only)
loanRouter.route('/applications/:applicationId/status').patch(
  ClerkExpressRequireAuth(),
  updateLoanApplicationStatus
);

// Loan Routes
// Get all loans for the logged in user
loanRouter.route('/loans').get(
  ClerkExpressRequireAuth(),
  getUserLoans
);

// Get all loans - admin only
loanRouter.route('/loans/all').get(
  ClerkExpressRequireAuth(),
  getAllLoans
);

// Get specific loan
loanRouter.route('/loans/:loanId').get(
  ClerkExpressRequireAuth(),
  getLoanById
);

// Make a payment on a loan
loanRouter.route('/loans/:loanId/payment').post(
  ClerkExpressRequireAuth(),
  makePayment
);

// Update loan status (admin only)
loanRouter.route('/loans/:loanId/status').patch(
  ClerkExpressRequireAuth(),
  updateLoanStatus
);

export default loanRouter;