import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage-new";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication
  setupAuth(app);

  // Get available loans
  app.get("/api/loans/available", async (req, res) => {
    try {
      const loans = await storage.getAvailableLoans();
      res.json(loans);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch available loans" });
    }
  });

  // Get borrowed loans
  app.get("/api/loans/borrowed", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    
    try {
      const loans = await storage.getLoansByBorrower(req.user!.id);
      res.json(loans);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch borrowed loans" });
    }
  });

  // Get lent loans
  app.get("/api/loans/lent", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    
    try {
      const loans = await storage.getLoansByLender(req.user!.id);
      res.json(loans);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch lent loans" });
    }
  });

  // Create loan
  app.post("/api/loans", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    
    try {
      const loan = await storage.createLoan({
        ...req.body,
        borrowerId: req.user!.id
      });
      
      res.status(201).json(loan);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to create loan" });
    }
  });

  // Fund loan
  app.post("/api/loans/:id/fund", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    
    try {
      const loanId = parseInt(req.params.id);
      const loan = await storage.getLoan(loanId);
      
      if (!loan) {
        return res.status(404).json({ error: "Loan not found" });
      }
      
      if (loan.status !== "requested") {
        return res.status(400).json({ error: "Loan is not available for funding" });
      }
      
      if (loan.borrowerId === req.user!.id) {
        return res.status(400).json({ error: "Cannot fund your own loan" });
      }
      
      const lender = await storage.getUser(req.user!.id);
      if (!lender || lender.balance < loan.amount) {
        return res.status(400).json({ error: "Insufficient balance" });
      }
      
      // Update loan
      const updatedLoan = await storage.updateLoan(loanId, {
        lenderId: req.user!.id,
        status: "funded",
        fundedAt: new Date(),
        hash: `0x${Math.random().toString(16).substring(2, 10)}...`
      });
      
      // Update lender's balance
      await storage.updateUser(req.user!.id, {
        balance: lender.balance - loan.amount,
        totalLent: lender.totalLent + loan.amount
      });
      
      // Update borrower's balance
      const borrower = await storage.getUser(loan.borrowerId);
      if (borrower) {
        await storage.updateUser(loan.borrowerId, {
          balance: borrower.balance + loan.amount
        });
      }
      
      // Create transaction
      await storage.createTransaction({
        loanId,
        fromUserId: req.user!.id,
        toUserId: loan.borrowerId,
        amount: loan.amount,
        type: "loan_funding",
        status: "completed",
        hash: updatedLoan!.hash!
      });
      
      res.json(updatedLoan);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fund loan" });
    }
  });

  // Repay loan
  app.post("/api/loans/:id/repay", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    
    try {
      const loanId = parseInt(req.params.id);
      const loan = await storage.getLoan(loanId);
      
      if (!loan) {
        return res.status(404).json({ error: "Loan not found" });
      }
      
      if (loan.status !== "funded") {
        return res.status(400).json({ error: "Loan is not active" });
      }
      
      if (loan.borrowerId !== req.user!.id) {
        return res.status(400).json({ error: "You can only repay your own loans" });
      }
      
      const borrower = req.user!;
      const repaymentAmount = loan.amount + (loan.amount * loan.interestRate / 100);
      
      if (borrower.balance < repaymentAmount) {
        return res.status(400).json({ error: "Insufficient balance" });
      }
      
      // Update loan
      const updatedLoan = await storage.updateLoan(loanId, {
        status: "repaid",
        repaidAt: new Date()
      });
      
      // Update borrower's balance
      await storage.updateUser(borrower.id, {
        balance: borrower.balance - repaymentAmount,
        trustScore: Math.min(borrower.trustScore + 2, 100) // Increase trust score for repayment
      });
      
      // Update lender's balance
      const lender = await storage.getUser(loan.lenderId!);
      if (lender) {
        await storage.updateUser(lender.id, {
          balance: lender.balance + repaymentAmount
        });
      }
      
      // Create transaction
      await storage.createTransaction({
        loanId,
        fromUserId: borrower.id,
        toUserId: loan.lenderId!,
        amount: repaymentAmount,
        type: "loan_repayment",
        status: "completed",
        hash: `0x${Math.random().toString(16).substring(2, 10)}...`
      });
      
      res.json(updatedLoan);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to repay loan" });
    }
  });

  // Get badges
  app.get("/api/badges", async (req, res) => {
    try {
      const badges = await storage.getAllBadges();
      res.json(badges);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch badges" });
    }
  });

  // Get transactions by user
  app.get("/api/transactions", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    
    try {
      const transactions = await storage.getTransactionsByUser(req.user!.id);
      res.json(transactions);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch transactions" });
    }
  });

  // Update profile
  app.patch("/api/profile", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    
    try {
      const updatedUser = await storage.updateUser(req.user!.id, req.body);
      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // Don't return the password
      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to update profile" });
    }
  });

  // Get community members
  app.get("/api/community", async (req, res) => {
    try {
      const members = await storage.getCommunityMembers();
      res.json(members);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch community members" });
    }
  });

  // Get trust connections
  app.get("/api/trust-connections", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    
    try {
      const connections = await storage.getTrustConnectionsByUser(req.user!.id);
      res.json(connections);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch trust connections" });
    }
  });

  // Create trust connection
  app.post("/api/trust-connections", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    
    try {
      const { trustedUserId, score } = req.body;
      
      // Check if connection already exists
      const existingConnection = await storage.getTrustConnection(req.user!.id, trustedUserId);
      if (existingConnection) {
        return res.status(400).json({ error: "Connection already exists" });
      }
      
      const connection = await storage.createTrustConnection({
        userId: req.user!.id,
        trustedUserId,
        score
      });
      
      res.status(201).json(connection);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to create trust connection" });
    }
  });

  // Get specific user (for loan details)
  app.get("/api/users/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // Don't return the password
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
