import { NextResponse } from "next/server";
import { getGeminiModel } from "@/lib/ai/gemini";
import { getBacteridexContext } from "@/lib/ai/context";

export async function POST(req: Request) {
  try {
    const { history, prompt, mode = "normal", organismoId = null } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "El prompt es requerido." }, { status: 400 });
    }

    let model;
    try {
      model = getGeminiModel();
    } catch (e: any) {
      return NextResponse.json(
        { error: e.message || "Error de configuración de API." },
        { status: 500 }
      );
    }

    // Preparar el historial en el formato de Gemini SDK
    // El frontend nos enviará un array con { role: "user" | "model", parts: [{ text: "..." }] }
    const formattedHistory = Array.isArray(history) ? history : [];

    // Obtener contexto de la base de BacteriDex
    const bacteridexContext = getBacteridexContext(prompt, organismoId);
    
    // Inyectar el contexto de BacteriDex de forma oculta en el último mensaje
    let finalPrompt = prompt;
    if (bacteridexContext) {
      finalPrompt = `[INSTRUCCIÓN INTERNA OCULTA PARA EL MODELO]\n${bacteridexContext}\n\n[MENSAJE DEL USUARIO]\n${prompt}`;
    }

    if (mode === "estudio") {
      finalPrompt = `[MODO ESTUDIO: Responde de forma guiada para que el estudiante piense, haciendo preguntas socráticas si es oportuno]\n${finalPrompt}`;
    }

    const chat = model.startChat({
      history: formattedHistory,
    });

    const result = await chat.sendMessage(finalPrompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ text });

  } catch (error: any) {
    console.error("AI Chat API Error:", error);
    
    // Generic safe error message
    let errorMessage = "No pude procesar la respuesta en este momento. Intenta nuevamente.";
    if (error.message?.includes("API key")) {
      errorMessage = "Error de configuración: GEMINI_API_KEY no válida o ausente.";
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
