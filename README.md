# Ascendant

Application de sport gamifiée : quêtes journalières (24h), pénalités, portails (défis), niveaux et caractéristiques.

## Tester sur ton téléphone (Expo Go)

1. Installe **Expo Go** sur ton téléphone (App Store / Play Store).
2. Sur un ordinateur avec Node.js : `npm install` puis `npx expo start`.
3. Scanne le QR code affiché avec Expo Go (Android) ou l'appareil photo (iPhone).

## Structure

- `App.tsx` : barre d'onglets + fenêtres « système »
- `src/data.ts` : quêtes, portails, rangs (facile à modifier)
- `src/store.tsx` : logique du jeu (XP, niveaux, pénalités, sauvegarde locale)
- `src/screens/` : écrans Quêtes, Portails, Statut
