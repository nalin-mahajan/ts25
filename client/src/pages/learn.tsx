import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BookOpen, 
  Award, 
  HelpCircle, 
  Users, 
  Shield, 
  Lightbulb,
  HandCoins
} from "lucide-react";

export default function Learn() {
  const { t } = useTranslation();

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{t("learn.title")}</h1>
        <p className="mt-2 text-gray-600">{t("learn.description")}</p>
      </div>

      <Tabs defaultValue="basics" className="mb-8">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="basics">
            <BookOpen className="h-4 w-4 mr-2" />
            {t("learn.basics")}
          </TabsTrigger>
          <TabsTrigger value="trustScore">
            <Award className="h-4 w-4 mr-2" />
            {t("learn.trustScore")}
          </TabsTrigger>
          <TabsTrigger value="blockchain">
            <Shield className="h-4 w-4 mr-2" />
            {t("learn.blockchain")}
          </TabsTrigger>
          <TabsTrigger value="faq">
            <HelpCircle className="h-4 w-4 mr-2" />
            {t("learn.faq")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="basics">
          <Card>
            <CardHeader>
              <CardTitle>{t("learn.basicsPlatformTitle")}</CardTitle>
              <CardDescription>{t("learn.basicsPlatformDescription")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex flex-col space-y-3">
                  <div className="flex">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary bg-opacity-10 flex items-center justify-center mr-3">
                      <HandCoins className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-base font-medium mb-1">{t("learn.borrowingTitle")}</h3>
                      <p className="text-sm text-gray-600">{t("learn.borrowingDescription")}</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col space-y-3">
                  <div className="flex">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-secondary bg-opacity-10 flex items-center justify-center mr-3">
                      <Users className="h-5 w-5 text-secondary" />
                    </div>
                    <div>
                      <h3 className="text-base font-medium mb-1">{t("learn.lendingTitle")}</h3>
                      <p className="text-sm text-gray-600">{t("learn.lendingDescription")}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium mb-3">{t("learn.howItWorksTitle")}</h3>
                <ol className="space-y-4 list-decimal list-inside">
                  <li className="text-sm">{t("learn.howItWorksStep1")}</li>
                  <li className="text-sm">{t("learn.howItWorksStep2")}</li>
                  <li className="text-sm">{t("learn.howItWorksStep3")}</li>
                  <li className="text-sm">{t("learn.howItWorksStep4")}</li>
                  <li className="text-sm">{t("learn.howItWorksStep5")}</li>
                </ol>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-medium mb-3">{t("learn.benefitsTitle")}</h3>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-primary mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm">{t("learn.benefit1")}</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-primary mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm">{t("learn.benefit2")}</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-primary mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm">{t("learn.benefit3")}</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-primary mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm">{t("learn.benefit4")}</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trustScore">
          <Card>
            <CardHeader>
              <CardTitle>{t("learn.trustScoreTitle")}</CardTitle>
              <CardDescription>{t("learn.trustScoreDescription")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-primary bg-opacity-5 p-4 rounded-lg">
                <h3 className="text-lg font-medium mb-3 text-primary">{t("learn.whatIsTrustScoreTitle")}</h3>
                <p className="text-sm">{t("learn.whatIsTrustScoreDescription")}</p>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-3">{t("learn.howTrustScoreCalculatedTitle")}</h3>
                <p className="text-sm mb-4">{t("learn.howTrustScoreCalculatedDescription")}</p>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium text-sm mb-2">{t("learn.factorRepaymentTitle")}</h4>
                    <p className="text-xs text-gray-600">{t("learn.factorRepaymentDescription")}</p>
                  </div>
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium text-sm mb-2">{t("learn.factorCommunityTitle")}</h4>
                    <p className="text-xs text-gray-600">{t("learn.factorCommunityDescription")}</p>
                  </div>
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium text-sm mb-2">{t("learn.factorConsistencyTitle")}</h4>
                    <p className="text-xs text-gray-600">{t("learn.factorConsistencyDescription")}</p>
                  </div>
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium text-sm mb-2">{t("learn.factorLendingTitle")}</h4>
                    <p className="text-xs text-gray-600">{t("learn.factorLendingDescription")}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-3">{t("learn.trustScoreBenefitsTitle")}</h3>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <div className="flex-shrink-0 h-6 w-6 rounded-full bg-green-100 flex items-center justify-center mr-2">
                      <span className="text-xs text-green-800">1</span>
                    </div>
                    <span className="text-sm">{t("learn.trustScoreBenefit1")}</span>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 h-6 w-6 rounded-full bg-green-100 flex items-center justify-center mr-2">
                      <span className="text-xs text-green-800">2</span>
                    </div>
                    <span className="text-sm">{t("learn.trustScoreBenefit2")}</span>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 h-6 w-6 rounded-full bg-green-100 flex items-center justify-center mr-2">
                      <span className="text-xs text-green-800">3</span>
                    </div>
                    <span className="text-sm">{t("learn.trustScoreBenefit3")}</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="blockchain">
          <Card>
            <CardHeader>
              <CardTitle>{t("learn.blockchainTitle")}</CardTitle>
              <CardDescription>{t("learn.blockchainDescription")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium mb-3">{t("learn.whatIsBlockchainTitle")}</h3>
                <p className="text-sm">{t("learn.whatIsBlockchainDescription")}</p>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-3">{t("learn.blockchainFeaturesTitle")}</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="border rounded-lg p-4">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary bg-opacity-10 flex items-center justify-center mb-3">
                      <Shield className="h-5 w-5 text-primary" />
                    </div>
                    <h4 className="font-medium text-sm mb-2">{t("learn.blockchainFeature1Title")}</h4>
                    <p className="text-xs text-gray-600">{t("learn.blockchainFeature1Description")}</p>
                  </div>
                  <div className="border rounded-lg p-4">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary bg-opacity-10 flex items-center justify-center mb-3">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <h4 className="font-medium text-sm mb-2">{t("learn.blockchainFeature2Title")}</h4>
                    <p className="text-xs text-gray-600">{t("learn.blockchainFeature2Description")}</p>
                  </div>
                  <div className="border rounded-lg p-4">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary bg-opacity-10 flex items-center justify-center mb-3">
                      <BookOpen className="h-5 w-5 text-primary" />
                    </div>
                    <h4 className="font-medium text-sm mb-2">{t("learn.blockchainFeature3Title")}</h4>
                    <p className="text-xs text-gray-600">{t("learn.blockchainFeature3Description")}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-3">{t("learn.howBlockchainWorksTitle")}</h3>
                <p className="text-sm mb-4">{t("learn.howBlockchainWorksDescription")}</p>
                
                <div className="grid grid-cols-1 gap-2">
                  <div className="flex items-center p-2 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary flex items-center justify-center mr-3 text-white font-medium">
                      1
                    </div>
                    <p className="text-sm">{t("learn.blockchainStep1")}</p>
                  </div>
                  <div className="flex items-center p-2 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary flex items-center justify-center mr-3 text-white font-medium">
                      2
                    </div>
                    <p className="text-sm">{t("learn.blockchainStep2")}</p>
                  </div>
                  <div className="flex items-center p-2 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary flex items-center justify-center mr-3 text-white font-medium">
                      3
                    </div>
                    <p className="text-sm">{t("learn.blockchainStep3")}</p>
                  </div>
                  <div className="flex items-center p-2 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary flex items-center justify-center mr-3 text-white font-medium">
                      4
                    </div>
                    <p className="text-sm">{t("learn.blockchainStep4")}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="faq">
          <Card>
            <CardHeader>
              <CardTitle>{t("learn.faqTitle")}</CardTitle>
              <CardDescription>{t("learn.faqDescription")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-b pb-4">
                <h3 className="text-base font-medium mb-2">{t("learn.faq1Question")}</h3>
                <p className="text-sm text-gray-600">{t("learn.faq1Answer")}</p>
              </div>
              <div className="border-b pb-4">
                <h3 className="text-base font-medium mb-2">{t("learn.faq2Question")}</h3>
                <p className="text-sm text-gray-600">{t("learn.faq2Answer")}</p>
              </div>
              <div className="border-b pb-4">
                <h3 className="text-base font-medium mb-2">{t("learn.faq3Question")}</h3>
                <p className="text-sm text-gray-600">{t("learn.faq3Answer")}</p>
              </div>
              <div className="border-b pb-4">
                <h3 className="text-base font-medium mb-2">{t("learn.faq4Question")}</h3>
                <p className="text-sm text-gray-600">{t("learn.faq4Answer")}</p>
              </div>
              <div className="border-b pb-4">
                <h3 className="text-base font-medium mb-2">{t("learn.faq5Question")}</h3>
                <p className="text-sm text-gray-600">{t("learn.faq5Answer")}</p>
              </div>
              <div>
                <h3 className="text-base font-medium mb-2">{t("learn.faq6Question")}</h3>
                <p className="text-sm text-gray-600">{t("learn.faq6Answer")}</p>
              </div>

              <div className="mt-6 p-4 bg-primary bg-opacity-5 rounded-lg flex">
                <div className="flex-shrink-0 mr-4">
                  <Lightbulb className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-medium mb-1">{t("learn.stillHaveQuestionsTitle")}</h3>
                  <p className="text-xs text-gray-600">{t("learn.stillHaveQuestionsDescription")}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  );
}
