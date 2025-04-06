import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { hashTransaction } from "./blockchain";
import { z } from "zod";
import { insertLoanSchema, insertTrustConnectionSchema } from "@shared/schema";
import { handleIncomingSMS, sendSMS } from "./sms";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // API routes
  // ===========================================================
  
  // User routes
  // ------------------------------------
  
  // Get current user's profile
  app.get("/api/profile", (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    res.json(req.user);
  });
  
  // Update user profile
  app.patch("/api/profile", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    
    try {
      const updatedUser = await storage.updateUser(req.user!.id, req.body);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(updatedUser);
    } catch (error) {
      res.status(500).json({ message: "Failed to update profile" });
    }
  });
  
  // Loan routes
  // ------------------------------------
  
  // Get all available loans with search, filter, and sort
  app.get("/api/loans/available", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    
    try {
      // Get loans that are in 'requested' status and not created by the current user
      const availableLoans = await storage.getAvailableLoans();
      let filteredLoans = availableLoans.filter(loan => loan.borrowerId !== req.user!.id);
      
      // Search functionality
      const searchQuery = req.query.search as string | undefined;
      if (searchQuery) {
        // Search by purpose or ID
        filteredLoans = filteredLoans.filter(loan => 
          loan.purpose.toLowerCase().includes(searchQuery.toLowerCase()) ||
          loan.id.toString().includes(searchQuery)
        );
      }
      
      // Filter by amount range
      const minAmount = req.query.minAmount ? parseFloat(req.query.minAmount as string) : undefined;
      const maxAmount = req.query.maxAmount ? parseFloat(req.query.maxAmount as string) : undefined;
      
      console.log(`Filtering loans - minAmount: ${minAmount}, maxAmount: ${maxAmount}`);
      
      if (minAmount !== undefined && !isNaN(minAmount)) {
        console.log(`Filtering loans with amount >= ${minAmount}`);
        filteredLoans = filteredLoans.filter(loan => loan.amount >= minAmount);
      }
      
      if (maxAmount !== undefined && !isNaN(maxAmount)) {
        console.log(`Before maxAmount filter: ${filteredLoans.length} loans. Filtering loans with amount <= ${maxAmount}`);
        const preFilterCount = filteredLoans.length;
        filteredLoans = filteredLoans.filter(loan => loan.amount <= maxAmount);
        console.log(`After maxAmount filter: ${filteredLoans.length} loans (removed ${preFilterCount - filteredLoans.length})`);
      }
      
      // Filter by duration
      const maxDuration = req.query.maxDuration ? parseInt(req.query.maxDuration as string) : undefined;
      if (maxDuration !== undefined && !isNaN(maxDuration)) {
        console.log(`Before maxDuration filter: ${filteredLoans.length} loans. Filtering loans with duration <= ${maxDuration}`);
        const preFilterCount = filteredLoans.length;
        filteredLoans = filteredLoans.filter(loan => loan.duration <= maxDuration);
        console.log(`After maxDuration filter: ${filteredLoans.length} loans (removed ${preFilterCount - filteredLoans.length})`);
      }
      
      // Filter by emergency status
      const emergency = req.query.emergency;
      if (emergency === 'true') {
        console.log(`Before emergency filter: ${filteredLoans.length} loans. Filtering emergency loans only.`);
        const preFilterCount = filteredLoans.length;
        filteredLoans = filteredLoans.filter(loan => loan.isEmergency === true);
        console.log(`After emergency filter: ${filteredLoans.length} loans (removed ${preFilterCount - filteredLoans.length})`);
      } else if (emergency === 'false') {
        console.log(`Before non-emergency filter: ${filteredLoans.length} loans. Filtering non-emergency loans only.`);
        const preFilterCount = filteredLoans.length;
        filteredLoans = filteredLoans.filter(loan => loan.isEmergency === false);
        console.log(`After non-emergency filter: ${filteredLoans.length} loans (removed ${preFilterCount - filteredLoans.length})`);
      }
      
      // Sort functionality
      const sortBy = req.query.sortBy as string | undefined;
      const sortDir = req.query.sortDir as 'asc' | 'desc' | undefined || 'asc';
      
      if (sortBy) {
        filteredLoans.sort((a, b) => {
          let comparison = 0;
          
          switch(sortBy) {
            case 'amount':
              comparison = a.amount - b.amount;
              break;
            case 'duration':
              comparison = a.duration - b.duration;
              break;
            case 'interest':
              comparison = a.interestRate - b.interestRate;
              break;
            case 'date':
              // Safely handle potentially null dates
              const aTime = a.requestedAt ? new Date(a.requestedAt).getTime() : 0;
              const bTime = b.requestedAt ? new Date(b.requestedAt).getTime() : 0;
              comparison = aTime - bTime;
              break;
            default:
              comparison = 0;
          }
          
          return sortDir === 'desc' ? -comparison : comparison;
        });
      }
      
      res.json(filteredLoans);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch available loans" });
    }
  });
  
  // Get loans borrowed by current user
  app.get("/api/loans/borrowed", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    
    try {
      const loans = await storage.getLoansByBorrower(req.user!.id);
      res.json(loans);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch borrowed loans" });
    }
  });
  
  // Get loans lent by current user
  app.get("/api/loans/lent", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    
    try {
      const loans = await storage.getLoansByLender(req.user!.id);
      res.json(loans);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch lent loans" });
    }
  });
  
  // Create a new loan request
  app.post("/api/loans", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    
    try {
      const validatedData = insertLoanSchema.parse({
        ...req.body,
        borrowerId: req.user!.id
      });
      
      const loan = await storage.createLoan(validatedData);
      res.status(201).json(loan);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid loan data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create loan request" });
    }
  });
  
  // Fund a loan (lend money)
  app.post("/api/loans/:id/fund", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    
    try {
      const loanId = parseInt(req.params.id);
      const loan = await storage.getLoan(loanId);
      
      if (!loan) {
        return res.status(404).json({ message: "Loan not found" });
      }
      
      if (loan.status !== "requested") {
        return res.status(400).json({ message: "Loan is not available for funding" });
      }
      
      if (loan.borrowerId === req.user!.id) {
        return res.status(400).json({ message: "You cannot fund your own loan request" });
      }
      
      const lender = await storage.getUser(req.user!.id);
      if (!lender || lender.balance < loan.amount) {
        return res.status(400).json({ message: "Insufficient balance" });
      }
      
      // Create a hash for the transaction (simulating blockchain)
      const transactionHash = hashTransaction({
        from: req.user!.id,
        to: loan.borrowerId,
        amount: loan.amount,
        timestamp: new Date()
      });
      
      // Update loan status
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + loan.duration);
      
      const updatedLoan = await storage.updateLoan(loanId, {
        lenderId: req.user!.id,
        status: "funded",
        dueDate,
        transactionHash
      });
      
      // Create transaction record
      await storage.createTransaction({
        loanId,
        fromUserId: req.user!.id,
        toUserId: loan.borrowerId,
        amount: loan.amount,
        type: "loan_funding",
        status: "completed",
        hash: transactionHash
      });
      
      // Update balances
      await storage.updateUser(req.user!.id, {
        balance: lender.balance - loan.amount,
        totalLent: lender.totalLent + loan.amount
      });
      
      const borrower = await storage.getUser(loan.borrowerId);
      if (borrower) {
        await storage.updateUser(loan.borrowerId, {
          balance: borrower.balance + loan.amount
        });
      }
      
      res.json(updatedLoan);
    } catch (error) {
      res.status(500).json({ message: "Failed to fund loan" });
    }
  });
  
  // Repay a loan
  app.post("/api/loans/:id/repay", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    
    try {
      const loanId = parseInt(req.params.id);
      const loan = await storage.getLoan(loanId);
      
      if (!loan) {
        return res.status(404).json({ message: "Loan not found" });
      }
      
      if (loan.status !== "funded") {
        return res.status(400).json({ message: "Loan cannot be repaid in its current state" });
      }
      
      if (loan.borrowerId !== req.user!.id) {
        return res.status(403).json({ message: "You can only repay your own loans" });
      }
      
      const borrower = await storage.getUser(req.user!.id);
      if (!borrower) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Calculate repayment amount with interest
      const principal = loan.amount;
      const interest = (principal * loan.interestRate) / 100;
      const totalAmount = principal + interest;
      
      if (borrower.balance < totalAmount) {
        return res.status(400).json({ message: "Insufficient balance for repayment" });
      }
      
      // Make sure lenderId is not null for repayment
      if (!loan.lenderId) {
        return res.status(400).json({ message: "Cannot repay a loan without a lender" });
      }
      
      // Create a hash for the transaction (simulating blockchain)
      const transactionHash = hashTransaction({
        from: req.user!.id,
        to: loan.lenderId,
        amount: totalAmount,
        timestamp: new Date()
      });
      
      // Update loan status
      const updatedLoan = await storage.updateLoan(loanId, {
        status: "repaid",
        repaymentDate: new Date(),
        transactionHash
      });
      
      // Create transaction record
      await storage.createTransaction({
        loanId,
        fromUserId: req.user!.id,
        toUserId: loan.lenderId!,
        amount: totalAmount,
        type: "loan_repayment",
        status: "completed",
        hash: transactionHash
      });
      
      // Update balances
      await storage.updateUser(req.user!.id, {
        balance: borrower.balance - totalAmount,
        trustScore: borrower.trustScore + 5 // Increase trust score on repayment
      });
      
      const lender = await storage.getUser(loan.lenderId!);
      if (lender) {
        await storage.updateUser(loan.lenderId!, {
          balance: lender.balance + totalAmount,
          trustScore: lender.trustScore + 2 // Small increase for lender too
        });
      }
      
      res.json(updatedLoan);
    } catch (error) {
      res.status(500).json({ message: "Failed to repay loan" });
    }
  });
  
  // Trust connections routes
  // ------------------------------------
  
  // Get user's trust connections
  app.get("/api/trust-connections", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    
    try {
      const connections = await storage.getTrustConnectionsByUser(req.user!.id);
      res.json(connections);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch trust connections" });
    }
  });
  
  // Create a new trust connection
  app.post("/api/trust-connections", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    
    try {
      const validatedData = insertTrustConnectionSchema.parse({
        ...req.body,
        userId: req.user!.id
      });
      
      if (validatedData.userId === validatedData.trustedUserId) {
        return res.status(400).json({ message: "You cannot create a trust connection with yourself" });
      }
      
      // Check if connection already exists
      const existingConnection = await storage.getTrustConnection(req.user!.id, validatedData.trustedUserId);
      if (existingConnection) {
        return res.status(400).json({ message: "Trust connection already exists" });
      }
      
      const connection = await storage.createTrustConnection(validatedData);
      res.status(201).json(connection);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid trust connection data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create trust connection" });
    }
  });
  
  // Community routes
  // ------------------------------------
  
  // Get community members (simple implementation - just get all users except current user)
  app.get("/api/community", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    
    try {
      // This would be more sophisticated in a real app with pagination, search, etc.
      const allUsers = [];
      for (let i = 1; i < 10; i++) {
        const user = await storage.getUser(i);
        if (user && user.id !== req.user!.id) {
          // Don't send password in response
          const { password, ...userWithoutPassword } = user;
          allUsers.push(userWithoutPassword);
        }
      }
      res.json(allUsers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch community members" });
    }
  });
  
  // Badge routes
  // ------------------------------------
  
  // Get all badges
  app.get("/api/badges", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    
    try {
      const badges = await storage.getAllBadges();
      res.json(badges);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch badges" });
    }
  });
  
  // SMS Loan Request Routes
  // ------------------------------------
  
  // Webhook for incoming SMS messages from Twilio
  app.post("/api/sms", handleIncomingSMS);
  
  // Send test SMS
  app.post("/api/send-sms", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    
    try {
      const { to, message } = req.body;
      
      if (!to || !message) {
        return res.status(400).json({ message: "Phone number and message are required" });
      }
      
      const result = await sendSMS(to, message);
      
      if (result) {
        res.json({ success: true, message: "SMS sent successfully" });
      } else {
        res.status(500).json({ message: "Failed to send SMS" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to send SMS" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
