import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";

const MessageSchema = z.object({
  role: z.enum(["system", "user", "assistant"]),
  content: z.string(),
});

const GenerateInput = z.object({
  system: z.string().optional(),
  prompt: z.string().optional(),
  messages: z.array(MessageSchema).optional(),
});

export const generateAI = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => GenerateInput.parse(data))
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");
    const gateway = createLovableAiGatewayProvider(key);
    const model = gateway.chatModel("google/gemini-3-flash-preview");

    const { text } = await generateText({
      model,
      system: data.system,
      ...(data.messages
        ? { messages: data.messages }
        : { prompt: data.prompt ?? "" }),
    });
    return { text };
  });
