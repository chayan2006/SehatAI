import dotenv from "dotenv";
dotenv.config();

async function testFetch() {
    const key = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`;
    const payload = {
        contents: [{ parts: [{ text: "hi" }] }]
    };

    console.log("Testing without restrictions...");
    const res1 = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    });
    console.log("No restrictions status:", res1.status);
    console.log("No restrictions body:", await res1.text());

    console.log("\nTesting with browser spoofing...");
    const res2 = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Origin": "http://localhost:3000",
            "Referer": "http://localhost:3000/"
        },
        body: JSON.stringify(payload)
    });
    console.log("Browser spoof status:", res2.status);
    console.log("Browser spoof body:", await res2.text());
}

testFetch();
