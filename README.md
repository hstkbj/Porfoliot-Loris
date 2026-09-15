# 🎬 Portfolio Vidéaste & Monteur — Guide de Liaison de la Base de Données

Ce guide explique pas à pas comment connecter votre base de données **PostgreSQL hébergée sur Supabase**, comment récupérer vos clés/variables d'environnement, et quelles commandes exécuter pour déployer le schéma de données.

---

## ⚡ 1. Fonctionnement du stockage (Mode Hybride)

L'application intègre une architecture hybride intelligente :
- **Sans configuration Supabase** : Le site fonctionne immédiatement grâce à un stockage local persistant complet (`localStorage`). Vous pouvez tester l'espace admin, modifier vos tarifs, ajouter des projets et recevoir des demandes de devis.
- **Avec Supabase connecté** : Dès que les variables d'environnement sont détectées, l'application bascule automatiquement sur votre base PostgreSQL Supabase avec authentification sécurisée, stockage cloud des médias et règles RLS (*Row Level Security*).

---

## 🔑 2. Comment obtenir vos variables d'environnement Supabase

Pour connecter votre propre base de données, vous avez besoin de deux variables clés :
1. `VITE_SUPABASE_URL`
2. `VITE_SUPABASE_ANON_KEY`

---

### Option A : Directement depuis le tableau de bord web Supabase (Le plus simple)

