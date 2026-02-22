# Intro für KI – Seemodo-Starter

Du arbeitest am **Seemodo-Starter-Template**: eine React-SPA, die lokal und über Seemodo weiterentwickelt wird.

**Wichtig:** Die App muss **ohne Supabase-Zugänge lauffähig** sein (kein .env oder leere Supabase-Vars). Dann: Platzhalter-Client, Auth = nicht eingeloggt, keine Crashes. Neue Features so bauen, dass sie ohne Supabase entweder deaktiviert sind oder sinnvoll degradieren (z. B. „Nicht konfiguriert“ statt Absturz).

**Wenn Supabase von extern verbunden wird** (API Keys / .env mit `VITE_SUPABASE_URL` und `VITE_SUPABASE_PUBLISHABLE_KEY` angelegt): Überall wo sinnvoll **Supabase einbauen und verbinden** – Auth (bereits über AuthContext), Profil lesen/schreiben (`profiles`), weitere Tabellen (`analyses`, `org_charts`, `org_roles`), Storage, Edge Functions aufrufen. Erkennung: **`isSupabaseConfigured`** aus `@/integrations/supabase/client` – `true`, wenn echte Credentials gesetzt sind. Dann alle Supabase-Features nutzen; trotzdem Fehler (z. B. Netzwerk) abfangen.

## Stack

- **Build**: Vite 6, TypeScript
- **UI**: React 18, React Router 6, Tailwind CSS, **shadcn/ui** (Radix-basiert, Komponenten in `src/components/ui/`)
- **State/Data**: TanStack React Query, optional **Supabase** (Auth, DB, Edge Functions)
- **Forms**: react-hook-form, Zod, @hookform/resolvers (Form + Validierung)
- **Tests**: Vitest, Testing Library (jsdom, @testing-library/react)

## Projektstruktur (relevant)

```
src/
  main.tsx          → Einstieg
  App.tsx           → Router, Provider, Routes
  App.css
  index.css         → Design-System (CSS-Variablen)
  pages/            → Seiten (eine Komponente pro Route)
  components/       → eigene Komponenten
  components/ui/    → shadcn-Komponenten (nicht anpassen außer nötig)
  contexts/         → React Context (z. B. AuthContext)
  hooks/             → Custom Hooks
  lib/utils.ts       → cn() und andere Hilfen
  integrations/supabase/  → client, types
  test/              → setup.ts, Beispiel-Tests
public/              → favicon, statische Assets (z. B. placeholder.svg)
index.html           → HTML-Einstieg, Meta, Seemodo-Script
supabase/
  migrations/        → SQL-Migrationen
  functions/         → Edge Functions (z. B. analyze-role)
```

## Wichtige Pfade

- **Einstieg**: `src/main.tsx` → `src/App.tsx` (Router, QueryClient, AuthProvider, Routes)
- **Routen**: in `App.tsx` unter `Routes`; neue Routen **über** der Catch-All-Route `path="*"` eintragen
- **Seiten**: `src/pages/` (z. B. `Index.tsx`, `NotFound.tsx`)
- **Komponenten**: `src/components/` (eigene) und `src/components/ui/` (shadcn)
- **Auth**: `src/contexts/AuthContext.tsx` – `useAuth()` liefert `{ user, session, loading, signOut }`
- **Supabase**: `src/integrations/supabase/client.ts` – `supabase` (Client), **`isSupabaseConfigured`** (boolean, true wenn echte .env-Keys gesetzt). `types.ts` (DB-Typen: `Tables<'profiles'>`, `Tables<'analyses'>`, …). Ohne `.env` → Platzhalter-Client, App bleibt lauffähig.
- **Hooks/Utils**: `src/hooks/`, `src/lib/utils.ts` – **`cn(...)`** aus `@/lib/utils` für Tailwind-Klassen (clsx + tailwind-merge)
- **Imports**: Alias **`@/`** → `src/` (z. B. `import { useAuth } from "@/contexts/AuthContext"`)

## Umgebungsvariablen (.env)

- **VITE_SUPABASE_URL** – Supabase-Projekt-URL (z. B. `https://<ref>.supabase.co`)
- **VITE_SUPABASE_PUBLISHABLE_KEY** – Anon/Public Key aus Supabase Dashboard
- Optional (Supabase Edge Functions): **SEEMODO_API_KEY** im Supabase Dashboard unter Edge Functions Secrets

Vorlage: `.env.example` kopieren nach `.env` und Werte eintragen. Nur Variablen mit `VITE_` sind im Frontend verfügbar (`import.meta.env.VITE_*`).

## Styling & Design-System

- **Tailwind**: Konfiguration in `tailwind.config.ts`. Content-Pfade: `./src/**/*.{ts,tsx}` (und weitere).
- **Farben/Themes**: Alle in **`src/index.css`** als HSL-CSS-Variablen unter `:root` und `.dark` (z. B. `--background`, `--foreground`, `--primary`, `--muted`, `--radius`, Sidebar-Varianten). Tailwind nutzt diese über `theme.extend.colors` (z. B. `bg-background`, `text-muted-foreground`). **Neue Farben nur in index.css als HSL definieren.**
- **Dark Mode**: Tailwind `darkMode: "class"` – Klasse `.dark` auf ein Parent (z. B. `<html>`) setzen; oft über `next-themes` oder manuell.
- **Klassen zusammenfügen**: `cn(...)` aus `@/lib/utils` verwenden (besonders bei bedingten oder überschriebenen Klassen).

