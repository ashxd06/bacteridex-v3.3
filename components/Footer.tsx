import Link from "next/link";
import Logo from "./Logo";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-base-700 bg-base-900/60 print:hidden">
      <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-mist-400">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Logo className="h-7 w-7" />
            <div>
              <p className="font-display text-base font-semibold text-mist-100">
                Bacteri<span className="text-bio">Dex</span>
              </p>
              <p className="mt-1">Enciclopedia interactiva de Laboratorio Clínico.</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-4">
            <Link href="/acerca" className="hover:text-bio">Acerca de BacteriDex</Link>
            <Link href="/procedimientos" className="hover:text-bio">Procedimientos</Link>
            <Link href="/pruebas" className="hover:text-bio">Pruebas</Link>
          </div>
        </div>
        <p className="mt-6 border-t border-base-700 pt-4 text-xs text-mist-400">
          Creado por <span className="font-medium text-mist-200">Alex Arenas (Satoshi)</span>. Contenido
          educativo de Laboratorio Clínico; no sustituye protocolos institucionales ni indicación médica.
        </p>
      </div>
    </footer>
  );
}
