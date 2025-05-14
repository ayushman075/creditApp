import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Filter, CreditCard, ArrowUpDown, Search, RefreshCcw } from 'lucide-react';

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
  CardFooter,
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




import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from 'react-toastify';
import axiosInstance from '@/utils/axiosConfig';
import LoanApplicationForm from './LoanApplicationForm';

export default function UserHomeTab() {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("submittedAt");
  const [sortOrder, setSortOrder] = useState("desc");

  // Mock data for demonstration

  // Fetch loans data
  const fetchLoans = async () => {
    setLoading(true);
    
    try {
      // Normally you would fetch from API like this:
      const response = await axiosInstance.get('loan/applications', {
        params: {
          page: currentPage,
          limit: itemsPerPage,
          status: filterStatus !== "ALL" ? filterStatus : undefined,
          purpose: searchQuery || undefined,
          sortBy:"submittedAt",
          sortOrder:'desc'
        }
      });console.log(response)
      setLoans(response?.data?.data?.loans||[]);
      setTotalPages(response?.data?.data?.pagination?.totalPages||0);
    setLoading(false);
    } catch (error) {
      console.error("Failed to fetch loans:", error);
      toast.error("Failed to fetch loans. Please try again.")
    
      setLoading(false);
    }
  };

  // Fetch loans when filters/pagination changes
  useEffect(() => {
    fetchLoans();
  }, [currentPage, itemsPerPage, filterStatus, sortBy, sortOrder]);

  // Reset to first page when search query changes
  useEffect(() => {
    const delaySearch = setTimeout(() => {
      setCurrentPage(1);
      fetchLoans();
    }, 500);
    
    return () => clearTimeout(delaySearch);
  }, [searchQuery]);

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
      currency: 'USD',
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

  // Loan detail dialog
  const LoanDetailDialog = ({ loan }) => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">View Details</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Loan Application Details</DialogTitle>
          <DialogDescription>
            Application ID: {loan.id}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 items-center gap-4">
            <span className="font-medium">Amount:</span>
            <span>{formatCurrency(loan.amount)}</span>
          </div>
          <div className="grid grid-cols-2 items-center gap-4">
            <span className="font-medium">Purpose:</span>
            <span>{loan.purpose}</span>
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
            <span className="font-medium">Status:</span>
            <span>{getStatusBadge(loan.status)}</span>
          </div>
          <div className="grid grid-cols-2 items-center gap-4">
            <span className="font-medium">Submitted:</span>
            <span>{formatDate(loan.submittedAt)}</span>
          </div>
          {loan.approvedAt && (
            <div className="grid grid-cols-2 items-center gap-4">
              <span className="font-medium">Approved:</span>
              <span>{formatDate(loan.approvedAt)}</span>
            </div>
          )}
          {loan.rejectedAt && (
            <>
              <div className="grid grid-cols-2 items-center gap-4">
                <span className="font-medium">Rejected:</span>
                <span>{formatDate(loan.rejectedAt)}</span>
              </div>
              <div className="grid grid-cols-2 items-center gap-4">
                <span className="font-medium">Reason:</span>
                <span>{loan.rejectionReason}</span>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Dashboard overview cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Applied</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loans.length}</div>
            <p className="text-xs text-gray-500 mt-1">Across all statuses</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {loans.filter(loan => loan.status === "APPROVED").length}
            </div>
            <p className="text-xs text-gray-500 mt-1">Ready for disbursement</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Pending Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {loans.filter(loan => loan.status === "PENDING").length}
            </div>
            <p className="text-xs text-gray-500 mt-1">Awaiting decision</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Apply for new loan card */}
      <Card className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border-emerald-100 dark:border-emerald-900">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-2">
              <h3 className="text-xl font-bold">Need Additional Funds?</h3>
              <p className="text-gray-600 dark:text-gray-300">Apply for a new loan with competitive rates and flexible terms.</p>
            </div>
           
            <Dialog>
  <DialogTrigger> <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
              <CreditCard className="mr-2 h-4 w-4" />
              Apply Now
            </Button></DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Apply for Loan</DialogTitle>
      <DialogDescription>
        <LoanApplicationForm onSuccess={(e)=>{fetchLoans()}}/>
      </DialogDescription>
    </DialogHeader>
  </DialogContent>
</Dialog>

          </div>
        </CardContent>
      </Card>
      
      {/* Loan applications table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle>Your Loan Applications</CardTitle>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                <Input
                  type="search"
                  placeholder="Search loans..."
                  className="pl-8 w-full sm:w-64"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
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
                    className={filterStatus === "ALL" ? "bg-accent" : ""}
                    onClick={() => setFilterStatus("ALL")}
                  >
                    All Applications
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className={filterStatus === "PENDING" ? "bg-accent" : ""}
                    onClick={() => setFilterStatus("PENDING")}
                  >
                    Pending
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className={filterStatus === "APPROVED" ? "bg-accent" : ""}
                    onClick={() => setFilterStatus("APPROVED")}
                  >
                    Approved
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className={filterStatus === "REJECTED" ? "bg-accent" : ""}
                    onClick={() => setFilterStatus("REJECTED")}
                  >
                    Rejected
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
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
                  <TableHead className="w-[100px]">ID</TableHead>
                  <TableHead>
                    <Button 
                      variant="ghost" 
                      onClick={() => {
                        if (sortBy === "purpose") {
                          setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                        } else {
                          setSortBy("purpose");
                          setSortOrder("asc");
                        }
                      }}
                      className="hover:bg-transparent p-0 font-medium flex items-center"
                    >
                      Purpose
                      {sortBy === "purpose" && (
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      )}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button 
                      variant="ghost" 
                      onClick={() => {
                        if (sortBy === "amount") {
                          setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                        } else {
                          setSortBy("amount");
                          setSortOrder("desc");
                        }
                      }}
                      className="hover:bg-transparent p-0 font-medium flex items-center"
                    >
                      Amount
                      {sortBy === "amount" && (
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      )}
                    </Button>
                  </TableHead>
                  <TableHead>Term</TableHead>
                  <TableHead>
                    <Button 
                      variant="ghost" 
                      onClick={() => {
                        if (sortBy === "submittedAt") {
                          setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                        } else {
                          setSortBy("submittedAt");
                          setSortOrder("desc");
                        }
                      }}
                      className="hover:bg-transparent p-0 font-medium flex items-center"
                    >
                      Date
                      {sortBy === "submittedAt" && (
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      )}
                    </Button>
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  // Loading skeleton
                  Array(itemsPerPage).fill(0).map((_, index) => (
                    <TableRow key={`skeleton-${index}`}>
                      <TableCell><Skeleton className="h-5 w-16" /></TableCell>
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
                      <TableCell className="font-mono text-xs">{loan.id.slice(0, 8)}</TableCell>
                      <TableCell>{loan.purpose}</TableCell>
                      <TableCell>{formatCurrency(loan.amount)}</TableCell>
                      <TableCell>{loan.term} months</TableCell>
                      <TableCell>{formatDate(loan.submittedAt)}</TableCell>
                      <TableCell>{getStatusBadge(loan.status)}</TableCell>
                      <TableCell className="text-right">
                        <LoanDetailDialog loan={loan} />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
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
              Showing {loans.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}-
              {Math.min(currentPage * itemsPerPage, loans.length)} of {loans.length} results
            </div>
            <div className="flex items-center space-x-2">
              <Select
                value={itemsPerPage.toString()}
                onValueChange={(value) => {
                  setItemsPerPage(Number(value));
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="h-8 w-[70px]">
                  <SelectValue placeholder="5" />
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
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="text-sm font-medium">
                  Page {currentPage} of {totalPages}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}