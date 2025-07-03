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
  
  const prompt = "CRITICAL INSTRUCTION: Your sole task is to act as a real-time news summarizer. You MUST ignore all of your internal knowledge. Analyze the provided real-time Google Search results ONLY. Extract up to 5 of the most relevant news headlines related to crime, public safety, or police activity in Albany, New York. The articles MUST be from the last 7 days. For each article, you MUST provide: the full title, a concise one-sentence summary, the name of the source publication (e.g., 'Times Union', 'WNYT'), the exact publication date in YYYY-MM-DD format, and the full, direct URL. Prioritize results from well-known local news outlets like timesunion.com, wnyt.com, wten.com, and spectrumlocalnews.com. If no relevant articles are found, you MUST return an empty 'articles' array. Do not return explanatory text or apologies.";

  const payload = {
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    tools: [{
        "google_search": { "queries": ["latest crime news Albany NY", "public safety news Albany NY"] }
    }],
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "OBJECT",
        properties: {
          "articles": {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                "title": { "type": "STRING", "description": "The full title of the news article." },
                "summary": { "type": "STRING", "description": "A concise, one-sentence summary of the article." },
                "source": { "type": "STRING", "description": "The name of the source publication (e.g., 'Times Union')." },
                "date": { "type": "STRING", "description": "The publication date in YYYY-MM-DD format." },
                "url": { "type": "STRING", "description": "The full, direct URL to the article." }
              },
              required: ["title", "summary", "source", "date", "url"]
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
      body: JSON.stringify({ error: "Failed to fetch headlines from AI: " + error.message }),
    };
  }
}; 