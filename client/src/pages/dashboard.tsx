import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Loan } from "@shared/schema";
import { useTranslation } from "react-i18next";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  Grab, 
  BadgeIndianRupee, 
  Wallet,
  Award,
  CalendarDays
} from "lucide-react";
import StatsCard from "@/components/dashboard/stats-card";
import LoanCard from "@/components/dashboard/loan-card";
import AchievementBadge from "@/components/dashboard/achievement-badge";
import TrustScore from "@/components/ui/trust-score";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch available loan requests
  const { data: availableLoans, isLoading: isLoadingAvailable } = useQuery<Loan[]>({
    queryKey: ["/api/loans/available"],
  });

  // Fetch user's borrowed loans
  const { data: borrowedLoans, isLoading: isLoadingBorrowed } = useQuery<Loan[]>({
    queryKey: ["/api/loans/borrowed"],
  });

  // Fetch user's lent loans
  const { data: lentLoans, isLoading: isLoadingLent } = useQuery<Loan[]>({
    queryKey: ["/api/loans/lent"],
  });

  // Fetch badges
  const { data: badges, isLoading: isLoadingBadges } = useQuery({
    queryKey: ["/api/badges"],
  });

  // Active loans are both borrowed and lent loans with 'funded' status
  const activeLoans = [
    ...(borrowedLoans?.filter(loan => loan.status === 'funded') || []),
    ...(lentLoans?.filter(loan => loan.status === 'funded') || [])
  ];

  const handleConnectUser = () => {
    toast({
      title: "Feature coming soon",
      description: "User connection feature will be available in the next update.",
    });
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* User welcome section */}
      <div className="lg:flex lg:items-center lg:justify-between mb-8">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            {t("dashboard.welcome", { name: user?.fullName?.split(' ')[0] || '' })}
          </h2>
          <div className="mt-1 flex flex-col sm:flex-row sm:flex-wrap sm:mt-0 sm:space-x-6">
            <div className="mt-2 flex items-center text-sm text-gray-500">
              <span className="inline-flex items-center mr-2 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <Award className="h-3 w-3 mr-1 text-green-500" />
                {t("dashboard.trustScore")}
              </span>
              <TrustScore score={user?.trustScore || 0} />
            </div>
            <div className="mt-2 flex items-center text-sm text-gray-500">
              <span className="inline-flex items-center mr-2 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                <Award className="h-3 w-3 mr-1 text-primary" />
                {t("dashboard.communityLevel")}
              </span>
              <span className="font-semibold">
                {user?.trustScore && user.trustScore > 80 
                  ? t("dashboard.trustedLender") 
                  : user?.trustScore && user.trustScore > 60 
                    ? t("dashboard.reliableMember") 
                    : t("dashboard.newMember")}
              </span>
            </div>
          </div>
        </div>
        <div className="mt-5 flex lg:mt-0 lg:ml-4">
          <span className="ml-3">
            <Link href="/loans">
              <Button variant="default" className="bg-primary hover:bg-primary-dark">
                <Grab className="h-4 w-4 mr-2" />
                {t("dashboard.lendMoney")}
              </Button>
            </Link>
          </span>
          <span className="ml-3">
            <Link href="/loan-request">
              <Button variant="default" className="bg-secondary hover:bg-secondary-dark">
                <BadgeIndianRupee className="h-4 w-4 mr-2" />
                {t("dashboard.borrowMoney")}
              </Button>
            </Link>
          </span>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatsCard 
          title={t("dashboard.availableBalance")}
          value={`₹ ${user?.balance.toLocaleString()}`}
          icon={<Wallet className="h-4 w-4" />}
          iconBg="bg-primary bg-opacity-10"
          iconColor="text-primary"
          linkText={t("dashboard.viewDetails")}
          linkUrl="/profile"
        />
        
        <StatsCard 
          title={t("dashboard.totalMoneyLent")}
          value={`₹ ${user?.totalLent.toLocaleString()}`}
          icon={<Grab className="h-4 w-4" />}
          iconBg="bg-green-100"
          iconColor="text-green-600"
          linkText={t("dashboard.viewActiveLoans")}
          linkUrl="/loans"
        />
        
        <StatsCard 
          title={t("dashboard.activeLoans")}
          value={activeLoans?.length.toString() || "0"}
          icon={<CalendarDays className="h-4 w-4" />}
          iconBg="bg-blue-100"
          iconColor="text-blue-600"
          linkText={t("dashboard.viewAllLoans")}
          linkUrl="/loans"
        />
        
        <StatsCard 
          title={t("dashboard.achievements")}
          value={(user?.achievedBadges?.length || 0).toString()}
          icon={<Award className="h-4 w-4" />}
          iconBg="bg-accent bg-opacity-10"
          iconColor="text-accent"
          linkText={t("dashboard.viewAchievements")}
          linkUrl="/profile"
        />
      </div>

      {/* Loan requests section */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900">{t("dashboard.loanRequestsNearYou")}</h2>
          <Link href="/loans" className="text-sm font-medium text-primary hover:text-primary-dark">
            {t("dashboard.viewAll")}
          </Link>
        </div>
        
        {isLoadingAvailable ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white shadow rounded-lg overflow-hidden border border-gray-100 p-6">
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
              </div>
            ))}
          </div>
        ) : availableLoans && availableLoans.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {availableLoans.slice(0, 3).map((loan) => (
              <LoanCard key={loan.id} loan={loan} />
            ))}
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg p-6 text-center">
            <p className="text-gray-500">{t("dashboard.noLoanRequests")}</p>
          </div>
        )}
      </div>

      {/* Active loans section */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900">{t("dashboard.yourActiveLoans")}</h2>
          <Link href="/loans" className="text-sm font-medium text-primary hover:text-primary-dark">
            {t("dashboard.viewAll")}
          </Link>
        </div>
        
        {isLoadingBorrowed || isLoadingLent ? (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul role="list" className="divide-y divide-gray-200">
              {[1, 2, 3].map((n) => (
                <li key={n} className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <Skeleton className="ml-4 h-4 w-32" />
                    </div>
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <Skeleton className="mt-2 h-4 w-24 sm:mt-0 sm:ml-6" />
                      <Skeleton className="mt-2 h-4 w-32 sm:mt-0 sm:ml-6" />
                    </div>
                    <Skeleton className="mt-2 h-4 w-40 sm:mt-0" />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : activeLoans && activeLoans.length > 0 ? (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul role="list" className="divide-y divide-gray-200">
              {activeLoans.slice(0, 3).map((loan) => (
                <li key={loan.id}>
                  <div className="block hover:bg-gray-50">
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center">
                              {loan.borrowerId === user?.id ? 'B' : 'L'}
                            </div>
                          </div>
                          <p className="ml-4 text-sm font-medium text-gray-900">
                            {loan.borrowerId === user?.id 
                              ? t("dashboard.borrowedFrom", { lender: "Lender" }) 
                              : t("dashboard.lentTo", { borrower: "Borrower" })}
                          </p>
                        </div>
                        <div className="ml-2 flex-shrink-0 flex">
                          <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            {t("dashboard.onTime")}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <p className="flex items-center text-sm text-gray-500">
                            <BadgeIndianRupee className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                            ₹ {loan.amount.toLocaleString()}
                          </p>
                          <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                            <CalendarDays className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                            {loan.dueDate 
                              ? t("dashboard.dueIn", { days: Math.ceil((new Date(loan.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) }) 
                              : t("dashboard.pending")}
                          </p>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                          <CalendarDays className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                          <p>
                            {t("dashboard.startedOn", { date: new Date(loan.createdAt).toLocaleDateString() })}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg p-6 text-center">
            <p className="text-gray-500">{t("dashboard.noActiveLoans")}</p>
          </div>
        )}
      </div>

      {/* Achievements section */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900">{t("dashboard.yourAchievements")}</h2>
          <Link href="/profile" className="text-sm font-medium text-primary hover:text-primary-dark">
            {t("dashboard.viewAll")}
          </Link>
        </div>
        
        {isLoadingBadges ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="text-center">
                <Skeleton className="mx-auto w-16 h-16 rounded-full" />
                <Skeleton className="mt-2 h-4 w-16 mx-auto" />
              </div>
            ))}
          </div>
        ) : badges ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
            {badges.slice(0, 6).map((badge) => (
              <AchievementBadge 
                key={badge.id}
                name={badge.name}
                icon={badge.icon}
                achieved={user?.achievedBadges?.includes(badge.id) || false}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg p-6 text-center">
            <p className="text-gray-500">{t("dashboard.noAchievements")}</p>
          </div>
        )}
      </div>

      {/* Community section */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900">{t("dashboard.communityEngagement")}</h2>
          <Link href="/community" className="text-sm font-medium text-primary hover:text-primary-dark">
            {t("dashboard.viewCommunity")}
          </Link>
        </div>
        <div className="bg-white shadow sm:rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-base font-medium text-gray-900">{t("dashboard.nearbyCommunityMembers")}</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              {t("dashboard.buildTrustNetwork")}
            </p>
          </div>
          <div className="border-t border-gray-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-4">
              <div className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg">
                <div className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center">
                  D
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">Deepika Malhotra</p>
                  <p className="text-sm text-gray-500 truncate">{t("dashboard.trustScore")}: 92</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-primary hover:bg-primary-light hover:bg-opacity-10"
                  onClick={handleConnectUser}
                >
                  {t("dashboard.connect")}
                </Button>
              </div>
              
              <div className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg">
                <div className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center">
                  S
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">Sanjay Mehra</p>
                  <p className="text-sm text-gray-500 truncate">{t("dashboard.trustScore")}: 85</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-primary hover:bg-primary-light hover:bg-opacity-10"
                  onClick={handleConnectUser}
                >
                  {t("dashboard.connect")}
                </Button>
              </div>
              
              <div className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg">
                <div className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center">
                  N
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">Neha Gupta</p>
                  <p className="text-sm text-gray-500 truncate">{t("dashboard.trustScore")}: 78</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-primary hover:bg-primary-light hover:bg-opacity-10"
                  onClick={handleConnectUser}
                >
                  {t("dashboard.connect")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
