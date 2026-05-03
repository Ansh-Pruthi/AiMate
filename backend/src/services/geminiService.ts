import { getGeminiModel } from "../config/gemini";
import { IGeminiMessage } from "../types";

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

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
  retries: number = 3,
): AsyncGenerator<string> {
  const model = getGeminiModel(modelName);
  const chat = model.startChat({ history });

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const result = await chat.sendMessageStream(newUserMessage);

      for await (const chunk of result.stream) {
        const text = chunk.text();
        if (text) yield text;
      }

      return; // success — exit the retry loop
    } catch (error) {
      if (error instanceof Error) {
        const is429 =
          error.message.includes("quota") ||
          error.message.includes("429") ||
          error.message.includes("TooManyRequests");

        if (is429 && attempt < retries) {
          const waitMs = attempt * 10000; // 10s, 20s, 30s
          console.warn(
            `⚠️  Gemini rate limited. Retry ${attempt}/${retries} in ${waitMs / 1000}s...`,
          );
          yield `\n\n_Rate limited, retrying in ${waitMs / 1000} seconds..._\n\n`;
          await sleep(waitMs);
          continue; // retry
        }

        if (is429) {
          throw new GeminiError(
            "Gemini API is currently rate limited. Please wait a moment and try again.",
            429,
          );
        }

        if (error.message.includes("SAFETY")) {
          throw new GeminiError(
            "Your message was blocked by safety filters.",
            400,
          );
        }
        throw new GeminiError(`Gemini API error: ${error.message}`, 500);
      }
      throw new GeminiError("Unknown error from Gemini API", 500);
    }
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
