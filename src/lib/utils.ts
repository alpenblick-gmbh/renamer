/// <reference types="pdfjs-dist" />

import { GoogleGenerativeAI } from "@google/generative-ai";
import * as pdfjsLib from 'pdfjs-dist';
// The `?url` suffix is a vite feature to get the url of the asset
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;


const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

async function callGemini(modelName: string, imageBase64: string, prompt: string) {
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
        // Extract status code from the error if possible
        const errorMessage = (error as any).toString();
        if (errorMessage.includes('503')) {
            return await callGemini("gemini-1.5-flash-latest", imageBase64, prompt);
        }
        // Re-throw if it's not the expected overload error
        throw error;
    }
}


export async function convertPdfToImage(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
  const page = await pdf.getPage(1); // Get the first page
  const viewport = page.getViewport({ scale: 1.5 });

  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error('Could not get canvas context');
  }

  canvas.height = viewport.height;
  canvas.width = viewport.width;

  const renderContext = {
    canvasContext: context,
    viewport: viewport,
  };

  await page.render(renderContext).promise;

  return canvas.toDataURL('image/jpeg');
}
