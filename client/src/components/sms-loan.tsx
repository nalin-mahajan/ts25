import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare, CheckCircle, ArrowUpDown, Phone } from 'lucide-react';
import type { Loan } from '@shared/schema';

interface SMSFormData {
  to: string;
  message: string;
}

export default function SMSLoan() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('');

  // Mutation for sending SMS
  const sendSMSMutation = useMutation({
    mutationFn: async (data: SMSFormData) => {
      const res = await apiRequest('POST', '/api/send-sms', data);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to send SMS');
      }
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: t('sms.sendSuccess'),
        description: t('sms.messageSent'),
      });
      setPhoneNumber('');
      setMessage('');
      // Refresh loans data
      queryClient.invalidateQueries({ queryKey: ['/api/loans/borrowed'] });
      queryClient.invalidateQueries({ queryKey: ['/api/loans/available'] });
    },
    onError: (error: Error) => {
      toast({
        title: t('sms.sendError'),
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber || !message) {
      toast({
        title: t('sms.formError'),
        description: t('sms.allFieldsRequired'),
        variant: 'destructive',
      });
      return;
    }

    sendSMSMutation.mutate({ to: phoneNumber, message });
  };

  return (
    <Tabs defaultValue="send">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="send">
          <MessageSquare className="mr-2 h-4 w-4" />
          {t('sms.sendSMS')}
        </TabsTrigger>
        <TabsTrigger value="howto">
          <CheckCircle className="mr-2 h-4 w-4" />
          {t('sms.howToUse')}
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="send" className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>{t('sms.sendSMS')}</CardTitle>
            <CardDescription>
              {t('sms.sendDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">{t('sms.phoneNumber')}</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+919876543210"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">{t('sms.message')}</Label>
                <Input
                  id="message"
                  placeholder={t('sms.messagePlaceholder')}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>
              <Button 
                type="submit" 
                className="w-full"
                disabled={sendSMSMutation.isPending}
              >
                {sendSMSMutation.isPending ? (
                  <ArrowUpDown className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Phone className="mr-2 h-4 w-4" />
                )}
                {t('sms.send')}
              </Button>
            </form>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="howto" className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>{t('sms.howToUse')}</CardTitle>
            <CardDescription>
              {t('sms.howToDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-md bg-muted p-4">
              <h3 className="font-medium">{t('sms.format')}</h3>
              <p className="text-sm text-muted-foreground mt-1">LOAN &lt;amount&gt; &lt;purpose&gt; &lt;duration&gt;</p>
              <div className="mt-2">
                <h4 className="text-sm font-medium">{t('sms.example')}</h4>
                <code className="relative rounded bg-primary/10 px-[0.3rem] py-[0.2rem] font-mono text-sm">
                  LOAN 500 MEDICAL 30
                </code>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium">{t('sms.parameters')}</h3>
              <ul className="mt-2 space-y-1 text-sm">
                <li><strong>LOAN</strong>: {t('sms.loanCommand')}</li>
                <li><strong>{t('sms.amount')}</strong>: {t('sms.amountDescription')}</li>
                <li><strong>{t('sms.purpose')}</strong>: {t('sms.purposeDescription')}</li>
                <li><strong>{t('sms.duration')}</strong>: {t('sms.durationDescription')}</li>
              </ul>
            </div>
            
            <div className="rounded-md bg-primary/10 p-4">
              <h3 className="font-medium">{t('sms.note')}</h3>
              <p className="text-sm mt-1">{t('sms.noteDescription')}</p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

interface SMSLoanListProps {
  loans: Loan[];
}

export function EmergencyLoans({ loans }: SMSLoanListProps) {
  const { t } = useTranslation();
  const emergencyLoans = loans.filter(loan => loan.isEmergency === true);

  if (emergencyLoans.length === 0) {
    return (
      <div className="text-center p-4 bg-muted rounded-md">
        <MessageSquare className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
        <p className="text-muted-foreground">{t('sms.noEmergencyLoans')}</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {emergencyLoans.map(loan => (
        <Card key={loan.id} className="border-l-4 border-l-red-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex justify-between">
              <span>₹{loan.amount} - {loan.purpose}</span>
              <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
                {t('sms.emergency')}
              </span>
            </CardTitle>
            <CardDescription>
              ID: {loan.id} · {loan.duration} {t('loans.days')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              <p><strong>{t('sms.requestMethod')}:</strong> SMS</p>
              <p><strong>{t('loans.status')}:</strong> {loan.status}</p>
              <p><strong>{t('loans.interestRate')}:</strong> {loan.interestRate}%</p>
            </div>
            <Button variant="outline" size="sm" className="mt-2">
              {t('loans.viewDetails')}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}