## Navigation & Links

- **Intern**: `NavLink` aus `@/components/NavLink` (Wrapper um React Router `NavLink`) mit optional `activeClassName` und `pendingClassName`; oder `Link`/`useNavigate` aus `react-router-dom`.

## Feedback (Toasts)

- Zwei Systeme eingebunden: **Toaster** (shadcn) und **Sonner** – beide in `App.tsx`. Für Toasts: `useToast()` aus `@/components/ui/use-toast` bzw. `@/hooks/use-toast` oder Sonner-API nutzen.

## Supabase (optional / bei Verbindung voll nutzen)

- **Client & Erkennung**: `@/integrations/supabase/client` – `supabase`, **`isSupabaseConfigured`**. Ohne `.env` → Platzhalter-Client; **App darf nicht crashen** – AuthContext fängt Fehler ab.
- **Wenn verbunden** (API Keys in .env): Supabase überall sinnvoll nutzen: **Auth** (bereits `useAuth()`), **profiles** (Profil nach Login lesen/aktualisieren), **analyses / org_charts / org_roles** wo die Features genutzt werden, **Storage** für Uploads, **Edge Functions** per `supabase.functions.invoke()`. Typen aus `types.ts` verwenden (`Tables<'profiles'>`, `TablesInsert`, …). Bei Aufrufen weiterhin Fehler abfangen (Netzwerk, RLS).
- **Auth**: Immer über **`useAuth()`** (user, session, loading, signOut), nicht direkt `supabase.auth` für Session-State.
- **Typen**: `Database`, `Tables<'table_name'>`, `TablesInsert`, `TablesUpdate` aus `@/integrations/supabase/types`.
- **Migrations**: `supabase/migrations/`. Nach Änderungen: `supabase link --project-ref <ref>`, dann `supabase db push`.
- **Edge Functions**: `supabase/functions/` (z. B. `analyze-role/index.ts`). Deploy: `supabase functions deploy <name>`. Geheimnisse im Supabase Dashboard (Edge Functions). Siehe `supabase/README.md`.

**Nutzung im Code:**
- **Ohne Supabase** (`isSupabaseConfigured === false`): Login/Profil-Features ausblenden oder Hinweis „Supabase nicht konfiguriert“ anzeigen; keine Supabase-Calls, die die App blockieren oder crashen.
- **Mit Supabase** (`isSupabaseConfigured === true`): Auth über `useAuth()`, Tabellen z. B. `supabase.from('profiles')`, `supabase.from('analyses')` nutzen, Typen wie `Tables<'profiles'>`, `TablesInsert<'profiles'>` aus `@/integrations/supabase/types` verwenden; Storage und Edge Functions per `supabase.storage`, `supabase.functions.invoke()`. Fehler (Netzwerk, RLS) trotzdem abfangen.

## HTML & Meta

- **`index.html`**: Titel, Description, og:title, og:description etc. – TODOs im Head für App-Namen anpassen. **Seemodo Runtime** wird per Script von `https://app.seemodo.ai/seemodo.js` geladen (Console/Network-Logging, visuelles Bearbeiten).

## Konventionen

- **Seiten**: Neue Seite als Komponente in `src/pages/`, Route in `App.tsx` **über** der `path="*"`-Route eintragen.
- **Komponenten**: PascalCase (z. B. `NavLink.tsx`). Eigene Komponenten in `src/components/`, shadcn nur in `src/components/ui/` erweitern wenn nötig.
- **UI**: Vorhandene shadcn-Komponenten aus `src/components/ui/` nutzen; gleichen Stil und Aufbau beibehalten (Tailwind + CSS-Variablen).
- **Supabase**: Typen aus `@/integrations/supabase/types`; Auth nur über `useAuth()`. Wenn `isSupabaseConfigured`: Auth, DB, Storage, Functions überall einbinden; wenn nicht: Features ausblenden oder Degradation, nie crashen.
- **Tests**: Setup in `src/test/setup.ts` (u. a. matchMedia-Mock). Tests in `src/test/` oder neben dem Code. `npm run test` / `npm run test:watch`.
- **Ohne Supabase**: Code, der Supabase nutzt (Auth, DB, Functions), bei Fehlern/Abwesenheit abfangen oder degradieren – nie die App zum Absturz bringen. `useAuth()` liefert dann einfach `user: null`, `loading: false`.

## Nützliche Befehle

- **`npm run dev`** – Dev-Server (Port 8080, Host `::`)
- **`npm run build`** / **`npm run build:dev`** – Production- bzw. Development-Build
- **`npm run preview`** – Build lokal vorschauen
- **`npm run lint`** – ESLint
- **`npm run test`** / **`npm run test:watch`** – Vitest
- **Supabase**: `.env` aus `.env.example`; `supabase link --project-ref <ref>`; `supabase db push`; `supabase functions deploy <name>`

## Deployment

- Über **Seemodo**: Share → Publish. Custom Domain in Seemodo unter Project → Settings → Domains.
- Optional: Repo kann mit Vercel o. Ä. verbunden sein (z. B. `vercel.json`).

---

Wenn du unsicher bist: zuerst `App.tsx`, `AuthContext.tsx`, `index.css` und die betroffenen Seiten/Komponenten lesen, dann Änderungen vorschlagen oder umsetzen.
