import { db } from "./db";
import { 
  User, InsertUser, 
  Loan, InsertLoan, 
  Transaction, InsertTransaction, 
  TrustConnection, InsertTrustConnection, 
  Badge, InsertBadge,
  users, loans, transactions, trustConnections, badges
} from "@shared/schema";
import { and, eq, or, desc, isNull, sql, gt, asc } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import pg from "pg";

// Create a session store that uses PostgreSQL
const PostgresSessionStore = connectPg(session);

// Create a connection pool to the same database
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

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
  
  // Initialize data
  initializeDefaultBadges(): Promise<void>;
  importMockData(mockData: any): Promise<void>;
  
  // Session store
  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;
  
  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true
    });
  }
  
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  
  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }
  
  async getLoan(id: number): Promise<Loan | undefined> {
    const [loan] = await db.select().from(loans).where(eq(loans.id, id));
    return loan;
  }
  
  async getLoansByBorrower(borrowerId: number): Promise<Loan[]> {
    return db
      .select()
      .from(loans)
      .where(eq(loans.borrowerId, borrowerId))
      .orderBy(desc(loans.createdAt));
  }
  
  async getLoansByLender(lenderId: number): Promise<Loan[]> {
    return db
      .select()
      .from(loans)
      .where(eq(loans.lenderId, lenderId))
      .orderBy(desc(loans.createdAt));
  }
  
  async getAvailableLoans(): Promise<Loan[]> {
    return db
      .select()
      .from(loans)
      .where(and(
        eq(loans.status, "requested"),
        isNull(loans.lenderId)
      ))
      .orderBy(desc(loans.createdAt));
  }
  
  async createLoan(insertLoan: InsertLoan): Promise<Loan> {
    const [loan] = await db
      .insert(loans)
      .values({
        ...insertLoan,
        status: "requested",
      })
      .returning();
    return loan;
  }
  
  async updateLoan(id: number, loanData: Partial<Loan>): Promise<Loan | undefined> {
    const [updatedLoan] = await db
      .update(loans)
      .set(loanData)
      .where(eq(loans.id, id))
      .returning();
    return updatedLoan;
  }
  
  async getTransaction(id: number): Promise<Transaction | undefined> {
    const [transaction] = await db
      .select()
      .from(transactions)
      .where(eq(transactions.id, id));
    return transaction;
  }
  
  async getTransactionsByUser(userId: number): Promise<Transaction[]> {
    return db
      .select()
      .from(transactions)
      .where(
        or(
          eq(transactions.fromUserId, userId),
          eq(transactions.toUserId, userId)
        )
      )
      .orderBy(desc(transactions.timestamp));
  }
  
  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const [transaction] = await db
      .insert(transactions)
      .values(insertTransaction)
      .returning();
    return transaction;
  }
  
  async getTrustConnection(userId: number, trustedUserId: number): Promise<TrustConnection | undefined> {
    const [connection] = await db
      .select()
      .from(trustConnections)
      .where(
        and(
          eq(trustConnections.userId, userId),
          eq(trustConnections.trustedUserId, trustedUserId)
        )
      );
    return connection;
  }
  
  async getTrustConnectionsByUser(userId: number): Promise<TrustConnection[]> {
    return db
      .select()
      .from(trustConnections)
      .where(eq(trustConnections.userId, userId))
      .orderBy(desc(trustConnections.score));
  }
  
  async createTrustConnection(insertConnection: InsertTrustConnection): Promise<TrustConnection> {
    const [connection] = await db
      .insert(trustConnections)
      .values(insertConnection)
      .returning();
    return connection;
  }
  
  async updateTrustConnection(id: number, connectionData: Partial<TrustConnection>): Promise<TrustConnection | undefined> {
    const [updatedConnection] = await db
      .update(trustConnections)
      .set(connectionData)
      .where(eq(trustConnections.id, id))
      .returning();
    return updatedConnection;
  }
  
  async getBadge(id: number): Promise<Badge | undefined> {
    const [badge] = await db
      .select()
      .from(badges)
      .where(eq(badges.id, id));
    return badge;
  }
  
  async getAllBadges(): Promise<Badge[]> {
    return db
      .select()
      .from(badges)
      .orderBy(asc(badges.id));
  }
  
  async createBadge(insertBadge: InsertBadge): Promise<Badge> {
    const [badge] = await db
      .insert(badges)
      .values(insertBadge)
      .returning();
    return badge;
  }
  
  async getCommunityMembers(): Promise<User[]> {
    return db
      .select()
      .from(users)
      .orderBy(desc(users.trustScore));
  }
  
  async initializeDefaultBadges(): Promise<void> {
    const defaultBadges = [
      {
        name: "Early Adopter",
        description: "Joined the platform during its early stage",
        icon: "🚀",
        requirement: "Joined before 100 users",
      },
      {
        name: "Trusted Member",
        description: "Achieved a trust score of 75+",
        icon: "🛡️",
        requirement: "Trust score >= 75",
      },
      {
        name: "Community Pillar",
        description: "Established 10+ trust connections",
        icon: "🏛️",
        requirement: "10+ trust connections",
      },
      {
        name: "Generous Lender",
        description: "Funded 5+ loans",
        icon: "💰",
        requirement: "Funded 5+ loans",
      },
      {
        name: "Perfect Repayment",
        description: "Repaid 3+ loans on time",
        icon: "✅",
        requirement: "Repaid 3+ loans",
      },
      {
        name: "Financial Lifeline",
        description: "Provided emergency loan funding within 24 hours",
        icon: "⚡",
        requirement: "Funded loan within 24 hours of request",
      },
      {
        name: "Local Hero",
        description: "Funded loans to 5+ people in your locality",
        icon: "🏆",
        requirement: "Funded 5+ local loans",
      }
    ];
    
    // Check if badges already exist
    const existingBadges = await this.getAllBadges();
    if (existingBadges.length === 0) {
      // Insert all badges
      await db.insert(badges).values(defaultBadges);
      console.log("Default badges created successfully");
    } else {
      console.log("Badges already exist, skipping creation");
    }
  }
  
  async importMockData(mockData: {
    users: Map<number, User>;
    loans: Map<number, Loan>;
    transactions: Map<number, Transaction>;
    trustConnections: Map<number, TrustConnection>;
  }): Promise<void> {
    // Import users
    const usersMap = new Map<number, number>();
    
    // mockData.users is a Map, so we need to convert it to an array of values
    const users = Array.from(mockData.users.values());
    
    for (const user of users as User[]) {
      try {
        const insertedUser = await this.createUser({
          username: user.username,
          password: user.password, // Note: This is just for mock data
          fullName: user.fullName,
          email: user.email,
          phoneNumber: user.phoneNumber,
          location: user.location,
          language: user.language || "en"
        });
        
        // Update trust score, balance and other fields
        await this.updateUser(insertedUser.id, {
          trustScore: user.trustScore,
          balance: user.balance,
          totalLent: user.totalLent,
          achievedBadges: user.achievedBadges
        });
        
        // Map old ID to new ID
        usersMap.set(user.id, insertedUser.id);
      } catch (error) {
        console.error(`Error importing user ${user.username}:`, error);
      }
    }
    
    console.log(`Imported ${usersMap.size} users`);
    
    // Import loans
    const loansMap = new Map<number, number>();
    
    // Convert loans Map to array
    const loans = Array.from(mockData.loans.values());
    
    for (const loan of loans as Loan[]) {
      try {
        const newBorrowerId = usersMap.get(loan.borrowerId);
        if (!newBorrowerId) continue;
        
        const insertedLoan = await this.createLoan({
          amount: loan.amount,
          duration: loan.duration,
          interestRate: loan.interestRate,
          purpose: loan.purpose,
          borrowerId: newBorrowerId
        });
        
        // Update loan status and other fields
        const newLenderId = loan.lenderId ? usersMap.get(loan.lenderId) : null;
        
        await this.updateLoan(insertedLoan.id, {
          status: loan.status,
          lenderId: newLenderId,
          requestedAt: loan.requestedAt,
          fundedAt: loan.fundedAt,
          repaidAt: loan.repaidAt,
          hash: loan.hash
        });
        
        // Map old ID to new ID
        loansMap.set(loan.id, insertedLoan.id);
      } catch (error) {
        console.error(`Error importing loan for purpose ${loan.purpose}:`, error);
      }
    }
    
    console.log(`Imported ${loansMap.size} loans`);
    
    // Import transactions
    const transactionsMap = new Map<number, number>();
    
    // Convert transactions Map to array
    const transactions = Array.from(mockData.transactions.values());
    
    for (const transaction of transactions as Transaction[]) {
      try {
        const newFromUserId = usersMap.get(transaction.fromUserId);
        const newToUserId = usersMap.get(transaction.toUserId);
        const newLoanId = loansMap.get(transaction.loanId);
        
        if (!newFromUserId || !newToUserId || !newLoanId) continue;
        
        const insertedTransaction = await this.createTransaction({
          fromUserId: newFromUserId,
          toUserId: newToUserId,
          loanId: newLoanId,
          amount: transaction.amount,
          type: transaction.type,
          status: transaction.status,
          // timestamp is handled by the database with DEFAULT NOW()
          hash: transaction.hash
        });
        
        // Map old ID to new ID
        transactionsMap.set(transaction.id, insertedTransaction.id);
      } catch (error) {
        console.error(`Error importing transaction:`, error);
      }
    }
    
    console.log(`Imported ${transactionsMap.size} transactions`);
    
    // Import trust connections
    const trustConnectionsMap = new Map<number, number>();
    
    // Convert trustConnections Map to array
    const trustConnections = Array.from(mockData.trustConnections.values());
    
    for (const connection of trustConnections as TrustConnection[]) {
      try {
        const newUserId = usersMap.get(connection.userId);
        const newTrustedUserId = usersMap.get(connection.trustedUserId);
        
        if (!newUserId || !newTrustedUserId) continue;
        
        const insertedConnection = await this.createTrustConnection({
          userId: newUserId,
          trustedUserId: newTrustedUserId,
          score: connection.score
        });
        
        // Map old ID to new ID
        trustConnectionsMap.set(connection.id, insertedConnection.id);
      } catch (error) {
        console.error(`Error importing trust connection:`, error);
      }
    }
    
    console.log(`Imported ${trustConnectionsMap.size} trust connections`);
  }
}

// Create an instance of DatabaseStorage for use in the app
export const storage = new DatabaseStorage();