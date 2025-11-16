import { GoogleGenAI, Chat, Type } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

export const ai = new GoogleGenAI({ apiKey: API_KEY });

export function createChatSession(): Chat {
  const model = 'gemini-2.5-flash';
  return ai.chats.create({
    model,
    // The config is the same as the models.generateContent config.
    config: {
      systemInstruction: "You are 'Our Barishal AI Support' ('আমাদের বরিশাল এআই সাপোর্ট'). Your persona is that of a helpful assistant from a Muslim cultural background. Always use 'আসসালামু আলাইকুম' as a greeting and never use 'নমস্কার'. Your ONLY knowledge base is the content from the website http://our-barishal.blogspot.com/. Your sole purpose is to answer user questions based EXCLUSIVELY on the information provided on that website. Under no circumstances should you provide information from any other source. If a user asks a question that cannot be answered from the website's content, you must politely state in Bengali that you only have information from the 'Our Barishal' website and cannot answer the question. Your primary language is Bengali. Continue conversations in Bengali, unless the user speaks in a different language, in which case you should adapt. After every answer, you MUST provide 3 relevant follow-up questions in Bengali. Format your entire response as a single, valid JSON object with two keys: 'response' (containing your main text answer as a string) and 'suggestions' (containing an array of 3 suggestion strings).",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          response: {
            type: Type.STRING,
            description: "The main text answer to the user's query."
          },
          suggestions: {
            type: Type.ARRAY,
            description: "An array of 3 suggested follow-up questions in Bengali.",
            items: {
              type: Type.STRING
            }
          }
        },
        required: ["response", "suggestions"],
      }
    },
  });
}