"use client";

import { User, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css"; // Estilos para las fórmulas matemáticas

export interface ChatMessage {
  id: string;
  role: "user" | "model";
  text: string;
  isError?: boolean;
}

export default function Message({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";

  return (
    <div className={`flex w-full ${isUser ? "justify-end" : "justify-start"} mb-4`}>
      <div
        className={`flex max-w-[85%] sm:max-w-[75%] items-start gap-3 rounded-2xl px-4 py-3 ${
          isUser
            ? "bg-bio text-base-950 rounded-tr-sm"
            : message.isError
            ? "bg-alert/10 border border-alert/20 text-alert rounded-tl-sm"
            : "bg-base-800 border border-base-700 text-mist-100 rounded-tl-sm"
        }`}
      >
        {!isUser && (
          <div className="mt-0.5 shrink-0">
            {message.isError ? (
              <span className="text-xl">⚠️</span>
            ) : (
              <Sparkles className="h-5 w-5 text-bio" />
            )}
          </div>
        )}

        <div className="overflow-hidden w-full prose-sm prose-invert 
            prose-p:leading-relaxed prose-pre:bg-base-950 prose-pre:border prose-pre:border-base-700
            prose-headings:text-inherit prose-a:text-bio hover:prose-a:text-bio-light">
          {isUser ? (
            <div className="whitespace-pre-wrap">{message.text}</div>
          ) : (
            <ReactMarkdown 
              remarkPlugins={[remarkGfm, remarkMath]} 
              rehypePlugins={[rehypeKatex]}
            >
              {message.text}
            </ReactMarkdown>
          )}
        </div>

        {isUser && (
          <div className="mt-0.5 shrink-0">
            <User className="h-5 w-5 opacity-75" />
          </div>
        )}
      </div>
    </div>
  );
}
