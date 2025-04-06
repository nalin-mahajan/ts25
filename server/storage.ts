import { users, loans, transactions, trustConnections, badges } from "@shared/schema";
import type { User, InsertUser, Loan, InsertLoan, Transaction, InsertTransaction, TrustConnection, InsertTrustConnection, Badge, InsertBadge } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

// Storage interface
export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>; // Added this method
  
  // Loans
  getLoan(id: number): Promise<Loan | undefined>;
  getLoansByBorrower(borrowerId: number): Promise<Loan[]>;
  getLoansByLender(lenderId: number): Promise<Loan[]>;
  getAvailableLoans(): Promise<Loan[]>;
  createLoan(loan: InsertLoan): Promise<Loan>;
  updateLoan(id: number, loan: Partial<Loan>): Promise<Loan | undefined>;
  
  // Transactions
  getTransaction(id: number): Promise<Transaction | undefined>;
  getTransactionsByUser(userId: number): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  
  // Trust Connections
  getTrustConnection(userId: number, trustedUserId: number): Promise<TrustConnection | undefined>;
  getTrustConnectionsByUser(userId: number): Promise<TrustConnection[]>;
  createTrustConnection(connection: InsertTrustConnection): Promise<TrustConnection>;
  updateTrustConnection(id: number, connection: Partial<TrustConnection>): Promise<TrustConnection | undefined>;
  
  // Badges
  getBadge(id: number): Promise<Badge | undefined>;
  getAllBadges(): Promise<Badge[]>;
  createBadge(badge: InsertBadge): Promise<Badge>;
  
  // Session store
  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private loans: Map<number, Loan>;
  private transactions: Map<number, Transaction>;
  private trustConnections: Map<number, TrustConnection>;
  private badges: Map<number, Badge>;
  sessionStore: session.Store;
  
  private userIdCounter: number;
  private loanIdCounter: number;
  private transactionIdCounter: number;
  private trustConnectionIdCounter: number;
  private badgeIdCounter: number;

  constructor() {
    this.users = new Map();
    this.loans = new Map();
    this.transactions = new Map();
    this.trustConnections = new Map();
    this.badges = new Map();
    
    this.userIdCounter = 1;
    this.loanIdCounter = 1;
    this.transactionIdCounter = 1;
    this.trustConnectionIdCounter = 1;
    this.badgeIdCounter = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
    
    // Initialize with default badges
    this.initializeBadges();
  }
  
  private initializeBadges() {
    const defaultBadges = [
      {
        name: "First Loan",
        description: "Successfully received your first loan",
        icon: "fas fa-medal",
        requirement: "Complete first loan"
      },
      {
        name: "Perfect Repayer",
        description: "Repaid all loans on time",
        icon: "fas fa-star",
        requirement: "Repay 3 loans on time"
      },
      {
        name: "Community Helper",
        description: "Helped community members in need",
        icon: "fas fa-heart",
        requirement: "Lend to 5 different borrowers"
      },
      {
        name: "Early Repayer",
        description: "Repaid loans before due date",
        icon: "fas fa-bolt",
        requirement: "Repay 2 loans before due date"
      },
      {
        name: "Network Builder",
        description: "Built a strong trust network",
        icon: "fas fa-users",
        requirement: "Connect with 10 community members"
      },
      {
        name: "Major Lender",
        description: "Provided significant financial help",
        icon: "fas fa-coins",
        requirement: "Lend more than ₹25,000 in total"
      }
    ];
    
    defaultBadges.forEach(badge => {
      this.createBadge(badge);
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const now = new Date();
    const user: User = { 
      ...insertUser, 
      id, 
      trustScore: 50,
      balance: 5000, // Starting balance
      totalLent: 0, 
      language: insertUser.language || 'en',
      achievedBadges: [],
      createdAt: now
    };
    this.users.set(id, user);
    return user;
  }
  
  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Loan methods
  async getLoan(id: number): Promise<Loan | undefined> {
    return this.loans.get(id);
  }
  
  async getLoansByBorrower(borrowerId: number): Promise<Loan[]> {
    return Array.from(this.loans.values()).filter(
      (loan) => loan.borrowerId === borrowerId,
    );
  }
  
  async getLoansByLender(lenderId: number): Promise<Loan[]> {
    return Array.from(this.loans.values()).filter(
      (loan) => loan.lenderId === lenderId,
    );
  }
  
  async getAvailableLoans(): Promise<Loan[]> {
    return Array.from(this.loans.values()).filter(
      (loan) => loan.status === 'requested',
    );
  }
  
  async createLoan(insertLoan: InsertLoan): Promise<Loan> {
    const id = this.loanIdCounter++;
    const now = new Date();
    const loan: Loan = {
      ...insertLoan,
      id,
      lenderId: null,
      status: 'requested',
      dueDate: null,
      repaymentDate: null,
      requestedAt: now,
      fundedAt: null,
      repaidAt: null,
      transactionHash: null,
      hash: null,
      isEmergency: false,
      createdAt: now
    };
    this.loans.set(id, loan);
    return loan;
  }
  
  async updateLoan(id: number, loanData: Partial<Loan>): Promise<Loan | undefined> {
    const loan = this.loans.get(id);
    if (!loan) return undefined;
    
    const updatedLoan = { ...loan, ...loanData };
    this.loans.set(id, updatedLoan);
    return updatedLoan;
  }

  // Transaction methods
  async getTransaction(id: number): Promise<Transaction | undefined> {
    return this.transactions.get(id);
  }
  
  async getTransactionsByUser(userId: number): Promise<Transaction[]> {
    return Array.from(this.transactions.values()).filter(
      (transaction) => transaction.fromUserId === userId || transaction.toUserId === userId,
    );
  }
  
  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = this.transactionIdCounter++;
    const now = new Date();
    const transaction: Transaction = {
      ...insertTransaction,
      id,
      timestamp: now
    };
    this.transactions.set(id, transaction);
    return transaction;
  }

  // Trust Connection methods
  async getTrustConnection(userId: number, trustedUserId: number): Promise<TrustConnection | undefined> {
    return Array.from(this.trustConnections.values()).find(
      (connection) => connection.userId === userId && connection.trustedUserId === trustedUserId,
    );
  }
  
  async getTrustConnectionsByUser(userId: number): Promise<TrustConnection[]> {
    return Array.from(this.trustConnections.values()).filter(
      (connection) => connection.userId === userId,
    );
  }
  
  async createTrustConnection(insertConnection: InsertTrustConnection): Promise<TrustConnection> {
    const id = this.trustConnectionIdCounter++;
    const now = new Date();
    const connection: TrustConnection = {
      ...insertConnection,
      id,
      score: insertConnection.score || 0,
      createdAt: now
    };
    this.trustConnections.set(id, connection);
    return connection;
  }
  
  async updateTrustConnection(id: number, connectionData: Partial<TrustConnection>): Promise<TrustConnection | undefined> {
    const connection = this.trustConnections.get(id);
    if (!connection) return undefined;
    
    const updatedConnection = { ...connection, ...connectionData };
    this.trustConnections.set(id, updatedConnection);
    return updatedConnection;
  }

  // Badge methods
  async getBadge(id: number): Promise<Badge | undefined> {
    return this.badges.get(id);
  }
  
  async getAllBadges(): Promise<Badge[]> {
    return Array.from(this.badges.values());
  }
  
  async createBadge(insertBadge: InsertBadge): Promise<Badge> {
    const id = this.badgeIdCounter++;
    const badge: Badge = {
      ...insertBadge,
      id
    };
    this.badges.set(id, badge);
    return badge;
  }
  
  // Get all users
  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }
}

export const storage = new MemStorage();
