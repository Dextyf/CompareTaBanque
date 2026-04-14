# 🤝 Guide Collaboration - Administrateurs CompareTaBanque

## 📋 Accès Requis

### 1️⃣ **GitHub** (Repo Code)
- **URL:** https://github.com/Dextyf/CompareTaBanque
- **Access:** Collaborator (Maintain or Admin)
- **Workflow:**
  - Clone ou utilisez GitHub Codespaces (voir ci-dessous)
  - Créez une branche: `feature/nom-feature`
  - Commitez avec messages clairs
  - Créez une Pull Request (PR) pour review
  - Merge après approbation

### 2️⃣ **GitHub Codespaces** (Dev Environment Cloud)
⭐ **RECOMMANDÉ pour tester** - Pas d'installation locale!

**Steps:**
1. https://github.com/Dextyf/CompareTaBanque
2. Clique **< > Code** → **Codespaces** → **Create codespace on main**
3. VS Code s'ouvre (dans le cloud)
4. Terminal: `cd frontend && npm run dev`
5. L'app tourne sur http://localhost:5173

**Avantage:** Env identique au production

---

## 🔐 Accès Cloud

### 3️⃣ **Supabase** (Database + Auth)
- **URL:** https://supabase.com
- **Project:** CompareTaBanque
- **Access:** Owner ou Developer

**Responsabilités:**
- 👤 Voir les **users** créés (Auth → Users)
- 📊 Vérifier les **données** de la DB
- 🔐 Gérer les **secrets** d'authentification

**Checklist:**
- [ ] Vérifier que les users peuvent se créer
- [ ] Monitorer les reset password requests
- [ ] Vérifier que les données se sauvegardent correctement

---

### 4️⃣ **N8N** (Automation - Lead Management)
- **URL:** https://comparetabanque.app.n8n.cloud
- **Access:** Admin invité
- **Workflows:**
  - ✅ **Lead Creation** - Reçoit les leads quand un user choisit une banque

**Responsabilités:**
- 📬 Monitorer les **leads reçus**
- 🔍 Voir les **exécutions** des workflows
- 🔧 Éditer workflows si besoin

**Checklist:**
- [ ] Vérifier que les leads arrivent après "Select Bank"
- [ ] Checker les logs en cas d'erreur
- [ ] Documenter nouveaux workflows

---

### 5️⃣ **Hostinger** (Hosting + Deployment)
- **URL:** https://hostinger.com
- **Access:** FTP ou Admin account

**Options d'accès:**

**Option A: FTP (Simple)**
```
Server: ftp.ton-domaine.com
Username: [fourni]
Password: [fourni]
Port: 21
```
Accédez via FileZilla ou VS Code

**Option B: cPanel (Complet)**
Via Hostinger Dashboard

**Responsabilités:**
- 🚀 Vérifier les déploiements
- 📁 Gérer les fichiers `/public_html/`
- ✅ Vérifier que le site est UP

---

## 🔄 Workflow de Synérgie

### **Développement**
1. **GitHub Codespaces** → Code & test
2. **Local Supabase** → Vérifie les données
3. **N8N Test** → Teste les workflows
4. **Pull Request** → Code review
5. **Merge** → Production

### **Monitoring Production**
- **Daily:** Check N8N leads count
- **Weekly:** Review Supabase users & data
- **On-demand:** Vérifier Hostinger si site down

---

## 📊 Dashboard Monitoring

### **Checklist Quotidienne:**
- [ ] Leads reçus aujourd'hui (N8N)
- [ ] Aucune erreur dans N8N logs
- [ ] Users créés sans problème (Supabase)
- [ ] Site accessible (Hostinger)

---

## 🆘 Troubleshooting

| Problème | Solution |
|----------|----------|
| **Codespace crash** | Delete & recreate |
| **Leads pas reçus** | Lancer un test webhook (voir docs) |
| **User can't signup** | Vérifier Supabase Auth settings |
| **Site down** | Check Hostinger File Manager |

---

## 🔗 Liens Rapides

- GitHub Repo: https://github.com/Dextyf/CompareTaBanque
- Supabase Console: https://supabase.com
- N8N Cloud: https://comparetabanque.app.n8n.cloud
- Hostinger: https://hostinger.com

---

## 📞 Contacts & Escalation

- **Code Questions:** GitHub Issues
- **Data Questions:** Supabase Dashboard
- **Automation Issues:** N8N Logs
- **Hosting Issues:** Hostinger Support

---

**Version:** v1.0  
**Last Updated:** 2026-04-14  
**Maintained by:** Équipe Admin
