# Nadège 100Gène — Dashboard Partenariats

## Déploiement sur Vercel (5 minutes)

### 1. Upload sur GitHub
Crée un repo GitHub privé et push ces fichiers.

### 2. Importer sur Vercel
- vercel.com → New Project → importe ton repo GitHub
- Framework : Next.js (détecté automatiquement)

### 3. Variables d'environnement
Dans Vercel → Settings → Environment Variables, ajoute :

| Nom | Valeur |
|-----|--------|
| NOTION_TOKEN | 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 |
| NOTION_DATABASE_ID | 4204d5b7-b67a-48ae-80ff-4ea9ae4a81d8 |

### 4. Deploy → Done ✅

## Mot de passe
Le mot de passe actuel est : **Nadege99!**
Pour le changer : modifier la constante `PASSWORD` dans `pages/index.js` ligne 8.

## Structure
```
pages/
  index.js          → Dashboard + page login
  api/
    crm.js          → Lecture base Notion
    add-brand.js    → Ajout suggestion de marque
package.json
.env.example
```
