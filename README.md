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

## 🗂️ 5. Configuration du stockage des médias (Supabase Storage)

Pour permettre l'hébergement direct des images de vos projets et vidéos :

1. Dans le tableau de bord Supabase, cliquez sur **Storage** dans le menu de gauche.
2. Cliquez sur **« New bucket »**.
3. Renseignez les paramètres suivants :
   - **Name** : `portfolio`
   - **Public bucket** : **Activé** (Cochez la case pour que vos images de miniatures et vidéos soient publiquement consultables par les visiteurs).
4. Cliquez sur **Save**.

---

## 🚀 6. Démarrer et vérifier la connexion

1. Démarrez l'application localement :
   ```bash
   npm run dev
   ```

2. Accédez à l'application dans votre navigateur : [http://localhost:3000](http://localhost:3000)

3. Connectez-vous à l'espace d'administration :
   - URL : [http://localhost:3000/admin](http://localhost:3000/admin)
   - Mot de passe par défaut : `admin123` (modifiable dans l'onglet Paramètres)

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

---

## ❓ Foire Aux Questions & Dépannage

- **Comment trouver mon `project-ref` ?**  
  Dans l'URL de votre tableau de bord Supabase : `https://supabase.com/dashboard/project/<project-ref>`. C'est la série de lettres et chiffres qui identifie votre projet.
- **Les modifications sont-elles perdues si je n'ai pas configuré Supabase ?**  
  Non ! En mode local, toutes les modifications effectuées via l'administration (création de projet, modification des tranches de budget en XOF, mise à jour des prix de services) sont conservées dans le `localStorage` de votre navigateur.
- **Comment réinitialiser les données ?**  
  Dans l'espace Admin > Paramètres, vous disposez d'un bouton pour rétablir les tranches budgétaires par défaut, ou vous pouvez relancer le script SQL dans Supabase pour réinitialiser la base.
