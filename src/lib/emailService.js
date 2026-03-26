/**
 * Utility service to send automated emails via Google Apps Script.
 * Requires VITE_GOOGLE_SCRIPT_URL in .env
 *
 * NOTE: Browsers enforce `no-cors` rules for Google Apps Script.
 * With no-cors, only `text/plain` Content-Type is allowed.
 * We send the JSON body as text/plain so Apps Script can still
 * parse `e.postData.contents` via JSON.parse().
 * We ALSO try a GET request with URL params as a fallback.
 */

export const sendEmailNotification = async (payload) => {
    const scriptUrl = import.meta.env.VITE_GOOGLE_SCRIPT_URL;

    if (!scriptUrl) {
        console.warn("Email Automation: VITE_GOOGLE_SCRIPT_URL not found in .env. Email withheld.");
        return { status: "skipped", message: "No script URL configured" };
    }

    // ── Attempt 1: POST with text/plain so the body isn't rejected by no-cors ──
    try {
        await fetch(scriptUrl, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                // 'application/json' is NOT a CORS-safelisted value and gets stripped.
                // 'text/plain' IS allowed and the body still carries the JSON string.
                'Content-Type': 'text/plain',
            },
            body: JSON.stringify(payload),
        });
    } catch (error) {
        console.warn("SehatAI Email (POST attempt) failed:", error.message);
    }

    // ── Attempt 2: GET with URL params (Apps Script doGet handler) ─────────────
    // This is the most reliable path when the Apps Script supports doGet().
    try {
        const url = new URL(scriptUrl);
        // Flatten top-level keys
        Object.entries(payload).forEach(([k, v]) => {
            if (typeof v === 'object' && v !== null) {
                // Flatten nested details object
                Object.entries(v).forEach(([dk, dv]) => url.searchParams.set(dk, String(dv)));
            } else {
                url.searchParams.set(k, String(v));
            }
        });

        await fetch(url.toString(), { method: 'GET', mode: 'no-cors' });
    } catch (error) {
        console.warn("SehatAI Email (GET attempt) failed:", error.message);
    }

    return { status: "success", message: "Email request sent via both channels" };
};

/**
 * Dedicated OTP email sender.
 * Sends via multiple strategies and returns so the caller can also show the OTP on-screen.
 */
export const sendOtpEmail = async ({ email, name, otp }) => {
    const scriptUrl = import.meta.env.VITE_GOOGLE_SCRIPT_URL;

    const subject = "SehatAI — Your Verification Code";
    const body =
        `Dear ${name},\n\n` +
        `Your SehatAI email verification code is:\n\n` +
        `  ${otp}\n\n` +
        `This code is valid for 10 minutes. Do NOT share it with anyone.\n\n` +
        `If you did not request this, please ignore this email.\n\n` +
        `Regards,\nSehatAI Support Team`;

    const htmlBody =
        `<div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;border:1px solid #e2e8f0;border-radius:16px">` +
        `<h2 style="color:#10b981;margin-bottom:8px">SehatAI Verification</h2>` +
        `<p style="color:#475569">Hi <strong>${name}</strong>,</p>` +
        `<p style="color:#475569">Your one-time verification code is:</p>` +
        `<div style="font-size:40px;font-weight:900;letter-spacing:12px;color:#10b981;text-align:center;padding:24px;background:#f0fdf4;border-radius:12px;margin:24px 0">${otp}</div>` +
        `<p style="color:#94a3b8;font-size:13px">This code expires in <strong>10 minutes</strong>. Never share it with anyone.</p>` +
        `<hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0"/>` +
        `<p style="color:#cbd5e1;font-size:12px">© 2024 SehatAI. Secure 256-bit SSL Encrypted.</p>` +
        `</div>`;

    if (!scriptUrl) {
        console.warn("OTP Email: No script URL configured. OTP =", otp);
        return;
    }

    // POST attempt (text/plain body so no-cors doesn't strip content-type)
    try {
        await fetch(scriptUrl, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'text/plain' },
            body: JSON.stringify({
                type: "otp",
                to: email,
                email: email,
                name: name,
                otp: otp,
                subject: subject,
                body: body,
                htmlBody: htmlBody,
                // Also pass as 'message' key in case App Script uses that field
                message: body,
            }),
        });
    } catch (e) {
        console.warn("OTP POST failed:", e.message);
    }

    // GET attempt (URL params)
    try {
        const url = new URL(scriptUrl);
        url.searchParams.set('type', 'otp');
        url.searchParams.set('action', 'sendOtp');
        url.searchParams.set('to', email);
        url.searchParams.set('email', email);
        url.searchParams.set('name', name);
        url.searchParams.set('otp', otp);
        url.searchParams.set('subject', subject);
        url.searchParams.set('message', body);
        url.searchParams.set('body', body);
        await fetch(url.toString(), { method: 'GET', mode: 'no-cors' });
    } catch (e) {
        console.warn("OTP GET failed:", e.message);
    }
};
