
import { GoogleGenAI } from "@google/genai";

const getAI = () => {
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
  if (!apiKey || apiKey === 'PLACEHOLDER_API_KEY') return null;
  return new GoogleGenAI({ apiKey });
};

export async function analyzeInstagramUrl(url: string) {
  try {
    const ai = getAI();
    if (!ai) return "Ready to download your high-quality Instagram content.";

    const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(`You are an Instagram assistant. I have an Instagram URL: ${url}. 
      Generate 3 high-impact hashtags and a 1-sentence SEO summary for a downloader page using this URL.`);

    return result.response.text();
  } catch (error) {
    console.error("Gemini analysis error:", error);
    return "Ready to download your high-quality Instagram content.";
  }
}
