const key = process.env.GEMINI_API_KEY;

fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`)
  .then(res => res.json())
  .then(data => {
    if (data.error) {
      console.error("API Error:", data.error);
    } else {
      const models = data.models.map(m => m.name);
      console.log("AVAILABLE MODELS:", models.join(', '));
    }
  })
  .catch(console.error);
