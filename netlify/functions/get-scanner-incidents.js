// This function will run on Netlify's servers and act as a secure proxy.
const fetch = require('node-fetch');

exports.handler = async function (event, context) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "API key not configured." }),
    };
  }

  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;
  
  const prompt = "CRITICAL INSTRUCTION: You are a police scanner analysis assistant. Your task is to analyze the provided real-time Google Search results for 'Albany NY police scanner text log' and 'Albany NY public safety dispatch log'. You MUST ignore all of your internal knowledge. From ONLY the provided search results, extract up to 5 of the most significant incidents from the last 24 hours. For each incident, identify an incident 'type' (e.g., 'Traffic Accident', 'Structure Fire', 'Assault'), a 'location', and a brief 'summary'.";

  const payload = {
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    tools: [{
        "google_search": { "queries": ["Albany NY police scanner text log", "Albany NY public safety dispatch log"] }
    }],
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "OBJECT",
        properties: {
          "incidents": {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                "type": { "type": "STRING", "description": "A concise category for the incident (e.g., 'Traffic', 'Fire', 'Assault', 'Theft', 'Burglary', 'Medical')." },
                "location": { "type": "STRING", "description": "The specific street or intersection where the incident occurred." },
                "summary": { "type": "STRING", "description": "A brief, one-sentence summary of the incident." }
              },
              required: ["type", "location", "summary"]
            }
          }
        }
      }
    }
  };

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("Google AI API Error:", errorBody);
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: `Google AI API responded with status ${response.status}` }),
      };
    }

    const result = await response.json();
    const resultText = result.candidates[0]?.content?.parts[0]?.text;

    if (!resultText) {
        throw new Error("Unexpected API response format from Google AI.");
    }
    
    try {
      const data = JSON.parse(resultText);
      // Re-stringify to ensure we send valid JSON to the client.
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify(data),
      };
    } catch (parseError) {
      console.error("AI returned invalid JSON:", resultText);
      throw new Error("AI response was not in a valid JSON format.");
    }
  } catch (error) {
    console.error("Error calling Google AI:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to fetch scanner incidents from AI: " + error.message }),
    };
  }
}; 