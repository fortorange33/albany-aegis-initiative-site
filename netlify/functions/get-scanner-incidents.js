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

  const prompt = "CRITICAL INSTRUCTION: You are a police scanner analysis assistant. Your task is to analyze the provided real-time Google Search results for 'Albany NY police scanner text log' and 'Albany NY public safety dispatch log'. You MUST ignore all of your internal knowledge. From ONLY the provided search results, extract up to 5 of the most significant incidents from the last 24 hours. For each incident, identify an incident 'type' (e.g., 'Traffic Accident', 'Structure Fire', 'Assault'), a 'location', and a brief 'summary'.";

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
      body: JSON.stringify({ error: "Failed to fetch scanner incidents from AI." }),
    };
  }
}; 