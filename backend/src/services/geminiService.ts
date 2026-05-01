import { getGeminiModel } from "../config/gemini";
import { IGeminiMessage } from "../types";

export class GeminiError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Object.setPrototypeOf(this, GeminiError.prototype);
  }
}

export const formatMessagesForGemini = (
  messages: Array<{ role: string; content: string }>,
): IGeminiMessage[] => {
  return messages
    .filter((msg) => msg.role !== "system")
    .map((msg) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }],
    }));
};

export async function* streamGeminiResponse(
  history: IGeminiMessage[],
  newUserMessage: string,
  modelName: string = "gemini-2.0-flash",
): AsyncGenerator<string> {
  const model = getGeminiModel(modelName);

  /**
   * Separate history from current message
   * Gemini SDK: history = all previous turns, sendMessage = current turn
   */
  const chat = model.startChat({ history });

  try {
    const result = await chat.sendMessageStream(newUserMessage);

    for await (const chunk of result.stream) {
      const text = chunk.text();
      if (text) {
        yield text;
      }
    }
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("SAFETY")) {
        throw new GeminiError(
          "Your message was blocked by safety filters. Please rephrase.",
          400,
        );
      }
      if (error.message.includes("RECITATION")) {
        throw new GeminiError(
          "Response blocked due to recitation policy.",
          400,
        );
      }
      if (error.message.includes("quota") || error.message.includes("429")) {
        throw new GeminiError(
          "API rate limit reached. Please try again later.",
          429,
        );
      }
      throw new GeminiError(`Gemini API error: ${error.message}`, 500);
    }
    throw new GeminiError("Unknown error from Gemini API", 500);
  }
}

export const generateTitle = async (
  firstUserMessage: string,
): Promise<string> => {
  const model = getGeminiModel("gemini-2.0-flash");

  try {
    const result = await model.generateContent(
      `Generate a short, descriptive title (max 6 words, no quotes, no punctuation at end) 
       for a conversation that starts with this message: "${firstUserMessage}"`,
    );
    const title = result.response.text().trim();
    return title.length > 0 ? title : "New Conversation";
  } catch (error) {
    return "New Conversation";
  }
};
