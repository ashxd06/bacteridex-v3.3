# 🧫 BacteriDex

Enciclopedia interactiva de Laboratorio Clínico. Next.js 14 (App Router) + TypeScript + Tailwind CSS.
Toda la app funciona como sitio estático — no necesita base de datos ni backend propio. El progreso
del estudiante (XP, favoritos, flashcards, puntaje de "Identifica") se guarda en el navegador (localStorage).

Creado por **Alex Arenas (Satoshi)**.

## Contenido actual (Fase 2)

- **106 microorganismos** con ficha completa: 46 bacterias, 24 virus, 18 hongos, 18 parásitos
- **33 pruebas bioquímicas/de laboratorio** documentadas
- **19 medios de cultivo** documentados
- **16 procedimientos** de laboratorio clínico (microbiología, micología, parasitología, toma de
  muestras y bioseguridad), cada uno con objetivo, fundamento, materiales, reactivos, pasos,
  interpretación, errores frecuentes, control de calidad y bioseguridad
- Buscador global (ahora incluye procedimientos), comparador, quiz dinámico, flashcards con
  repetición espaciada, modo **"Identifica el microorganismo"** (pistas progresivas, 4 niveles de
  dificultad, puntaje y racha), gamificación, modo oscuro/claro, diseño responsive
- **Sistema de imágenes manuales**: cada organismo, prueba, medio y procedimiento tiene una entrada
  lista en `lib/images.ts` para que pegues tus propias imágenes — ver sección 3 más abajo
- Página **"Acerca de"** con la autoría y las reglas de calidad del contenido

La arquitectura sigue pensada para escalar hacia los cientos de microorganismos planeados,
simplemente agregando objetos a los archivos en `/data`, sin tocar el código de la interfaz.

---

## 1. Cómo correrlo en tu computadora (opcional, antes de subirlo)

