/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Filter, Check, X, Eye, ArrowUpDown, Search, RefreshCcw, AlertTriangle } from 'lucide-react';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { toast } from 'react-toastify';
import axiosInstance from '@/utils/axiosConfig';

export default function AdminDashboard() {
  // Application table state
  const [applications, setApplications] = useState([]);
  const [appLoading, setAppLoading] = useState(true);
  const [appCurrentPage, setAppCurrentPage] = useState(1);
  const [appTotalPages, setAppTotalPages] = useState(1);
  const [appItemsPerPage, setAppItemsPerPage] = useState(10);
  const [appFilterStatus, setAppFilterStatus] = useState("PENDING");
  const [appSearchQuery, setAppSearchQuery] = useState("");
  const [appSortBy, setAppSortBy] = useState("submittedAt");
  const [appSortOrder, setAppSortOrder] = useState("desc");

  // Loans table state
  const [loans, setLoans] = useState([]);
  const [loanLoading, setLoanLoading] = useState(true);
  const [loanCurrentPage, setLoanCurrentPage] = useState(1);
  const [loanTotalPages, setLoanTotalPages] = useState(1);
  const [loanItemsPerPage, setLoanItemsPerPage] = useState(10);
  const [loanSearchQuery, setLoanSearchQuery] = useState("");
  const [loanSortBy, setLoanSortBy] = useState("approvedAt");
  const [loanSortOrder, setLoanSortOrder] = useState("desc");

  const [interestRate, setInterestRate] = useState("");
const [isApprovalDialogOpen, setIsApprovalDialogOpen] = useState(false);
const [selectedApprovalId, setSelectedApprovalId] = useState(null);

  // Modal state
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Dashboard stats
  const [dashboardStats, setDashboardStats] = useState({
    pendingCount: 0,
    approvedCount: 0,
    rejectedCount: 0,
    totalAmount: 0
  });

  // Fetch loan applications
  const fetchApplications = async () => {
    setAppLoading(true);
    
    try {
      const response = await axiosInstance.get('loan/applications/all', {
        params: {
          page: appCurrentPage,
          limit: appItemsPerPage,
          status: appFilterStatus !== "ALL" ? appFilterStatus : undefined,
          purpose: appSearchQuery || undefined,
          sortBy: appSortBy,
          sortOrder: appSortOrder
        }
      });
      
      setApplications(response?.data?.data?.loanApplications || []);
      setAppTotalPages(response?.data?.data?.pagination?.totalPages || 1);
      setAppLoading(false);
    } catch (error) {
      console.error("Failed to fetch applications:", error);
      toast.error("Failed to fetch loan applications");
      setAppLoading(false);
    }
  };

  // Fetch approved loans
  const fetchLoans = async () => {
    setLoanLoading(true);
    
    try {
      const response = await axiosInstance.get('loan/loans/all', {
        params: {
          page: loanCurrentPage,
          limit: loanItemsPerPage,
          query: loanSearchQuery || undefined,
          sortBy: loanSortBy,
          sortOrder: loanSortOrder
        }
      });
      
      setLoans(response?.data?.data?.loans || []);
      console.log(response?.data?.data?.loans)
      setLoanTotalPages(response?.data?.data?.pagination?.totalPages || 1);
      setLoanLoading(false);
    } catch (error) {
      console.error("Failed to fetch loans:", error);
      toast.error("Failed to fetch approved loans");
      setLoanLoading(false);
    }
  };

  // Fetch dashboard stats
  const fetchDashboardStats = async () => {
    try {
      const response = await axiosInstance.get('/admin/dashboard/stats');
      setDashboardStats(response?.data?.data || {
        pendingCount: 0,
        approvedCount: 0,
        rejectedCount: 0,
        totalAmount: 0
      });
    } catch (error) {
      console.error("Failed to fetch dashboard stats:", error);
    }
  };

  // Handle application approval

// Updated approval function to send interest rate
const handleApprove = async (applicationId) => {
  setIsProcessing(true);
  try {
    await axiosInstance.patch(`loan/applications/${applicationId}/status`, {
      status: "APPROVED",
      interestRate: parseFloat(interestRate) // Use the user-entered interest rate
    });
    
    toast.success("Loan application approved successfully");
    setInterestRate(""); // Reset the interest rate
    setIsApprovalDialogOpen(false); // Close the dialog
    fetchApplications();
    fetchDashboardStats();
    fetchLoans();
  } catch (error) {
    console.error("Failed to approve application:", error);
    toast.error("Failed to approve loan application");
  } finally {
    setIsProcessing(false);
  }
};


const openApprovalDialog = (applicationId) => {
  // Find the application to get its default interest rate
  const selectedApp = applications.find(app => app.id === applicationId);
  if (selectedApp) {
    setInterestRate(selectedApp.interestRate?.toString() || "");
  }
  setSelectedApprovalId(applicationId);
  setIsApprovalDialogOpen(true);
};

// Updated rejection function to match controller
const handleReject = async (applicationId, reason) => {
  setIsProcessing(true);
  try {
    await axiosInstance.patch(`loan/applications/${applicationId}/status`, {
      status: "REJECTED",
      rejectionReason: reason
    });
    
    toast.success("Loan application rejected");
    setRejectionReason("");
    fetchApplications();
    fetchDashboardStats();
  } catch (error) {
    console.error("Failed to reject application:", error);
    toast.error("Failed to reject loan application");
  } finally {
    setIsProcessing(false);
  }
};


  // Format date for display
  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Format currency for display
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Status badge variants
  const getStatusBadge = (status) => {
    switch (status) {
      case "APPROVED":
        return <Badge variant="success" className="bg-green-500">Approved</Badge>;
      case "REJECTED":
        return <Badge variant="destructive">Rejected</Badge>;
      case "PENDING":
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">Pending</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // Fetch when filters/pagination changes
  useEffect(() => {
    fetchApplications();
  }, [appCurrentPage, appItemsPerPage, appFilterStatus, appSortBy, appSortOrder]);

  useEffect(() => {
    fetchLoans();
  }, [loanCurrentPage, loanItemsPerPage, loanSortBy, loanSortOrder]);

  // Search with delay
  useEffect(() => {
    const delaySearch = setTimeout(() => {
      setAppCurrentPage(1);
      fetchApplications();
    }, 500);
    
    return () => clearTimeout(delaySearch);
  }, [appSearchQuery]);

  useEffect(() => {
    const delaySearch = setTimeout(() => {
      setLoanCurrentPage(1);
      fetchLoans();
    }, 500);
    
    return () => clearTimeout(delaySearch);
  }, [loanSearchQuery]);

  // Fetch initial data
  useEffect(() => {
    fetchDashboardStats();
    fetchApplications();
    fetchLoans();
  }, []);

  // Loan Application Detail Dialog
 const ApplicationDetailDialog = ({ application }) => {
  const [localRejectionReason, setLocalRejectionReason] = useState("");
  const [localIsProcessing, setLocalIsProcessing] = useState(false);
  
  const handleLocalReject = async () => {
    setLocalIsProcessing(true);
    try {
      await axiosInstance.put(`/admin/loan/applications/${application.id}/update-status`, {
        status: "REJECTED",
        rejectionReason: localRejectionReason
      });
      
      toast.success("Loan application rejected");
      setLocalRejectionReason("");
      fetchApplications();
      fetchDashboardStats();
    } catch (error) {
      console.error("Failed to reject application:", error);
      toast.error("Failed to reject loan application");
    } finally {
      setLocalIsProcessing(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Eye className="mr-2 h-4 w-4" />
          Details
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Loan Application Details</DialogTitle>
          <DialogDescription>
            Application ID: {application.id}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 items-center gap-4">
            <span className="font-medium">Applicant:</span>
            <span className='w-44 text-wrap flex overflow-clip'>{application.user?.name || "N/A"}</span>
          </div>
          <div className="grid grid-cols-2  items-center gap-4">
            <span className="font-medium">Email:</span>
            <span className='w-48 text-wrap flex overflow-clip'>{application.user?.email || "N/A"}</span>
          </div>
          <div className="grid grid-cols-2 items-center gap-4">
            <span className="font-medium">Amount:</span>
            <span>{formatCurrency(application.amount)}</span>
          </div>
          <div className="grid grid-cols-2 items-center gap-4">
            <span className="font-medium">Purpose:</span>
            <span className='w-44 text-wrap flex overflow-clip'>{application.purpose}</span>
          </div>
          <div className="grid grid-cols-2 items-center gap-4">
            <span className="font-medium">Term:</span>
            <span>{application.term} months</span>
          </div>
          <div className="grid grid-cols-2 items-center gap-4">
            <span className="font-medium">Interest Rate:</span>
            <span>{application.interestRate}%</span>
          </div>
          <div className="grid grid-cols-2 items-center gap-4">
            <span className="font-medium">Status:</span>
            <span>{getStatusBadge(application.status)}</span>
          </div>
          <div className="grid grid-cols-2 items-center gap-4">
            <span className="font-medium">Submitted:</span>
            <span>{formatDate(application.submittedAt)}</span>
          </div>
          {application.approvedAt && (
            <div className="grid grid-cols-2 items-center gap-4">
              <span className="font-medium">Approved:</span>
              <span>{formatDate(application.approvedAt)}</span>
            </div>
          )}
          {application.rejectedAt && (
            <>
              <div className="grid grid-cols-2 items-center gap-4">
                <span className="font-medium">Rejected:</span>
                <span>{formatDate(application.rejectedAt)}</span>
              </div>
              <div className="grid grid-cols-2 items-center gap-4">
                <span className="font-medium">Reason:</span>
                <span>{application.rejectionReason}</span>
              </div>
            </>
          )}
        </div>
        {application.status === "PENDING" && (
          <DialogFooter className="flex justify-between">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <X className="mr-2 h-4 w-4" />
                  Reject
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Reject Loan Application</AlertDialogTitle>
                  <AlertDialogDescription>
                    Please provide a reason for rejecting this loan application.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <Textarea 
                  value={localRejectionReason}
                  onChange={(e) => setLocalRejectionReason(e.target.value)}
                  placeholder="Enter rejection reason..."
                  className="mt-2"
                />
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    disabled={!localRejectionReason.trim() || localIsProcessing}
                    onClick={handleLocalReject}
                  >
                    {localIsProcessing ? "Processing..." : "Confirm Rejection"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            
            <Button
  variant="default"
  className="bg-green-600 hover:bg-green-700"
  onClick={() => {
    setIsApprovalDialogOpen(false); // Close the details dialog first
    openApprovalDialog(application.id);
  }}
  disabled={isProcessing}
>
  <Check className="mr-2 h-4 w-4" />
  {isProcessing ? "Processing..." : "Approve"}
</Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};



  return (
    <div className="container mx-auto px-4 py-6 space-y-6">

      {/* Dashboard overview cards */}
      

      {/* Main content tabs */}
      <Tabs defaultValue="applications" className="w-full">
        <TabsList>
          <TabsTrigger value="applications">Loan Applications</TabsTrigger>
          <TabsTrigger value="loans">Approved Loans</TabsTrigger>
        </TabsList>
        
        {/* Loan Applications Tab */}
        <TabsContent value="applications">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <CardTitle>Loan Applications</CardTitle>
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                    <Input
                      type="search"
                      placeholder="Search applications..."
                      className="pl-8 w-full sm:w-64"
                      value={appSearchQuery}
                      onChange={(e) => setAppSearchQuery(e.target.value)}
                    />
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="ml-auto">
                        <Filter className="mr-2 h-4 w-4" />
                        Filter
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        className={appFilterStatus === "ALL" ? "bg-accent" : ""}
                        onClick={() => setAppFilterStatus("ALL")}
                      >
                        All Applications
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className={appFilterStatus === "PENDING" ? "bg-accent" : ""}
                        onClick={() => setAppFilterStatus("PENDING")}
                      >
                        Pending
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className={appFilterStatus === "APPROVED" ? "bg-accent" : ""}
                        onClick={() => setAppFilterStatus("APPROVED")}
                      >
                        Approved
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className={appFilterStatus === "REJECTED" ? "bg-accent" : ""}
                        onClick={() => setAppFilterStatus("REJECTED")}
                      >
                        Rejected
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={fetchApplications}
                    title="Refresh"
                  >
                    <RefreshCcw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">ID</TableHead>
                      <TableHead>Applicant</TableHead>
                      <TableHead>
                        <Button 
                          variant="ghost" 
                          onClick={() => {
                            if (appSortBy === "purpose") {
                              setAppSortOrder(appSortOrder === "asc" ? "desc" : "asc");
                            } else {
                              setAppSortBy("purpose");
                              setAppSortOrder("asc");
                            }
                          }}
                          className="hover:bg-transparent p-0 font-medium flex items-center"
                        >
                          Purpose
                          {appSortBy === "purpose" && (
                            <ArrowUpDown className="ml-2 h-4 w-4" />
                          )}
                        </Button>
                      </TableHead>
                      <TableHead>
                        <Button 
                          variant="ghost" 
                          onClick={() => {
                            if (appSortBy === "amount") {
                              setAppSortOrder(appSortOrder === "asc" ? "desc" : "asc");
                            } else {
                              setAppSortBy("amount");
                              setAppSortOrder("desc");
                            }
                          }}
                          className="hover:bg-transparent p-0 font-medium flex items-center"
                        >
                          Amount
                          {appSortBy === "amount" && (
                            <ArrowUpDown className="ml-2 h-4 w-4" />
                          )}
                        </Button>
                      </TableHead>
                      <TableHead>Term</TableHead>
                      <TableHead>
                        <Button 
                          variant="ghost" 
                          onClick={() => {
                            if (appSortBy === "submittedAt") {
                              setAppSortOrder(appSortOrder === "asc" ? "desc" : "asc");
                            } else {
                              setAppSortBy("submittedAt");
                              setAppSortOrder("desc");
                            }
                          }}
                          className="hover:bg-transparent p-0 font-medium flex items-center"
                        >
                          Date
                          {appSortBy === "submittedAt" && (
                            <ArrowUpDown className="ml-2 h-4 w-4" />
                          )}
                        </Button>
                      </TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {appLoading ? (
                      // Loading skeleton
                      Array(appItemsPerPage).fill(0).map((_, index) => (
                        <TableRow key={`skeleton-${index}`}>
                          <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                          <TableCell><Skeleton className="h-8 w-24" /></TableCell>
                        </TableRow>
                      ))
                    ) : applications.length > 0 ? (
                      applications.map((application) => (
                        <TableRow key={application.id}>
                          <TableCell className="font-mono text-xs">{application.id.slice(0, 8)}</TableCell>
                          <TableCell>{application.user?.name || "N/A"}</TableCell>
                          <TableCell>{application.purpose}</TableCell>
                          <TableCell>{formatCurrency(application.amount)}</TableCell>
                          <TableCell>{application.term} months</TableCell>
                          <TableCell>{formatDate(application.submittedAt)}</TableCell>
                          <TableCell>{getStatusBadge(application.status)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <ApplicationDetailDialog application={application} />
                              
                              {application.status === "PENDING" && (
                                <>
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button variant="destructive" size="sm">
                                        <X className="h-4 w-4" />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Reject Loan Application</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Please provide a reason for rejecting this loan application.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <Textarea 
                                        value={rejectionReason}
                                        onChange={(e) => setRejectionReason(e.target.value)}
                                        placeholder="Enter rejection reason..."
                                        className="mt-2"
                                      />
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                          disabled={!rejectionReason.trim() || isProcessing}
                                          onClick={() => handleReject(application.id, rejectionReason)}
                                        >
                                          {isProcessing ? "Processing..." : "Confirm Rejection"}
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                  
                                  <Button
  variant="default"
  size="sm"
  className="bg-green-600 hover:bg-green-700"
  onClick={() => openApprovalDialog(application.id)}
  disabled={isProcessing}
>
  <Check className="h-4 w-4" />
</Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} className="h-24 text-center">
                          No loan applications found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              
              {/* Pagination */}
              <div className="flex items-center justify-between space-x-2 py-4">
                <div className="flex-1 text-sm text-muted-foreground">
                  Showing {applications.length > 0 ? (appCurrentPage - 1) * appItemsPerPage + 1 : 0}-
                  {Math.min(appCurrentPage * appItemsPerPage, applications.length)} of {applications.length} results
                </div>
                <div className="flex items-center space-x-2">
                  <Select
                    value={appItemsPerPage.toString()}
                    onValueChange={(value) => {
                      setAppItemsPerPage(Number(value));
                      setAppCurrentPage(1);
                    }}
                  >
                    <SelectTrigger className="h-8 w-[70px]">
                      <SelectValue placeholder="10" />
                    </SelectTrigger>
                    <SelectContent side="top">
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setAppCurrentPage(Math.max(1, appCurrentPage - 1))}
                      disabled={appCurrentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="text-sm font-medium">
                      Page {appCurrentPage} of {appTotalPages}
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setAppCurrentPage(Math.min(appTotalPages, appCurrentPage + 1))}
                      disabled={appCurrentPage === appTotalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Approved Loans Tab */}
        <TabsContent value="loans">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <CardTitle>Approved Loans</CardTitle>
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                    <Input
                      type="search"
                      placeholder="Search loans..."
                      className="pl-8 w-full sm:w-64"
                      value={loanSearchQuery}
                      onChange={(e) => setLoanSearchQuery(e.target.value)}
                    />
                  </div>
                  
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={fetchLoans}
                    title="Refresh"
                  >
                    <RefreshCcw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">Loan ID</TableHead>
                      <TableHead>Borrower</TableHead>
                      <TableHead>Purpose</TableHead>
                      <TableHead>
                        <Button 
                          variant="ghost" 
                          onClick={() => {
                            if (loanSortBy === "amount") {
                              setLoanSortOrder(loanSortOrder === "asc" ? "desc" : "asc");
                            } else {
                              setLoanSortBy("amount");
                              setLoanSortOrder("desc");
                            }
                          }}
                          className="hover:bg-transparent p-0 font-medium flex items-center"
                        >
                          Amount
                          {loanSortBy === "amount" && (
                            <ArrowUpDown className="ml-2 h-4 w-4" />
                          )}
                        </Button>
                      </TableHead>
                      <TableHead>Term</TableHead>
                      <TableHead>
                        <Button 
                          variant="ghost" 
                          onClick={() => {
                            if (loanSortBy === "approvedAt") {
                              setLoanSortOrder(loanSortOrder === "asc" ? "desc" : "asc");
                            } else {
                              setLoanSortBy("approvedAt");
                              setLoanSortOrder("desc");
                            }
                          }}
                          className="hover:bg-transparent p-0 font-medium flex items-center"
                        >
                          Approved Date
                          {loanSortBy === "approvedAt" && (
                            <ArrowUpDown className="ml-2 h-4 w-4" />
                          )}
                        </Button>
                      </TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loanLoading ? (
                      // Loading skeleton
                      Array(loanItemsPerPage).fill(0).map((_, index) => (
                        <TableRow key={`loan-skeleton-${index}`}>
                          <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                          <TableCell><Skeleton className="h-8 w-24" /></TableCell>
                        </TableRow>
                      ))
                    ) : loans.length > 0 ? (
                      loans.map((loan) => (
                        <TableRow key={loan.id}>
                          <TableCell className="font-mono text-xs">{loan.loanNumber}</TableCell>
                          <TableCell>{loan.application?.user?.name || "N/A"}</TableCell>
                          <TableCell>{loan.application?.purpose}</TableCell>
                          <TableCell>{formatCurrency(loan.amount)}</TableCell>
                          <TableCell>{loan.term} months</TableCell>
                          <TableCell>{formatDate(loan.application?.approvedAt)}</TableCell>
                          <TableCell>
                            <Badge variant="success" className="bg-green-500">Active</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <Eye className="mr-2 h-4 w-4" />
                                  Details
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-md">
                                <DialogHeader>
                                  <DialogTitle>Loan Details</DialogTitle>
                                  <DialogDescription>
                                    Loan ID: {loan.loanNumber}
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                  <div className="grid grid-cols-2 items-center gap-4">
                                    <span className="font-medium">Borrower:</span>
                                    <span className='w-48 overflow-clip text-wrap'>{loan.application?.user?.name || "N/A"}</span>
                                  </div>
                                  <div className="grid grid-cols-2 items-center gap-4">
                                    <span className="font-medium">Email:</span>
                                    <span className='w-48 overflow-clip text-wrap'>{loan.application?.user?.email || "N/A"}</span>
                                  </div>
                                  <div className="grid grid-cols-2 items-center gap-4">
                                    <span className="font-medium">Amount:</span>
                                    <span>{formatCurrency(loan.amount)}</span>
                                  </div>
                                  <div className="grid grid-cols-2 items-center gap-4">
                                    <span className="font-medium">Purpose:</span>
                                    <span className='w-48 overflow-clip text-wrap'>{loan.application?.purpose}</span>
                                  </div>
                                  <div className="grid grid-cols-2 items-center gap-4">
                                    <span className="font-medium">Term:</span>
                                    <span>{loan.term} months</span>
                                  </div>
                                  <div className="grid grid-cols-2 items-center gap-4">
                                    <span className="font-medium">Interest Rate:</span>
                                    <span>{loan.interestRate}%</span>
                                  </div>
                                  <div className="grid grid-cols-2 items-center gap-4">
                                    <span className="font-medium">Monthly Payment:</span>
                                    <span>{formatCurrency(loan.monthlyPayment || 0)}</span>
                                  </div>
                                  <div className="grid grid-cols-2 items-center gap-4">
                                    <span className="font-medium">Approved Date:</span>
                                    <span>{formatDate(loan.application?.approvedAt)}</span>
                                  </div>
                                  <div className="grid grid-cols-2 items-center gap-4">
                                    <span className="font-medium">Disbursement Date:</span>
                                    <span>{formatDate(loan.disbursementDate)}</span>
                                  </div>
                                  <div className="grid grid-cols-2 items-center gap-4">
                                    <span className="font-medium">First Payment Date:</span>
                                    <span>{formatDate(loan.firstPaymentDate)}</span>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} className="h-24 text-center">
                          No approved loans found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              
              {/* Pagination */}
              <div className="flex items-center justify-between space-x-2 py-4">
                <div className="flex-1 text-sm text-muted-foreground">
                  Showing {loans.length > 0 ? (loanCurrentPage - 1) * loanItemsPerPage + 1 : 0}-
                  {Math.min(loanCurrentPage * loanItemsPerPage, loans.length)} of {loans.length} results
                </div>
                <div className="flex items-center space-x-2">
                  <Select
                    value={loanItemsPerPage.toString()}
                    onValueChange={(value) => {
                      setLoanItemsPerPage(Number(value));
                      setLoanCurrentPage(1);
                    }}
                  >
                    <SelectTrigger className="h-8 w-[70px]">
                      <SelectValue placeholder="10" />
                    </SelectTrigger>
                    <SelectContent side="top">
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setLoanCurrentPage(Math.max(1, loanCurrentPage - 1))}
                      disabled={loanCurrentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="text-sm font-medium">
                      Page {loanCurrentPage} of {loanTotalPages}
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setLoanCurrentPage(Math.min(loanTotalPages, loanCurrentPage + 1))}
                      disabled={loanCurrentPage === loanTotalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      <Dialog open={isApprovalDialogOpen} onOpenChange={setIsApprovalDialogOpen}>
  <DialogContent className="sm:max-w-md">
    <DialogHeader>
      <DialogTitle>Approve Loan Application</DialogTitle>
      <DialogDescription>
        Set the interest rate for this loan before approving.
      </DialogDescription>
    </DialogHeader>
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-4 items-center gap-4">
        <label htmlFor="interestRate" className="text-right col-span-1">
          Interest Rate (%):
        </label>
        <Input
          id="interestRate"
          type="number"
          step="0.01"
          min="0"
          max="100"
          value={interestRate}
          onChange={(e) => setInterestRate(e.target.value)}
          className="col-span-3"
        />
      </div>
    </div>
    <DialogFooter>
      <Button variant="outline" onClick={() => setIsApprovalDialogOpen(false)}>
        Cancel
      </Button>
      <Button
        variant="default"
        className="bg-green-600 hover:bg-green-700"
        onClick={() => handleApprove(selectedApprovalId)}
        disabled={isProcessing || !interestRate.trim()}
      >
        {isProcessing ? "Processing..." : "Confirm Approval"}
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
    </div>
  );
}