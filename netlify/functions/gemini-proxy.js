const { GoogleGenerativeAI } = require("@google/generative-ai");

exports.handler = async function(event, context) {
    if (event.httpMethod !== "POST") {
        return {
            statusCode: 405,
            body: "Method Not Allowed"
        };
    }

    try {
        const { prompt, chatHistory } = JSON.parse(event.body);

        // Access your API key as an environment variable
        const API_KEY = process.env.GEMINI_API_KEY;

        if (!API_KEY) {
            console.error("GEMINI_API_KEY is not set as an environment variable.");
            return {
                statusCode: 500,
                body: JSON.stringify({ error: "Server configuration error: API Key missing." })
            };
        }

        const genAI = new GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash"}); // Using gemini-2.0-flash

        let responseText = "";

        if (chatHistory && chatHistory.length > 0) {
            const chat = model.startChat({
                history: chatHistory,
                generationConfig: {
                    maxOutputTokens: 500, // Adjust as needed
                },
            });
            const result = await chat.sendMessage(prompt);
            responseText = result.response.text();
        } else {
            const result = await model.generateContent(prompt);
            responseText = result.response.text();
        }

        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: responseText })
        };

    } catch (error) {
        console.error("Error in Netlify function:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Failed to generate content", details: error.message })
        };
    }
};
