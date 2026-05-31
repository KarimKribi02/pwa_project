# TODO

- [ ] Mettre à jour `frontend/src/app/admin/orders/page.tsx` :
  - [x] Dans la colonne **Statut**, remplacer le badge simple par un badge + checkbox.
  - [x] Checkbox active si `order.statut` est `en attente` ou `en cours`.
  - [x] Au changement (onChange), appeler `handleValidate(order.id, order.statut)` pour faire avancer :
    - `en attente` -> `en cours`
    - `en cours` -> `terminer`
  - [x] Après validation, laisser le backend renvoyer le statut mis à jour via `setOrders`.
  - [x] Retirer la duplication du bouton Validate de la colonne **Actions** (garder seulement Delete dans Actions).
- [ ] Vérifier le lint/build frontend.
- [ ] Tester manuellement la page Admin Orders (cocher en attente puis en cours).



