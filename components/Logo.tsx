// Logomark reutilizable: una "placa de Petri" estilizada con colonias, en
// la paleta cian/turquesa de la marca (mismo espíritu que /public/icon.svg,
// que ya usa exactamente estos tonos). No es un archivo de imagen pesado:
// es SVG inline, así que hereda color por currentColor donde aplica y se ve
// nítido a cualquier tamaño (navbar, footer, login, admin, favicon).
export default function Logo({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 128 128" className={className} role="img" aria-label="BacteriDex">
      <rect width="128" height="128" rx="28" fill="#0B1220" />
      <circle cx="64" cy="64" r="46" stroke="#22C7E0" strokeWidth="6" fill="none" />
      <circle cx="64" cy="64" r="34" stroke="#22C7E0" strokeWidth="1.5" strokeOpacity="0.35" fill="none" />
      <circle cx="52" cy="54" r="7" fill="#22C7E0" />
      <circle cx="76" cy="70" r="9" fill="#8B6BFF" />
      <circle cx="70" cy="44" r="5" fill="#F2B84B" />
    </svg>
  );
}
