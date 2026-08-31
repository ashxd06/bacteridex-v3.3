"use client";

import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { Send, Loader2, RefreshCcw } from "lucide-react";
import Message, { ChatMessage } from "./Message";
import Suggestions from "./Suggestions";

export default function Chat({
  initialContext,
  initialQuery
}: {
  initialContext?: string;
  initialQuery?: string;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState(initialQuery || "");
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  
  // En la primera carga, si hay una query inicial (ej. desde url), enviarla automáticamente.
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (initialQuery && !hasInitialized.current) {
      hasInitialized.current = true;
      handleSend(initialQuery);
    }
  }, [initialQuery]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  async function handleSend(textOverride?: string) {
    const textToSend = textOverride || input;
    if (!textToSend.trim()) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      text: textToSend.trim(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      // Preparamos historial para Gemini:
      const history = messages.filter(m => !m.isError).map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      const payload = {
        prompt: textToSend.trim(),
        history,
        mode: "normal",
        organismoId: initialContext || null
      };

      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Ocurrió un error de conexión.");
      }

      const modelMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "model",
        text: data.text,
      };

      setMessages((prev) => [...prev, modelMsg]);

    } catch (error: any) {
      const errorMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "model",
        text: error.message || "Error desconocido",
        isError: true
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleRetry = () => {
    // Busca el último mensaje del usuario antes del error
    const lastUserMsg = [...messages].reverse().find(m => m.role === "user");
    if (lastUserMsg) {
      // Quitar los errores finales
      setMessages(prev => prev.filter(m => !m.isError));
      handleSend(lastUserMsg.text);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] w-full max-w-4xl mx-auto lab-card overflow-hidden">
      {/* Contenedor de mensajes */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 scrollbar-thin">
        {messages.length === 0 ? (
          <Suggestions onSelect={(t) => handleSend(t)} />
        ) : (
          <div className="flex flex-col gap-2">
            {messages.map((msg) => (
              <Message key={msg.id} message={msg} />
            ))}
            
            {isLoading && (
              <div className="flex justify-start mb-4">
                <div className="flex items-center gap-3 rounded-2xl rounded-tl-sm px-4 py-3 bg-base-800 border border-base-700 text-mist-400">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span className="text-sm font-medium animate-pulse">BacteriDex AI está pensando...</span>
                </div>
              </div>
            )}
            
            {messages.length > 0 && messages[messages.length - 1].isError && (
              <div className="flex justify-start">
                <button 
                  onClick={handleRetry}
                  className="flex items-center gap-2 text-sm text-mist-400 hover:text-mist-200"
                >
                  <RefreshCcw className="h-4 w-4" /> Reintentar
                </button>
              </div>
            )}
            <div ref={bottomRef} className="h-4" />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-base-700 bg-base-800/50 p-4">
        <div className="relative flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            placeholder="Pregunta algo sobre laboratorio clínico... (Enter para enviar, Shift+Enter para nueva línea)"
            className="w-full resize-none rounded-xl border border-base-600 bg-base-900 px-4 py-3 text-sm focus-ring min-h-[50px] max-h-[200px] scrollbar-thin disabled:opacity-50 disabled:cursor-not-allowed"
            rows={input.split("\n").length > 3 ? 3 : input.split("\n").length}
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            className="focus-ring flex h-[50px] w-[50px] shrink-0 items-center justify-center rounded-xl bg-bio text-base-950 transition-colors hover:bg-bio-glow disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
          </button>
        </div>
        <div className="mt-2 text-center text-[10px] text-mist-500">
          BacteriDex AI es una herramienta educativa. No puede realizar diagnósticos reales ni sustituir el criterio profesional.
        </div>
      </div>
    </div>
  );
}
