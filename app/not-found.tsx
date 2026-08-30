import Link from "next/link";

export default function NotFound() {
  return (
    <div className="lab-card mx-auto flex max-w-md flex-col items-center gap-3 p-10 text-center">
      <p className="text-4xl">🧫</p>
      <h1 className="font-display text-xl font-bold">Cultivo negativo</h1>
      <p className="text-sm text-mist-400">
        No encontramos ningún registro en esta ruta. Puede que la ficha aún no exista en esta
        fase de BacteriDex.
      </p>
      <Link href="/" className="focus-ring rounded-lg bg-bio px-4 py-2 text-sm font-medium text-base-950">
        Volver al inicio
      </Link>
    </div>
  );
}
