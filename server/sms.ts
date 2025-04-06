import twilio from 'twilio';
import { Request, Response } from 'express';
import { storage } from './storage';
import { smsLoanRequestSchema } from '@shared/schema';
import { z } from 'zod';
import { addTransactionToBlockchain } from './blockchain';

// Initialize Twilio client
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

// Check if Twilio credentials are provided
if (!accountSid || !authToken || !twilioPhone) {
  console.warn('Twilio credentials missing. SMS functionality will not work correctly.');
}

// Initialize Twilio client
let client: any = null;
try {
  if (accountSid && authToken) {
    client = twilio(accountSid, authToken);
    console.log('Twilio client initialized successfully');
  }
} catch (error) {
  console.error('Failed to initialize Twilio client:', error);
}

// Extended schema for SMS input with coercion
const smsParsedSchema = smsLoanRequestSchema.extend({
  amount: z.coerce.number().positive(),
  duration: z.coerce.number().int().positive(),
});

// Handle incoming SMS
export async function handleIncomingSMS(req: Request, res: Response) {
  try {
    const { Body, From } = req.body;
    
    // Only process messages that start with "LOAN"
    if (!Body || typeof Body !== 'string' || !Body.trim().toUpperCase().startsWith('LOAN')) {
      await sendSMS(
        From,
        'Invalid format. To request a loan, send: LOAN <amount> <purpose> <duration in days>'
      );
      return res.sendStatus(200);
    }

    // Parse the SMS format
    const parts = Body.trim().split(' ');
    if (parts.length < 4) {
      await sendSMS(
        From,
        'Missing information. Format: LOAN <amount> <purpose> <duration in days>'
      );
      return res.sendStatus(200);
    }

    const amount = Number(parts[1]);
    const purpose = parts[2];
    const duration = Number(parts[3]);
    
    // Find user by phone number
    const user = await getUserByPhone(From);
    
    if (!user) {
      await sendSMS(
        From,
        'You need to register first. Please download our app or visit our website.'
      );
      return res.sendStatus(200);
    }

    // Validate request
    const loanRequest = smsParsedSchema.parse({
      amount,
      purpose,
      duration,
      phoneNumber: From
    });

    // Create the loan
    const loan = await storage.createLoan({
      borrowerId: user.id,
      amount: loanRequest.amount,
      purpose: loanRequest.purpose.toUpperCase(),
      duration: loanRequest.duration,
      interestRate: 5, // Default interest rate
    });
    
    // Update loan to add emergency status
    await storage.updateLoan(loan.id, {
      status: 'requested', // Make sure to use the correct status as defined in the schema
      isEmergency: true // SMS requests are treated as emergency by default
    });

    // Record in blockchain
    const transactionHash = addTransactionToBlockchain({
      from: 0, // System
      to: user.id,
      amount: 0,
      timestamp: new Date(),
      data: {
        type: 'LOAN_REQUEST',
        loanId: loan.id,
        method: 'SMS'
      }
    });

    // Send confirmation
    await sendSMS(
      From,
      `Loan request for ${amount} received. Your loan ID is ${loan.id}. We'll notify you when it's approved.`
    );

    return res.sendStatus(200);
  } catch (error) {
    console.error('SMS Processing Error:', error);
    return res.status(500).json({ error: 'Failed to process SMS' });
  }
}

// Send SMS reply
export async function sendSMS(to: string, message: string) {
  try {
    // Check if client is initialized
    if (!client) {
      console.error('Twilio client not initialized. Cannot send SMS.');
      return false;
    }
    
    await client.messages.create({
      body: message,
      from: twilioPhone,
      to
    });
    console.log(`SMS sent successfully to ${to}`);
    return true;
  } catch (error) {
    console.error('Failed to send SMS:', error);
    return false;
  }
}

// Utility to find user by phone number
async function getUserByPhone(phone: string) {
  // Get all users
  const users = await storage.getAllUsers();
  return users.find((user: any) => user.phoneNumber === normalizePhone(phone));
}

// Normalize phone number (remove spaces, dashes, etc.)
function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, '');
}