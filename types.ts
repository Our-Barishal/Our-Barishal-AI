export type Role = "user" | "model";

export interface Message {
  role: Role;
  parts: { text: string }[];
}

export interface User {
    name: string;
    email: string;
}

export interface ChatSession {
    id: string;
    title: string;
    messages: Message[];
    createdAt: string;
    updatedAt: string;
}