Necesitas tener [Node.js](https://nodejs.org) instalado (versión 18 o superior).

```bash
cd bacteridex
npm install
npm run dev
```

Abre `http://localhost:3000` en tu navegador. Los cambios en el código se recargan solos.

Si solo quieres subirlo directo a Vercel sin probarlo en tu máquina, puedes saltarte este paso.

---

## 2. Cómo publicarlo en Vercel (paso a paso, para principiantes)

### Opción A — Subiendo el proyecto a GitHub primero (recomendada)

1. **Crea una cuenta gratuita** en [github.com](https://github.com) si no tienes una.
2. **Crea un repositorio nuevo** (botón verde "New repository"), ponle de nombre `bacteridex`,
   y déjalo público o privado, como prefieras. No marques ninguna casilla de inicialización.
3. En tu computadora, dentro de la carpeta `bacteridex`, ejecuta:
   ```bash
   git init
   git add .
   git commit -m "BacteriDex Fase 2"
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/bacteridex.git
   git push -u origin main
   ```
   **Importante:** todo el contenido de la carpeta `bacteridex` (package.json, app/, components/,
   data/, lib/, public/, etc.) debe quedar en la RAÍZ del repositorio, no dentro de una carpeta
   `bacteridex/` anidada.
4. **Crea una cuenta gratuita** en [vercel.com](https://vercel.com) — puedes registrarte
   directamente con tu cuenta de GitHub.
5. Dentro de Vercel: **"Add New… → Project"** → busca `bacteridex` → **"Import"** → **"Deploy"**.
6. Espera 1-2 minutos y obtendrás una URL pública como `https://bacteridex.vercel.app`.

Cada `git push` posterior actualiza el sitio automáticamente.

### Opción B — Subida directa sin GitHub

```bash
npm install -g vercel
vercel        # primer despliegue, sigue las preguntas
vercel --prod # despliegues siguientes
```

---

## 3. Cómo agregar tus propias imágenes (sistema manual)

**No se descarga ninguna imagen de Internet automáticamente.** Todo el sistema es manual y está
centralizado en un solo archivo: `lib/images.ts`.

Ese archivo contiene un mapa por cada microorganismo (dos entradas: **microscópica** y **agar**),
por cada prueba, medio y procedimiento, con un comentario que indica exactamente qué imagen falta:

```ts
export const imagenesMicroscopica: MapaImagenes = {
  b001: null, // === AQUI VA IMAGEN MICROSCOPICA DE STAPHYLOCOCCUS AUREUS / TINCION DE GRAM ===
  ...
};

export const imagenesAgar: MapaImagenes = {
  b001: null, // === AQUI VA IMAGEN DE STAPHYLOCOCCUS AUREUS EN AGAR / CULTIVO ===
  ...
};
```

Cada microorganismo tiene **exactamente dos** tarjetas fijas en su ficha — 🔬 Microscópica y
🧫 Agar — no hay una tercera tarjeta ni imagen de portada adicional.

Para agregar una imagen:

1. Coloca el archivo en `/public/images/<categoria>/tu-imagen.jpg` (por ejemplo
   `/public/images/bacterias/staph-aureus-microscopica.jpg`). Crea las subcarpetas si no existen:
   `bacterias/`, `virus/`, `hongos/`, `parasitos/`, `medios-cultivo/`, `pruebas/`, `procedimientos/`.
2. En `lib/images.ts`, reemplaza el `null` correspondiente por la ruta:
   ```ts
   b001: "/images/bacterias/staph-aureus-microscopica.jpg",
   ```
3. Guarda y vuelve a desplegar (`git push` o `vercel --prod`). No hace falta tocar ningún otro
   archivo — la ficha detecta automáticamente la imagen y dejará de mostrar el placeholder.

Si el valor sigue en `null`, la app **no se rompe**: sigue mostrando un placeholder ilustrado con
el texto de qué imagen falta, nunca una imagen caída ni un espacio vacío que estorbe.

**Medios de cultivo es una sección totalmente aparte**: sus imágenes (`imagenesMedios` en
`lib/images.ts`) son fotos **genéricas** del aspecto del medio (ej. "cómo se ve el agar sangre"),
independientes de las fotos de cada microorganismo, y van en `/public/images/medios-cultivo/`. No
se mezclan entre sí ni forman una tercera tarjeta dentro de la ficha del microorganismo.

---

## 4. Cómo seguir agregando contenido (sin tocar el código de la interfaz)

Toda la base de datos vive en `/data`:

- `data/bacterias.json`, `data/virus.json`, `data/hongos.json`, `data/parasitos.json`
- `data/pruebas.json` — pruebas bioquímicas/de laboratorio
- `data/medios.json` — medios de cultivo
- `data/procedimientos.json` — biblioteca de procedimientos de laboratorio

Para agregar un registro nuevo: copia un objeto existente de la categoría correspondiente, pégalo
al final del arreglo, cambia el `id` (debe ser único, ej. `b047`, `v025`, `h019`, `p019`) y el
`numero`, y completa los campos siguiendo la misma estructura (ver `lib/types.ts`).

Después de editar un archivo `.json`, agrega también su entrada de imagen en `lib/images.ts` (o
vuelve a generarlo si prefieres, siguiendo el mismo patrón `id: null, // === PONER AQUI...`), y
vuelve a desplegar.

---

## 5. Estructura del proyecto

```
bacteridex/
  app/                 → páginas (rutas) de Next.js: organismos, pruebas, medios,
                          procedimientos, buscar, comparador, quiz, flashcards,
                          identifica, progreso, acerca
  components/          → piezas de interfaz reutilizables (incluye Footer con la autoría)
  data/                → toda la base de datos científica en JSON
  lib/                 → tipos, funciones de datos, progreso del estudiante e imágenes manuales
  public/               → manifest PWA, ícono, carpeta images/ para tus fotos
```

## 6. Calidad del contenido

- No se inventan datos científicos, imágenes ni fuentes.
- Cuando una prueba o resultado depende del método, fabricante o protocolo institucional, se indica
  explícitamente (campo `notaProtocolo` en procedimientos).
- Se diferencia entre identificación presuntiva, confirmatoria, tamizaje, diagnóstico y pruebas de
  susceptibilidad antimicrobiana.
- El contenido es educativo y no reemplaza el POE de ningún laboratorio ni una indicación clínica
  profesional — esto se aclara también en la página "Acerca de" (`/acerca`).

## 8. Cuentas de usuario (Supabase) — nuevo

BacteriDex sigue siendo una enciclopedia **100% pública**: nadie necesita cuenta para buscar,
leer fichas, hacer quiz, usar flashcards o el modo Identifica. Iniciar sesión solo desbloquea
**favoritos en la nube, notas personales e historial**, sincronizados entre dispositivos.

Si no configuras Supabase, la app sigue funcionando exactamente igual que antes (favoritos locales
por navegador incluidos); los botones de cuenta simplemente no aparecen.

### 8.1 Crear el proyecto en Supabase

1. Crea una cuenta gratuita en [supabase.com](https://supabase.com) y un proyecto nuevo.
2. Ve a **Project Settings → API** y copia la **Project URL** y la **anon public key**.
3. Ve a **SQL Editor → New query**, pega el contenido completo de `supabase/schema.sql` (incluido
   en este proyecto) y ejecútalo. Esto crea las tablas `profiles`, `favorites`, `notes`, `history`,
   `user_settings`, activa Row Level Security en todas y crea el trigger que genera el perfil
   automáticamente al registrarse.
4. Ve a **Authentication → URL Configuration** y configura:
   - **Site URL**: la URL de tu sitio en Vercel, ej. `https://bacteridex.vercel.app`
   - **Redirect URLs**: agrega también `https://bacteridex.vercel.app/recuperar` (y
     `http://localhost:3000/recuperar` si vas a probar en local)
5. En **Authentication → Providers → Email**, confirma que el proveedor de correo esté activado.
   Puedes dejar "Confirm email" activado (más seguro) o desactivarlo (los usuarios entran de
   inmediato tras registrarse) según prefieras.

### 8.2 Variables de entorno

En tu computadora, copia `.env.local.example` a `.env.local` y completa los valores:

```
NEXT_PUBLIC_SUPABASE_URL=https://TU-PROYECTO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=TU_ANON_KEY_PUBLICA
```

En **Vercel → tu proyecto → Settings → Environment Variables**, agrega esas mismas dos variables
(con los valores reales) para Production, Preview y Development. Luego haz **Redeploy**.

La clave `anon` es pública por diseño (así funciona Supabase) y es segura de usar en el frontend.
**Nunca** agregues la `service_role key` en el proyecto ni en variables `NEXT_PUBLIC_*`.

### 8.3 Cómo probar cada función

- **Registro**: entra a cualquier página → botón "Crear cuenta" → completa usuario, correo y
  contraseña → si tienes confirmación de correo activada, revisa tu bandeja; si no, entrarás de
  inmediato.
- **Login**: botón "Iniciar sesión" con el correo y contraseña ya registrados.
- **Recuperar contraseña**: en el modal de login, "¿Olvidaste tu contraseña?" → revisa tu correo →
  el enlace te lleva a `/recuperar`, donde el formulario cambia automáticamente a "nueva
  contraseña".
- **Favoritos**: con sesión iniciada, abre cualquier ficha de microorganismo y toca ☆; debe pasar a
  ★ y aparecer en `/favoritos`. Sin sesión, el mismo botón muestra el aviso "Necesitas iniciar
  sesión…" con accesos directos a login/registro.
- **Notas**: en `/notas`, crea una nota (con o sin microorganismo asociado), edítala y elimínala.
- **Historial**: visita 2-3 fichas distintas con sesión iniciada y revisa `/perfil` — deben aparecer
  en "Historial reciente".
- **Aislamiento entre usuarios (RLS)**: crea dos cuentas de prueba. Guarda un favorito con la
  cuenta A, cierra sesión, entra con la cuenta B y verifica que `/favoritos` esté vacío para B
  (no ve los datos de A). También puedes confirmarlo en Supabase → **Table Editor → favorites**:
  cada fila tiene su propio `user_id`, y las políticas RLS impiden que una sesión distinta a esa
  pueda leerla o modificarla, aunque conozca el id de la fila.

---

## 9. Archivos nuevos/modificados en esta actualización

**Nuevos:**
`lib/supabase/client.ts`, `components/AuthProvider.tsx`, `components/AuthModal.tsx`,
`components/RequiereSesion.tsx`, `lib/hooks/useFavoritosNube.ts`, `app/perfil/page.tsx`,
`app/favoritos/page.tsx`, `app/notas/page.tsx`, `app/recuperar/page.tsx`, `supabase/schema.sql`,
`.env.local.example`

**Modificados (de forma aditiva, sin quitar nada):**
`package.json` (dependencia `@supabase/supabase-js`), `app/layout.tsx` (envuelve la app con
`AuthProvider` y agrega `AuthModal`), `components/Navbar.tsx` y `components/MobileNav.tsx`
(botones de sesión / menú de usuario), `components/OrganismDetail.tsx` (el botón de favorito usa
Supabase cuando hay sesión iniciada; si no, sigue usando el sistema local de siempre; además
registra el historial de visitas)

---

## 10. Próximos pasos sugeridos

- Seguir ampliando `/data` en lotes (más microorganismos, pruebas, medios y procedimientos).
- Ir colocando tus propias imágenes en `/public/images` y `lib/images.ts` a tu ritmo.
- Si más adelante quieres sincronizar también el tema o el progreso de quiz/flashcards en la nube,
  la tabla `user_settings` ya está creada y lista para usarse.

---

## 11. 🧠 BacteriDex Study (PDF → material de estudio con IA) — nuevo

Módulo aislado que convierte un PDF (apuntes, diapositivas, libros) en resumen, temas, conceptos,
microorganismos, tablas, interpretación de imágenes, flashcards y exámenes generados por Claude.
Requiere haber iniciado sesión (usa las cuentas de Supabase ya configuradas) y guarda cada
documento y su material en tu propia cuenta, protegido con RLS igual que favoritos/notas.

### 11.1 Qué se agregó (nada existente se modificó más allá de enlaces de navegación)

**Nuevo:** `lib/study/types.ts`, `lib/study/prompt.ts`, `lib/supabase/admin.ts`,
`app/api/study/analizar/route.ts` (única ruta que llama a la IA — corre en el servidor),
`components/study/PDFUploader.tsx`, `components/study/StudyDashboard.tsx`,
`components/study/StudyFlashcards.tsx`, `components/study/StudyExam.tsx`, `app/study/page.tsx`,
`app/study/[id]/page.tsx`, bloque nuevo al final de `supabase/schema.sql`.

**Modificado (mínimo, aditivo):** `package.json` (`@anthropic-ai/sdk`), `components/Navbar.tsx`
(enlace "🧠 Study" y entrada en el menú de usuario), `app/page.tsx` (tarjeta de acceso rápido),
`.env.local.example` (nuevas variables).

### 11.2 Configuración adicional en Supabase

1. Ejecuta el bloque nuevo de `supabase/schema.sql` (a partir de "BacteriDex Study") en el SQL
   Editor — crea `study_documents`, `study_content`, `study_flashcards`, `study_questions` con RLS,
   sin tocar las tablas anteriores.
2. Ve a **Storage** → **New bucket** → nombre exacto `study-pdfs` → **privado** (no marcar
   público).
3. El mismo script SQL incluye las políticas de Storage necesarias para que cada usuario solo
   pueda subir/leer/eliminar archivos dentro de su propia carpeta (`<user_id>/archivo.pdf`).

### 11.3 Variables de entorno nuevas

Además de `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` (ya usadas por el sistema
de cuentas), agrega en `.env.local` y en Vercel:

```
SUPABASE_SERVICE_ROLE_KEY=...   # Supabase → Project Settings → API → service_role
ANTHROPIC_API_KEY=...           # console.anthropic.com → API Keys
```

**Ambas son solo de servidor** (sin prefijo `NEXT_PUBLIC_`): Next.js nunca las incluye en el
código que se envía al navegador, y solo se leen dentro de `app/api/study/analizar/route.ts` y
`lib/supabase/admin.ts`. Si te falta alguna de las dos, `/study` sigue existiendo pero avisa que
el módulo no está configurado en vez de fallar.

### 11.4 Cómo funciona (para que sepas qué esperar)

- El PDF se sube directo a Supabase Storage desde el navegador (autenticado, a tu propia carpeta).
- El navegador le pide al servidor que lo analice enviando solo el `documentId` (nunca la clave de
  IA ni el archivo pasan por el cliente hacia la IA).
- El servidor descarga el PDF con la `service_role key`, verifica que el documento sea tuyo,
  y se lo envía completo a Claude (que lee texto, imágenes y escaneados sin necesitar un OCR
  aparte), pidiéndole una respuesta en JSON estructurado con reglas estrictas de "no inventar" y
  de tratar el PDF como datos, nunca como instrucciones.
- El resultado se guarda en tus tablas de Supabase y se muestra en pestañas: Resumen, Temas,
  Conceptos, Microorganismos, Tablas, Imágenes, Flashcards y Examen.
- **Límite actual:** hasta 32 MB / ~100 páginas por documento (límite del formato de documentos de
  la API de Claude). Documentos más grandes deberían dividirse antes de subirlos; no hay
  fragmentación automática en esta primera versión.

### 11.5 Cómo probar

1. Configura las 4 variables de entorno y ejecuta el SQL nuevo.
2. Inicia sesión en BacteriDex → entra a `/study` (o el enlace "🧠 Study" del menú).
3. Sube un PDF de prueba (unas pocas páginas primero) y pulsa "Analizar PDF".
4. Verifica que aparezcan los conteos (temas, microorganismos, etc.) y que cada dato tenga su
   número de página cuando el documento lo permite.
5. Prueba Flashcards (voltear, marcar como aprendida) y Examen (elige 10 preguntas, responde,
   revisa el resultado final con explicaciones).
6. Crea una segunda cuenta y confirma que no ve los documentos de la primera en `/study`.

### 11.6 Selector de motor de IA (Claude / Gemini / OpenAI) — nuevo

BacteriDex Study ahora puede analizar el PDF con tres proveedores de IA distintos. Antes de pulsar
"Analizar PDF" aparece un selector **🤖 Motor de IA** con 4 opciones:

- **⚡ Automático ⭐ Recomendado** (predeterminado): intenta Claude → si falla por créditos,
  autenticación, límite de uso o no disponibilidad, prueba Gemini → si también falla, prueba
  OpenAI. Si el problema es del propio documento (no algo que cambiar de proveedor solucione), se
  detiene ahí en vez de seguir intentando. Los proveedores sin clave configurada se saltan
  automáticamente, sin generar error.
- **🟣 Claude / 🔵 Gemini / 🟢 OpenAI**: usan únicamente ese proveedor, sin fallback. Si no tiene
  clave configurada, se muestra "Este proveedor de IA no está configurado actualmente."

**Archivos nuevos de esta actualización:**
`lib/study/ai/tipos.ts` (tipos + clase `ErrorProveedorIA` + detección de qué claves están
configuradas), `lib/study/ai/anthropic.ts`, `lib/study/ai/gemini.ts`, `lib/study/ai/openai.ts`
(un adaptador por proveedor, cada uno devuelve exactamente el mismo `ResultadoAnalisis` de
siempre), `lib/study/ai/provider.ts` (orquestador del modo Automático/manual).

**Archivos modificados (mínimo, aditivo):** `app/api/study/analizar/route.ts` (ya no llama a
Anthropic directamente, ahora llama a `analizarDocumento(...)`; el resto del flujo — descarga del
PDF, guardado en `study_content`/`study_flashcards`/`study_questions`, actualización de
`study_documents` — no cambió), `components/study/PDFUploader.tsx` (selector visual + envío del
proveedor elegido al backend), `package.json` (`@google/generative-ai`, `openai`),
`.env.local.example`.

**No se tocó:** `/data`, Supabase Auth, `profiles`, `favorites`, `notes`, `history`,
`user_settings`, el bucket `study-pdfs`, ni las políticas RLS existentes. El contrato
`ResultadoAnalisis` (temas, flashcards, preguntas, etc.) es idéntico sin importar qué IA respondió.

**Variables de entorno nuevas:** `GEMINI_API_KEY` y `OPENAI_API_KEY` (ambas solo servidor, mismo
patrón que `ANTHROPIC_API_KEY`, que se mantiene). Puedes configurar solo una, dos o las tres — con
una sola alcanza para que Study funcione; con las tres, Automático tiene margen de respaldo real.
Dónde obtener cada una:
- Claude: console.anthropic.com → API Keys
- Gemini: aistudio.google.com/app/apikey
- OpenAI: platform.openai.com/api-keys

**Cómo probar:** sube un PDF, elige "Automático" y analiza — debería usar Claude si tiene crédito.
Para probar el fallback real, quita temporalmente `ANTHROPIC_API_KEY` de Vercel (o deja su cuenta
sin crédito) y vuelve a analizar en modo Automático: debería completarse igual usando Gemini u
OpenAI, y el mensaje final debe indicar qué pasó. Selecciona manualmente "Claude" con la clave
quitada para confirmar que muestra "Este proveedor de IA no está configurado actualmente." en vez
de un error técnico.

---

## 12. 🎨 Fase 1 del rediseño visual: paleta clínica + iconos vectoriales — nuevo

Primera fase de la evolución visual de BacteriDex hacia una identidad de laboratorio clínico
(azul principal, celeste secundario, violeta reservado para Study/IA, verde para estados
positivos, rojo solo para errores/alertas). **No se tocó ninguna función, ruta ni componente de
lógica** — solo colores y los iconos de navegación.

**Qué cambió exactamente:**

- `tailwind.config.ts`: el token de color `bio` (usado en botones, enlaces activos, focus-ring,
  etc. en toda la app) pasó de teal a **azul clínico** (`#2E6BE6`). Como es un cambio de *valor*
  del mismo token, se propaga automáticamente a cada `bg-bio`/`text-bio`/`border-bio` ya existente
  en el proyecto, sin tocar esos archivos uno por uno. Se agregaron dos tokens nuevos, listos para
  usarse en las próximas fases: `cian` (celeste secundario) y `verde` (estados positivos). `gene`
  (violeta) y `alert` (rojo) ya cumplían su rol previsto (Study/gamificación y errores
  respectivamente), así que se dejaron igual.
- Se agregó `lucide-react` como librería de iconos (el proyecto no tenía ninguna).
- `components/Navbar.tsx` y `components/MobileNav.tsx`: los enlaces de navegación (Bacterias,
  Virus, Hongos, Parásitos, Pruebas, Medios, Procedimientos, Comparar, Identifica, Study, Quiz,
  Flashcards, Progreso, Buscar, tema, cuenta) ahora usan iconos vectoriales de Lucide en vez de
  emoji.
- `app/page.tsx`: la grilla "Explorar" de la página de inicio usa los mismos iconos vectoriales.

**A propósito se dejó igual (por ahora):** los emojis dentro del contenido educativo (fichas de
microorganismos, quiz, flashcards, medallas, importancia médica, `StatTile` del dashboard, etc.)
— el propio criterio de diseño distingue entre "iconos de navegación" (ahora vectoriales) y
"emojis con personalidad dentro del contenido" (se conservan).

**Pendiente para una futura fase 1b** (no implementado todavía, para no ampliar el alcance de este
cambio): aplicar el token `verde` a los estados de "correcto" en quiz/examen/flashcards, y usar
`cian` como acento secundario en buscadores y enlaces destacados.

### 12.1 Fase 1b: verde para estados "correcto" + celeste en buscadores — completada

- **Verde (`verde`)** ahora marca específicamente estados positivos/de acierto:
  - Resaltado de la respuesta correcta en `/quiz` y `/identifica` (después de responder).
  - Resumen final del examen de BacteriDex Study (`StudyExam.tsx`): fila y texto en verde cuando la
    respuesta fue correcta, rojo (`alert`, sin cambios) cuando fue incorrecta.
  - Marca "✓ Aprendida" en las flashcards de Study (`StudyFlashcards.tsx`).
  - Botón "Fácil" en las flashcards de la enciclopedia (`app/flashcards/page.tsx`).
  - **A propósito sin tocar:** los estados de *selección* (elegir dificultad en Identifica, elegir
    cuántas preguntas en el examen, elegir una opción antes de que se revele si es correcta) siguen
    en azul — el verde se reserva solo para cuando algo ya se confirmó como correcto/logrado, no
    para "esto está seleccionado".
- **Celeste (`cian`)** como acento secundario en los buscadores: borde al enfocar el input de
  `/buscar`, y color de hover/identidad del acceso "Buscar" en el Navbar y la navegación móvil.

Archivos tocados en esta fase: `app/quiz/page.tsx`, `app/identifica/page.tsx`,
`components/study/StudyExam.tsx`, `components/study/StudyFlashcards.tsx`,
`app/flashcards/page.tsx`, `app/buscar/page.tsx`, `components/Navbar.tsx`,
`components/MobileNav.tsx`. Ningún cambio de lógica, solo clases de Tailwind.

---

## 13. 👑 Sistema de roles (admin/user) + panel /admin — nuevo

Primera pieza de la evolución hacia plataforma: cuentas normales y cuentas administradoras,
con la asignación de rol protegida a nivel de base de datos (no solo ocultando un botón).

### 13.1 Qué se agregó

**Supabase (bloque nuevo al final de `supabase/schema.sql`, aditivo):**
- Columna `role` en `profiles` (`'user'` por defecto, restringida a `'user'`/`'admin'` con un
  `check` constraint).
- Trigger `prevent_role_self_escalation`: si una sesión de usuario normal (`auth.role() =
  'authenticated'`, es decir, alguien usando la app con su propia cuenta) intenta cambiar su
  columna `role`, el trigger la revierte silenciosamente al valor anterior. Solo se puede cambiar
  el rol desde el SQL Editor de Supabase o desde el backend con la `service_role key` — nunca
  manipulando la app desde el navegador.

**Archivos nuevos:**
- `app/api/admin/usuarios/route.ts` — ruta protegida: verifica con la `service_role key` que quien
  llama tiene `role = 'admin'` en su propio perfil antes de devolver la lista de usuarios.
- `app/admin/page.tsx` — panel con tarjetas por sección (Microorganismos, Análisis, Procedimientos,
  Microscopía, Study — todavía "Próximamente", se implementan en fases futuras; Usuarios ya
  funcional). Si no hay sesión, pide iniciar sesión; si hay sesión pero no es admin, muestra
  "Acceso restringido" en vez del contenido.
- `app/admin/usuarios/page.tsx` — lista de solo lectura de las cuentas registradas y su rol.

**Modificado (mínimo, aditivo):**
- `components/AuthProvider.tsx` — ahora también carga el perfil (`username`, `role`) del usuario
  autenticado y expone `perfil` y `esAdmin` en el contexto. No cambia ninguna función existente
  (`iniciarSesion`, `crearCuenta`, `cerrarSesion`, etc.), solo agrega estado nuevo.
- `components/Navbar.tsx` — el menú de usuario muestra "Panel Admin" únicamente si `esAdmin` es
  verdadero.

### 13.2 Cómo convertir tu cuenta en administrador

1. Ejecuta el bloque nuevo de `supabase/schema.sql` (sección 12) en el SQL Editor de Supabase.
2. Regístrate normalmente en BacteriDex con tu correo, como cualquier usuario.
3. En el SQL Editor de Supabase, ejecuta (reemplazando el correo):
   ```sql
   update public.profiles set role = 'admin'
   where id = (select id from auth.users where email = 'tu-correo@ejemplo.com');
   ```
4. Vuelve a iniciar sesión en BacteriDex (o recarga la página) — el menú de usuario mostrará
   "Panel Admin" y `/admin` dejará de mostrar "Acceso restringido".

### 13.3 Por qué es seguro (no es solo ocultar un botón)

- La UI (`esAdmin`) solo decide **qué se muestra**, nunca protege datos por sí sola.
- La protección real está en dos capas del servidor: el trigger de Postgres (nadie puede
  auto-ascenderse vía la app, ni siquiera manipulando las peticiones) y la ruta
  `/api/admin/usuarios`, que vuelve a verificar el rol con la `service_role key` antes de devolver
  cualquier dato — nunca confía en lo que el cliente diga sobre sí mismo.

### 13.4 Cómo probar

1. Con una cuenta normal (`role = 'user'`), entra a `/admin` → debe mostrar "Acceso restringido".
2. Intenta (opcionalmente, para verificar la protección) hacer `update` de tu propio `role` a
   `'admin'` usando el cliente de Supabase autenticado como usuario normal (por ejemplo desde la
   consola del navegador) → el trigger debe revertirlo; tu rol sigue en `'user'`.
3. Conviértete en admin siguiendo 13.2, recarga, entra a `/admin` → debe mostrarte el panel
   completo y "Usuarios" debe listar todas las cuentas.
4. Con una segunda cuenta normal, confirma que `/admin` le sigue mostrando "Acceso restringido".

### 13.5 Pendiente para próximas fases (no implementado todavía)

Gestión real (crear/editar/archivar) de Microorganismos, Análisis, Insertos, Procedimientos y
Microscopía desde el panel — hoy son tarjetas "Próximamente" para no ampliar el alcance de esta
fase. Cuando se implementen, seguirán el mismo patrón de seguridad: verificación de `role =
'admin'` en el servidor antes de cualquier escritura.

---

## 14. 🧬 Análisis Clínicos — nuevo

Primera pieza de contenido de la que dependerán después Insertos, Calculadoras y Registros (según
el mapa de relaciones de la evolución de BacteriDex: `ANÁLISIS → INSERTO → PROCEDIMIENTO →
CALCULADORA → ESCALADOR → REGISTRO → STUDY`).

### 14.1 Qué se agregó

- `data/analisis.json` — 10 análisis de bioquímica clínica (Glucosa, Colesterol total,
  Triglicéridos, Albúmina, Urea, Creatinina, Ácido úrico, Bilirrubina total/directa, AST/TGO,
  ALT/TGP), cada uno con: descripción, utilidad clínica, tipo y condiciones de muestra, reactivos,
  materiales, método, longitud de onda, pasos generales, fórmula, unidades, valores de referencia
  y consideraciones.
- `app/analisis/page.tsx` y `app/analisis/[id]/page.tsx` — listado con filtro por categoría y
  ficha de detalle, siguiendo exactamente el mismo patrón visual que Procedimientos.
- `lib/types.ts` y `lib/data.ts` — tipos `AnalisisClinico`/`CategoriaAnalisis` y funciones
  (aditivo, no se tocó ningún tipo existente).
- Se sumó al buscador global, al menú de navegación, a la grilla de la home y al panel `/admin`
  (enlaza a la sección pública; la edición desde el panel es una fase futura).

### 14.2 Sobre los valores de referencia

Como en Procedimientos, cada ficha tiene un campo `notaProtocolo` que aclara que los volúmenes,
tiempos, longitud de onda y rangos de referencia mostrados son generales y educativos — **el
inserto vigente del fabricante del reactivo siempre tiene prioridad** sobre estos valores en un
entorno real de laboratorio, tal como pediste explícitamente. No se inventó ningún valor: son
rangos estándar de bioquímica clínica ampliamente documentados en la literatura del área.

### 14.3 Pendiente para próximas fases

- Ampliar categorías más allá de bioquímica (hematología, inmunología, uroanálisis, etc.) — la
  arquitectura ya lo soporta, solo falta agregar contenido.
- Conectar cada análisis con su Inserto (PDF) y con una Calculadora real cuando esas piezas
  existan — el campo `procedimientosRelacionados` ya está listo para ese tipo de vínculos.
