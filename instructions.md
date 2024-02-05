## Plateforme de quiz en temps réel avec Socket.IO 
### Faire un clone / semblant de kahoot avec Socket.IO

### Prérequis :
- Avoir Docker d'allumé
- avoir Make d'installé

### Installation :
- Cloner le projet
- Se rendre dans le dossier du projet
- Copier les .env depuis les .env.example
  - `cp .env.example .env`

- Production :
    - Lancer la commande `make deploy` pour lancer le projet prêt à etre utilisé
    - Lancer la commande `make down` pour arrêter le projet

- Développement :
    - Lancer la commande `make deploy-dev` pour lancer en mode dev et le reste à la main
      - Backend
        - pnpm db:deploy
        - pnpm db:seed
        - pnpm db:seed
        - pnpm run start:dev
      - Frontend
        - pnpm run dev
    - Lancer la commande `make down-dev` pour arrêter le projet