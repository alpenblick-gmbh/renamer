import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import * as pdfjs from 'pdfjs-dist';
import { GoogleGenerativeAI } from "@google/generative-ai";
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

// Set worker source for pdf.js
pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker;

// Get API key from environment variables
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

/**
 * Converts a Base64 image to a GenerativePart object.
 * @param imageBase64 The Base64 encoded image string.
 * @returns The GenerativePart object for the image.
 */
function imageToGenerativePart(imageBase64: string) {
  return {
    inlineData: {
      data: imageBase64.split(",")[1],
      mimeType: "image/png",
    },
  };
}

/**
 * Gets a new file name from the Gemini API based on an image and a prompt.
 * @param imageBase64 The Base64 encoded image for analysis.
 * @param prompt The prompt to guide the naming process.
 * @returns A promise that resolves to the new file name.
 */
export async function getNewFileName(imageBase64: string, prompt: string): Promise<string> {
  const model = genAI.getGenerativeModel({ model: "gemini-pro-latest" });
  const imagePart = imageToGenerativePart(imageBase64);

  const result = await model.generateContent([prompt, imagePart]);
  const text = result.response.text().trim();
  
  // Remove wrapping quotes and backticks if present
  return text.replace(/[^\w\d\s.,_-]/g, '');
}


/**
 * Converts the first page of a PDF file to a PNG image as a Base64 string.
 * @param file The PDF file to convert.
 * @returns A promise that resolves with the Base64 encoded PNG image.
 */
export const convertPdfToImage = async (file: File): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument(arrayBuffer).promise;
  const page = await pdf.getPage(1);

  const viewport = page.getViewport({ scale: 1.5 });
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  canvas.height = viewport.height;
  canvas.width = viewport.width;

  if (context) {
    await page.render({ canvasContext: context, viewport: viewport } as any).promise;
    return canvas.toDataURL('image/png');
  }

  throw new Error('Could not get canvas context');
};

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
