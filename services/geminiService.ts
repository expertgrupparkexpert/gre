
import { GoogleGenAI, Type, Modality } from "@google/genai";
import type { ShoppingItem } from '../types';

// Lazy initialize the GoogleGenAI instance to prevent app crash on load
// if the API key is not available in the environment.
let aiInstance: GoogleGenAI | null = null;
const getAi = (): GoogleGenAI => {
  if (!aiInstance) {
    aiInstance = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
  }
  return aiInstance;
};

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = error => reject(error);
  });
};

export const refinePromptForImageEditing = async (complexPrompt: string): Promise<string> => {
  try {
    const ai = getAi();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: complexPrompt,
      config: {
        systemInstruction: `You are an expert interior design assistant. Your task is to translate a user's conversational design request into a clear, concise, and direct instruction for an image generation AI. The instruction should be a short phrase or sentence describing the visual change. For example, if the user says 'I think the room needs to be brighter and more welcoming', you should output 'Make the walls a lighter color and add warm lighting'. Only output the direct instruction for the AI, nothing else. The output should be in Turkish.`,
      },
    });
    return response.text.trim();
  } catch (error) {
    console.error("Error refining prompt:", error);
    // Fallback to the original prompt if refinement fails
    return complexPrompt;
  }
};

export const editImage = async (base64Image: string, mimeType: string, prompt: string): Promise<string> => {
  try {
    const ai = getAi();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image,
              mimeType: mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });
    
    const imagePart = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);

    if (imagePart?.inlineData?.data) {
      return imagePart.inlineData.data;
    }
    
    console.error("Görüntü oluşturma yanıtında resim verisi bulunamadı veya geçersiz yanıt yapısı.", response);
    throw new Error("Yapay zeka bir görüntü oluşturamadı. Bunun nedeni güvenlik ayarları veya geçersiz bir komut olabilir.");

  } catch (error) {
    console.error("Görüntü düzenlenirken hata:", error);
    if (error instanceof Error && error.message.startsWith("Yapay zeka")) {
      throw error;
    }
    throw new Error("Görüntü Gemini API ile düzenlenemedi.");
  }
};


export const getShoppingLinks = async (base64Image: string, mimeType: string): Promise<ShoppingItem[]> => {
    const prompt = "Based on the items in this image, provide a list of 5 similar shoppable items. For each item, provide the item name, a URL to an online store, and an approximate price in USD.";
    try {
        const ai = getAi();
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: {
                parts: [
                    { inlineData: { mimeType, data: base64Image } },
                    { text: prompt }
                ]
            },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            itemName: { type: Type.STRING },
                            url: { type: Type.STRING },
                            price: { type: Type.STRING },
                        },
                        required: ["itemName", "url", "price"]
                    }
                }
            }
        });

        const jsonString = response.text.trim();
        const shoppingItems: ShoppingItem[] = JSON.parse(jsonString);
        return shoppingItems;

    } catch (error) {
        console.error("Error getting shopping links:", error);
        throw new Error("Failed to generate shopping links with Gemini API.");
    }
};
