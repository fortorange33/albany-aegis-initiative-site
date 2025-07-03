exports.handler = async () => {
    return {
      statusCode: 200,
      body: JSON.stringify({
        apiKeyExists: !!process.env.GEMINI_API_KEY,
        value: process.env.GEMINI_API_KEY ? 'loaded' : 'missing',
      }),
    };
  };