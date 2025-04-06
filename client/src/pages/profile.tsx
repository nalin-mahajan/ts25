import { useAuth } from "@/hooks/use-auth";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  User, 
  Award, 
  Clock, 
  History, 
  Shield, 
  ChevronRight,
  Landmark,
  Settings
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Loan, Transaction } from "@shared/schema";
import TrustScore from "@/components/ui/trust-score";
import AchievementBadge from "@/components/dashboard/achievement-badge";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const profileSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email address"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  location: z.string().min(1, "Location is required"),
  language: z.string()
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function Profile() {
  const { t } = useTranslation();
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: user?.fullName || "",
      email: user?.email || "",
      phoneNumber: user?.phoneNumber || "",
      location: user?.location || "",
      language: user?.language || "en"
    }
  });

  // Fetch user's borrowed loans
  const { data: borrowedLoans } = useQuery<Loan[]>({
    queryKey: ["/api/loans/borrowed"],
  });

  // Fetch user's lent loans
  const { data: lentLoans } = useQuery<Loan[]>({
    queryKey: ["/api/loans/lent"],
  });

  // Fetch badges
  const { data: badges } = useQuery({
    queryKey: ["/api/badges"],
  });

  // Fetch transactions (simplified for display)
  const { data: transactions } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
    queryFn: async () => {
      // This would be a real API call in a full implementation
      return [
        {
          id: 1,
          loanId: 1,
          fromUserId: 1,
          toUserId: 2,
          amount: 3000,
          type: "loan_funding",
          status: "completed",
          hash: "0x12345...",
          timestamp: new Date()
        },
        {
          id: 2,
          loanId: 2,
          fromUserId: 2,
          toUserId: 1,
          amount: 2500,
          type: "loan_repayment",
          status: "completed",
          hash: "0x67890...",
          timestamp: new Date()
        }
      ];
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const onSubmit = async (data: ProfileFormValues) => {
    try {
      const res = await apiRequest("PATCH", "/api/profile", data);
      const updatedUser = await res.json();
      
      queryClient.setQueryData(["/api/user"], updatedUser);
      
      toast({
        title: t("profile.updateSuccess"),
        description: t("profile.updateSuccessDescription"),
      });
      
      setIsEditing(false);
    } catch (error) {
      toast({
        title: t("profile.updateError"),
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{t("profile.title")}</h1>
        <p className="mt-2 text-gray-600">{t("profile.description")}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="pb-0">
              <div className="flex justify-between items-center mb-2">
                <CardTitle>{t("profile.personalInfo")}</CardTitle>
                {!isEditing && (
                  <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
                    <Settings className="h-4 w-4 mr-1" />
                    {t("profile.edit")}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {!isEditing ? (
                <div className="space-y-6">
                  <div className="flex flex-col items-center">
                    <Avatar className="h-20 w-20 mb-3">
                      <AvatarFallback className="text-xl bg-primary text-white">
                        {user?.fullName?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <h2 className="text-xl font-semibold">{user?.fullName}</h2>
                    <div className="flex items-center mt-2">
                      <span className="text-sm font-medium text-gray-500 mr-2">{t("profile.trustScore")}:</span>
                      <TrustScore score={user?.trustScore || 0} />
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <div className="flex items-start">
                      <User className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-500">{t("profile.username")}</p>
                        <p className="text-sm font-medium">{user?.username}</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <svg className="h-5 w-5 text-gray-400 mr-3 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <div>
                        <p className="text-xs text-gray-500">{t("profile.email")}</p>
                        <p className="text-sm font-medium">{user?.email}</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <svg className="h-5 w-5 text-gray-400 mr-3 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <div>
                        <p className="text-xs text-gray-500">{t("profile.phoneNumber")}</p>
                        <p className="text-sm font-medium">{user?.phoneNumber}</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <svg className="h-5 w-5 text-gray-400 mr-3 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <div>
                        <p className="text-xs text-gray-500">{t("profile.location")}</p>
                        <p className="text-sm font-medium">{user?.location}</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <svg className="h-5 w-5 text-gray-400 mr-3 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                      </svg>
                      <div>
                        <p className="text-xs text-gray-500">{t("profile.preferredLanguage")}</p>
                        <p className="text-sm font-medium">
                          {user?.language === "en" ? "English" : 
                           user?.language === "hi" ? "हिन्दी (Hindi)" :
                           user?.language === "mr" ? "मराठी (Marathi)" :
                           user?.language === "ta" ? "தமிழ் (Tamil)" : "English"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <Button 
                    variant="destructive" 
                    className="w-full"
                    onClick={handleLogout}
                    disabled={logoutMutation.isPending}
                  >
                    {logoutMutation.isPending ? t("profile.loggingOut") : t("profile.logout")}
                  </Button>
                </div>
              ) : (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("profile.fullName")}</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("profile.email")}</FormLabel>
                          <FormControl>
                            <Input type="email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="phoneNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("profile.phoneNumber")}</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("profile.location")}</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="language"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("profile.preferredLanguage")}</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={t("profile.selectLanguage")} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="en">English</SelectItem>
                              <SelectItem value="hi">हिन्दी (Hindi)</SelectItem>
                              <SelectItem value="mr">मराठी (Marathi)</SelectItem>
                              <SelectItem value="ta">தமிழ் (Tamil)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex space-x-3 pt-2">
                      <Button type="submit" className="flex-1">
                        {t("profile.save")}
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => {
                          form.reset();
                          setIsEditing(false);
                        }}
                        className="flex-1"
                      >
                        {t("profile.cancel")}
                      </Button>
                    </div>
                  </form>
                </Form>
              )}
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>{t("profile.walletInfo")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-primary bg-opacity-5 rounded-lg">
                  <div className="flex items-center">
                    <Landmark className="h-5 w-5 text-primary mr-3" />
                    <div>
                      <p className="text-xs text-gray-500">{t("profile.availableBalance")}</p>
                      <p className="text-lg font-semibold">₹ {user?.balance.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <Award className="h-5 w-5 text-green-600 mr-3" />
                    <div>
                      <p className="text-xs text-gray-500">{t("profile.totalMoneyLent")}</p>
                      <p className="text-lg font-semibold">₹ {user?.totalLent.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Tabs defaultValue="activity">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="activity">
                <History className="h-4 w-4 mr-2" />
                {t("profile.activity")}
              </TabsTrigger>
              <TabsTrigger value="loans">
                <Landmark className="h-4 w-4 mr-2" />
                {t("profile.loans")}
              </TabsTrigger>
              <TabsTrigger value="achievements">
                <Award className="h-4 w-4 mr-2" />
                {t("profile.achievements")}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="activity">
              <Card>
                <CardHeader>
                  <CardTitle>{t("profile.recentTransactions")}</CardTitle>
                  <CardDescription>{t("profile.recentTransactionsDescription")}</CardDescription>
                </CardHeader>
                <CardContent>
                  {transactions && transactions.length > 0 ? (
                    <div className="space-y-4">
                      {transactions.map(transaction => (
                        <div key={transaction.id} className="flex items-start p-3 border rounded-lg">
                          <div className="h-10 w-10 rounded-full bg-primary bg-opacity-10 flex items-center justify-center mr-3">
                            {transaction.type === 'loan_funding' ? (
                              <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                              </svg>
                            ) : (
                              <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5l9 2-9 18-9-18 9-2zm0 0v14" />
                              </svg>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between">
                              <div>
                                <p className="text-sm font-medium">
                                  {transaction.type === 'loan_funding' 
                                    ? t("profile.loanFunded") 
                                    : t("profile.loanRepaid")}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {new Date(transaction.timestamp).toLocaleString()}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-semibold">
                                  {transaction.type === 'loan_funding' 
                                    ? `- ₹ ${transaction.amount.toLocaleString()}` 
                                    : `+ ₹ ${transaction.amount.toLocaleString()}`}
                                </p>
                                <p className={`text-xs ${transaction.status === 'completed' ? 'text-green-600' : 'text-yellow-600'}`}>
                                  {transaction.status === 'completed' 
                                    ? t("profile.completed") 
                                    : t("profile.pending")}
                                </p>
                              </div>
                            </div>
                            <div className="mt-2">
                              <p className="text-xs text-gray-500">{t("profile.transactionId")}</p>
                              <p className="text-xs font-mono truncate">{transaction.hash}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Clock className="mx-auto h-10 w-10 text-gray-400 mb-3" />
                      <p className="text-gray-500">{t("profile.noTransactions")}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>{t("profile.blockchain")}</CardTitle>
                  <CardDescription>{t("profile.blockchainDescription")}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 p-3 rounded-lg mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <Shield className="h-5 w-5 text-primary mr-2" />
                        <p className="text-sm font-medium">{t("profile.blockchainStatus")}</p>
                      </div>
                      <div className="flex items-center text-green-600">
                        <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-xs font-medium">{t("profile.verified")}</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600">{t("profile.blockchainInfo")}</p>
                  </div>

                  <div className="px-3">
                    <div className="flex items-center justify-between py-2 border-b">
                      <p className="text-sm text-gray-600">{t("profile.totalTransactions")}</p>
                      <p className="text-sm font-medium">
                        {transactions ? transactions.length : 0}
                      </p>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b">
                      <p className="text-sm text-gray-600">{t("profile.activeLoans")}</p>
                      <p className="text-sm font-medium">
                        {borrowedLoans && lentLoans 
                          ? borrowedLoans.filter(l => l.status === 'funded').length + 
                            lentLoans.filter(l => l.status === 'funded').length
                          : 0}
                      </p>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <p className="text-sm text-gray-600">{t("profile.completedLoans")}</p>
                      <p className="text-sm font-medium">
                        {borrowedLoans && lentLoans 
                          ? borrowedLoans.filter(l => l.status === 'repaid').length + 
                            lentLoans.filter(l => l.status === 'repaid').length
                          : 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="loans">
              <Card>
                <CardHeader>
                  <CardTitle>{t("profile.yourLoans")}</CardTitle>
                  <CardDescription>{t("profile.yourLoansDescription")}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-3">{t("profile.borrowed")}</h3>
                      {borrowedLoans && borrowedLoans.length > 0 ? (
                        <div className="space-y-3">
                          {borrowedLoans.map(loan => (
                            <div key={loan.id} className="flex justify-between items-center p-3 border rounded-lg">
                              <div className="flex items-center">
                                <div className="h-8 w-8 bg-primary text-white rounded-full flex items-center justify-center mr-3">
                                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                </div>
                                <div>
                                  <p className="text-sm font-medium">{loan.purpose}</p>
                                  <p className="text-xs text-gray-500">
                                    ₹ {loan.amount.toLocaleString()} • {loan.duration} {t("profile.days")}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className={`px-2 py-1 text-xs rounded-full font-semibold 
                                  ${loan.status === 'requested' ? 'bg-blue-100 text-blue-800' : 
                                    loan.status === 'funded' ? 'bg-green-100 text-green-800' :
                                    loan.status === 'repaid' ? 'bg-primary bg-opacity-10 text-primary' :
                                    'bg-red-100 text-red-800'}`}>
                                  {loan.status === 'requested' ? t("profile.requested") :
                                   loan.status === 'funded' ? t("profile.funded") :
                                   loan.status === 'repaid' ? t("profile.repaid") :
                                   t("profile.defaulted")}
                                </div>
                                <p className="text-xs mt-1">
                                  {new Date(loan.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-4 border rounded-lg">
                          <p className="text-gray-500">{t("profile.noBorrowedLoans")}</p>
                        </div>
                      )}
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-3">{t("profile.lent")}</h3>
                      {lentLoans && lentLoans.length > 0 ? (
                        <div className="space-y-3">
                          {lentLoans.map(loan => (
                            <div key={loan.id} className="flex justify-between items-center p-3 border rounded-lg">
                              <div className="flex items-center">
                                <div className="h-8 w-8 bg-secondary text-white rounded-full flex items-center justify-center mr-3">
                                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                </div>
                                <div>
                                  <p className="text-sm font-medium">{loan.purpose}</p>
                                  <p className="text-xs text-gray-500">
                                    ₹ {loan.amount.toLocaleString()} • {loan.duration} {t("profile.days")}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className={`px-2 py-1 text-xs rounded-full font-semibold 
                                  ${loan.status === 'requested' ? 'bg-blue-100 text-blue-800' : 
                                    loan.status === 'funded' ? 'bg-green-100 text-green-800' :
                                    loan.status === 'repaid' ? 'bg-primary bg-opacity-10 text-primary' :
                                    'bg-red-100 text-red-800'}`}>
                                  {loan.status === 'requested' ? t("profile.requested") :
                                   loan.status === 'funded' ? t("profile.funded") :
                                   loan.status === 'repaid' ? t("profile.repaid") :
                                   t("profile.defaulted")}
                                </div>
                                <p className="text-xs mt-1">
                                  {new Date(loan.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-4 border rounded-lg">
                          <p className="text-gray-500">{t("profile.noLentLoans")}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="achievements">
              <Card>
                <CardHeader>
                  <CardTitle>{t("profile.achievements")}</CardTitle>
                  <CardDescription>{t("profile.achievementsDescription")}</CardDescription>
                </CardHeader>
                <CardContent>
                  {badges ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {badges.map((badge: any) => (
                        <AchievementBadge 
                          key={badge.id}
                          name={badge.name}
                          icon={badge.icon}
                          achieved={user?.achievedBadges?.includes(badge.id) || false}
                          description={badge.description}
                          requirement={badge.requirement}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Award className="mx-auto h-10 w-10 text-gray-400 mb-3" />
                      <p className="text-gray-500">{t("profile.loadingAchievements")}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="mt-6 bg-primary bg-opacity-5 p-4 rounded-lg flex items-start">
                <Award className="h-6 w-6 text-primary mr-3 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-medium text-primary mb-1">{t("profile.howToEarnTitle")}</h3>
                  <p className="text-sm text-gray-600 mb-4">{t("profile.howToEarnDescription")}</p>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <ChevronRight className="h-4 w-4 text-primary mr-2" />
                      <p className="text-sm">{t("profile.earnTip1")}</p>
                    </div>
                    <div className="flex items-center">
                      <ChevronRight className="h-4 w-4 text-primary mr-2" />
                      <p className="text-sm">{t("profile.earnTip2")}</p>
                    </div>
                    <div className="flex items-center">
                      <ChevronRight className="h-4 w-4 text-primary mr-2" />
                      <p className="text-sm">{t("profile.earnTip3")}</p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </main>
  );
}
