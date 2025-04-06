import { createHash } from 'crypto';

/**
 * Simple blockchain simulation for the P2P loan platform
 * 
 * This is a basic implementation to simulate blockchain concepts
 * without the complexity of an actual blockchain.
 */

interface Transaction {
  from: number;
  to: number;
  amount: number;
  timestamp: Date;
  data?: any;
}

interface Block {
  index: number;
  timestamp: Date;
  transactions: Transaction[];
  previousHash: string;
  hash: string;
  nonce: number;
}

// Singleton class to simulate a blockchain
class Blockchain {
  private chain: Block[];
  private difficulty: number;
  private pendingTransactions: Transaction[];
  
  constructor() {
    this.chain = [this.createGenesisBlock()];
    this.difficulty = 2; // Simple difficulty setting for proof of work
    this.pendingTransactions = [];
  }
  
  private createGenesisBlock(): Block {
    return {
      index: 0,
      timestamp: new Date(),
      transactions: [],
      previousHash: '0',
      hash: '0',
      nonce: 0
    };
  }
  
  getLatestBlock(): Block {
    return this.chain[this.chain.length - 1];
  }
  
  addTransaction(transaction: Transaction): string {
    // Validate transaction (could be more complex in reality)
    if (!transaction.from || !transaction.to || transaction.amount <= 0) {
      throw new Error('Invalid transaction');
    }
    
    // Generate a transaction hash
    const txHash = this.hashTransaction(transaction);
    
    // In a real blockchain, this would be added to pending transactions
    // We're simulating by immediately creating a block with this transaction
    this.pendingTransactions.push(transaction);
    
    // In a real implementation, we'd mine blocks periodically, not for each transaction
    // But for simplicity in our simulation, we'll create a block now
    this.mineBlock();
    
    return txHash;
  }
  
  mineBlock(): void {
    if (this.pendingTransactions.length === 0) return;
    
    const block = this.createBlock();
    this.chain.push(block);
    this.pendingTransactions = [];
  }
  
  private createBlock(): Block {
    const latestBlock = this.getLatestBlock();
    const newBlock: Block = {
      index: latestBlock.index + 1,
      timestamp: new Date(),
      transactions: [...this.pendingTransactions],
      previousHash: latestBlock.hash,
      hash: '',
      nonce: 0
    };
    
    // Mine the block (proof of work)
    newBlock.hash = this.mineBlockHash(newBlock);
    
    return newBlock;
  }
  
  private mineBlockHash(block: Block): string {
    let hash = this.calculateBlockHash(block);
    let nonce = 0;
    
    // Simple mining simulation
    while (hash.substring(0, this.difficulty) !== Array(this.difficulty + 1).join('0')) {
      nonce++;
      block.nonce = nonce;
      hash = this.calculateBlockHash(block);
    }
    
    return hash;
  }
  
  private calculateBlockHash(block: Block): string {
    const blockData = {
      index: block.index,
      timestamp: block.timestamp,
      transactions: block.transactions,
      previousHash: block.previousHash,
      nonce: block.nonce
    };
    
    return createHash('sha256').update(JSON.stringify(blockData)).digest('hex');
  }
  
  hashTransaction(transaction: Transaction): string {
    return createHash('sha256').update(JSON.stringify(transaction)).digest('hex');
  }
  
  validateChain(): boolean {
    // In a real blockchain, we'd validate the entire chain here
    // For our simulation, we'll just check a few basic things
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];
      
      // Validate hash
      if (currentBlock.hash !== this.calculateBlockHash(currentBlock)) {
        return false;
      }
      
      // Validate chain link
      if (currentBlock.previousHash !== previousBlock.hash) {
        return false;
      }
    }
    
    return true;
  }
  
  getChain(): Block[] {
    return [...this.chain];
  }
}

// Create a singleton instance
const blockchain = new Blockchain();

// Export a simplified interface for the rest of the application
export function hashTransaction(transaction: Transaction): string {
  return blockchain.hashTransaction(transaction);
}

export function addTransactionToBlockchain(transaction: Transaction): string {
  return blockchain.addTransaction(transaction);
}

export function getBlockchainState(): Block[] {
  return blockchain.getChain();
}

export function isBlockchainValid(): boolean {
  return blockchain.validateChain();
}
