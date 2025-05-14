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
exports.updateLoanStatus = exports.makePayment = exports.getAllLoans = exports.getUserLoans = exports.getLoanById = exports.getAllLoanApplications = exports.updateLoanApplicationStatus = exports.getUserLoanApplications = exports.getLoanApplicationById = exports.uploadLoanDocuments = exports.createLoanApplication = void 0;
const client_1 = require("@prisma/client");
const AsyncHandler_1 = __importDefault(require("../utils/AsyncHandler"));
const ApiResponse_1 = __importDefault(require("../utils/ApiResponse"));
const uuid_1 = require("uuid");
const cloudinary_1 = require("../utils/cloudinary");
const prisma = new client_1.PrismaClient();
// Create a new loan application
exports.createLoanApplication = (0, AsyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { amount, purpose, term } = req.body;
    const userId = (_a = req.auth) === null || _a === void 0 ? void 0 : _a.userId;
    const files = req.files;
    if (!userId) {
        return res.status(401).json(new ApiResponse_1.default(401, {}, 'Unauthorized Request', false));
    }
    if (!amount || !purpose || !term) {
        return res.status(400).json(new ApiResponse_1.default(400, {}, 'All fields are required: amount, purpose, term', false));
    }
    try {
        // Find user by userId (from Clerk)
        const user = yield prisma.user.findFirst({
            where: { userId }
        });
        if (!user) {
            return res.status(404).json(new ApiResponse_1.default(404, {}, 'User not found', false));
        }
        const documents = [];
        //  const uploadedDocuments = await Promise.all(
        //   files?.map(async (file: Express.Multer.File) => {
        //     // Upload the file to Cloudinary
        //     const cloudinaryUrl:string|any = await uploadFileOnCloudinary(file.path);
        //     documents.push(cloudinaryUrl)
        //     if (!cloudinaryUrl) {
        //       throw new Error(`Failed to upload file: ${file.originalname}`);
        //     }}))
        // Create loan application
        const loanApplication = yield prisma.loanApplication.create({
            data: {
                amount: parseFloat(amount),
                purpose,
                term: parseInt(term),
                status: 'PENDING',
                document: documents,
                user: {
                    connect: { id: user.id }
                }
            }
        });
        return res.status(201).json(new ApiResponse_1.default(201, loanApplication, 'Loan application created successfully', true));
    }
    catch (error) {
        console.error('Error creating loan application:', error);
        return res.status(500).json(new ApiResponse_1.default(500, {}, 'Error creating loan application', false));
    }
}));
// Upload documents for loan application
exports.uploadLoanDocuments = (0, AsyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { applicationId } = req.params;
    const userId = (_a = req.auth) === null || _a === void 0 ? void 0 : _a.userId;
    const files = req.files;
    if (!userId) {
        return res.status(401).json(new ApiResponse_1.default(401, {}, 'Unauthorized Request', false));
    }
    if (!files || files.length === 0) {
        return res.status(400).json(new ApiResponse_1.default(400, {}, 'No files uploaded', false));
    }
    try {
        // Find user by userId (from Clerk)
        const user = yield prisma.user.findFirst({
            where: { userId }
        });
        if (!user) {
            return res.status(404).json(new ApiResponse_1.default(404, {}, 'User not found', false));
        }
        // Verify application belongs to the user
        const loanApplication = yield prisma.loanApplication.findFirst({
            where: {
                id: applicationId,
                userId: user.id
            }
        });
        if (!loanApplication) {
            return res.status(404).json(new ApiResponse_1.default(404, {}, 'Loan application not found or not authorized', false));
        }
        // Upload files to Cloudinary and save references to database
        const uploadedDocuments = yield Promise.all(files.map((file) => __awaiter(void 0, void 0, void 0, function* () {
            // Upload the file to Cloudinary
            const cloudinaryUrl = yield (0, cloudinary_1.uploadFileOnCloudinary)(file.path);
            if (!cloudinaryUrl) {
                throw new Error(`Failed to upload file: ${file.originalname}`);
            }
            // Save document reference to database
            return prisma.document.create({
                data: {
                    name: file.originalname,
                    fileUrl: cloudinaryUrl,
                    fileType: file.mimetype,
                    application: {
                        connect: { id: applicationId }
                    }
                }
            });
        })));
        return res.status(200).json(new ApiResponse_1.default(200, uploadedDocuments, 'Documents uploaded successfully', true));
    }
    catch (error) {
        console.error('Error uploading documents:', error);
        return res.status(500).json(new ApiResponse_1.default(500, {}, 'Error uploading documents', false));
    }
}));
// Get loan application by ID
exports.getLoanApplicationById = (0, AsyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { applicationId } = req.params;
    const userId = (_a = req.auth) === null || _a === void 0 ? void 0 : _a.userId;
    if (!userId) {
        return res.status(401).json(new ApiResponse_1.default(401, {}, 'Unauthorized Request', false));
    }
    try {
        // Find user by userId (from Clerk)
        const user = yield prisma.user.findFirst({
            where: { userId }
        });
        if (!user) {
            return res.status(404).json(new ApiResponse_1.default(404, {}, 'User not found', false));
        }
        // Check if user is admin
        const isAdmin = user.role === 'ADMIN';
        // Query to find the application
        const whereClause = isAdmin
            ? { id: applicationId }
            : { id: applicationId, userId: user.id };
        const loanApplication = yield prisma.loanApplication.findFirst({
            where: whereClause,
            include: {
                documents: true,
                loan: true
            }
        });
        if (!loanApplication) {
            return res.status(404).json(new ApiResponse_1.default(404, {}, 'Loan application not found or not authorized', false));
        }
        return res.status(200).json(new ApiResponse_1.default(200, loanApplication, 'Loan application retrieved successfully', true));
    }
    catch (error) {
        console.error('Error fetching loan application:', error);
        return res.status(500).json(new ApiResponse_1.default(500, {}, 'Error fetching loan application', false));
    }
}));
// Get all loan applications for a user
exports.getUserLoanApplications = (0, AsyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.auth) === null || _a === void 0 ? void 0 : _a.userId;
    if (!userId) {
        return res.status(401).json(new ApiResponse_1.default(401, {}, 'Unauthorized Request', false));
    }
    try {
        // Find user by userId (from Clerk)
        const user = yield prisma.user.findFirst({
            where: { userId }
        });
        if (!user) {
            return res.status(404).json(new ApiResponse_1.default(404, {}, 'User not found', false));
        }
        // Parse query parameters
        const { page = '1', limit = '10', purpose, status, sortBy = 'submittedAt', sortOrder = 'desc' } = req.query;
        // Convert pagination params to numbers
        const pageNumber = parseInt(page, 10);
        const pageSize = parseInt(limit, 10);
        const skip = (pageNumber - 1) * pageSize;
        // Build filter conditions
        const filterConditions = {
            userId: user.id
        };
        // Add purpose filter (regex search)
        if (purpose) {
            filterConditions.purpose = {
                contains: purpose,
                mode: 'insensitive'
            };
        }
        // Add status filter
        if (status) {
            filterConditions.status = status;
        }
        // Validate sort parameters
        const allowedSortFields = ['submittedAt', 'amount', 'dueDate', 'status'];
        const sortField = allowedSortFields.includes(sortBy)
            ? sortBy
            : 'submittedAt';
        const sortDirection = sortOrder.toLowerCase() === 'asc' ? 'asc' : 'desc';
        // Count total matching loans for pagination metadata
        const totalLoans = yield prisma.loanApplication.count({
            where: filterConditions
        });
        // Get filtered and paginated loans
        const loans = yield prisma.loanApplication.findMany({
            where: filterConditions,
            orderBy: { ['submittedAt']: 'desc' },
            skip,
            take: pageSize
        });
        // Calculate pagination metadata
        const totalPages = Math.ceil(totalLoans / pageSize);
        const hasNextPage = pageNumber < totalPages;
        const hasPrevPage = pageNumber > 1;
        // Prepare response with pagination metadata
        const paginationMetadata = {
            totalItems: totalLoans,
            itemsPerPage: pageSize,
            currentPage: pageNumber,
            totalPages,
            hasNextPage,
            hasPrevPage
        };
        return res.status(200).json(new ApiResponse_1.default(200, {
            loans,
            pagination: paginationMetadata
        }, 'Loans retrieved successfully', true));
    }
    catch (error) {
        console.error('Error fetching loans:', error);
        return res.status(500).json(new ApiResponse_1.default(500, {}, 'Error fetching loans', false));
    }
}));
// Update loan application status (admin only)
exports.updateLoanApplicationStatus = (0, AsyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { applicationId } = req.params;
    const { status, interestRate, rejectionReason } = req.body;
    const userId = (_a = req.auth) === null || _a === void 0 ? void 0 : _a.userId;
    if (!userId) {
        return res.status(401).json(new ApiResponse_1.default(401, {}, 'Unauthorized Request', false));
    }
    if (!status || !['APPROVED', 'REJECTED', 'CANCELLED'].includes(status)) {
        return res.status(400).json(new ApiResponse_1.default(400, {}, 'Invalid status', false));
    }
    try {
        // Find user by userId (from Clerk)
        const user = yield prisma.user.findFirst({
            where: { userId }
        });
        if (!user) {
            return res.status(404).json(new ApiResponse_1.default(404, {}, 'User not found', false));
        }
        // Check if user is admin
        if (user.role !== 'ADMIN') {
            return res.status(403).json(new ApiResponse_1.default(403, {}, 'Permission denied', false));
        }
        // Find the application
        const application = yield prisma.loanApplication.findUnique({
            where: { id: applicationId }
        });
        if (!application) {
            return res.status(404).json(new ApiResponse_1.default(404, {}, 'Loan application not found', false));
        }
        // Update fields based on status
        const updateData = { status: status };
        if (status === 'APPROVED') {
            if (!interestRate) {
                return res.status(400).json(new ApiResponse_1.default(400, {}, 'Interest rate is required for approval', false));
            }
            updateData.interestRate = parseFloat(interestRate);
            updateData.approvedAt = new Date();
        }
        else if (status === 'REJECTED') {
            if (!rejectionReason) {
                return res.status(400).json(new ApiResponse_1.default(400, {}, 'Rejection reason is required', false));
            }
            updateData.rejectionReason = rejectionReason;
            updateData.rejectedAt = new Date();
        }
        // Update application
        const updatedApplication = yield prisma.loanApplication.update({
            where: { id: applicationId },
            data: updateData
        });
        // If approved, create loan record
        if (status === 'APPROVED') {
            const startDate = new Date();
            const endDate = new Date();
            endDate.setMonth(endDate.getMonth() + application.term);
            yield prisma.loan.create({
                data: {
                    loanNumber: `LOAN-${(0, uuid_1.v4)().substring(0, 8).toUpperCase()}`,
                    amount: application.amount,
                    disbursedAmount: application.amount,
                    outstandingAmount: application.amount,
                    interestRate: parseFloat(interestRate),
                    term: application.term,
                    startDate,
                    endDate,
                    status: 'ACTIVE',
                    application: {
                        connect: { id: applicationId }
                    }
                }
            });
            // Create notification for approval
            yield prisma.notification.create({
                data: {
                    title: 'Loan Application Approved',
                    message: `Your loan application for ${application.amount} has been approved.`,
                    type: 'LOAN_APPLICATION_UPDATE',
                    user: {
                        connect: { id: application.userId }
                    }
                }
            });
        }
        else if (status === 'REJECTED') {
            // Create notification for rejection
            yield prisma.notification.create({
                data: {
                    title: 'Loan Application Rejected',
                    message: `Your loan application has been rejected. Reason: ${rejectionReason}`,
                    type: 'LOAN_APPLICATION_UPDATE',
                    user: {
                        connect: { id: application.userId }
                    }
                }
            });
        }
        return res.status(200).json(new ApiResponse_1.default(200, updatedApplication, 'Loan application updated successfully', true));
    }
    catch (error) {
        console.error('Error updating loan application:', error);
        return res.status(500).json(new ApiResponse_1.default(500, {}, 'Error updating loan application', false));
    }
}));
// Get all loan applications (admin only)
exports.getAllLoanApplications = (0, AsyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.auth) === null || _a === void 0 ? void 0 : _a.userId;
    if (!userId) {
        return res.status(401).json(new ApiResponse_1.default(401, {}, 'Unauthorized Request', false));
    }
    try {
        // Find user by userId (from Clerk)
        const user = yield prisma.user.findFirst({
            where: { userId }
        });
        if (!user) {
            return res.status(404).json(new ApiResponse_1.default(404, {}, 'User not found', false));
        }
        // Check if user is admin
        if (user.role !== 'ADMIN') {
            return res.status(403).json(new ApiResponse_1.default(403, {}, 'Permission denied', false));
        }
        // Pagination parameters
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        // Filtering parameters
        const filters = {};
        // Status filter
        if (req.query.status) {
            filters.status = req.query.status;
        }
        // Purpose filter (using contains for partial matches)
        if (req.query.purpose) {
            filters.purpose = {
                contains: req.query.purpose,
                mode: 'insensitive' // Case insensitive search
            };
        }
        // Term filter
        if (req.query.term) {
            filters.term = parseInt(req.query.term);
        }
        // Count total records for pagination metadata
        const totalCount = yield prisma.loanApplication.count({
            where: filters
        });
        // Sorting
        const sortField = req.query.sortBy || 'submittedAt';
        const sortOrder = req.query.sortOrder === 'asc' ? 'asc' : 'desc';
        const orderBy = {};
        orderBy[sortField] = sortOrder;
        // Fetch loan applications with pagination, filtering, and sorting
        const loanApplications = yield prisma.loanApplication.findMany({
            where: filters,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        creditScore: true
                    }
                },
                documents: true,
                loan: true
            },
            orderBy,
            skip,
            take: limit
        });
        // Pagination metadata
        const totalPages = Math.ceil(totalCount / limit);
        const hasNextPage = page < totalPages;
        const hasPrevPage = page > 1;
        return res.status(200).json(new ApiResponse_1.default(200, {
            loanApplications,
            pagination: {
                page,
                limit,
                totalItems: totalCount,
                totalPages,
                hasNextPage,
                hasPrevPage
            }
        }, 'Loan applications retrieved successfully', true));
    }
    catch (error) {
        console.error('Error fetching loan applications:', error);
        return res.status(500).json(new ApiResponse_1.default(500, {}, 'Error fetching loan applications', false));
    }
}));
// Get loan by ID
exports.getLoanById = (0, AsyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { loanId } = req.params;
    const userId = (_a = req.auth) === null || _a === void 0 ? void 0 : _a.userId;
    if (!userId) {
        return res.status(401).json(new ApiResponse_1.default(401, {}, 'Unauthorized Request', false));
    }
    try {
        // Find user by userId (from Clerk)
        const user = yield prisma.user.findFirst({
            where: { userId }
        });
        if (!user) {
            return res.status(404).json(new ApiResponse_1.default(404, {}, 'User not found', false));
        }
        // Find the loan
        const loan = yield prisma.loan.findUnique({
            where: { id: loanId },
            include: {
                application: {
                    include: {
                        user: true
                    }
                },
                payments: true
            }
        });
        if (!loan) {
            return res.status(404).json(new ApiResponse_1.default(404, {}, 'Loan not found', false));
        }
        // Check if user is admin or the loan belongs to the user
        if (user.role !== 'ADMIN' && loan.application.userId !== user.id) {
            return res.status(403).json(new ApiResponse_1.default(403, {}, 'Permission denied', false));
        }
        return res.status(200).json(new ApiResponse_1.default(200, loan, 'Loan retrieved successfully', true));
    }
    catch (error) {
        console.error('Error fetching loan:', error);
        return res.status(500).json(new ApiResponse_1.default(500, {}, 'Error fetching loan', false));
    }
}));
// Get all loans for a user
exports.getUserLoans = (0, AsyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.auth) === null || _a === void 0 ? void 0 : _a.userId;
    if (!userId) {
        return res.status(401).json(new ApiResponse_1.default(401, {}, 'Unauthorized Request', false));
    }
    try {
        // Find user by userId (from Clerk)
        const user = yield prisma.user.findFirst({
            where: { userId }
        });
        if (!user) {
            return res.status(404).json(new ApiResponse_1.default(404, {}, 'User not found', false));
        }
        // Parse query parameters
        const { page = '1', limit = '10', purpose, status, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
        // Convert pagination params to numbers
        const pageNumber = parseInt(page, 10);
        const pageSize = parseInt(limit, 10);
        const skip = (pageNumber - 1) * pageSize;
        // Build filter conditions
        const filterConditions = {
            application: {
                userId: user.id
            }
        };
        // Add purpose filter (regex search)
        if (purpose) {
            filterConditions.application.purpose = {
                contains: purpose,
                mode: 'insensitive'
            };
        }
        // Add status filter
        if (status) {
            filterConditions.status = status;
        }
        // Validate sort parameters
        const allowedSortFields = ['createdAt', 'amount', 'dueDate', 'status'];
        const sortField = allowedSortFields.includes(sortBy)
            ? sortBy
            : 'createdAt';
        const sortDirection = sortOrder.toLowerCase() === 'asc' ? 'asc' : 'desc';
        // Count total matching loans for pagination metadata
        const totalLoans = yield prisma.loan.count({
            where: filterConditions
        });
        // Get filtered and paginated loans
        const loans = yield prisma.loan.findMany({
            where: filterConditions,
            include: {
                application: true,
                payments: true
            },
            orderBy: { [sortField]: sortDirection },
            skip,
            take: pageSize
        });
        // Calculate pagination metadata
        const totalPages = Math.ceil(totalLoans / pageSize);
        const hasNextPage = pageNumber < totalPages;
        const hasPrevPage = pageNumber > 1;
        // Prepare response with pagination metadata
        const paginationMetadata = {
            totalItems: totalLoans,
            itemsPerPage: pageSize,
            currentPage: pageNumber,
            totalPages,
            hasNextPage,
            hasPrevPage
        };
        return res.status(200).json(new ApiResponse_1.default(200, {
            loans,
            pagination: paginationMetadata
        }, 'Loans retrieved successfully', true));
    }
    catch (error) {
        console.error('Error fetching loans:', error);
        return res.status(500).json(new ApiResponse_1.default(500, {}, 'Error fetching loans', false));
    }
}));
// Get all loans (admin only)
exports.getAllLoans = (0, AsyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.auth) === null || _a === void 0 ? void 0 : _a.userId;
    if (!userId) {
        return res.status(401).json(new ApiResponse_1.default(401, {}, 'Unauthorized Request', false));
    }
    try {
        // Find user by userId (from Clerk)
        const user = yield prisma.user.findFirst({
            where: { userId }
        });
        if (!user) {
            return res.status(404).json(new ApiResponse_1.default(404, {}, 'User not found', false));
        }
        // Check if user is admin
        if (user.role !== 'ADMIN') {
            return res.status(403).json(new ApiResponse_1.default(403, {}, 'Permission denied', false));
        }
        // Extract query parameters for filtering
        const { status, minAmount, maxAmount, startDate, endDate, search, loanNumber, sortBy = 'createdAt', sortOrder = 'desc', page = 1, limit = 10 } = req.query;
        // Build where conditions for filtering
        const whereConditions = {};
        // Filter by status
        if (status) {
            whereConditions.status = status;
        }
        // Filter by date range
        // Filter by loan number
        if (loanNumber) {
            whereConditions.loanNumber = {
                contains: loanNumber,
                mode: 'insensitive'
            };
        }
        // Calculate pagination parameters
        const pageNumber = parseInt(page) || 1;
        const itemsPerPage = parseInt(limit) || 10;
        const skip = (pageNumber - 1) * itemsPerPage;
        // Prepare sort options
        const orderBy = {};
        orderBy["createdAt"] = sortOrder;
        // Get total count for pagination metadata
        const totalLoans = yield prisma.loan.count({ where: whereConditions });
        // Get paginated and filtered results
        const loans = yield prisma.loan.findMany({
            where: whereConditions,
            include: {
                application: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true
                            }
                        }
                    }
                },
                payments: true
            },
            orderBy,
            skip,
            take: itemsPerPage
        });
        // Calculate pagination metadata
        const totalPages = Math.ceil(totalLoans / itemsPerPage);
        const hasNextPage = pageNumber < totalPages;
        const hasPrevPage = pageNumber > 1;
        // Prepare response with pagination details
        const paginationMeta = {
            total: totalLoans,
            page: pageNumber,
            limit: itemsPerPage,
            totalPages,
            hasNextPage,
            hasPrevPage
        };
        return res.status(200).json(new ApiResponse_1.default(200, { loans, pagination: paginationMeta }, 'Loans retrieved successfully', true));
    }
    catch (error) {
        console.error('Error fetching loans:', error);
        return res.status(500).json(new ApiResponse_1.default(500, {}, 'Error fetching loans', false));
    }
}));
// Make a loan payment
exports.makePayment = (0, AsyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { loanId } = req.params;
    const { amount, paymentMethod } = req.body;
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
            where: { userId }
        });
        if (!user) {
            return res.status(404).json(new ApiResponse_1.default(404, {}, 'User not found', false));
        }
        // Find the loan
        const loan = yield prisma.loan.findUnique({
            where: { id: loanId },
            include: {
                application: true
            }
        });
        if (!loan) {
            return res.status(404).json(new ApiResponse_1.default(404, {}, 'Loan not found', false));
        }
        // Check if loan belongs to user
        if (loan.application.userId !== user.id) {
            return res.status(403).json(new ApiResponse_1.default(403, {}, 'Permission denied', false));
        }
        // Check if loan is active
        if (loan.status !== 'ACTIVE') {
            return res.status(400).json(new ApiResponse_1.default(400, {}, `Cannot make payment on a ${loan.status.toLowerCase()} loan`, false));
        }
        // Create payment record
        const payment = yield prisma.payment.create({
            data: {
                amount: parseFloat(amount),
                paymentMethod,
                status: 'COMPLETED', // Assuming payment is processed immediately
                reference: `PAY-${(0, uuid_1.v4)().substring(0, 8).toUpperCase()}`,
                description: `Payment for loan ${loan.loanNumber}`,
                user: {
                    connect: { id: user.id }
                },
                loan: {
                    connect: { id: loanId }
                }
            }
        });
        // Create transaction record
        const transaction = yield prisma.transaction.create({
            data: {
                amount: parseFloat(amount),
                type: 'PAYMENT',
                description: `Loan payment for ${loan.loanNumber}`,
                status: 'COMPLETED',
                payment: {
                    connect: { id: payment.id }
                }
            }
        });
        // Update loan outstanding amount
        const newOutstandingAmount = loan.outstandingAmount - parseFloat(amount);
        const loanStatus = newOutstandingAmount <= 0 ? 'PAID' : 'ACTIVE';
        const updatedLoan = yield prisma.loan.update({
            where: { id: loanId },
            data: {
                outstandingAmount: newOutstandingAmount > 0 ? newOutstandingAmount : 0,
                status: loanStatus
            }
        });
        // Create notification for payment
        yield prisma.notification.create({
            data: {
                title: 'Payment Successful',
                message: `Your payment of ${amount} for loan ${loan.loanNumber} was successful.`,
                type: 'PAYMENT_CONFIRMATION',
                user: {
                    connect: { id: user.id }
                }
            }
        });
        return res.status(200).json(new ApiResponse_1.default(200, { payment, transaction, loan: updatedLoan }, 'Payment processed successfully', true));
    }
    catch (error) {
        console.error('Error processing payment:', error);
        return res.status(500).json(new ApiResponse_1.default(500, {}, 'Error processing payment', false));
    }
}));
// Update loan status (admin only)
exports.updateLoanStatus = (0, AsyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { loanId } = req.params;
    const { status } = req.body;
    const userId = (_a = req.auth) === null || _a === void 0 ? void 0 : _a.userId;
    if (!userId) {
        return res.status(401).json(new ApiResponse_1.default(401, {}, 'Unauthorized Request', false));
    }
    if (!status || !['ACTIVE', 'PAID', 'DEFAULTED', 'CLOSED'].includes(status)) {
        return res.status(400).json(new ApiResponse_1.default(400, {}, 'Invalid status', false));
    }
    try {
        // Find user by userId (from Clerk)
        const user = yield prisma.user.findFirst({
            where: { userId }
        });
        if (!user) {
            return res.status(404).json(new ApiResponse_1.default(404, {}, 'User not found', false));
        }
        // Check if user is admin
        if (user.role !== 'ADMIN') {
            return res.status(403).json(new ApiResponse_1.default(403, {}, 'Permission denied', false));
        }
        // Find the loan
        const loan = yield prisma.loan.findUnique({
            where: { id: loanId },
            include: {
                application: {
                    include: {
                        user: true
                    }
                }
            }
        });
        if (!loan) {
            return res.status(404).json(new ApiResponse_1.default(404, {}, 'Loan not found', false));
        }
        // Update loan status
        const updatedLoan = yield prisma.loan.update({
            where: { id: loanId },
            data: {
                status: status
            }
        });
        // Create notification for the user
        yield prisma.notification.create({
            data: {
                title: 'Loan Status Updated',
                message: `Your loan ${loan.loanNumber} status has been updated to ${status}.`,
                type: 'LOAN_APPLICATION_UPDATE',
                user: {
                    connect: { id: loan.application.userId }
                }
            }
        });
        return res.status(200).json(new ApiResponse_1.default(200, updatedLoan, 'Loan status updated successfully', true));
    }
    catch (error) {
        console.error('Error updating loan status:', error);
        return res.status(500).json(new ApiResponse_1.default(500, {}, 'Error updating loan status', false));
    }
}));
