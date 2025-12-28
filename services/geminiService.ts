
import { GoogleGenAI } from "@google/genai";
import { Candidate, Interaction } from "../types";

export const getLeadAnalysis = async (candidate: Candidate, interactions: Interaction[]) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Analyze this candidate for a Yeshiva institution and provide a short summary and a score (1-10) on their likelihood to enroll.
    Candidate: ${candidate.full_name}
    Current School: ${candidate.current_yeshiva}
    Lead Source: ${candidate.source}
    Current Stage: ${candidate.stage}
    
    Recent Interactions:
    ${interactions.map(i => `- [${i.type}] ${i.summary}`).join('\n')}
    
    Provide the response in Hebrew. Format:
    Summary: [Your analysis]
    Score: [X/10]
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: "You are an expert recruitment consultant for educational institutions (Yeshivot). Analyze lead quality and provide actionable insights."
      }
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return "שגיאה בניתוח הנתונים על ידי הבינה המלאכותית.";
  }
};

export const getManagementInsights = async (candidates: Candidate[], interactions: Interaction[]) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Provide 3 strategic insights for the Head of Yeshiva based on this data:
    Total Candidates: ${candidates.length}
    Stages: ${candidates.map(c => c.stage).join(', ')}
    Recent Interactions: ${interactions.slice(0, 20).map(i => i.summary).join(' | ')}
    
    Focus on:
    1. Identifying bottlenecks in the enrollment funnel.
    2. Predicting next month's success.
    3. Actionable advice for the recruitment team.
    
    Response must be in Hebrew, bullet points, professional tone.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: "You are a senior educational consultant. Provide high-level management insights."
      }
    });
    return response.text;
  } catch (error) {
    return "לא ניתן להפיק תובנות בשלב זה.";
  }
};
