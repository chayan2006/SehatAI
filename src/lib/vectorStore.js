/**
 * SehatAI Isomorphic Vector Store Utility
 * Provides RAG/Knowledge Memory capabilities with HNSWLib persistence.
 * Robust against embedding failures and environment differences.
 */

// Singleton instance
let vectorStore = null;
let embeddings = null;
let useMock = false;

const SAVE_PATH = "c:\\Users\\kadit\\OneDrive\\Desktop\\Hackathon\\sehat_ai\\.cache\\vectorstore";

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
    
    // Fix: Using community package for HNSWLib
    const { HNSWLib } = await import("@langchain/community/vectorstores/hnswlib");
    const { GoogleGenerativeAIEmbeddings } = await import("@langchain/google-genai");

    // Fix: Use import.meta.env for Vite compatibility
    const apiKey = import.meta.env.VITE_GOOGLE_AI_KEY || import.meta.env.VITE_GEMINI_API_KEY;
    
    if (!apiKey) {
      throw new Error("Missing VITE_GOOGLE_AI_KEY for embeddings.");
    }

    embeddings = new GoogleGenerativeAIEmbeddings({
      apiKey,
      modelName: "embedding-001",
      maxRetries: 0,
    });

    try {
      // Try loading from saved path first
      console.log(`VectorStore: Attempting to load from ${SAVE_PATH}`);
      vectorStore = await HNSWLib.load(SAVE_PATH, embeddings);
      console.log("VectorStore: Loaded existing persistence successfully.");
    } catch (loadErr) {
      console.log("VectorStore: No existing index found, creating fresh store...");
      vectorStore = await HNSWLib.fromDocuments(SEED_DATA, embeddings);
      
      // Save for persistence if NOT in browser (HNSWLib save requires 'fs')
      if (typeof window === 'undefined') {
        try {
          await vectorStore.save(SAVE_PATH);
          console.log("VectorStore: Persisted fresh index to disk.");
        } catch (saveErr) {
          console.warn("VectorStore: Failed to save to disk:", saveErr.message);
        }
      }
    }
    
    return vectorStore;
  } catch (err) {
    console.warn("VectorStore: LangChain initialization failed, switching to SAFE MOCK:", err.message);
    useMock = true;
    vectorStore = {
      addDocuments: async (docs) => {
        console.log("Mock VectorStore: Logged new data (volatile):", docs);
        SEED_DATA.push(...docs);
      },
      similaritySearch: async (query, k) => {
        console.log("Mock VectorStore: Performing keyword search for:", query);
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
