# Savior  
### Automatic Form Draft Recovery

Savior est un moteur d’autosave ultra-léger pour les formulaires web.  
Il capture silencieusement le contenu saisi par l’utilisateur et le restaure automatiquement en cas de fermeture d’onglet, rafraîchissement, erreur ou crash du navigateur.  
Objectif : empêcher les utilisateurs de perdre ce qu’ils écrivent — sans configuration, sans backend, sans friction.

---

## 🚀 Fonctionnalités (MVP)

- Sauvegarde automatique via `localStorage`
- Restauration instantanée au chargement de la page
- Nettoyage automatique après `submit`
- Installation en quelques secondes
- Aucune dépendance, aucun framework requis
- Fonctionne sur tous les formulaires HTML

---

## 📦 Installation

Inclure simplement le script dans votre page :

```html
<script src="savior.js"></script>
```

---

## ✨ Utilisation

Ajouter l’attribut `data-savior` à un formulaire :

```html
<form data-savior="contact-form">
  <input name="email" />
  <textarea name="message"></textarea>
</form>
```

Activer Savior :

```html
<script>
  Savior.init({
    selector: 'form[data-savior]'
  });
</script>
```

C’est tout : le formulaire est maintenant protégé contre la perte de données.

---

## 🧩 Architecture (MVP)

Savior se compose de deux éléments :

1. **Le moteur d’autosave**
   - détecte les formulaires
   - écoute les entrées utilisateur
   - restaure les brouillons sauvegardés
   - efface le brouillon lors du `submit`

2. **Le driver de stockage**
   - MVP : `LocalStorageDriver`
   - À venir : drivers serveur, hybride et IndexedDB

---

## 🛠️ À venir

- Drivers avancés (serveur, fallback, hybrid)
- API backend (C#, Node, PHP)
- Version TypeScript
- Publication npm
- Tests automatisés

---

## 📄 Licence  
À définir.

---

Statut : MVP en développement actif.

