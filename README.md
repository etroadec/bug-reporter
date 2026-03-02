# Bug Reporter

Solution complète de bug reporting in-app pour React Native/Expo.

- **SDK** (`@mindedsolutions/bug-reporter-sdk`) — Shake to report, capture d'écran automatique, formulaire intégré, métadonnées device/app/network
- **Admin** — Backoffice Next.js pour visualiser et gérer les bugs
- **Supabase** — Base de données, stockage screenshots, authentification

## Architecture

```
App Mobile (Expo)              Supabase                  Admin (Vercel)
┌───────────────┐            ┌──────────┐             ┌───────────────┐
│  SDK intégré  │  upload    │ Storage  │             │  Dashboard    │
│  Shake/Bouton ├───────────▶│screenshots│            │  Filtres      │
│  Screenshot   │  insert    │          │   select    │  Détail bug   │
│  Formulaire   ├───────────▶│bug_reports├────────────▶│  Status/Notes │
└───────────────┘ (anon key) └──────────┘ (auth key)  └───────────────┘
```

## Monorepo

```
packages/
  sdk/          → SDK React Native/Expo (npm package)
  supabase/     → Migrations SQL, seed data
apps/
  admin/        → Backoffice Next.js (Vercel)
```

Géré avec **pnpm workspaces** + **Turborepo**.

## Quick Start

### 1. Supabase

Créer un projet Supabase et exécuter la migration :

```sql
-- Copier le contenu de packages/supabase/migrations/001_initial_schema.sql
-- dans l'éditeur SQL de Supabase
```

### 2. Admin

```bash
cd apps/admin
cp .env.example .env.local
# Remplir NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY
pnpm dev
```

Déployer sur Vercel : connecter le repo, root directory `apps/admin`, ajouter les variables d'environnement.

### 3. SDK

```bash
npm install @mindedsolutions/bug-reporter-sdk
```

```tsx
import { BugReporterProvider } from '@mindedsolutions/bug-reporter-sdk';

export default function App() {
  return (
    <BugReporterProvider
      config={{
        supabaseUrl: 'https://your-project.supabase.co',
        supabaseAnonKey: 'your-anon-key',
        projectId: 'my-app',
        locale: 'fr',           // 'en' | 'fr'
        enableShake: true,       // Shake to report (défaut: true)
        floatingButton: true,    // Bouton flottant (défaut: true)
      }}
    >
      <YourApp />
    </BugReporterProvider>
  );
}
```

Peer dependencies requises :

```bash
npx expo install expo-sensors react-native-view-shot expo-device expo-application expo-network
```

## SDK — API

### `<BugReporterProvider config={...}>`

| Prop | Type | Défaut | Description |
|------|------|--------|-------------|
| `supabaseUrl` | `string` | — | URL du projet Supabase |
| `supabaseAnonKey` | `string` | — | Clé anon Supabase |
| `projectId` | `string` | — | Identifiant du projet (multi-projet) |
| `locale` | `'en' \| 'fr'` | `'en'` | Langue de l'interface |
| `enableShake` | `boolean` | `true` | Activer la détection de secousse |
| `shakeThreshold` | `number` | `1.8` | Seuil de sensibilité du shake |
| `floatingButton` | `boolean` | `true` | Afficher le bouton flottant |
| `categories` | `BugCategory[]` | `['Bug', 'Crash', 'UI', ...]` | Catégories disponibles |
| `defaultCategory` | `BugCategory` | `'Bug'` | Catégorie par défaut |
| `currentScreen` | `string` | — | Nom de l'écran actuel |
| `userId` | `string` | — | ID de l'utilisateur |
| `customData` | `Record<string, unknown>` | — | Données custom attachées au report |
| `onReportSubmitted` | `(report) => void` | — | Callback après soumission |

### `useBugReporter()`

Hook pour contrôler le reporter programmatiquement :

```tsx
const { openModal, closeModal, isModalVisible } = useBugReporter();
```

### `<FloatingButton />`

Bouton flottant standalone si `floatingButton: false` dans la config :

```tsx
import { FloatingButton } from '@mindedsolutions/bug-reporter-sdk';
```

## Développement

```bash
pnpm install
pnpm build        # Build tous les packages
pnpm dev          # Dev mode
```

## Licence

MIT
