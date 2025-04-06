import { storage } from "./storage-db";
import { generateMockData } from "./mock-data";

/**
 * Initialize the database with default badges and mock data
 */
async function initializeDatabase() {
  console.log("Starting database initialization...");
  
  try {
    console.log("Creating default badges...");
    await storage.initializeDefaultBadges();
    console.log("Default badges created");
    
    // Generate and import mock data
    console.log("Generating mock data...");
    const mockData = generateMockData();
    
    console.log("Importing mock data...");
    await storage.importMockData(mockData);
    console.log("Mock data imported successfully");
    
    console.log("Database initialization completed successfully!");
  } catch (error) {
    console.error("Error initializing database:", error);
  }
}

// Self-invoking function to run the initialization
(async () => {
  try {
    await initializeDatabase();
    console.log("Database initialization complete!");
    // Don't exit here if imported as module
  } catch (error) {
    console.error("Database initialization failed:", error);
    // Don't exit here if imported as module
  }
})();

export { initializeDatabase };