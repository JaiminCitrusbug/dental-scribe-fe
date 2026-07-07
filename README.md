# dental-scribe-fe

Frontend for **DentalScribe** - a dental medical-scribe platform. React 19 + Vite 7 + TypeScript + Tailwind v4, organized by atomic design (`agents/frontendv2.md`).

## Stack
- **React 19** + **Vite 7** + **TypeScript**
- **Tailwind CSS v4** (CSS-first tokens in `src/styles/theme.css`)
- **react-router-dom v7** - routing
- **@tanstack/react-query v5** - server state
- Fonts: **Plus Jakarta Sans** (display) + **Inter** (UI), bundled via `@fontsource-variable`

## Scripts
```bash
npm install
npm run dev        # start dev server (http://localhost:5173)
npm run build      # typecheck + production build
npm run preview    # preview the production build
```

## Design system
The locked visual language lives in `src/styles/theme.css` (tokens) and the component
library under `src/components/{atoms,molecules,layout}`. A live styleguide is available at
the **`/design-system`** route. Principles: card depth + soft shadows, solid pastel accents,
**no gradients, no flat design, no AI-landing aesthetic**.

## Structure
```
src/
├─ app/            # App bootstrap + router
├─ components/
│  ├─ atoms/       # Button, Input, Badge, Card, Avatar, icons
│  ├─ molecules/   # StatTile, NavItem
│  └─ layout/      # Sidebar, Topbar, AppShell
├─ features/       # dashboard, design-system, misc (feature-scoped UI)
├─ lib/            # cn(), accent tokens
└─ styles/         # theme tokens + base CSS
```

## Environment
Copy `.env.example` → `.env` and set `VITE_API_BASE_URL` to the backend URL.
