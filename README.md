# Savior

**Automatic Form Draft Recovery**

Savior est un moteur d’autosave ultra-léger pour les formulaires web. Il capture silencieusement le contenu saisi par l’utilisateur et le restaure automatiquement en cas de fermeture d’onglet, rafraîchissement, navigation arrière/avant ou crash du navigateur.

🎯 **Objectif :** empêcher les utilisateurs de perdre ce qu’ils écrivent — sans backend, sans configuration lourde, sans friction.

---

## 🚀 Fonctionnalités (MVP)

* Sauvegarde automatique via `localStorage`
* Restauration instantanée au chargement
* Nettoyage automatique après `submit`
* Installation en quelques secondes
* Aucune dépendance
* Fonctionne avec les formulaires HTML classiques (champs textuels)

---

## 📦 Installation

Savior fonctionne actuellement comme module ES.

```js
import { Savior } from './savior.js';
```

(Le support `<script src="...">` arrivera avec le bundle UMD.)

---

## ✨ Utilisation de base

### 1. Marquer un formulaire

```html
<form data-savior="contact-form">
  <input name="email" />
  <textarea name="message"></textarea>
</form>
```

### 2. Activer Savior

```html
<script type="module">
  import { Savior } from './savior.js';

  Savior.init({
    selector: 'form[data-savior]'
  });
</script>
```

C’est tout : le formulaire est maintenant protégé contre la perte de données.

---

## ⚙️ Options disponibles

```js
Savior.init({
  selector: 'form[data-savior]', // Formulaires à protéger
  saveDelayMs: 400,              // Débounce avant sauvegarde
  driver: new Savior.LocalStorageDriver({
    storageKeyPrefix: 'savior_draft_'
  })
});
```

### Détails

* **selector** : sélectionne les formulaires à protéger. Par défaut : `form[data-savior]`.
* **saveDelayMs** : délai avant sauvegarde après frappe (ms). Par défaut : `400`.
* **driver** : mécanisme de stockage. Par défaut : `LocalStorageDriver`.

`Savior.init()` retourne une instance interne (`SaviorCore`).

---

## 🧩 Architecture (MVP)

### 1. Core autosave

* Détecte les formulaires via `selector`
* Observe les entrées utilisateur (`input`, `change`)
* Sauvegarde un brouillon après un délai (`saveDelayMs`)
* Restaure le brouillon au chargement
* Efface le brouillon lors du `submit`

### Structure d’un brouillon

```json
{
  "formId": "demo-form",
  "timestampUtc": "2025-11-21T20:42:20.001Z",
  "fields": {
    "email": "user@example.com",
    "message": "Bonjour..."
  }
}
```

### 2. Driver de stockage

MVP : `LocalStorageDriver` utilisant `window.localStorage`.

---

## ⚠️ Limitations actuelles

* Champs `password` non sauvegardés (sécurité)
* Champs textuels supportés
* Support avancé (checkbox, radio, select multiple) à venir

---

## 🛠️ Feuille de route

* Drivers serveur / hybrides / IndexedDB
* Version TypeScript
* Bundle UMD + publication npm
* Tests automatisés

---

## 📄 Licence

À définir.

**Statut :** MVP en développement actif.
