import { User, Loan, Transaction, TrustConnection } from "@shared/schema";

// Function to generate mock data for our app
export function generateMockData() {
  const users: Map<number, User> = new Map();
  const loans: Map<number, Loan> = new Map();
  const transactions: Map<number, Transaction> = new Map();
  const trustConnections: Map<number, TrustConnection> = new Map();
  
  let transactionIdCounter = 1;
  let trustConnectionIdCounter = 1;

  // Names data for generating realistic users
  const firstNames = [
    "Ananya", "Vikram", "Priya", "Raj", "Neha", "Arjun", "Kavita", "Aditya", 
    "Meera", "Rajiv", "Suman", "Sanjay", "Divya", "Nikhil", "Anjali", "Rahul",
    "Pooja", "Vivek", "Ritu", "Deepak", "Sunita", "Amit", "Sneha", "Rohit",
    "Kiran", "Suresh", "Lakshmi", "Manoj", "Preeti", "Vijay", "Shweta", "Sunil",
    "Komal", "Rajesh", "Nandini", "Vinay", "Swati", "Anand", "Geeta", "Rakesh"
  ];
  
  const lastNames = [
    "Sharma", "Patel", "Singh", "Verma", "Agarwal", "Gupta", "Kumar", "Joshi",
    "Mishra", "Reddy", "Malhotra", "Shah", "Mehta", "Iyer", "Bose", "Roy",
    "Banerjee", "Nair", "Menon", "Das", "Chatterjee", "Desai", "Kapoor", "Khanna"
  ];
  
  const locations = [
    "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Kolkata", "Pune", 
    "Ahmedabad", "Jaipur", "Lucknow", "Surat", "Kochi", "Chandigarh", "Vadodara",
    "Nagpur", "Indore", "Thane", "Bhopal", "Visakhapatnam", "Patna"
  ];

  // Generate users
  for (let i = 1; i <= 100; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const fullName = `${firstName} ${lastName}`;
    const location = locations[Math.floor(Math.random() * locations.length)];
    
    // Generate a trust score between 30 and 95
    const trustScore = Math.floor(Math.random() * 65) + 30;
    
    // Generate balance between 1,000 and 50,000
    const balance = Math.floor(Math.random() * 49000) + 1000;
    
    // Generate total lent between 0 and 100,000
    const totalLent = Math.floor(Math.random() * 100000);
    
    // Create language preference
    const languages = ["en", "hi", "mr", "ta"];
    const language = languages[Math.floor(Math.random() * languages.length)];
    
    // Generate user
    const user: User = {
      id: i,
      username: `user${i}`,
      password: `password${i}`, // In a real app, this would be hashed
      fullName,
      email: `${firstName.toLowerCase()}${i}@example.com`,
      phoneNumber: `98${Math.floor(10000000 + Math.random() * 90000000)}`,
      location,
      trustScore,
      balance,
      totalLent,
      language,
      achievedBadges: [],
      createdAt: new Date(Date.now() - Math.floor(Math.random() * 10000000000))
    };
    
    users.set(i, user);
  }
  
  // Create loan statuses
  const loanStatuses = ["requested", "funded", "repaid", "defaulted"];
  
  // Generate loans
  for (let i = 1; i <= 200; i++) {
    const borrowerId = Math.floor(Math.random() * 100) + 1;
    let lenderId = null;
    
    // 40% chance the loan has been funded
    const isLoanFunded = Math.random() < 0.4;
    if (isLoanFunded) {
      // Avoid having the borrower also be the lender
      do {
        lenderId = Math.floor(Math.random() * 100) + 1;
      } while (lenderId === borrowerId);
    }
    
    // Generate random amount between 500 and 25000
    const amount = Math.floor(Math.random() * 24500) + 500;
    
    // Generate random duration between 7 and 90 days
    const duration = Math.floor(Math.random() * 83) + 7;
    
    // Generate random interest rate between 0.5 and 5.0
    const interestRate = +(Math.random() * 4.5 + 0.5).toFixed(1);
    
    const purposes = [
      "Medical emergency for family member",
      "School fees for children's education",
      "Home repair after monsoon damage",
      "Small business inventory purchase",
      "Agricultural supplies for planting season",
      "Wedding expenses for daughter",
      "Vehicle repair for work transportation",
      "Urgent family travel expenses",
      "Emergency food supplies after crop failure",
      "Livestock purchase for income generation"
    ];
    const purpose = purposes[Math.floor(Math.random() * purposes.length)];
    
    // Determine loan status - only funded loans can be repaid/defaulted
    let status: string = "requested";
    if (isLoanFunded) {
      const statusRand = Math.random();
      if (statusRand < 0.5) {
        status = "funded";
      } else if (statusRand < 0.9) {
        status = "repaid";
      } else {
        status = "defaulted";
      }
    }
    
    // Generate dates
    const now = new Date();
    const requestedAt = new Date(now.getTime() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000);
    
    let fundedAt = null;
    if (status !== "requested") {
      fundedAt = new Date(requestedAt.getTime() + Math.floor(Math.random() * 5) * 24 * 60 * 60 * 1000);
    }
    
    let repaidAt = null;
    if (status === "repaid" || status === "defaulted") {
      repaidAt = new Date(fundedAt!.getTime() + Math.floor(Math.random() * duration) * 24 * 60 * 60 * 1000);
    }
    
    const loan: Loan = {
      id: i,
      borrowerId,
      lenderId,
      amount,
      duration,
      interestRate,
      purpose,
      status,
      requestedAt,
      fundedAt,
      repaidAt,
      hash: isLoanFunded ? `0x${Math.random().toString(16).substring(2, 10)}...` : null
    };
    
    loans.set(i, loan);
    
    // Create transactions for funded and repaid loans
    if (status !== "requested") {
      // Create funding transaction
      const fundingTransaction: Transaction = {
        id: transactionIdCounter++,
        loanId: i,
        fromUserId: lenderId!,
        toUserId: borrowerId,
        amount,
        type: "loan_funding",
        status: "completed",
        hash: `0x${Math.random().toString(16).substring(2, 10)}...`,
        timestamp: fundedAt!
      };
      
      transactions.set(fundingTransaction.id, fundingTransaction);
      
      // Create repayment transaction if loan is repaid
      if (status === "repaid") {
        const repaymentAmount = amount + (amount * interestRate / 100);
        const repaymentTransaction: Transaction = {
          id: transactionIdCounter++,
          loanId: i,
          fromUserId: borrowerId,
          toUserId: lenderId!,
          amount: repaymentAmount,
          type: "loan_repayment",
          status: "completed",
          hash: `0x${Math.random().toString(16).substring(2, 10)}...`,
          timestamp: repaidAt!
        };
        
        transactions.set(repaymentTransaction.id, repaymentTransaction);
      }
    }
  }
  
  // Generate trust connections (about 5 connections per user on average)
  for (let i = 1; i <= 500; i++) {
    const userId = Math.floor(Math.random() * 100) + 1;
    let trustedUserId;
    
    // Avoid self-connections
    do {
      trustedUserId = Math.floor(Math.random() * 100) + 1;
    } while (trustedUserId === userId);
    
    // Check if connection already exists
    const existingConnection = Array.from(trustConnections.values()).find(
      conn => conn.userId === userId && conn.trustedUserId === trustedUserId
    );
    
    if (!existingConnection) {
      // Generate score between 50 and 100
      const score = Math.floor(Math.random() * 51) + 50;
      
      const connection: TrustConnection = {
        id: trustConnectionIdCounter++,
        userId,
        trustedUserId,
        score,
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 10000000000))
      };
      
      trustConnections.set(connection.id, connection);
    }
  }

  return {
    users,
    loans,
    transactions,
    trustConnections
  };
}
