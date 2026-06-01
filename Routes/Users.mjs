import express from 'express';
import { sendEnquiryEmail } from '../Utils/Nodemailer.mjs';

const router = express.Router();

// POST /users — Contact / enquiry form submission
// Validates input → calls sendEnquiryEmail (pure function) → ALWAYS returns JSON
router.post('/users', async (req, res) => {
    // Safe fallback: prevents crash if Content-Type header is missing
    const { name, email, phone, message,sub } = req.body || {};

    // ── Validation (400 returned instantly, before any SMTP work) ─────────────
    if (!name || !email || !message) {
        return res.status(400).json({
            success: false,
            error: 'Required fields missing: name, email, and message are required',
        });
    }

    try {
        // sendEnquiryEmail is a pure function — never calls res.json() itself
        const result = await sendEnquiryEmail({ name, email, phone, message,sub });

        if (result.success) {
            return res.status(200).json({ success: true, message: 'Email sent successfully' });
        } else {
            return res.status(502).json({ success: false, error: result.error });
        }
    } catch (error) {
        // Catch-all safety net — res.json() is guaranteed in every path
        console.error(`[/users route] Unexpected error: ${error.message}`);
        return res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

export default router;