1. **Créer un compte Supabase** :
   - Rendez-vous sur [https://supabase.com](https://supabase.com) et créez un compte gratuit (ou connectez-vous avec GitHub).

2. **Créer un nouveau projet** :
   - Cliquez sur **« New project »**.
   - Donnez un nom à votre projet (ex: `portfolio-videaste`).
   - Définissez un **mot de passe de base de données fort** (notez-le précieusement).
   - Choisissez la région la plus proche de votre audience (ex: `eu-west-3` pour Paris).
   - Cliquez sur **« Create new project »** et patientez 1 à 2 minutes.

3. **Copier l'URL et la clé API publique** :
   - Dans le menu latéral gauche, cliquez sur l'icône **Project Settings** (engrenage en bas à gauche).
   - Cliquez sur **API** (ou **Data API**).
   - Vous trouverez la section **Project API keys** :
     - **Project URL** : Copiez l'URL (format : `https://xyzcompanyid.supabase.co`).
       ➡️ C'est la valeur pour `VITE_SUPABASE_URL`.
     - **Project API Keys (`anon` / `public`)** : Copiez la clé `anon public` (longue chaîne de caractères commençant par `eyJ...`).
       ➡️ C'est la valeur pour `VITE_SUPABASE_ANON_KEY`.

> ⚠️ **Sécurité** : N'utilisez **JAMAIS** la clé `service_role` (secrète) dans le front-end. Utilisez exclusivement la clé `anon` (`public`).

---

### Option B : Obtenir vos variables et clés en ligne de commande (CLI)

Si vous travaillez dans le terminal, vous pouvez lister vos projets et afficher les identifiants directement :

```bash
# 1. Connecter la CLI à votre compte Supabase
npx supabase login
# (Un lien s'ouvre dans votre navigateur pour valider la connexion avec votre token)

# 2. Lister vos projets et récupérer votre <project-ref>
npx supabase projects list

# 3. Lier votre dossier local au projet distant
npx supabase link --project-ref <VOTRE_PROJECT_REF>
```

Une fois le projet lié, votre URL Supabase est toujours :
`https://<VOTRE_PROJECT_REF>.supabase.co`

---

## 💻 3. Où et comment renseigner les variables

### Méthode rapide en ligne de commande :
Vous pouvez créer directement votre fichier `.env` en exécutant :

```bash
cat << 'EOF' > .env
VITE_SUPABASE_URL=https://votre-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=votre_cle_anon_publique_ici
EOF
```

### Ou manuellement :
Créez un fichier nommé `.env` à la racine du projet (au même niveau que `package.json`) :

```env
# URL de votre projet Supabase
VITE_SUPABASE_URL=https://votre-project-ref.supabase.co

# Clé publique anonyme Supabase
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Sur Google AI Studio / Déploiement Cloud (Cloud Run / Vercel / Netlify) :
- Accédez aux paramètres du projet (**Settings** > **Environment Variables** / **Secrets**).
- Ajoutez les deux variables `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY`.
- L'application les chargera automatiquement au démarrage sans aucun redéploiement manuel de code.

---

## 🛠️ 4. Initialiser la base de données (Schéma & Données initiales)

Le projet contient un script SQL complet préconfiguré situé dans :
📁 `supabase/migrations/20260915000000_initial_schema.sql`

Ce script crée automatiquement :
- Les tables : `profiles`, `site_settings`, `projects`, `project_media`, `services`, `service_requests`, `contact_messages`, `resume`.
- Les index de performance.
- Les politiques de sécurité RLS (*Row Level Security*).
- Les données par défaut (tarifs en XOF, tranches budgétaires configurables, services, profil de démonstration).

### Méthode 1 : Via l'interface web Supabase SQL Editor (Recommandée & la plus rapide)

1. Connectez-vous à votre tableau de bord [Supabase](https://supabase.com).
2. Ouvrez votre projet et cliquez sur **SQL Editor** (icône `>_` dans le menu latéral gauche).
3. Cliquez sur **« New query »** (Nouvelle requête).
4. Ouvrez le fichier `supabase/migrations/20260915000000_initial_schema.sql` dans votre éditeur, copiez tout son contenu et collez-le dans l'éditeur Supabase.
5. Cliquez sur le bouton vert **« Run »** (ou raccourci `Ctrl + Entrée` / `Cmd + Entrée`).
6. Le message `Success. No rows returned` confirme que toutes les tables et données ont été créées !

---

### Méthode 2 : En ligne de commande avec la CLI Supabase

Si vous préférez automatiser via votre terminal :

```bash
# 1. Installer la CLI Supabase (si ce n'est pas déjà fait)
npm install -g supabase

# 2. Se connecter à votre compte Supabase
npx supabase login

# 3. Lier votre projet local au projet distant
# (Remplacez <VOTRE_PROJECT_REF> par l'identifiant présent dans l'URL de votre dashboard : ex. abcdefghijklmnop)
npx supabase link --project-ref <VOTRE_PROJECT_REF>

# 4. Appliquer les migrations directement sur la base distante
npx supabase db push
```

---

## 🔐 5. Identifiants Administrateur & Modification

Pour des raisons de sécurité, ces identifiants sont documentés **exclusivement ici dans le README** et ne sont plus affichés publiquement sur le site.

### Identifiants initiaux par défaut :
- **URL d'accès** : `/admin` (ou `http://localhost:3000/admin`)
- **Email administrateur** : `admin@studio.com`
- **Mot de passe initial** : `Admin2026!`

---

### Comment modifier vos identifiants administrateur :

Vous avez 2 façons très simples de modifier votre email et mot de passe administrateur :

#### Méthode 1 : Directement depuis l'application Web (Recommandé)
1. Connectez-vous sur votre espace d'administration à `/admin`.
2. Cliquez sur l'onglet **« Paramètres du site »** (icône d'engrenage).
3. Descendez jusqu'à la section **« Sécurité & Accès — Identifiants de connexion administrateur »**.
4. Vous pouvez modifier votre **adresse email**, saisir un **nouveau mot de passe**, et cliquer sur **« Enregistrer mes nouveaux identifiants »**.
   - Si Supabase est connecté : Vos identifiants sont instantanément mis à jour dans `auth.users` de votre base Supabase.
   - Si vous êtes en mode local : Ils sont sauvegardés dans votre stockage local sécurisé.

