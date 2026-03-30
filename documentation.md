# Documentation du Projet Ticketing

Cette documentation explique comment installer, configurer et utiliser le projet Ticketing sur Windows et Linux.

> **Note Importante :** Une connexion internet est **indispensable** pour l'installation initiale des dépendances (Python et Node.js).

---

## 1. Fonctionnement du Projet

Le système de Ticketing permet de gérer les demandes de support via une interface web moderne. 

### Fonctionnalités Clés :
- **Gestion des Tickets :** Création, suivi de l'état (Ouvert, En cours, Résolu, Clos) et priorité.
- **Rôles Utilisateurs :** 
  - **Client (USER) :** Peut créer et suivre ses propres tickets.
  - **Support (HELPDESK) :** Peut voir tous les tickets, les prendre en charge et répondre.
  - **Admin :** Accès total à la configuration, aux utilisateurs et aux statistiques.
- **Messagerie en Temps Réel :** Discussion instantanée sur chaque ticket via WebSockets (Django Channels).
- **Pièces Jointes :** Possibilité d'attacher des fichiers/images aux tickets et messages.
- **Catégories :** Organisation des tickets par type (Technique, Facturation, etc.).

---

## 2. Comptes de Test

Vous pouvez utiliser les comptes suivants pour tester les différents rôles :

| Rôle | Email | Mot de passe |
| :--- | :--- | :--- |
| **Administrateur** | `admin@gmail.com` | `123456` |
| **Support / Helpdesk** | `tovo@gmail.com` | `123456` |
| **Client / User** | `user2@gmail.com` | `123456` |

*Note : Vous pouvez également créer vos propres comptes via le formulaire d'inscription (Register).*

---

## 3. Lancement Automatisé (Scripts)

### Sur Windows
Lancez le fichier à la racine du projet :
```cmd
run_project_script.bat
```

### Sur Linux
Donnez les permissions d'exécution aux scripts puis lancez le script principal :
```bash
chmod +x run_project_script.sh script/*.sh
./run_project_script.sh
```

---

## 4. Initialisation des Données (Optionnel)

Si la base de données est vide, vous pouvez générer les rôles et catégories par défaut avec cette commande dans le dossier `backend` (avec l'environnement virtuel activé) :
```bash
python manage.py seed_data
```

---

## 5. Démarche Manuelle (Terminal)

### Backend (Django)
1. Ouvrez un terminal dans `backend/`.
2. Créez et activez l'environnement virtuel (`python -m venv env`).
3. Installez les dépendances : `pip install -r requirements.txt`.
4. Appliquez les migrations : `python manage.py migrate` (seulement si db.sqlite3 n'existe plus).
5. Lancez : `python manage.py runserver`.

### Frontend (React/Vite)
1. Ouvrez un terminal dans `frontend/`.
2. Installez les dépendances : `npm install`.
3. Construisez le projet : `npm run build`.
4. Servez le dossier dist : `npx serve dist`.

---

## 6. Prérequis Système
- **Python 3.x**
- **Node.js** (recommandé v24+)
- **Accès Internet** (pour le premier lancement).
