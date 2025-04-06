import { Loan, User } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/use-auth";
import { Calendar, BadgeIndianRupee, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface LoanCardProps {
  loan: Loan;
  onFund?: (loanId: number) => void;
}

export default function LoanCard({ loan, onFund }: LoanCardProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch borrower details
  const { data: borrower, isLoading: isLoadingBorrower } = useQuery<Omit<User, 'password'>>({
    queryKey: [`/api/users/${loan.borrowerId}`],
    enabled: !!loan.borrowerId,
  });

  const fundLoan = async () => {
    if (onFund) {
      // Use the provided onFund callback if available
      onFund(loan.id);
    } else {
      try {
        // Default implementation if no callback provided
        await apiRequest("POST", `/api/loans/${loan.id}/fund`);
        
        // Invalidate queries to refresh the data
        queryClient.invalidateQueries({ queryKey: ["/api/loans/available"] });
        queryClient.invalidateQueries({ queryKey: ["/api/loans/lent"] });
        queryClient.invalidateQueries({ queryKey: ["/api/user"] });
        
        toast({
          title: t("loans.fundSuccess"),
          description: t("loans.fundSuccessDescription", { amount: loan.amount }),
        });
      } catch (error) {
        toast({
          title: t("loans.fundError"),
          description: (error as Error).message || t("loans.fundErrorDescription"),
          variant: "destructive",
        });
      }
    }
  };

  if (isLoadingBorrower) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center mb-4">
            <Skeleton className="h-10 w-10 rounded-full mr-4" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <div className="space-y-3 mb-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <Skeleton className="h-10 w-full rounded-md" />
        </CardContent>
      </Card>
    );
  }

  // Format the request date safely
  const requestedDate = loan.requestedAt ? new Date(loan.requestedAt).toLocaleDateString() : '';

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center mb-4">
          <div className="h-10 w-10 rounded-full bg-primary-dark text-white flex items-center justify-center">
            {borrower?.fullName?.charAt(0) || "U"}
          </div>
          <div className="ml-4">
            <h4 className="text-sm font-medium">{borrower?.fullName || t("loans.unknownBorrower")}</h4>
            <p className="text-sm text-gray-500">{t("loans.trustScore")}: {borrower?.trustScore || 0}</p>
          </div>
        </div>
        
        <div className="mb-4">
          <div className="flex items-center mb-2">
            <BadgeIndianRupee className="h-4 w-4 text-gray-400 mr-2" />
            <span className="text-lg font-medium">₹ {loan.amount.toLocaleString()}</span>
          </div>
          
          <div className="flex items-center mb-2">
            <Calendar className="h-4 w-4 text-gray-400 mr-2" />
            <span className="text-sm text-gray-600">{t("loans.duration")}: {loan.duration} {t("loans.days")}</span>
          </div>
          
          <div className="flex items-center mb-2">
            <BadgeIndianRupee className="h-4 w-4 text-gray-400 mr-2" />
            <span className="text-sm text-gray-600">{t("loans.interestRate")}: {loan.interestRate}%</span>
          </div>
          
          <div className="flex items-start mb-2">
            <span className="text-gray-600 text-sm">{t("loans.purpose")}:</span>
            <span className="text-sm ml-2">{loan.purpose}</span>
          </div>
          
          <div className="flex items-center text-xs text-gray-500 mt-2">
            <CalendarDays className="h-3 w-3 mr-1" />
            {t("loans.requestedOn", { date: requestedDate })}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="px-6 py-4 bg-gray-50 border-t">
        <Button 
          className="w-full"
          disabled={user?.id === loan.borrowerId || (user?.balance || 0) < loan.amount}
          onClick={fundLoan}
        >
          {t("loans.fund")}
        </Button>
      </CardFooter>
    </Card>
  );
}