# Bug Reporter

Solution complete de bug reporting et feature requests in-app pour React Native/Expo.

- **SDK** (`@mindedsolutions/bug-reporter-sdk`) — Shake to report, capture d'ecran automatique, formulaire integre, lien vers le board de features
- **Admin** — Backoffice Next.js pour gerer les bugs et les feature requests
- **Board** — Board public pour soumettre et voter sur les feature requests
- **Supabase** — Base de donnees, stockage screenshots, authentification

## Architecture

```
App Mobile (Expo)              Supabase                  Admin (Vercel)
┌───────────────┐            ┌──────────┐             ┌───────────────┐
│  SDK integre  │  upload    │ Storage  │             │  Dashboard    │
│  Shake/Bouton ├───────────>│screenshots│            │  Bugs/Features│
│  Screenshot   │  insert    │          │   select    │  Status/Notes │
│  Formulaire   ├───────────>│bug_reports├───────────>│  Admin resp.  │
│  FeatureBoard │            │feature_  │             └───────────────┘
│    Link       │            │requests  │
└───────────────┘ (anon key) │feature_  │             Board (Vercel)
                             │votes     │             ┌───────────────┐
                             └──────────┘  select     │  Liste votes  │
                                          ├──────────>│  Soumission   │
                                          (anon key)  │  Filtres/Tri  │
                                                      └───────────────┘
```

## Monorepo

```
packages/
  sdk/          -> SDK React Native/Expo (npm package)
  supabase/     -> Migrations SQL, seed data
apps/
  admin/        -> Backoffice Next.js (Vercel) — port 3000
  board/        -> Board public Next.js (Vercel) — port 3001
```

Gere avec **pnpm workspaces** + **Turborepo**.

## Quick Start

### 1. Supabase

Creer un projet Supabase et executer les migrations :

```sql
-- Copier le contenu de packages/supabase/migrations/001_initial_schema.sql
-- puis packages/supabase/migrations/002_feature_requests.sql
-- dans l'editeur SQL de Supabase
```

### 2. Admin

```bash
cd apps/admin
cp .env.example .env.local
# Remplir NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
pnpm dev
```

### 3. Board

```bash
cd apps/board
cp .env.example .env.local
# Remplir NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY
pnpm dev
```

Deployer sur Vercel : connecter le repo, root directory `apps/board`, ajouter les variables d'environnement.

### 4. SDK

```bash
npm install @mindedsolutions/bug-reporter-sdk
```

```tsx
import { BugReporterProvider, FeatureBoardLink } from '@mindedsolutions/bug-reporter-sdk';
import { useAuth } from './your-auth-hook';

export default function App() {
  const { user } = useAuth();

  return (
    <BugReporterProvider
      config={{
        // Requis
        supabaseUrl: 'https://your-project.supabase.co',
        supabaseAnonKey: 'your-anon-key',
        projectId: 'my-app',

        // Identification du reporter (recommande)
        userId: user?.email,
        customData: {
          uid: user?.id,
          plan: user?.plan,
        },

        // Interface
        locale: 'fr',                     // 'en' | 'fr'
        floatingButton: true,             // bouton flottant (defaut: true)

        // Feature Board (optionnel)
        featureBoard: {
          boardBaseUrl: 'https://your-board.vercel.app',
        },
      }}
    >
      <YourApp />
      {/* Placer le lien vers le board ou vous voulez */}
      <FeatureBoardLink />
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

| Prop | Type | Defaut | Description |
|------|------|--------|-------------|
| `supabaseUrl` | `string` | — | URL du projet Supabase |
| `supabaseAnonKey` | `string` | — | Cle anon Supabase |
| `projectId` | `string` | — | Identifiant du projet (multi-projet) |
| `locale` | `'en' \| 'fr'` | `'en'` | Langue de l'interface |
| `enableShake` | `boolean` | `!__DEV__` | Activer la detection de secousse |
| `shakeThreshold` | `number` | `1.8` | Seuil de sensibilite du shake |
| `floatingButton` | `boolean` | `true` | Afficher le bouton flottant |
| `categories` | `BugCategory[]` | `['Bug', 'Crash', ...]` | Categories disponibles |
| `defaultCategory` | `BugCategory` | `'Bug'` | Categorie par defaut |
| `currentScreen` | `string` | — | Nom de l'ecran actuel |
| `userId` | `string` | — | Email ou ID du reporter |
| `customData` | `Record<string, unknown>` | — | Donnees custom attachees au report |
| `onReportSubmitted` | `(report) => void` | — | Callback apres soumission |
| `featureBoard` | `FeatureBoardConfig` | — | Configuration du board de features |

### `<FeatureBoardLink />`

Bouton style (indigo) qui ouvre le board public dans le navigateur. A placer ou vous voulez dans l'app.

| Prop | Type | Description |
|------|------|-------------|
| `style` | `ViewStyle` | Style du bouton |
| `textStyle` | `TextStyle` | Style du texte |
| `label` | `string` | Label custom (defaut: traduction `suggestFeature`) |

Retourne `null` si `featureBoard` n'est pas configure.

### `useFeatureBoard()`

Hook pour controler le board programmatiquement :

```tsx
const { boardUrl, openFeatureBoard } = useFeatureBoard();
```

### `useBugReporter()`

Hook pour controler le reporter programmatiquement :

```tsx
const { openModal, closeModal, isModalVisible } = useBugReporter();
```

## Board public

Le board public (`apps/board`) permet aux utilisateurs de :

- Voir les feature requests existantes
- Voter / devoter (toggle via UNIQUE constraint)
- Soumettre de nouvelles feature requests
- Filtrer par statut et trier par votes ou date

L'identite du votant est geree via `voter_id` :
- Si passe en query param (depuis le SDK) : stocke en localStorage
- Sinon : genere avec `crypto.randomUUID()` et stocke en localStorage

## Admin

Le backoffice admin permet de gerer :

- **Bugs** (`/`) — Liste, filtres, detail, changement de statut, notes, assignation
- **Features** (`/features`) — Liste, filtres, detail, changement de statut, reponse admin

## Developpement

```bash
pnpm install
pnpm build        # Build tous les packages
pnpm dev          # Dev mode (admin :3000, board :3001, sdk watch)
```

## Licence

MIT
