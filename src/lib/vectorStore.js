/**
 * SehatAI Isomorphic Vector Store Utility
 * Provides RAG/Knowledge Memory capabilities with HNSWLib persistence.
 * Robust against embedding failures and environment differences.
 */

// Singleton instance
let vectorStore = null;
let useMock = false;

// Seed Data for Mock/Fallback Search
const SEED_DATA = [
  { pageContent: "SehatAI Emergency Protocol (CODE BLUE): Immediately notify ICU and clear Wing B. Ensure defib is ready.", metadata: { source: "protocol" } },
  { pageContent: "Patient Data Privacy Policy: All EMR records must be encrypted via AES-256. Access logs are purged every 90 days.", metadata: { source: "policy" } },
  { pageContent: "AI Scribe Guidelines: Always confirm generated SOAP notes with the attending physician before export.", metadata: { source: "ai_scribe" } },
  { pageContent: "Inventory Burn Rate Threshold: Trigger re-order when stock levels drop below 15% of monthly average.", metadata: { source: "pharmacy" } }
];

// Build a lightweight in-memory mock store (works in all environments)
function buildMockStore() {
  return {
    addDocuments: async (docs) => { SEED_DATA.push(...docs); },
    similaritySearch: async (query, k) => {
      const words = query.toLowerCase().split(' ');
      const matches = SEED_DATA.filter(doc =>
        words.some(word => doc.pageContent.toLowerCase().includes(word))
      ).slice(0, k);
      return matches.length > 0 ? matches : [{ pageContent: "No specific protocol found for your query. Please consult the attending physician.", metadata: {} }];
    }
  };
}

/**
 * Initializes the vector store.
 * In browsers: always uses fast in-memory mock (HNSWLib requires Node.js/fs).
 * In Node.js: tries HNSWLib with Google embeddings, falls back to mock.
 */
const initLangChain = async () => {
  if (vectorStore) return vectorStore;

  // Browser environment: always use mock (HNSWLib needs Node.js fs API)
  if (typeof window !== 'undefined') {
    console.log("VectorStore: Browser detected, using fast in-memory store.");
    useMock = true;
    vectorStore = buildMockStore();
    return vectorStore;
  }

  // Node.js environment: try real HNSWLib with embeddings
  try {
    const { HNSWLib } = await import("@langchain/community/vectorstores/hnswlib");
    const { GoogleGenerativeAIEmbeddings } = await import("@langchain/google-genai");
    const apiKey = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

    if (!apiKey) throw new Error("Missing Gemini API key for embeddings.");

    const embeddings = new GoogleGenerativeAIEmbeddings({ apiKey, modelName: "embedding-001", maxRetries: 0 });
    const SAVE_PATH = "./cache/vectorstore";

    try {
      vectorStore = await HNSWLib.load(SAVE_PATH, embeddings);
      console.log("VectorStore: Loaded from cache.");
    } catch {
      vectorStore = await HNSWLib.fromDocuments(SEED_DATA, embeddings);
      try { await vectorStore.save(SAVE_PATH); } catch {}
    }
    return vectorStore;
  } catch (err) {
    console.warn("VectorStore: Falling back to mock:", err.message);
    useMock = true;
    vectorStore = buildMockStore();
    return vectorStore;
  }
};

/**
 * Gets or initializes the vector store.
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
    return content.length > 1000 ? content.substring(0, 1000) + "... [Truncated]" : content;
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
    
    // Fix: Persistence update if possible
    if (!useMock && typeof window === 'undefined' && vectorStore.save) {
      await vectorStore.save(SAVE_PATH);
    }
    return true;
  } catch (err) {
    console.error("VectorStore: Memory storage failed:", err.message);
    return false;
  }
};
