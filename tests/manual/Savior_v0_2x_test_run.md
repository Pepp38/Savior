
# ✅ **Savior – Test Checklist v0.2.x → v0.3.0**

## 📌 **A. Comportement de base**

* [X] **T01 – Autosave simple**

  * Remplir → Refresh → Restore complet → Aucune erreur console.
* [X] **T02 – Nettoyage après submit**

  * Remplir → Submit → Storage vidé → Refresh = formulaire vierge.

---

## 📌 **B. Support / Non-support du storage**

* [X] **T03 – checkSupport() (navigateur normal)**

  * `true` → aucune erreur console.
* [X] **T04 – Mode navigation privée (Safari / mobile)**

  * Pas de crash → comportement dégradé propre.

---

## 📌 **C. Limite de quota / erreurs storage**

* [X] **T05 – Storage plein (quota atteint)**

  * fillLocalStorageToQuota() → Savior ne crash pas → aucune erreur non gérée.
* [X] **T06 – JSON corrompu dans storage**

  * JSON invalide → Savior ignore proprement → aucune exception `JSON.parse`.

---

## 📌 **D. Multi-formulaires**

* [X] **T07 – Plusieurs formulaires sur la même page**

  * Isolation parfaite → aucune fuite de valeurs.

---

## 📌 **E. Formulaires dynamiques**

* [X] **T08 – Formulaire ajouté dynamiquement**

  * Autosave fonctionne ou comportement propre sans crash.
* [X] **T09 – Champs supprimés dynamiquement**

  * Restore OK pour les champs existants → aucune erreur console.

---

## 📌 **F. Performance / Stress**

* [X] **T10 – Saisie rapide / stress debounce**

  * Pas de lag → pas de rafale excessive de writes → aucune erreur console.
* [X] **T11 – Spam F5 / refresh agressifs**

  * Restore stable → aucun comportement imprévisible.

---

## 📌 **G. Drivers**

* [X] **T12 – LocalStorageDriver**

  * Tous les tests clés passent (T01, T02, T06, T10).
* [X] **T13 – SessionStorageDriver**

  * Restore OK après un refresh → Vidé après fermeture de l’onglet.

---

## 📌 **H. Sécurité / robustesse générale**

* [X] **T14 – Noms de champs atypiques**

  * Restore correct → aucune erreur liée aux noms.
* [X] **T15 – Pages sans formulaire / selector vide**

  * Savior reste silencieux → aucune erreur.

---

## 🎯 **Critères de succès globaux**

* [X] Aucune erreur rouge dans *toute* la campagne de tests
* [X] Tous les comportements cohérents, stables, documentables
* [X] Savior survit à tous les scénarios hostiles sans throw non géré
* [X] v0.3.0 prête à être packagée

