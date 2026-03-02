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
import { useAuth } from './your-auth-hook'; // votre hook d'authentification

export default function App() {
  const { user } = useAuth();

  return (
    <BugReporterProvider
      config={{
        // Requis
        supabaseUrl: 'https://your-project.supabase.co',
        supabaseAnonKey: 'your-anon-key',
        projectId: 'my-app',

        // Identification du reporter (recommandé)
        userId: user?.email,              // affiché dans l'admin comme "Reporter"
        customData: {                     // données supplémentaires visibles dans l'admin
          uid: user?.id,
          plan: user?.plan,
        },

        // Interface
        locale: 'fr',                     // 'en' | 'fr'
        floatingButton: true,             // bouton flottant (défaut: true)

        // Shake : désactivé en __DEV__ par défaut (conflit Expo dev menu)
        // enableShake: true,             // forcer l'activation en dev si besoin
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
| `enableShake` | `boolean` | `!__DEV__` | Activer la détection de secousse (désactivé en dev pour éviter le conflit avec le menu Expo) |
| `shakeThreshold` | `number` | `1.8` | Seuil de sensibilité du shake |
| `floatingButton` | `boolean` | `true` | Afficher le bouton flottant |
| `categories` | `BugCategory[]` | `['Bug', 'Crash', 'UI', ...]` | Catégories disponibles |
| `defaultCategory` | `BugCategory` | `'Bug'` | Catégorie par défaut |
| `currentScreen` | `string` | — | Nom de l'écran actuel (ex: `HomeScreen`) |
| `userId` | `string` | — | Email ou ID du reporter — affiché dans l'admin |
| `customData` | `Record<string, unknown>` | — | Données custom attachées au report (uid, plan, rôle, etc.) |
| `onReportSubmitted` | `(report) => void` | — | Callback après soumission |

### Identifier le reporter

Pour savoir **qui** a signalé un bug, passez `userId` et/ou `customData` :

```tsx
<BugReporterProvider
  config={{
    ...
    userId: user.email,           // visible dans l'admin sous "Reporter"
    customData: {
      uid: user.id,               // visible dans l'admin sous "Custom Data"
      plan: 'premium',
      role: 'admin',
    },
  }}
>
```

Ces informations apparaissent dans le backoffice admin sur la page de détail de chaque bug.

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
