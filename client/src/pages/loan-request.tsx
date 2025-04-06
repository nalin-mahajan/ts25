import { useTranslation } from "react-i18next";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { AlertCircle, HelpCircle, ArrowLeft, Calendar } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { insertLoanSchema } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { TabsContent, Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Extend the loan schema with our form-specific validation
const loanRequestSchema = insertLoanSchema.extend({
  amount: z.coerce.number()
    .min(500, "Amount must be at least ₹500")
    .max(25000, "Amount cannot exceed ₹25,000"),
  duration: z.coerce.number()
    .min(7, "Duration must be at least 7 days")
    .max(90, "Duration cannot exceed 90 days"),
  interestRate: z.coerce.number()
    .min(0.5, "Interest rate must be at least 0.5%")
    .max(5, "Interest rate cannot exceed 5%"),
  purpose: z.string()
    .min(10, "Purpose must be at least 10 characters")
    .max(200, "Purpose cannot exceed 200 characters"),
});

type LoanRequestFormValues = z.infer<typeof loanRequestSchema>;

export default function LoanRequest() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const { user } = useAuth();

  // Default values for the form
  const defaultValues: LoanRequestFormValues = {
    amount: 5000,
    duration: 30,
    interestRate: 1.5,
    purpose: "",
    borrowerId: user?.id || 0,
  };

  const form = useForm<LoanRequestFormValues>({
    resolver: zodResolver(loanRequestSchema),
    defaultValues,
  });

  const { watch, setValue } = form;
  const amount = watch("amount");
  const duration = watch("duration");
  const interestRate = watch("interestRate");

  // Calculate repayment amount
  const interest = (amount * interestRate) / 100;
  const totalRepayment = amount + interest;

  // Loan request mutation
  const loanRequestMutation = useMutation({
    mutationFn: async (data: LoanRequestFormValues) => {
      const response = await apiRequest("POST", "/api/loans", data);
      return response.json();
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["/api/loans/borrowed"] });
      
      toast({
        title: t("loanRequest.success"),
        description: t("loanRequest.successDescription"),
      });
      
      // Navigate to loans page
      navigate("/loans");
    },
    onError: (error) => {
      toast({
        title: t("loanRequest.error"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  function onSubmit(data: LoanRequestFormValues) {
    loanRequestMutation.mutate(data);
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-4">
        <Button variant="ghost" onClick={() => navigate("/dashboard")} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t("loanRequest.back")}
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">{t("loanRequest.title")}</h1>
        <p className="mt-2 text-gray-600">{t("loanRequest.description")}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Tabs defaultValue="request">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="request">
                {t("loanRequest.createRequest")}
              </TabsTrigger>
              <TabsTrigger value="guidelines">
                {t("loanRequest.guidelines")}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="request">
              <Card>
                <CardHeader>
                  <CardTitle>{t("loanRequest.formTitle")}</CardTitle>
                  <CardDescription>{t("loanRequest.formDescription")}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <FormField
                        control={form.control}
                        name="amount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("loanRequest.amountLabel")}</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                                <Input 
                                  type="number" 
                                  {...field} 
                                  className="pl-8" 
                                  step="500"
                                  min="500"
                                  max="25000"
                                />
                              </div>
                            </FormControl>
                            <FormDescription>
                              {t("loanRequest.amountDescription")}
                            </FormDescription>
                            <div className="mt-2">
                              <Slider
                                value={[field.value]}
                                min={500}
                                max={25000}
                                step={500}
                                onValueChange={(value) => {
                                  setValue("amount", value[0]);
                                }}
                              />
                              <div className="flex justify-between text-xs text-gray-500 mt-1">
                                <span>₹500</span>
                                <span>₹25,000</span>
                              </div>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="duration"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("loanRequest.durationLabel")}</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input 
                                  type="number" 
                                  {...field} 
                                  min="7"
                                  max="90"
                                  step="1"
                                />
                                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                                  {t("loanRequest.days")}
                                </span>
                              </div>
                            </FormControl>
                            <FormDescription>
                              {t("loanRequest.durationDescription")}
                            </FormDescription>
                            <div className="mt-2">
                              <Slider
                                value={[field.value]}
                                min={7}
                                max={90}
                                step={1}
                                onValueChange={(value) => {
                                  setValue("duration", value[0]);
                                }}
                              />
                              <div className="flex justify-between text-xs text-gray-500 mt-1">
                                <span>7 {t("loanRequest.days")}</span>
                                <span>90 {t("loanRequest.days")}</span>
                              </div>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="interestRate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("loanRequest.interestRateLabel")}</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input 
                                  type="number" 
                                  {...field} 
                                  step="0.1"
                                  min="0.5"
                                  max="5"
                                />
                                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
                              </div>
                            </FormControl>
                            <FormDescription>
                              {t("loanRequest.interestRateDescription")}
                            </FormDescription>
                            <div className="mt-2">
                              <Slider
                                value={[field.value]}
                                min={0.5}
                                max={5}
                                step={0.1}
                                onValueChange={(value) => {
                                  setValue("interestRate", value[0]);
                                }}
                              />
                              <div className="flex justify-between text-xs text-gray-500 mt-1">
                                <span>0.5%</span>
                                <span>5%</span>
                              </div>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="purpose"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("loanRequest.purposeLabel")}</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder={t("loanRequest.purposePlaceholder")} 
                                className="resize-none"
                                rows={4}
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              {t("loanRequest.purposeDescription")}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Alert className="bg-primary bg-opacity-5 border-primary">
                        <HelpCircle className="h-4 w-4 text-primary" />
                        <AlertTitle>{t("loanRequest.trustScoreImpactTitle")}</AlertTitle>
                        <AlertDescription>
                          {t("loanRequest.trustScoreImpactDescription")}
                        </AlertDescription>
                      </Alert>

                      <Button 
                        type="submit" 
                        className="w-full"
                        disabled={loanRequestMutation.isPending}
                      >
                        {loanRequestMutation.isPending ? t("loanRequest.submitting") : t("loanRequest.submitRequest")}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="guidelines">
              <Card>
                <CardHeader>
                  <CardTitle>{t("loanRequest.guidelinesTitle")}</CardTitle>
                  <CardDescription>{t("loanRequest.guidelinesDescription")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-base font-medium">{t("loanRequest.eligibilityTitle")}</h3>
                    <ul className="list-disc pl-5 space-y-1">
                      <li className="text-sm">{t("loanRequest.eligibility1")}</li>
                      <li className="text-sm">{t("loanRequest.eligibility2")}</li>
                      <li className="text-sm">{t("loanRequest.eligibility3")}</li>
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-base font-medium">{t("loanRequest.doTitle")}</h3>
                    <ul className="list-disc pl-5 space-y-1 text-green-700">
                      <li className="text-sm">{t("loanRequest.do1")}</li>
                      <li className="text-sm">{t("loanRequest.do2")}</li>
                      <li className="text-sm">{t("loanRequest.do3")}</li>
                      <li className="text-sm">{t("loanRequest.do4")}</li>
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-base font-medium">{t("loanRequest.dontTitle")}</h3>
                    <ul className="list-disc pl-5 space-y-1 text-red-700">
                      <li className="text-sm">{t("loanRequest.dont1")}</li>
                      <li className="text-sm">{t("loanRequest.dont2")}</li>
                      <li className="text-sm">{t("loanRequest.dont3")}</li>
                    </ul>
                  </div>

                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>{t("loanRequest.importantTitle")}</AlertTitle>
                    <AlertDescription>
                      {t("loanRequest.importantDescription")}
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>{t("loanRequest.summaryTitle")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between py-2 border-b">
                <p className="text-gray-600">{t("loanRequest.loanAmount")}</p>
                <p className="font-medium">₹ {amount.toLocaleString()}</p>
              </div>
              
              <div className="flex justify-between py-2 border-b">
                <p className="text-gray-600">{t("loanRequest.interestAmount")}</p>
                <p className="font-medium">₹ {interest.toLocaleString()}</p>
              </div>
              
              <div className="flex justify-between py-2 border-b">
                <p className="text-gray-600">{t("loanRequest.totalRepayment")}</p>
                <p className="font-semibold">₹ {totalRepayment.toLocaleString()}</p>
              </div>
              
              <div className="flex justify-between py-2">
                <p className="text-gray-600">{t("loanRequest.durationDays")}</p>
                <p className="font-medium flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {duration} {t("loanRequest.days")}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>{t("loanRequest.trustScoreTitle")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center">
                <div className="relative h-24 w-24 mb-3">
                  <svg className="w-full h-full" viewBox="0 0 100 100">
                    <circle
                      className="text-gray-200"
                      strokeWidth="8"
                      stroke="currentColor"
                      fill="transparent"
                      r="40"
                      cx="50"
                      cy="50"
                    />
                    <circle
                      className="text-primary"
                      strokeWidth="8"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="transparent"
                      r="40"
                      cx="50"
                      cy="50"
                      strokeDasharray={`${2 * Math.PI * 40}`}
                      strokeDashoffset={`${2 * Math.PI * 40 * (1 - (user?.trustScore || 0) / 100)}`}
                      transform="rotate(-90 50 50)"
                    />
                    <text
                      x="50"
                      y="50"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="font-bold text-lg"
                    >
                      {user?.trustScore || 0}
                    </text>
                  </svg>
                </div>
                <p className="text-sm text-gray-600 text-center mb-4">
                  {t("loanRequest.trustScoreDescription")}
                </p>
                
                <div className="w-full bg-gray-100 p-3 rounded-lg">
                  <h4 className="text-sm font-medium mb-2">{t("loanRequest.improveTrustTitle")}</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 h-5 w-5 rounded-full bg-primary text-white flex items-center justify-center mr-2 text-xs">
                        1
                      </div>
                      <p className="text-gray-600">{t("loanRequest.improveTrust1")}</p>
                    </div>
                    <div className="flex items-start">
                      <div className="flex-shrink-0 h-5 w-5 rounded-full bg-primary text-white flex items-center justify-center mr-2 text-xs">
                        2
                      </div>
                      <p className="text-gray-600">{t("loanRequest.improveTrust2")}</p>
                    </div>
                    <div className="flex items-start">
                      <div className="flex-shrink-0 h-5 w-5 rounded-full bg-primary text-white flex items-center justify-center mr-2 text-xs">
                        3
                      </div>
                      <p className="text-gray-600">{t("loanRequest.improveTrust3")}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
