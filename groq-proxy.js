    // backend/groq-proxy.js
    // Standalone Express server to proxy chat requests to Groq securely

    import express from "express";
    import cors from "cors";
    import bodyParser from "body-parser";
    import fetch from "node-fetch";

    const app = express();
    const PORT = process.env.PORT || 3001;
    const apiKey = process.env.GROQ_API_KEY;

    app.use(cors());
    app.use(bodyParser.json());

    app.post("/groq-chat", async (req, res) => {
        try {
            // Inject custom system prompt with business info
            const systemPrompt = `You are a helpful assistant for Saurav Computers, a computer education center and service provider in Shendurjan, Taluka Sindkhed Raja, District Buldana, Maharashtra 443202.\n\nCourses Offered:\n\nMS-CIT: ₹4,500.00 – IT literacy course covering computer basics, digital skills, office tools, cybersecurity, and more.\nGCC-TBC: ₹4,700.00 – Government-certified typing course in English, Marathi, or Hindi, focusing on typing speed and accuracy.\nMKCL KLiC Courses: Various job-oriented courses like Tally Prime (with GST), Advanced Excel, DTP, AutoCAD, and more, typically spanning 60 to 120 hours.\n\nAdditional Services:\n\nSBI Kiosk Banking: Authorized Customer Service Point offering account opening, deposits, withdrawals, transfers, and other basic banking services.\nAaple Seva Kendra: MahaOnline CSC providing government certificates, bookings, and digital services.\n\nContact Information:\n\nPhone: 9823779796 / 8275233774\nEmail: sauravcomputer@gmail.com\n\nBusiness Hours:\n\nMonday – Friday: 9:00 AM – 7:00 PM\nSaturday: 9:00 AM – 5:00 PM\nSunday: Closed\n\nWhen responding to user queries, provide accurate and concise information based on the above details. If a question falls outside this scope, politely inform the user that you don't have that information.`;

            // Always inject system prompt as the first message
            const userMessages = req.body.messages || [];
            // Remove any previous system prompts from userMessages
            const filteredMessages = userMessages.filter(
                (m) => m.role !== "system"
            );
            // If the first user message is a greeting, rewrite it to include Saurav Computers
            if (
                filteredMessages.length > 0 &&
                filteredMessages[0].role === "user"
            ) {
                const greeting = filteredMessages[0].content.trim().toLowerCase();
                if (
                    [
                        "hi",
                        "hello",
                        "hey",
                        "good morning",
                        "good afternoon",
                        "good evening",
                    ].some((g) => greeting.startsWith(g))
                ) {
                    filteredMessages[0].content = `${filteredMessages[0].content}\n(You are chatting with Saurav Computers, not a generic computer services website.)`;
                }
            }
            const messages = [
                { role: "system", content: systemPrompt },
                ...filteredMessages,
            ];

            const groqRes = await fetch(
                "https://api.groq.com/openai/v1/chat/completions",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${apiKey}`,
                    },
                    body: JSON.stringify({
                        ...req.body,
                        messages,
                    }),
                }
            );
            const data = await groqRes.json();
            res.status(200).json(data);
        } catch (err) {
            res.status(500).json({ error: "Server error", details: err.message });
        }
    });

    app.listen(PORT, () => {
        console.log(`Groq proxy server running on http://localhost:${PORT}`);
    });
