import { pgTable, text, serial, integer, boolean, real, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  phoneNumber: text("phone_number").notNull(),
  location: text("location").notNull(),
  trustScore: integer("trust_score").default(50).notNull(),
  balance: real("balance").default(0).notNull(),
  totalLent: real("total_lent").default(0).notNull(),
  language: text("language").default("en").notNull(),
  achievedBadges: jsonb("achieved_badges").default([]).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Loans
export const loans = pgTable("loans", {
  id: serial("id").primaryKey(),
  amount: real("amount").notNull(),
  duration: integer("duration").notNull(), // in days
  interestRate: real("interest_rate").notNull(),
  purpose: text("purpose").notNull(),
  borrowerId: integer("borrower_id").notNull(),
  lenderId: integer("lender_id"),
  status: text("status").notNull(), // 'requested', 'funded', 'repaid', 'defaulted'
  dueDate: timestamp("due_date"),
  repaymentDate: timestamp("repayment_date"),
  requestedAt: timestamp("requested_at").defaultNow(),
  fundedAt: timestamp("funded_at"),
  repaidAt: timestamp("repaid_at"),
  transactionHash: text("transaction_hash"),
  hash: text("hash"),
  isEmergency: boolean("is_emergency").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Transactions
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  loanId: integer("loan_id").notNull(),
  fromUserId: integer("from_user_id").notNull(),
  toUserId: integer("to_user_id").notNull(),
  amount: real("amount").notNull(),
  type: text("type").notNull(), // 'loan_funding', 'loan_repayment'
  status: text("status").notNull(), // 'completed', 'pending', 'failed'
  hash: text("hash").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

// Trust Network
export const trustConnections = pgTable("trust_connections", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  trustedUserId: integer("trusted_user_id").notNull(),
  score: integer("score").default(0).notNull(), // 0-100 score
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Badges
export const badges = pgTable("badges", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  requirement: text("requirement").notNull(),
});

// Insert Schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  trustScore: true,
  balance: true,
  totalLent: true,
  achievedBadges: true,
  createdAt: true,
});

export const insertLoanSchema = createInsertSchema(loans).omit({
  id: true,
  lenderId: true,
  status: true,
  dueDate: true,
  repaymentDate: true,
  requestedAt: true,
  fundedAt: true,
  repaidAt: true,
  transactionHash: true,
  hash: true,
  isEmergency: true,
  createdAt: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  timestamp: true,
});

export const insertTrustConnectionSchema = createInsertSchema(trustConnections).omit({
  id: true,
  createdAt: true,
});

export const insertBadgeSchema = createInsertSchema(badges).omit({
  id: true,
});

// Login Schema
export const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

// SMS Loan Request Schema
export const smsLoanRequestSchema = z.object({
  amount: z.number().positive(),
  purpose: z.string().min(1),
  duration: z.number().int().positive(),
  phoneNumber: z.string(),
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertLoan = z.infer<typeof insertLoanSchema>;
export type Loan = typeof loans.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;
export type InsertTrustConnection = z.infer<typeof insertTrustConnectionSchema>;
export type TrustConnection = typeof trustConnections.$inferSelect;
export type InsertBadge = z.infer<typeof insertBadgeSchema>;
export type Badge = typeof badges.$inferSelect;
export type LoginData = z.infer<typeof loginSchema>;
export type SMSLoanRequest = z.infer<typeof smsLoanRequestSchema>;
