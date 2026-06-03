declare module "ollama" {
  export type ChatMessage = {
    role: "system" | "user" | "assistant";
    content: string;
  };

  export type ChatResponse = {
    message: {
      content: string;
    };
  };

  const ollama: {
    chat(input: {
      model: string;
      messages: ChatMessage[];
      format?: unknown;
      options?: Record<string, unknown>;
    }): Promise<ChatResponse>;
  };

  export default ollama;
}
