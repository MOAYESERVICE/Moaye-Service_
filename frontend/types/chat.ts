export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
};

export type Conversation = {
  id: string;
  title: string;
  messages: ChatMessage[];
  updatedAt: number;
};