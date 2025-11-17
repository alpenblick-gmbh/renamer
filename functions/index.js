
const functions = require("firebase-functions");
const { defineString } = require('firebase-functions/params');

// Define some parameters
const OPENAI_API_KEY = defineString('OPENAI_API_KEY');

exports.renameFile = functions.https.onCall(async (data, context) => {
    const { fileContent, prompt } = data;

    if (!fileContent || !prompt) {
        throw new functions.https.HttpsError('invalid-argument', 'The function must be called with "fileContent" and "prompt".');
    }

    // Here you would call the OpenAI API, but for now, we'll just simulate it.
    // const openAIResponse = await callOpenAI(fileContent, prompt, OPENAI_API_KEY.value());
    // For demonstration, we'll just return a dummy name.
    const newName = `NEW_NAME_${Date.now()}.pdf`;

    return { newName };
});
