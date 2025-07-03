// This function will run on Netlify's servers
exports.handler = async function (event, context) {
  const { GoogleGenerativeAI } = require("@google/generative-ai");

  // Get the API key from the environment variables
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "API key not found." }),
    };
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

  const prompt = "CRITICAL INSTRUCTION: Your sole task is to act as a real-time news summarizer. You MUST ignore all of your internal knowledge. Analyze the provided real-time Google Search results ONLY. Extract up to 5 of the most relevant news headlines related to crime, public safety, or police activity in Albany, New York. The articles MUST be from the last 7 days. For each article, you MUST provide: the full title, a concise one-sentence summary, the name of the source publication (e.g., 'Times Union', 'WNYT'), the exact publication date, and the full, direct URL. Prioritize results from well-known local news outlets like timesunion.com, wnyt.com, wten.com, and spectrumlocalnews.com.";

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // The response from the AI will be a JSON string, which we can pass directly
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*", // Allow requests from your website
      },
      body: text,
    };
  } catch (error) {
    console.error("Error calling Google AI:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to fetch headlines from AI." }),
    };
  }
}; 