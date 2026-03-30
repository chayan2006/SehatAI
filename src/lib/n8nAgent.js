export async function initN8nAgent({ webhookUrl, sessionId = "default-session" }) {
  // Returns an agent interface compatible with the existing AIChat components
  return {
    invoke: async ({ input, chat_history = [], image_data = null }) => {
      try {
        if (!webhookUrl) {
          return { output: "Error: n8n Webhook URL is not configured." };
        }

        // Prepare the payload for n8n
        const payload = {
          sessionId,
          action: "chatMessage",
          chatInput: input,
          // We can optionally send the chat history if your n8n workflow needs it
          // OR you can let n8n manage memory based on the sessionId
          history: chat_history,
          // If the user uploads an image, we send it as base64
          imageData: image_data,
          timestamp: new Date().toISOString()
        };

        const response = await fetch(webhookUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          throw new Error(`n8n responded with status: ${response.status}`);
        }

        const data = await response.json();
        
        // n8n should ideally return a JSON object with at least an "output" string.
        // E.g., { "output": "Hello from n8n agent!" }
        // Adjust this depending on how you structure your n8n Webhook Response node.
        return { 
          output: data.output || data.text || data.message || JSON.stringify(data)
        };

      } catch (error) {
        console.error("n8n Agent error:", error);
        return { output: `n8n Connection Error: ${error.message}` };
      }
    }
  };
}
