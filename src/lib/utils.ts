/// <reference types="pdfjs-dist" />

import { GoogleGenerativeAI } from "@google/generative-ai";
import * as pdfjsLib from 'pdfjs-dist';
// The `?url` suffix is a vite feature to get the url of the asset
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { GEMINI_API_KEY } from '../config'; // Import the key directly

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

async function callGemini(modelName: string, imageBase64: string, prompt: string) {
    // Directly use the imported API key
    const API_KEY = GEMINI_API_KEY;

    if (!API_KEY || API_KEY === "YOUR_GEMINI_API_KEY_HERE") {
        const errorMessage = "Gemini API key is not set. Please open 'src/config.ts', replace the placeholder with your actual key, and do a hard refresh of this page.";
        console.error(errorMessage);
        throw new Error(errorMessage);
    }

    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: modelName });

    const image = {
        inlineData: {
            data: imageBase64.split(',')[1],
            mimeType: 'image/jpeg'
        }
    };
    const result = await model.generateContent([prompt, image]);
    const response = await result.response;
    return response.text();
}

export async function getNewFileName(imageBase64: string, prompt: string): Promise<string> {
    try {
        return await callGemini("gemini-pro-latest", imageBase64, prompt);
    } catch (error) {
        console.warn("gemini-pro-latest failed, trying gemini-1.5-flash-latest", error);
        const errorMessage = (error as any).toString();
        if (errorMessage.includes('503')) {
            return await callGemini("gemini-1.5-flash-latest", imageBase64, prompt);
        }
        throw error;
    }
}

export async function convertPdfToImage(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
  const page = await pdf.getPage(1);
  const viewport = page.getViewport({ scale: 1.5 });
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Could not get canvas context');
  canvas.height = viewport.height;
  canvas.width = viewport.width;
  const renderContext = { canvasContext: context, viewport: viewport };
  await page.render(renderContext).promise;
  return canvas.toDataURL('image/jpeg');
}
