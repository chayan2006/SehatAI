/**
 * SehatAI Isomorphic Vector Store Utility
 * Provides RAG/Knowledge Memory capabilities with browser-safe fallbacks.
 * Robust against embedding failures.
 */

const isBrowser = typeof window !== 'undefined';

// Singleton instance
let vectorStore = null;
let embeddings = null;
let useMock = false;

// Seed Data for Mock Search
const SEED_DATA = [
  { pageContent: "SehatAI Emergency Protocol (CODE BLUE): Immediately notify ICU and clear Wing B. Ensure defib is ready.", metadata: { source: "protocol" } },
  { pageContent: "Patient Data Privacy Policy: All EMR records must be encrypted via AES-256. Access logs are purged every 90 days.", metadata: { source: "policy" } },
  { pageContent: "AI Scribe Guidelines: Always confirm generated SOAP notes with the attending physician before export.", metadata: { source: "ai_scribe" } },
  { pageContent: "Inventory Burn Rate Threshold: Trigger re-order when stock levels drop below 15% of monthly average.", metadata: { source: "pharmacy" } }
];

/**
 * Initializes LangChain components dynamically.
 */
const initLangChain = async () => {
  if (vectorStore) return vectorStore;

  try {
    console.log("VectorStore: Initializing LangChain components...");
    const { MemoryVectorStore } = await import("@langchain/classic/vectorstores/memory");
    const { GoogleGenerativeAIEmbeddings } = await import("@langchain/google-genai");

    const apiKey = process.env.VITE_GOOGLE_AI_KEY || process.env.GOOGLE_AI_KEY || process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      throw new Error("Missing Google AI API Key for embeddings.");
    }

    embeddings = new GoogleGenerativeAIEmbeddings({
      apiKey,
      modelName: "embedding-001",
      maxRetries: 0, // CRITICAL: Stop hanging on errors
    });

    vectorStore = new MemoryVectorStore(embeddings);
    
    // Test embeddings with a small call to see if it works
    console.log("VectorStore: Pre-seeding test...");
    await vectorStore.addDocuments([SEED_DATA[0]]);
    
    // Seed the rest
    await vectorStore.addDocuments(SEED_DATA.slice(1));
    console.log("VectorStore: LangChain initialized and seeded successfully.");
    return vectorStore;
  } catch (err) {
    console.warn("VectorStore: LangChain initialization failed, switching to FAILS-SAFE MOCK:", err.message);
    useMock = true;
    vectorStore = {
      addDocuments: async (docs) => {
        console.log("Mock VectorStore: Logged new data (volatile):", docs);
        SEED_DATA.push(...docs);
      },
      similaritySearch: async (query, k) => {
        console.log("Mock VectorStore: Performing keyword search for:", query);
        // Simple keyword matching for the mock
        const words = query.toLowerCase().split(' ');
        const matches = SEED_DATA.filter(doc => 
          words.some(word => doc.pageContent.toLowerCase().includes(word))
        ).slice(0, k);
        return matches.length > 0 ? matches : [{ pageContent: "No specific hospital protocol found for your query. Please consult the attending physician.", metadata: {} }];
      }
    };
    return vectorStore;
  }
};

/**
 * Gets or initializes the memory vector store.
 */
export const getVectorStore = async () => {
  return await initLangChain();
};

/**
 * Searches the vector store for relevant context.
 */
export const searchKnowledge = async (query) => {
  try {
    const store = await getVectorStore();
    const results = await store.similaritySearch(query, 3);
    const content = results.map(r => r.pageContent).join("\n\n");
    // Truncate to 1000 chars to save tokens
    return content.length > 1000 ? content.substring(0, 1000) + "... [Truncated for brevity]" : content;
  } catch (err) {
    console.error("VectorStore: Search failed:", err.message);
    return "Error retrieving knowledge memory. Please use clinical judgment.";
  }
};

/**
 * Adds new context to the agentic memory.
 */
export const addMemory = async (content, metadata = {}) => {
  try {
    const store = await getVectorStore();
    await store.addDocuments([{ pageContent: content, metadata }]);
    return true;
  } catch (err) {
    console.error("VectorStore: Memory storage failed:", err.message);
    return false;
  }
};
