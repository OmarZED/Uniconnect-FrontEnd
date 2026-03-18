
import { GoogleGenAI, Type } from "@google/genai";

const apiKey = process.env.API_KEY || '';

// Initialize the client safely, even if the key is missing initially
const getClient = () => {
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

export const generatePostContent = async (role: string, context: string): Promise<string> => {
  const ai = getClient();
  if (!ai) return "Error: API Key missing.";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Generate a realistic, short social media post (max 280 chars) for a university community app. 
      The author is a ${role}. The context is: ${context}.
      Make it sound professional yet engaging.`,
    });
    return response.text.trim();
  } catch (error) {
    console.error("GenAI Error:", error);
    return "Could not generate content at this time.";
  }
};

export const analyzeDomainQuery = async (query: string): Promise<string> => {
  const ai = getClient();
  if (!ai) return "Please provide an API Key to use the AI Assistant.";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are an expert software architect analyzing a university domain diagram.
      The domain includes entities like User, Role, Student, Teacher, Department Manager, Dean, Course, Classroom, Subject, Community, Post, Report, Notification, Chat, Vote.
      
      User asks: "${query}"
      
      Provide a concise, technical explanation or suggestion based on this domain model.`,
    });
    return response.text;
  } catch (error) {
    console.error("GenAI Error:", error);
    return "I encountered an error analyzing your request.";
  }
};

export const generateDummyUsers = async (count: number): Promise<any[]> => {
  const ai = getClient();
  if (!ai) return [];

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Generate ${count} fictional university users in JSON format matching the UserDto structure.
      Roles: 0=Student, 1=Teacher, 2=Manager, 3=Dean.
      Return ONLY a JSON array.
      Schema: [{ firstName, lastName, fullName, email, role (int), facultyName, studentGroupName (optional) }]`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    firstName: { type: Type.STRING },
                    lastName: { type: Type.STRING },
                    fullName: { type: Type.STRING },
                    email: { type: Type.STRING },
                    role: { type: Type.INTEGER, description: "0=Student, 1=Teacher, 2=Manager, 3=Dean" },
                    facultyName: { type: Type.STRING },
                    studentGroupName: { type: Type.STRING }
                }
            }
        }
      }
    });
    
    const text = response.text;
    const data = JSON.parse(text);
    // Post-process to ensure IDs and consistency
    return data.map((u: any, index: number) => ({
        ...u,
        id: `gen_${Date.now()}_${index}`,
        isActive: true,
        createdAt: new Date().toISOString()
    }));
  } catch (error) {
    console.error("GenAI Error:", error);
    return [];
  }
};
