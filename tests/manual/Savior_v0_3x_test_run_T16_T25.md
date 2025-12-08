# ✅ Savior – Test Checklist v0.3.0 (T16 → T25)

## 📌 I. Storage instable et données corrompues

* [X] **T16 – Storage indisponible 1 fois sur 3**
  * Faux driver avec `save/load/clear` qui lève une exception environ 33 % du temps.
  * Vérifier: aucun throw côté Savior, comportement prévisible, pas de reset complet inattendu.

* [X] **T17 – JSON corrompu sur une clé existante**
  * Écrire du JSON invalide dans `localStorage` avant `Savior.init` pour une clé existante.
  * Vérifier: Savior ignore le draft, aucune erreur bloquante, formulaire stable.

---

## 📌 J. Formulaires dynamiques et champs manquants

* [X] **T18 – Ajout dynamique d inputs après init**
  * Formulaire minimal, `Savior.init` puis ajout d un `<input>` en JS.
  * Vérifier: autosave sans rebind manuel, restore complet après reload pour tous les champs.

* [X] **T19 – Suppression de champs avant restore**
  * Sauvegarder un formulaire, puis supprimer un champ dans le DOM avant reload.
  * Vérifier: aucun throw, aucun recréation de champ supprimé, le reste du formulaire est restauré normalement.

---

## 📌 K. Multi-form et duplication de noeuds

* [X] **T20 – Multi-form (3 formulaires indépendants)**
  * Trois formulaires sur la même page, chacun avec des champs distincts.
  * Vérifier: aucun écrasement inter form, chaque formulaire se restaure avec ses propres valeurs.

* [X] **T21 – Formulaire cloné par cloneNode(true)**
  * Cloner un formulaire existant via `cloneNode(true)` et lui donner un nouvel identifiant/formId.
  * Vérifier: chaque formulaire a son propre formId, aucun conflit de clés dans le storage.

---

## 📌 L. Stress tests sur les événements input

* [X] **T22 – Input events rapides avec LocalStorage**
  * Script qui génère environ 50 événements `input` en rafale sur un champ.
  * Mesurer indirectement le nombre de `setItem` (instrumentation simple).
  * Vérifier: debouncing effectif, peu d écritures dans le driver pour un burst de 50 events, aucun lag ni erreur.

* [X] **T23 – Input events rapides avec SessionStorage**
  * Même scénario que T22 mais avec `SessionStorageDriver`.
  * Vérifier: comportement équivalent, aucune divergence notable avec LocalStorage.

---

## 📌 M. Restore et altérations externes

* [X] **T24 – restore sur page déjà préremplie**
  * Formulaire avec valeurs par défaut dans le HTML (ex: select avec option sélectionnée, input avec `value` initial).
  * Vérifier: le restore remplace uniquement les champs qui ont un draft, aucun override indésirable des valeurs par défaut.

* [X] **T25 – Altérations externes du storage pendant l usage**
  * Script externe qui supprime ou corrompt la clé de storage pendant que l utilisateur tape.
  * Vérifier: Savior continue à fonctionner, aucun throw, le draft final reste cohérent.
