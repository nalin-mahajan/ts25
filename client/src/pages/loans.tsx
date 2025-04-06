import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Loan } from "@shared/schema";
import { useTranslation } from "react-i18next";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LoanCard from "@/components/dashboard/loan-card";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { CalendarDays, BadgeIndianRupee, Clock, CheckCircle2, AlertCircle, Search, Filter, SortAsc, AlertTriangle } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { useState, useEffect } from "react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function Loans() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [minAmount, setMinAmount] = useState<number | undefined>(undefined);
  const [maxAmount, setMaxAmount] = useState<number | undefined>(undefined);
  const [maxDuration, setMaxDuration] = useState<number | undefined>(undefined);
  const [showEmergencyOnly, setShowEmergencyOnly] = useState<boolean | undefined>(undefined);
  const [sortBy, setSortBy] = useState<string | undefined>(undefined);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [showFilters, setShowFilters] = useState<boolean>(false);
  
  // Build query params for filtering and sorting
  const buildQueryParams = () => {
    const params = new URLSearchParams();
    
    if (searchQuery) params.append('search', searchQuery);
    if (minAmount !== undefined) params.append('minAmount', minAmount.toString());
    if (maxAmount !== undefined) params.append('maxAmount', maxAmount.toString());
    if (maxDuration !== undefined) params.append('maxDuration', maxDuration.toString());
    if (showEmergencyOnly !== undefined) params.append('emergency', showEmergencyOnly.toString());
    if (sortBy) params.append('sortBy', sortBy);
    if (sortDir) params.append('sortDir', sortDir);
    
    return params.toString();
  };
  
  // Refresh loans when filters change
  const [queryParams, setQueryParams] = useState("");
  
  useEffect(() => {
    setQueryParams(buildQueryParams());
  }, [searchQuery, minAmount, maxAmount, maxDuration, showEmergencyOnly, sortBy, sortDir]);

  // Fetch available loan requests with filters
  const { data: availableLoans, isLoading: isLoadingAvailable } = useQuery<Loan[]>({
    queryKey: ["/api/loans/available", queryParams],
    queryFn: async ({ queryKey }) => {
      const [endpoint, params] = queryKey as [string, string];
      const url = params ? `${endpoint}?${params}` : endpoint;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch loans");
      }
      return response.json();
    }
  });

  // Fetch user's borrowed loans
  const { data: borrowedLoans, isLoading: isLoadingBorrowed } = useQuery<Loan[]>({
    queryKey: ["/api/loans/borrowed"],
  });

  // Fetch user's lent loans
  const { data: lentLoans, isLoading: isLoadingLent } = useQuery<Loan[]>({
    queryKey: ["/api/loans/lent"],
  });

  // Mutation for funding a loan
  const fundLoanMutation = useMutation({
    mutationFn: async (loanId: number) => {
      await apiRequest("POST", `/api/loans/${loanId}/fund`);
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["/api/loans/available"] });
      queryClient.invalidateQueries({ queryKey: ["/api/loans/lent"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      
      toast({
        title: t("loans.fundSuccess"),
        description: t("loans.fundSuccessDescription"),
      });
    },
    onError: (error) => {
      toast({
        title: t("loans.fundError"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation for repaying a loan
  const repayLoanMutation = useMutation({
    mutationFn: async (loanId: number) => {
      await apiRequest("POST", `/api/loans/${loanId}/repay`);
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["/api/loans/borrowed"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      
      toast({
        title: t("loans.repaySuccess"),
        description: t("loans.repaySuccessDescription"),
      });
    },
    onError: (error) => {
      toast({
        title: t("loans.repayError"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle loan funding
  const handleFundLoan = (loanId: number) => {
    if (user && user.balance <= 0) {
      toast({
        title: t("loans.insufficientFunds"),
        description: t("loans.insufficientFundsDescription"),
        variant: "destructive",
      });
      return;
    }
    
    fundLoanMutation.mutate(loanId);
  };

  // Handle loan repayment
  const handleRepayLoan = (loanId: number) => {
    repayLoanMutation.mutate(loanId);
  };

  // Helper function to get loan status tag
  const getLoanStatusTag = (loan: Loan) => {
    switch(loan.status) {
      case 'requested':
        return (
          <div className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
            <Clock className="h-3 w-3 mr-1" /> {t("loans.requested")}
          </div>
        );
      case 'funded':
        return (
          <div className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
            <CheckCircle2 className="h-3 w-3 mr-1" /> {t("loans.funded")}
          </div>
        );
      case 'repaid':
        return (
          <div className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-primary bg-opacity-10 text-primary">
            <CheckCircle2 className="h-3 w-3 mr-1" /> {t("loans.repaid")}
          </div>
        );
      case 'defaulted':
        return (
          <div className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
            <AlertCircle className="h-3 w-3 mr-1" /> {t("loans.defaulted")}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t("loans.title")}</h1>
        <a href="/loan-request">
          <Button className="bg-primary hover:bg-primary/90">
            {t("loanRequest.createRequest")}
          </Button>
        </a>
      </div>
      
      <Tabs defaultValue="available" className="mb-8">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="available">{t("loans.available")}</TabsTrigger>
          <TabsTrigger value="borrowed">{t("loans.borrowed")}</TabsTrigger>
          <TabsTrigger value="lent">{t("loans.lent")}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="available">
          <h2 className="text-lg font-medium text-gray-900 mb-4">{t("loans.availableLoans")}</h2>
          
          {/* Search and filter UI */}
          <div className="bg-white p-4 rounded-md shadow mb-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              {/* Search bar */}
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <Input
                  type="text"
                  placeholder={t("loans.searchPlaceholder")}
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              {/* Filter and sort controls */}
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowFilters(!showFilters)}
                  className={showFilters ? "bg-primary/10" : ""}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  {t("loans.filters")}
                  {minAmount || maxAmount || maxDuration || showEmergencyOnly !== undefined ? (
                    <Badge className="ml-2 bg-primary text-white">{
                      [
                        minAmount !== undefined && "₹",
                        maxDuration !== undefined && t("loans.days"),
                        showEmergencyOnly && t("loans.emergency")
                      ].filter(Boolean).length
                    }</Badge>
                  ) : null}
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <SortAsc className="h-4 w-4 mr-2" />
                      {t("loans.sort")}
                      {sortBy && (
                        <Badge className="ml-2 bg-primary text-white">
                          {sortBy === 'amount' ? '₹' : 
                           sortBy === 'duration' ? t("loans.days") : 
                           sortBy === 'interest' ? '%' : 
                           sortBy === 'date' ? t("loans.date") : ''}
                           {sortDir === 'desc' ? '↓' : '↑'}
                        </Badge>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => { setSortBy('amount'); setSortDir(sortDir === 'asc' ? 'desc' : 'asc'); }}>
                      {t("loans.sortByAmount")} {sortBy === 'amount' && (sortDir === 'asc' ? '↑' : '↓')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => { setSortBy('duration'); setSortDir(sortDir === 'asc' ? 'desc' : 'asc'); }}>
                      {t("loans.sortByDuration")} {sortBy === 'duration' && (sortDir === 'asc' ? '↑' : '↓')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => { setSortBy('interest'); setSortDir(sortDir === 'asc' ? 'desc' : 'asc'); }}>
                      {t("loans.sortByInterest")} {sortBy === 'interest' && (sortDir === 'asc' ? '↑' : '↓')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => { setSortBy('date'); setSortDir(sortDir === 'asc' ? 'desc' : 'asc'); }}>
                      {t("loans.sortByDate")} {sortBy === 'date' && (sortDir === 'asc' ? '↑' : '↓')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                
                {/* Reset button */}
                {(searchQuery || minAmount !== undefined || maxAmount !== undefined || maxDuration !== undefined || showEmergencyOnly !== undefined || sortBy) && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      setSearchQuery("");
                      setMinAmount(undefined);
                      setMaxAmount(undefined);
                      setMaxDuration(undefined);
                      setShowEmergencyOnly(undefined);
                      setSortBy(undefined);
                      setSortDir('asc');
                    }}
                  >
                    {t("loans.reset")}
                  </Button>
                )}
              </div>
            </div>
            
            {/* Filter panel */}
            {showFilters && (
              <div className="mt-4 pt-4 border-t">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Amount range */}
                  <div>
                    <h3 className="text-sm font-medium mb-2">{t("loans.amountRange")}</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs text-gray-500">{t("loans.min")}</label>
                        <Input
                          type="number"
                          min="0"
                          value={minAmount || ""}
                          onChange={(e) => setMinAmount(e.target.value ? parseInt(e.target.value) : undefined)}
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500">{t("loans.max")}</label>
                        <Input
                          type="number"
                          min="0"
                          value={maxAmount || ""}
                          onChange={(e) => setMaxAmount(e.target.value ? parseInt(e.target.value) : undefined)}
                          placeholder="∞"
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Duration filter */}
                  <div>
                    <h3 className="text-sm font-medium mb-2">{t("loans.maxDuration")}</h3>
                    <div className="flex gap-2 items-center">
                      <Input
                        type="number"
                        min="1"
                        value={maxDuration || ""}
                        onChange={(e) => setMaxDuration(e.target.value ? parseInt(e.target.value) : undefined)}
                        placeholder="30"
                      />
                      <span className="text-sm text-gray-500">{t("loans.days")}</span>
                    </div>
                  </div>
                  
                  {/* Emergency filter */}
                  <div>
                    <h3 className="text-sm font-medium mb-2">{t("loans.emergencyLoans")}</h3>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="emergency-only"
                        checked={showEmergencyOnly === true}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setShowEmergencyOnly(true);
                          } else if (showEmergencyOnly === true) {
                            setShowEmergencyOnly(undefined);
                          } else {
                            setShowEmergencyOnly(false);
                          }
                        }}
                      />
                      <Label htmlFor="emergency-only" className="flex items-center gap-1">
                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                        {t("loans.showEmergencyOnly")}
                      </Label>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Results */}
          {isLoadingAvailable ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : availableLoans && availableLoans.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {availableLoans.map((loan) => (
                <LoanCard 
                  key={loan.id} 
                  loan={loan} 
                  onFund={() => handleFundLoan(loan.id)} 
                />
              ))}
            </div>
          ) : (
            <div className="bg-white shadow rounded-lg p-6 text-center">
              <p className="text-gray-500">
                {searchQuery || minAmount !== undefined || maxAmount !== undefined || maxDuration !== undefined || showEmergencyOnly !== undefined
                  ? t("loans.noMatchingLoans")
                  : t("loans.noAvailableLoans")}
              </p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="borrowed">
          <h2 className="text-lg font-medium text-gray-900 mb-4">{t("loans.borrowedLoans")}</h2>
          {isLoadingBorrowed ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : borrowedLoans && borrowedLoans.length > 0 ? (
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul role="list" className="divide-y divide-gray-200">
                {borrowedLoans.map((loan) => (
                  <li key={loan.id}>
                    <div className="px-4 py-5 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center">
                            {loan.lenderId ? 'L' : '?'}
                          </div>
                          <div>
                            <h3 className="text-sm font-medium text-gray-900">
                              {loan.purpose}
                            </h3>
                            <div className="mt-1 flex items-center">
                              {getLoanStatusTag(loan)}
                            </div>
                          </div>
                        </div>
                        {loan.status === 'funded' && (
                          <Button 
                            onClick={() => handleRepayLoan(loan.id)}
                            disabled={repayLoanMutation.isPending}
                            className="bg-secondary hover:bg-secondary-dark"
                          >
                            {repayLoanMutation.isPending ? t("loans.repaying") : t("loans.repay")}
                          </Button>
                        )}
                      </div>
                      
                      <Separator className="my-4" />
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-xs text-gray-500">{t("loans.amount")}</p>
                          <p className="text-sm font-medium flex items-center">
                            <BadgeIndianRupee className="h-3 w-3 mr-1" /> {loan.amount.toLocaleString()}
                          </p>
                        </div>
                        
                        <div>
                          <p className="text-xs text-gray-500">{t("loans.interest")}</p>
                          <p className="text-sm font-medium">{loan.interestRate}%</p>
                        </div>
                        
                        <div>
                          <p className="text-xs text-gray-500">{t("loans.duration")}</p>
                          <p className="text-sm font-medium">{loan.duration} {t("loans.days")}</p>
                        </div>
                        
                        <div>
                          <p className="text-xs text-gray-500">{t("loans.dueDate")}</p>
                          <p className="text-sm font-medium flex items-center">
                            <CalendarDays className="h-3 w-3 mr-1" />
                            {loan.dueDate ? new Date(loan.dueDate).toLocaleDateString() : t("loans.pending")}
                          </p>
                        </div>
                      </div>
                      
                      {loan.transactionHash && (
                        <div className="mt-4">
                          <p className="text-xs text-gray-500">{t("loans.transactionId")}</p>
                          <p className="text-xs font-mono break-all">{loan.transactionHash}</p>
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="bg-white shadow rounded-lg p-6 text-center">
              <p className="text-gray-500">{t("loans.noBorrowedLoans")}</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="lent">
          <h2 className="text-lg font-medium text-gray-900 mb-4">{t("loans.lentLoans")}</h2>
          {isLoadingLent ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : lentLoans && lentLoans.length > 0 ? (
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul role="list" className="divide-y divide-gray-200">
                {lentLoans.map((loan) => (
                  <li key={loan.id}>
                    <div className="px-4 py-5 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center">
                            B
                          </div>
                          <div>
                            <h3 className="text-sm font-medium text-gray-900">
                              {loan.purpose}
                            </h3>
                            <div className="mt-1 flex items-center">
                              {getLoanStatusTag(loan)}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <Separator className="my-4" />
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-xs text-gray-500">{t("loans.amount")}</p>
                          <p className="text-sm font-medium flex items-center">
                            <BadgeIndianRupee className="h-3 w-3 mr-1" /> {loan.amount.toLocaleString()}
                          </p>
                        </div>
                        
                        <div>
                          <p className="text-xs text-gray-500">{t("loans.interest")}</p>
                          <p className="text-sm font-medium">{loan.interestRate}%</p>
                        </div>
                        
                        <div>
                          <p className="text-xs text-gray-500">{t("loans.duration")}</p>
                          <p className="text-sm font-medium">{loan.duration} {t("loans.days")}</p>
                        </div>
                        
                        <div>
                          <p className="text-xs text-gray-500">{t("loans.dueDate")}</p>
                          <p className="text-sm font-medium flex items-center">
                            <CalendarDays className="h-3 w-3 mr-1" />
                            {loan.dueDate ? new Date(loan.dueDate).toLocaleDateString() : t("loans.pending")}
                          </p>
                        </div>
                      </div>
                      
                      {loan.transactionHash && (
                        <div className="mt-4">
                          <p className="text-xs text-gray-500">{t("loans.transactionId")}</p>
                          <p className="text-xs font-mono break-all">{loan.transactionHash}</p>
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="bg-white shadow rounded-lg p-6 text-center">
              <p className="text-gray-500">{t("loans.noLentLoans")}</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </main>
  );
}