#### Méthode 2 : Depuis le tableau de bord Supabase
1. Rendez-vous sur votre projet sur [https://supabase.com](https://supabase.com).
2. Dans le menu de gauche, cliquez sur **Authentication** > **Users**.
3. Repérez l'utilisateur `admin@studio.com` :
   - Cliquez sur les trois petits points `...` à droite de la ligne.
   - Cliquez sur **« Send password recovery »** ou **« Edit user »** pour changer l'email ou définir un nouveau mot de passe directement.

---

## 💾 6. Le Seeder (`supabase/seed.sql`) et comment l'injecter

Un fichier de seeding complet est préparé dans le dossier :  
📁 `supabase/seed.sql`

### Ce que contient ce seeder :
1. **Création du compte administrateur Supabase Auth** (`admin@studio.com` / `Admin2026!`) avec mot de passe haché et email confirmé.
2. **Profil professionnel** (Alexandre Roche, Monteur Vidéo & Motion Designer Senior).
3. **Paramètres du site & tranches budgétaires en Francs CFA (XOF)**.
4. **4 Services complets** avec tarifs réalistes en XOF.
5. **6 Projets vidéo** détaillés avec tags d'outils, catégories et vidéos d'exemples.
6. **Compétences techniques** (Premiere Pro, After Effects, DaVinci Resolve, Cinema 4D, Sound Design...).
7. **Liens réseaux sociaux** (YouTube, Vimeo, Instagram, LinkedIn).
8. **Exemples de demandes de devis et messages de contact**.

---

### Comment envoyer le seeder dans votre base de données :

#### Option A — Via le SQL Editor de Supabase (Le plus rapide, 100% visuel)
1. Rendez-vous sur votre tableau de bord [https://supabase.com](https://supabase.com) > sélectionnez votre projet (`portfolio-videaste`).
2. Dans le menu latéral gauche, cliquez sur **SQL Editor** (icône `>_`).
3. Cliquez sur **« New query »**.
4. Ouvrez le fichier local `supabase/seed.sql`, sélectionnez tout (`Ctrl + A` / `Cmd + A`), copiez-le et collez-le dans l'éditeur Supabase.
5. Cliquez sur le bouton vert **« Run »** en bas à droite (ou `Ctrl + Entrée` / `Cmd + Entrée`).
6. Le message **`Success. No rows returned`** s'affiche : toutes vos données réelles et le compte admin sont en place !

#### Option B — En ligne de commande via la CLI Supabase
Si vous préférez exécuter la commande dans votre terminal :
```bash
# 1. Vérifier que vous êtes bien lié à votre projet
npx supabase link --project-ref yqwgdssefrfhauwuufuk

# 2. Réinitialiser et appliquer migrations + seed.sql automatiquement
npx supabase db reset --linked
```
*(Attention : `db reset` réapplique les tables et le fichier `seed.sql`).*

---

## 🗂️ 7. Configuration du stockage des médias (Supabase Storage)

Pour permettre l'hébergement direct des images de vos projets et vidéos :

1. Dans le tableau de bord Supabase, cliquez sur **Storage** dans le menu de gauche.
2. Cliquez sur **« New bucket »**.
3. Renseignez les paramètres suivants :
   - **Name** : `portfolio`
   - **Public bucket** : **Activé** (Cochez la case pour que vos images de miniatures et vidéos soient publiquement consultables par les visiteurs).
4. Cliquez sur **Save**.

---

## 🚀 8. Démarrer et vérifier la connexion

1. Démarrez l'application localement :
   ```bash
   npm run dev
   ```

2. Accédez à l'application dans votre navigateur : [http://localhost:3000](http://localhost:3000)

3. Connectez-vous à l'espace d'administration :
   - URL : [http://localhost:3000/admin](http://localhost:3000/admin)
   - Email : `admin@studio.com`
   - Mot de passe : `Admin2026!`

4. Vérifiez le statut de la base de données :
   - Dans l'onglet **Paramètres**, observez l'encadré supérieur **« Moteur de données actif »** :
   - Si les clés sont correctes, il affichera :
     > 🟢 **Moteur de données actif : Supabase Cloud (PostgreSQL)**
     > *Connecté à votre projet Supabase avec Row Level Security et Storage buckets.*

---

## 📋 Récapitulatif des commandes utiles

| Commande | Action |
| :--- | :--- |
| `npm run dev` | Lance le serveur de développement sur le port 3000 |
| `npm run build` | Compile l'application pour la production |
| `npm run lint` | Valide le typage TypeScript et la syntaxe |
| `npx supabase login` | Authentifie votre machine avec Supabase |
| `npx supabase link --project-ref <id>` | Relie le dossier local au projet Supabase |
| `npx supabase db push` | Pousse les migrations locales vers la base Supabase |
| `npx vercel` | Déploie le projet sur Vercel via la CLI |

---

## 🚀 9. Déploiement sur Vercel

Le projet est entièrement préparé pour un déploiement instantané et sans erreur sur **Vercel**.

### A. Configuration SPA automatique (`vercel.json`)
Le fichier `vercel.json` à la racine gère la redirection de toutes les routes vers `/index.html`. Sans ce fichier, naviguer ou rafraîchir la page sur `/admin`, `/demande` ou `/projets` provoquerait une erreur **404 NOT_FOUND** sur Vercel. Grâce à `vercel.json`, la navigation React Router fonctionne de manière fluide et transparente.

### B. Méthode 1 : Déploiement via GitHub (Recommandé)

1. **Pousser votre code sur un dépôt GitHub** :
   ```bash
   git add .
   git commit -m "feat: portfolio videaste prêt pour production et Supabase"
   git push origin main
   ```

2. **Importer le projet sur Vercel** :
   - Connectez-vous sur [https://vercel.com](https://vercel.com).
   - Cliquez sur **« Add New... »** > **« Project »**.
   - Sélectionnez votre dépôt GitHub et cliquez sur **« Import »**.

3. **Paramètres de Build & Framework** :
   - **Framework Preset** : `Vite` (détecté automatiquement).
   - **Build Command** : `npm run build`
   - **Output Directory** : `dist`

4. **Ajouter les Variables d'Environnement** :
   - Déroulez la section **« Environment Variables »**.
   - Ajoutez les 2 variables :
     - `VITE_SUPABASE_URL` = `https://<votre-project-ref>.supabase.co`
     - `VITE_SUPABASE_ANON_KEY` = `<votre-cle-anon-publique>`
   - Cliquez sur **« Deploy »**.

---

### C. Méthode 2 : Déploiement rapide en ligne de commande (Vercel CLI)

Si vous préférez déployer directement depuis votre terminal :

```bash
# 1. Lancer le déploiement
npx vercel

# 2. Répondre aux questions interactives :
# - Set up and deploy? [Y]
# - Which scope? [Votre compte]
# - Link to existing project? [N]
# - Project name? [portfolio-videaste]
# - In which directory is your code located? [./]
# - Want to modify build settings? [N]

# 3. Ajouter les variables d'environnement sur Vercel
npx vercel env add VITE_SUPABASE_URL
npx vercel env add VITE_SUPABASE_ANON_KEY

# 4. Déployer en production finale
npx vercel --prod
```

Votre site est instantanément en ligne avec HTTPS, CDN mondial ultra-rapide et connexion directe à votre base de données Supabase !

---

## ❓ Foire Aux Questions & Dépannage

- **Erreur `function uuid_generate_v4() does not exist` résolue** :  
  Dans les versions récentes de PostgreSQL et Supabase, l'extension `uuid-ossp` peut être dans le schéma `extensions` ou inactive. La migration utilise désormais **`gen_random_uuid()`**, la fonction standard native intégrée à PostgreSQL. Vous pouvez relancer `npx supabase db push` sans aucune erreur.
- **Comment trouver mon `project-ref` ?**  
  Dans l'URL de votre tableau de bord Supabase : `https://supabase.com/dashboard/project/<project-ref>`. C'est la série de lettres et chiffres qui identifie votre projet.
- **Les modifications sont-elles perdues si je n'ai pas configuré Supabase ?**  
  Non ! En mode local, toutes les modifications effectuées via l'administration (création de projet, modification des tranches de budget en XOF, mise à jour des prix de services) sont conservées dans le `localStorage` de votre navigateur.
- **Comment réinitialiser les données ?**  
  Dans l'espace Admin > Paramètres, vous disposez d'un bouton pour rétablir les tranches budgétaires par défaut, ou vous pouvez relancer le script SQL dans Supabase pour réinitialiser la base.
