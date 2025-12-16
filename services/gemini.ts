import { GoogleGenAI, Chat, FunctionDeclaration, Type } from "@google/genai";

const SYSTEM_INSTRUCTION = `
You are an elite "Agentic Travel Planner". Your goal is to design bespoke, highly detailed travel itineraries.

**CORE DIRECTIVE:**
You MUST use the provided tool \`propose_itinerary\` to present the final plan. Do not write the itinerary in plain text.

**WORKFLOW:**
1.  **Analyze Request:** Identify destination, duration, budget, and "Vibe".
2.  **Analyze Image (if present):** Extract the aesthetic (e.g., "Minimalist Nordic", "Chaotic Cyberpunk", "Rustic Italian") and apply this mood to the activity choices.
3.  **Construct Itinerary:** Call the \`propose_itinerary\` function with specific, real-world locations and activities.
4.  **Fallback:** If the user just says "Hello", reply conversationally in text. Only call the function when planning a trip.

**TONE:** 
Sophisticated, enthusiastic, and highly organized.
`;

const itineraryTool: FunctionDeclaration = {
  name: "propose_itinerary",
  description: "Generates a structured travel itinerary based on user preferences.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      trip_title: { type: Type.STRING, description: "A catchy name for the trip" },
      destination: { type: Type.STRING },
      duration: { type: Type.STRING },
      budget_estimate: { type: Type.STRING },
      vibe: { type: Type.STRING, description: "The detected mood/aesthetic of the trip" },
      summary: { type: Type.STRING, description: "A simplified 2-sentence overview of the experience" },
      days: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            day_number: { type: Type.INTEGER },
            theme: { type: Type.STRING },
            activities: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  time_of_day: { type: Type.STRING, enum: ["Morning", "Afternoon", "Evening"] },
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  location: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    },
    required: ["trip_title", "destination", "days", "summary", "vibe"]
  }
};

let chatInstance: Chat | null = null;

export const getChatInstance = (): Chat => {
  if (!chatInstance) {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    chatInstance = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.5, // Lower temperature for more consistent function calling
        tools: [{ functionDeclarations: [itineraryTool] }],
      },
    });
  }
  return chatInstance;
};

export const sendMessageStream = async (message: string, imageBase64?: string) => {
  const chat = getChatInstance();
  
  let msgContent: any = message;

  if (imageBase64) {
      const [meta, data] = imageBase64.split(',');
      const mimeType = meta.split(':')[1].split(';')[0];

      msgContent = [
          { text: message },
          { inlineData: { mimeType: mimeType, data: data } }
      ];
  }
  
  // We return the stream. The caller (App.tsx) handles parsing function calls from the chunks/final response.
  return chat.sendMessageStream({ message: msgContent });
};