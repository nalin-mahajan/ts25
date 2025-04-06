import { users as usersSchema, loans as loansSchema, transactions as transactionsSchema, trustConnections as trustConnectionsSchema, badges as badgesSchema } from "@shared/schema";
import type { User, InsertUser, Loan, InsertLoan, Transaction, InsertTransaction, TrustConnection, InsertTrustConnection, Badge, InsertBadge } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import { generateMockData } from "./mock-data";

const MemoryStore = createMemoryStore(session);

// Storage interface
export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User | undefined>;
  
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
  
  // Community
  getCommunityMembers(): Promise<User[]>;
  
  // Session store
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private loans: Map<number, Loan>;
  private transactions: Map<number, Transaction>;
  private trustConnections: Map<number, TrustConnection>;
  private badges: Map<number, Badge>;
  sessionStore: session.SessionStore;
  
  private userIdCounter: number;
  private loanIdCounter: number;
  private transactionIdCounter: number;
  private trustConnectionIdCounter: number;
  private badgeIdCounter: number;

  constructor() {
    this.badges = new Map();
    
    // Initialize with default badges
    this.initializeBadges();
    
    // Generate mock data
    const mockData = generateMockData();
    
    this.users = mockData.users;
    this.loans = mockData.loans;
    this.transactions = mockData.transactions;
    this.trustConnections = mockData.trustConnections;
    
    this.userIdCounter = 101; // Next ID will be 101
    this.loanIdCounter = 201; // Next ID will be 201
    this.transactionIdCounter = mockData.transactions.size + 1;
    this.trustConnectionIdCounter = mockData.trustConnections.size + 1;
    this.badgeIdCounter = this.badges.size + 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
    
    console.log(`Initialized mock data with ${this.users.size} users, ${this.loans.size} loans, ${this.transactions.size} transactions, and ${this.trustConnections.size} trust connections`);
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
        requirement: "Lend more than ₹50,000 in total"
      }
    ];
    
    defaultBadges.forEach((badge, index) => {
      this.badges.set(index + 1, {
        id: index + 1,
        ...badge,
        createdAt: new Date()
      });
    });
  }
  
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    
    const user: User = { 
      id,
      ...insertUser,
      trustScore: 50, // Default trust score for new users
      balance: 5000, // Default starting balance
      totalLent: 0, // New users haven't lent any money yet
      achievedBadges: [], // New users don't have any badges yet
      createdAt: new Date()
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
  
  async getLoan(id: number): Promise<Loan | undefined> {
    return this.loans.get(id);
  }
  
  async getLoansByBorrower(borrowerId: number): Promise<Loan[]> {
    return Array.from(this.loans.values()).filter(loan => loan.borrowerId === borrowerId);
  }
  
  async getLoansByLender(lenderId: number): Promise<Loan[]> {
    return Array.from(this.loans.values()).filter(loan => loan.lenderId === lenderId);
  }
  
  async getAvailableLoans(): Promise<Loan[]> {
    return Array.from(this.loans.values()).filter(loan => loan.status === "requested");
  }
  
  async createLoan(insertLoan: InsertLoan): Promise<Loan> {
    const id = this.loanIdCounter++;
    
    const loan: Loan = {
      id,
      ...insertLoan,
      lenderId: null, // Newly created loans don't have a lender yet
      status: "requested", // Initial status is "requested"
      requestedAt: new Date(),
      fundedAt: null,
      repaidAt: null,
      hash: null
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
  
  async getTransaction(id: number): Promise<Transaction | undefined> {
    return this.transactions.get(id);
  }
  
  async getTransactionsByUser(userId: number): Promise<Transaction[]> {
    return Array.from(this.transactions.values()).filter(transaction => 
      transaction.fromUserId === userId || transaction.toUserId === userId
    );
  }
  
  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = this.transactionIdCounter++;
    
    const transaction: Transaction = {
      id,
      ...insertTransaction,
      timestamp: new Date()
    };
    
    this.transactions.set(id, transaction);
    return transaction;
  }
  
  async getTrustConnection(userId: number, trustedUserId: number): Promise<TrustConnection | undefined> {
    return Array.from(this.trustConnections.values()).find(
      connection => connection.userId === userId && connection.trustedUserId === trustedUserId
    );
  }
  
  async getTrustConnectionsByUser(userId: number): Promise<TrustConnection[]> {
    return Array.from(this.trustConnections.values()).filter(
      connection => connection.userId === userId
    );
  }
  
  async createTrustConnection(insertConnection: InsertTrustConnection): Promise<TrustConnection> {
    const id = this.trustConnectionIdCounter++;
    
    const connection: TrustConnection = {
      id,
      ...insertConnection,
      createdAt: new Date()
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
  
  async getBadge(id: number): Promise<Badge | undefined> {
    return this.badges.get(id);
  }
  
  async getAllBadges(): Promise<Badge[]> {
    return Array.from(this.badges.values());
  }
  
  async createBadge(insertBadge: InsertBadge): Promise<Badge> {
    const id = this.badgeIdCounter++;
    
    const badge: Badge = {
      id,
      ...insertBadge,
      createdAt: new Date()
    };
    
    this.badges.set(id, badge);
    return badge;
  }
  
  async getCommunityMembers(): Promise<User[]> {
    // Return all users except for the password field
    return Array.from(this.users.values()).map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword as User;
    });
  }
}

export const storage = new MemStorage();
