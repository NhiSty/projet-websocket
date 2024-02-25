## Plateforme de quiz en temps réel avec Socket.IO

### Faire un clone / semblant de kahoot avec Socket.IO

### Prérequis :

- Avoir Docker d'allumé (et la version >= Docker version 24 )
- avoir Make d'installé

### Installation :

- Cloner le projet
- Se rendre dans le dossier du projet
- supprimer les .env que vous avez déjà
- Déploiement:
  - Production :
    - Lancer la commande `make deploy` pour lancer le projet prêt à être utilisé
    - Lancer la commande `make down` pour arrêter le projet
  - Développement :
    - Lancer la commande `make deploy-dev` pour lancer le projet en mode dev
    - Backend:
      - `pnpm db:reset`
      - `pnpm run start:dev`
    - Frontend :
      - `pnpm run dev`
      aller sur `http://localhost:5173`
    - Lancer la commande `make down-dev` pour arrêter le projet