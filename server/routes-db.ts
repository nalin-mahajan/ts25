import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage-db";
import { setupAuth } from "./auth-db";
import { 
  insertLoanSchema, 
  insertTransactionSchema, 
  insertTrustConnectionSchema 
} from "@shared/schema";
import { z } from 'zod';
import { addTransactionToBlockchain, hashTransaction, getBlockchainState, isBlockchainValid } from "./blockchain";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes (/api/register, /api/login, /api/logout, /api/user)
  setupAuth(app);

  // Get all available loans
  app.get("/api/loans/available", async (req, res) => {
    try {
      const loans = await storage.getAvailableLoans();
      res.json(loans);
    } catch (error) {
      console.error("Error fetching available loans:", error);
      res.status(500).json({ error: "Failed to fetch available loans" });
    }
  });

  // Get loans by borrower ID
  app.get("/api/loans/borrower/:id", async (req, res) => {
    try {
      const borrowerId = parseInt(req.params.id);
      const loans = await storage.getLoansByBorrower(borrowerId);
      res.json(loans);
    } catch (error) {
      console.error("Error fetching loans by borrower:", error);
      res.status(500).json({ error: "Failed to fetch loans by borrower" });
    }
  });

  // Get loans by lender ID
  app.get("/api/loans/lender/:id", async (req, res) => {
    try {
      const lenderId = parseInt(req.params.id);
      const loans = await storage.getLoansByLender(lenderId);
      res.json(loans);
    } catch (error) {
      console.error("Error fetching loans by lender:", error);
      res.status(500).json({ error: "Failed to fetch loans by lender" });
    }
  });

  // Get a specific loan by ID
  app.get("/api/loans/:id", async (req, res) => {
    try {
      const loanId = parseInt(req.params.id);
      const loan = await storage.getLoan(loanId);
      
      if (!loan) {
        return res.status(404).json({ error: "Loan not found" });
      }
      
      res.json(loan);
    } catch (error) {
      console.error("Error fetching loan:", error);
      res.status(500).json({ error: "Failed to fetch loan" });
    }
  });

  // Create a new loan request
  app.post("/api/loans", async (req, res) => {
    try {
      const loanData = insertLoanSchema.parse(req.body);
      const loan = await storage.createLoan(loanData);
      res.status(201).json(loan);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid loan data", details: error.errors });
      }
      console.error("Error creating loan:", error);
      res.status(500).json({ error: "Failed to create loan" });
    }
  });

  // Fund a loan (update loan with lender ID)
  app.post("/api/loans/:id/fund", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Authentication required" });
      }
      
      const loanId = parseInt(req.params.id);
      const lenderId = req.body.lenderId;
      
      const loan = await storage.getLoan(loanId);
      if (!loan) {
        return res.status(404).json({ error: "Loan not found" });
      }
      
      if (loan.status !== "requested") {
        return res.status(400).json({ error: "Loan is not available for funding" });
      }
      
      if (loan.borrowerId === lenderId) {
        return res.status(400).json({ error: "Cannot fund your own loan" });
      }
      
      const lender = await storage.getUser(lenderId);
      if (!lender) {
        return res.status(404).json({ error: "Lender not found" });
      }
      
      if (lender.balance < loan.amount) {
        return res.status(400).json({ error: "Insufficient funds" });
      }
      
      // Create a transaction
      const transactionData = {
        fromUserId: lenderId,
        toUserId: loan.borrowerId,
        loanId: loan.id,
        amount: loan.amount,
        type: "funding",
        status: "completed",
        hash: ""
      };
      
      // Hash the transaction (for blockchain)
      const txHash = hashTransaction(transactionData);
      transactionData.hash = txHash;
      
      // Create transaction in the database
      const transaction = await storage.createTransaction(transactionData);
      
      // Add transaction to blockchain
      const blockchainTxId = addTransactionToBlockchain({
        from: lenderId,
        to: loan.borrowerId,
        amount: loan.amount,
        timestamp: new Date(),
        data: { type: "funding", loanId: loan.id }
      });
      
      // Update loan status
      const updatedLoan = await storage.updateLoan(loanId, {
        status: "funded",
        lenderId: lenderId,
        transactionHash: blockchainTxId
      });
      
      // Update user balances
      await storage.updateUser(lenderId, {
        balance: lender.balance - loan.amount,
        totalLent: lender.totalLent + loan.amount
      });
      
      const borrower = await storage.getUser(loan.borrowerId);
      if (borrower) {
        await storage.updateUser(loan.borrowerId, {
          balance: borrower.balance + loan.amount
        });
      }
      
      res.status(200).json({ 
        loan: updatedLoan, 
        transaction 
      });
    } catch (error) {
      console.error("Error funding loan:", error);
      res.status(500).json({ error: "Failed to fund loan" });
    }
  });

  // Repay a loan
  app.post("/api/loans/:id/repay", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Authentication required" });
      }
      
      const loanId = parseInt(req.params.id);
      
      const loan = await storage.getLoan(loanId);
      if (!loan) {
        return res.status(404).json({ error: "Loan not found" });
      }
      
      if (loan.status !== "funded") {
        return res.status(400).json({ error: "Loan cannot be repaid at this time" });
      }
      
      if (!loan.lenderId) {
        return res.status(400).json({ error: "Loan has no lender" });
      }
      
      const repayAmount = loan.amount + (loan.amount * loan.interestRate / 100);
      
      const borrower = await storage.getUser(loan.borrowerId);
      if (!borrower) {
        return res.status(404).json({ error: "Borrower not found" });
      }
      
      if (borrower.balance < repayAmount) {
        return res.status(400).json({ error: "Insufficient funds for repayment" });
      }
      
      // Create a transaction
      const transactionData = {
        fromUserId: loan.borrowerId,
        toUserId: loan.lenderId,
        loanId: loan.id,
        amount: repayAmount,
        type: "repayment",
        status: "completed",
        hash: ""
      };
      
      // Hash the transaction
      const txHash = hashTransaction(transactionData);
      transactionData.hash = txHash;
      
      // Create transaction in the database
      const transaction = await storage.createTransaction(transactionData);
      
      // Add transaction to blockchain
      const blockchainTxId = addTransactionToBlockchain({
        from: loan.borrowerId,
        to: loan.lenderId,
        amount: repayAmount,
        timestamp: new Date(),
        data: { type: "repayment", loanId: loan.id }
      });
      
      // Update loan status
      const updatedLoan = await storage.updateLoan(loanId, {
        status: "repaid",
        repaymentDate: new Date(),
        transactionHash: blockchainTxId
      });
      
      // Update user balances
      await storage.updateUser(loan.borrowerId, {
        balance: borrower.balance - repayAmount
      });
      
      const lender = await storage.getUser(loan.lenderId);
      if (lender) {
        await storage.updateUser(loan.lenderId, {
          balance: lender.balance + repayAmount
        });
      }
      
      res.status(200).json({ 
        loan: updatedLoan, 
        transaction 
      });
    } catch (error) {
      console.error("Error repaying loan:", error);
      res.status(500).json({ error: "Failed to repay loan" });
    }
  });

  // Get transactions by user ID
  app.get("/api/transactions/user/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const transactions = await storage.getTransactionsByUser(userId);
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching user transactions:", error);
      res.status(500).json({ error: "Failed to fetch user transactions" });
    }
  });

  // Get a specific transaction by ID
  app.get("/api/transactions/:id", async (req, res) => {
    try {
      const transactionId = parseInt(req.params.id);
      const transaction = await storage.getTransaction(transactionId);
      
      if (!transaction) {
        return res.status(404).json({ error: "Transaction not found" });
      }
      
      res.json(transaction);
    } catch (error) {
      console.error("Error fetching transaction:", error);
      res.status(500).json({ error: "Failed to fetch transaction" });
    }
  });

  // Get trust connections for a user
  app.get("/api/trust-connections/user/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const connections = await storage.getTrustConnectionsByUser(userId);
      res.json(connections);
    } catch (error) {
      console.error("Error fetching trust connections:", error);
      res.status(500).json({ error: "Failed to fetch trust connections" });
    }
  });

  // Create a new trust connection
  app.post("/api/trust-connections", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Authentication required" });
      }
      
      const connectionData = insertTrustConnectionSchema.parse(req.body);
      
      // Check if already exists
      const existingConnection = await storage.getTrustConnection(
        connectionData.userId, 
        connectionData.trustedUserId
      );
      
      if (existingConnection) {
        return res.status(400).json({ error: "Trust connection already exists" });
      }
      
      // Cannot trust yourself
      if (connectionData.userId === connectionData.trustedUserId) {
        return res.status(400).json({ error: "Cannot create trust connection with yourself" });
      }
      
      const connection = await storage.createTrustConnection(connectionData);
      res.status(201).json(connection);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid trust connection data", details: error.errors });
      }
      console.error("Error creating trust connection:", error);
      res.status(500).json({ error: "Failed to create trust connection" });
    }
  });

  // Update a trust connection
  app.patch("/api/trust-connections/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Authentication required" });
      }
      
      const connectionId = parseInt(req.params.id);
      const connectionData = req.body;
      
      // Only allow updating the trust score
      if (Object.keys(connectionData).some(key => key !== "score")) {
        return res.status(400).json({ error: "Only the trust score can be updated" });
      }
      
      const updatedConnection = await storage.updateTrustConnection(connectionId, connectionData);
      
      if (!updatedConnection) {
        return res.status(404).json({ error: "Trust connection not found" });
      }
      
      res.json(updatedConnection);
    } catch (error) {
      console.error("Error updating trust connection:", error);
      res.status(500).json({ error: "Failed to update trust connection" });
    }
  });

  // Get all badges
  app.get("/api/badges", async (req, res) => {
    try {
      const badges = await storage.getAllBadges();
      res.json(badges);
    } catch (error) {
      console.error("Error fetching badges:", error);
      res.status(500).json({ error: "Failed to fetch badges" });
    }
  });

  // Get community members (all users)
  app.get("/api/community", async (req, res) => {
    try {
      const members = await storage.getCommunityMembers();
      res.json(members);
    } catch (error) {
      console.error("Error fetching community members:", error);
      res.status(500).json({ error: "Failed to fetch community members" });
    }
  });

  // Get blockchain state (debugging/admin)
  app.get("/api/blockchain/state", (req, res) => {
    try {
      const state = getBlockchainState();
      res.json(state);
    } catch (error) {
      console.error("Error fetching blockchain state:", error);
      res.status(500).json({ error: "Failed to fetch blockchain state" });
    }
  });

  // Validate blockchain (debugging/admin)
  app.get("/api/blockchain/validate", (req, res) => {
    try {
      const isValid = isBlockchainValid();
      res.json({ valid: isValid });
    } catch (error) {
      console.error("Error validating blockchain:", error);
      res.status(500).json({ error: "Failed to validate blockchain" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}