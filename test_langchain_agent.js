import { initAdminAgent } from "./src/lib/adminAgent.js";
import dotenv from "dotenv";

dotenv.config();

async function testAgent() {
    console.log("Initializing Agent...");
    const handlers = {
        getStats: () => ({ patientCount: 1284, throughput: 2400, throughputPct: 84 }),
        exportReport: (view) => console.log(`[STUB] Exporting ${view} report.`),
        getStaffRoster: (dept) => `Staff in ${dept}: Dr. Sarah Chen, Dr. Mike Lin`
    };

    const agent = await initAdminAgent({
        apiKey: process.env.VITE_GROQ_API_KEY || process.env.GROQ_API_KEY,
        handlers
    });

    console.log("Agent Initialized. Testing invocation 1...");

    const res1 = await agent.invoke({
        input: "What is the current patient count?",
        chat_history: []
    });

    console.log("\n--- Response 1 ---");
    console.log(res1.output);

    console.log("\nTesting invocation 2...");
    const res2 = await agent.invoke({
        input: "Who is working in the Cardiology department?",
        chat_history: []
    });

    console.log("\n--- Response 2 ---");
    console.log(res2.output);
}

testAgent().catch(console.error);
