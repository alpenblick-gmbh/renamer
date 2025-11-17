/* eslint-env node */

import dotenv from 'dotenv';

dotenv.config();

const generateText = async () => {
  const apiKey = process.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    console.error('Fehler: VITE_GEMINI_API_KEY wurde nicht in der .env-Datei gefunden.');
    return;
  }

  // Korrigiert: Ein Modell verwenden, das 'generateContent' nachweislich unterstützt.
  const model = 'gemini-pro-latest'; 
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const headers = {
    'Content-Type': 'application/json',
  };

  const body = {
    contents: [
      {
        parts: [
          {
            text: 'Gib mir eine kurze, freundliche Antwort.',
          },
        ],
      },
    ],
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (data.candidates && data.candidates.length > 0) {
      const text = data.candidates[0].content.parts[0].text;
      console.log('Das Modell hat geantwortet:', text);
    } else {
      console.error('Fehler: Die API hat keine gültige Antwort gesendet.');
      console.error('API-Antwort:', data);
    }
  } catch (error) {
    console.error('Fehler bei der Kommunikation mit der API:', error);
  }
};

generateText();
