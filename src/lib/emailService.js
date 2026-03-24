/**
 * Utility service to send automated emails via Google Apps Script.
 * Requires VITE_GOOGLE_SCRIPT_URL in .env
 */

export const sendEmailNotification = async (payload) => {
    const scriptUrl = import.meta.env.VITE_GOOGLE_SCRIPT_URL;
    
    if (!scriptUrl) {
        console.warn("Email Automation: VITE_GOOGLE_SCRIPT_URL not found in .env. Email withheld.");
        return { status: "skipped", message: "No script URL configured" };
    }

    try {
        const response = await fetch(scriptUrl, {
            method: 'POST',
            mode: 'no-cors', // Google Apps Script requires no-cors for simple POST or redirects
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        // Note: With no-cors, we can't read the response body, but the request will still fire.
        return { status: "success", message: "Email request sent" };
    } catch (error) {
        console.error("Email Automation Error:", error);
        return { status: "error", message: error.message };
    }
};
