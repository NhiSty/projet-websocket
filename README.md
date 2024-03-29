## Plateforme de quiz en temps réel avec Socket.IO 
### Faire un clone / semblant de kahoot avec Socket.IO

Projet interessant pour apprendre à utiliser Socket.IO et pour comprendre comment fonctionne la communication en temps réel. <br />
Tout les points du cahier des charges ont été respecté en plus des fonctionnalités avancées de Socket.IO.

- Voir le fichier [`instructions.md`](instructions.md)
 pour les instructions permettant de lancer le projet. <br />

- Pour tester, le projet a été déployé (à l'aide d'un makefile) sur un vps et est accessible à l'adresse suivante : http://158.178.207.4/

- Voir le fichier [`scenario.md`](scenario.md) pour avoir un scénario admin/user complet.

### Exigences : 

1. Interface de création de quiz : 
- [x] Un formulaire pour que les **administrateurs** puissent créer et gérer des quiz. 
- [x] La capacité d'ajouter des questions.
  - [x] Question choix multiples avec 1,2,3 ou 4 options
  - [x] Question choix unique
  - [x] Question Vrai faux

 
2. Communication en temps réel avec Socket.IO : 
- [x] Établissement de connexions WebSocket entre le serveur et les clients pour une communication bidirectionnelle. 
- [x] Diffusion des questions et réception des réponses en temps réel. 

3. Fonctionnalité de la salle de quiz : 
- [x] Mécanisme permettant aux utilisateurs de participer à un quiz en utilisant un identifiant unique pour la session. 
- [x] Support pour plusieurs salles où différents quiz peuvent se dérouler simultanément. 

4. Minuteur côté serveur : 
- [x] Un compteur à rebours géré par le serveur pour chaque question afin de garantir un timing synchronisé pour tous les clients. 
- [x] Progression automatique vers la prochaine question à l'expiration du minuteur.
- [x] Affichage du minuteur sur le front

5. Déroulement des questions et réponses : 
- [x] Présentation des questions à tous les clients dans une salle lorsque le quiz commence.
- [x] Collecte des réponses des clients et verrouillage des réponses à la fin du temps imparti. 

6. Retour en direct sur les réponses : 
- [x] Un retour immédiat aux clients après chaque question, indiquant si leur réponse était correcte ou non. 
- [x] Affichage en temps réel du nombre de clients ayant choisi chaque option de réponse. 

7. Notation et résultats : 
- [x] Calcul des scores côté serveur basé sur la justesse et la rapidité des réponses. 
- [x] Affichage des scores finaux et des bonnes réponses aux clients à la fin du quiz. 

8. Dockerisation : 
- [x] L’ensemble de l'application doit être conteneurisé à l'aide de Docker pour faciliter le déploiement et les tests (on ne parle pas des tests u mais tests user). 
- [x] Fournir un Dockerfile pour l'application serveur et un fichier docker-compose.yml pour orchestrer les services nécessaires, y compris les bases de données ou les systèmes de stockage utilisés. 
- [x] S’assurer que l'application peut être lancée avec **une seule commande** telle que docker-compose up . Pour la correction, le prof va juste faire **1** commande pour lancer le site, il ne va pas s'amuser à mettre en place des .env etc, donc il faut deja préparer le terrain pour lui.

Avec cette exigence, les tests et le déploiement sont simplifiés, offrant simplicité et cohérence à travers différents environnements, du machine locale de l'enseignant au serveur de production. 
Dockerisation encapsule les dépendances, atténuant le syndrome "ça marche sur ma machine" et facilitant la reproductibilité et la scalabilité. 

9. Fonctionnalités avancées de Socket.IO :
    
Pour renforcer l'utilisation de Socket.IO et pour mettre en évidence sa flexibilité et sa puissance, implémentez les fonctionnalités avancées suivantes utilisant explicitement Socket.IO :

  * [x] Synchronisation des états de jeu : Assurer que tous les clients reçoivent les mises à jour d'état en temps réel en cas de changement de question, de fin de temps imparti pour une question, ou toute autre mise à jour critique du jeu.
    
  * [x] Chat en direct lors des quiz : Mettre en place un système de chat où les participants peuvent discuter pendant un quiz, avec une attention particulière à la gestion des messages en temps réel et à la prévention de la triche (optionnel).
    
  * [x] Notifications en temps réel : Envoyer des annonces ou des alertes concernant les événements du quiz, comme le début du quiz, le passage à la prochaine question, ou les rappels avant la fin du temps imparti pour une question.
    
  * [x] Réglage du temps par question en temps réel : Permettre aux participants (vote) ou à l'administrateur de modifier le temps imparti pour les questions suivantes en cours de quiz, en affichant la mise à jour instantanément à tous les clients. (Pour ce point, on a décidé d'implémenter la fonctionnalité pour modifier le temps pour la question en cours car il était plus judicieux de le faire de cette manière)
    
Ces fonctionnalités avancées doivent non seulement démontrer l'appropriation de la technologie WebSocket, mais également ajouter de la valeur et de la richesse à l'expérience utilisateur globale du quiz en temps réel.
La mise en œuvre de ces fonctionnalités avancées nécessitera une planification et une coordination minutieuse pour s'assurer qu'elles s'intègrent harmonieusement dans l'application sans perturber les fonctionnalités existantes.

Stockage de données persistant : 
- [x] Intégration avec une base de données (SQL ou NoSQL) pour stocker les données de quiz et les résultats historiques. 

Authentification des utilisateurs : 
- [x] Solution pour suivre les utilisateurs et les scores au fil du temps. 
- [x] Différents niveaux d'accès pour les participants au quiz et les administrateurs. 

Gestion avancée des salles : 
- [x] Fonctionnalités pour gérer les salles, comme la protection par mot de passe ou les limites d'utilisateurs. 

Tableau de classement en temps réel : 
- [x] Mise à jour et affichage continue des classements des utilisateurs en fonction des scores tout au long du quiz. 

Paramètres de quiz personnalisables : 
- [x] Permettre diverses configurations pour les quiz (par exemple, ordre aléatoire des questions, limites de temps pour les questions). 

Améliorations de l'accessibilité :
- [x] S’assurer que l'interface est utilisable par les personnes handicapées, en suivant les normes d'accessibilité. 

### Technologies : 
- Communication en temps réel : Socket.IO 
- Gestion des événements dynamiques côté front-end : JavaScript (indépendant du framework) 
- Scripting côté serveur : Choix du langage de backend (Python, Java, C#, etc.) qui supporte Socket.IO
- Stockage temporaire : Structures de données volatiles pour l'état actif du quiz (par exemple, des maps, des dictionnaires)

### Contributions de l'équipe (à compléter au fur et à mesure du projet) :
- Kanoute Hamidou : configuration déploiment, gestion users, gestion de quiz, timer pour le début du questionnaire, gestion des scores, accessibilité, tableau classement
- Jallu Thomas : configuration déploiement, gestion du quiz, gestion du système de chat, gestion users, ajout temps supplémentaire pour chaque question, accessibilité
- Deveci Serkan : configuration déploiement, gestion du quiz, gestion du système de chat, gestion users, ajout temps supplémentaire pour chaque question, gestion des scores, gestion connexion au salle, système de notification, accessibilité, tableau classement