import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Search, Users, Grab, Award } from "lucide-react";
import TrustScore from "@/components/ui/trust-score";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export default function Community() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch community members
  const { data: communityMembers, isLoading } = useQuery({
    queryKey: ["/api/community"],
  });

  // Fetch trust connections
  const { data: trustConnections } = useQuery({
    queryKey: ["/api/trust-connections"],
  });

  // Create trust connection mutation
  const createConnectionMutation = useMutation({
    mutationFn: async (userId: number) => {
      return await apiRequest("POST", "/api/trust-connections", {
        trustedUserId: userId,
        score: 70, // Default initial trust score
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/trust-connections"] });
      toast({
        title: t("community.connectionSuccess"),
        description: t("community.connectionSuccessDescription"),
      });
    },
    onError: (error) => {
      toast({
        title: t("community.connectionError"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle trust connection
  const handleConnect = (userId: number) => {
    createConnectionMutation.mutate(userId);
  };

  // Filter members based on search term
  const filteredMembers = communityMembers && searchTerm 
    ? communityMembers.filter((member: any) => 
        member.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.location.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : communityMembers;

  // Check if a user is already connected
  const isConnected = (userId: number) => {
    return trustConnections?.some((connection: any) => connection.trustedUserId === userId);
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{t("community.title")}</h1>
        <p className="mt-2 text-gray-600">{t("community.description")}</p>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            className="pl-10"
            placeholder={t("community.searchPlaceholder")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Tabs defaultValue="nearby" className="mb-8">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="nearby">
            <Users className="h-4 w-4 mr-2" />
            {t("community.nearby")}
          </TabsTrigger>
          <TabsTrigger value="trusted">
            <Grab className="h-4 w-4 mr-2" />
            {t("community.trusted")}
          </TabsTrigger>
          <TabsTrigger value="topLenders">
            <Award className="h-4 w-4 mr-2" />
            {t("community.topLenders")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="nearby">
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : filteredMembers?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMembers.map((member: any) => (
                <Card key={member.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center mr-3">
                          {member.fullName.charAt(0)}
                        </div>
                        <div>
                          <CardTitle className="text-base">{member.fullName}</CardTitle>
                          <CardDescription>{member.location}</CardDescription>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center">
                        <span className="text-sm text-gray-500 mr-2">{t("community.trustScore")}:</span>
                        <TrustScore score={member.trustScore || 0} />
                      </div>
                    </div>
                    
                    <Button
                      variant={isConnected(member.id) ? "outline" : "default"}
                      size="sm"
                      className="w-full"
                      disabled={isConnected(member.id) || createConnectionMutation.isPending}
                      onClick={() => handleConnect(member.id)}
                    >
                      {isConnected(member.id) 
                        ? t("community.connected") 
                        : createConnectionMutation.isPending 
                          ? t("community.connecting") 
                          : t("community.connect")}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="bg-white shadow rounded-lg p-6 text-center">
              <p className="text-gray-500">
                {searchTerm 
                  ? t("community.noSearchResults") 
                  : t("community.noMembers")}
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="trusted">
          {trustConnections && trustConnections.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {trustConnections.map((connection: any) => {
                const connectedMember = communityMembers?.find(
                  (member: any) => member.id === connection.trustedUserId
                );
                
                if (!connectedMember) return null;
                
                return (
                  <Card key={connection.id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-secondary text-white flex items-center justify-center mr-3">
                            {connectedMember.fullName.charAt(0)}
                          </div>
                          <div>
                            <CardTitle className="text-base">{connectedMember.fullName}</CardTitle>
                            <CardDescription>{connectedMember.location}</CardDescription>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center">
                          <span className="text-sm text-gray-500 mr-2">{t("community.trustScore")}:</span>
                          <TrustScore score={connectedMember.trustScore || 0} />
                        </div>
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        disabled
                      >
                        {t("community.connected")}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="bg-white shadow rounded-lg p-6 text-center">
              <p className="text-gray-500">{t("community.noConnections")}</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="topLenders">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex flex-col items-center justify-center text-center py-8">
              <Award className="h-16 w-16 text-primary mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">{t("community.topLendersComingSoon")}</h3>
              <p className="text-gray-500">{t("community.topLendersDescription")}</p>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>{t("community.benefitsTitle")}</CardTitle>
          <CardDescription>{t("community.benefitsDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="flex flex-col items-center text-center p-4">
              <div className="h-12 w-12 rounded-full bg-primary bg-opacity-10 flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-medium mb-2">{t("community.benefit1Title")}</h3>
              <p className="text-sm text-gray-500">{t("community.benefit1Description")}</p>
            </div>
            
            <div className="flex flex-col items-center text-center p-4">
              <div className="h-12 w-12 rounded-full bg-primary bg-opacity-10 flex items-center justify-center mb-4">
                <Grab className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-medium mb-2">{t("community.benefit2Title")}</h3>
              <p className="text-sm text-gray-500">{t("community.benefit2Description")}</p>
            </div>
            
            <div className="flex flex-col items-center text-center p-4">
              <div className="h-12 w-12 rounded-full bg-primary bg-opacity-10 flex items-center justify-center mb-4">
                <Award className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-medium mb-2">{t("community.benefit3Title")}</h3>
              <p className="text-sm text-gray-500">{t("community.benefit3Description")}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
