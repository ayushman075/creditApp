"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const clerk_sdk_node_1 = require("@clerk/clerk-sdk-node");
const loan_controller_1 = require("../controllers/loan.controller");
const multer_middleware_1 = require("../middlewares/multer.middleware");
const loanRouter = (0, express_1.Router)();
// Loan Application Routes
// Create new loan application - requires authenticated user
loanRouter.route('/applications/create').post((0, clerk_sdk_node_1.ClerkExpressRequireAuth)(), multer_middleware_1.upload.array('documents'), loan_controller_1.createLoanApplication);
// Get all loan applications for the logged in user
loanRouter.route('/applications').get((0, clerk_sdk_node_1.ClerkExpressRequireAuth)(), loan_controller_1.getUserLoanApplications);
// Get all loan applications - admin only
loanRouter.route('/applications/all').get((0, clerk_sdk_node_1.ClerkExpressRequireAuth)(), loan_controller_1.getAllLoanApplications);
// Get specific loan application
loanRouter.route('/applications/:applicationId').get((0, clerk_sdk_node_1.ClerkExpressRequireAuth)(), loan_controller_1.getLoanApplicationById);
// Upload documents for loan application
loanRouter.route('/applications/:applicationId/documents').post((0, clerk_sdk_node_1.ClerkExpressRequireAuth)(), multer_middleware_1.upload.array('documents'), // Multer middleware to handle file uploads
loan_controller_1.uploadLoanDocuments);
// Update loan application status (admin only)
loanRouter.route('/applications/:applicationId/status').patch((0, clerk_sdk_node_1.ClerkExpressRequireAuth)(), loan_controller_1.updateLoanApplicationStatus);
// Loan Routes
// Get all loans for the logged in user
loanRouter.route('/loans').get((0, clerk_sdk_node_1.ClerkExpressRequireAuth)(), loan_controller_1.getUserLoans);
// Get all loans - admin only
loanRouter.route('/loans/all').get((0, clerk_sdk_node_1.ClerkExpressRequireAuth)(), loan_controller_1.getAllLoans);
// Get specific loan
loanRouter.route('/loans/:loanId').get((0, clerk_sdk_node_1.ClerkExpressRequireAuth)(), loan_controller_1.getLoanById);
// Make a payment on a loan
loanRouter.route('/loans/:loanId/payment').post((0, clerk_sdk_node_1.ClerkExpressRequireAuth)(), loan_controller_1.makePayment);
// Update loan status (admin only)
loanRouter.route('/loans/:loanId/status').patch((0, clerk_sdk_node_1.ClerkExpressRequireAuth)(), loan_controller_1.updateLoanStatus);
exports.default = loanRouter;
