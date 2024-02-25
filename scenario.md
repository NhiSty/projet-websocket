# Scénarios

Pour facilité les tests, un nombre d'utilisateurs ont été pré-généré :

Super Administrateur :

- `admin` / `admin`

Administrateur (enseignant) :

- `admin0` jusqu'à `admin9` / `password`

Utilisateur :

- `user0` jusqu'à `user29` / `password`

## Administrateur

### Création d'un quiz

- Connectez vous avec les identifiants `admin` / `admin` .
- Accédez au panneau d'administration (depuis le menu de navigation) .
- Ouvrez l'onglet "Quizzes"
- Cliquez sur "Create a quiz" (la petite fiche avec un plus "+")
- Entrez le nom du formulaire
- À partir de là, vous pourrez ajouter des questions, des réponses et des options pour chaque question.
- Vous pourrez aussi réordonner vos questions ainsi que les éditer
- Une fois que vous avez terminé, cliquez sur "Exit quiz" pour quitter l'édition.

### Création d'un utilisateur

- Connectez vous avec les identifiants `admin` / `admin` .
- Accédez au panneau d'administration (depuis le menu de navigation) .
- Ouvrez l'onglet "Users"
- Cliquez sur "Create a user" (la petite icône d'utilisateur avec un plus "+")
- Remplissez le formulaire avec les informations de l'utilisateur
- Cliquez sur "Create" pour créer un utilisateur (étudiant) ou administrateur (enseignant)

### Lancement d'un quiz

- Connectez vous avec les identifiants `admin` / `admin` .
- Accédez au panneau d'administration (depuis le menu de navigation) .
- Ouvrez l'onglet "Quizzes"
- Créez un quiz si nécessaire
- Cliquez sur la flèche d'action "Start _quiz name_"
- Vous serez redirigé sur la page de configuration de la session
- Paramétrez la session (mot de passe, nombre d'utilisateur max, questions aléatoires)
- Cliquez sur "Start the session" pour lancer la session
- À partir de là, veuillez attendre que tous les utilisateurs aient rejoins pour lancer le quiz
- Les personnes de la salle reçoivent des notifications pour prévenir qui à rejoins et qui a quitté la salle

### Ajout du temps

- Suivez les instructions de "Lancement d'un quiz"
- Lorsqu'une question est en cours, cliquez sur le bouton "Add time"
- 3 choix vous serons proposés, sélectionnez celui que vous préférez
- Le temps sera ajouté à la question en cours et une notification apparaîtra chez tous les clients.

### Onglet conversation

- Vous pouvez chattez avec les utilisateurs de la salle avec un petit indicateur pour dire que la personne "X est en train d'écrire ..." comme sur discord
- Vous pouvez voir les participants de la salle ainsi que leur score dans la partie "Participant"

## Utilisateur

### Se connecter

- Accédez à la page de connexion via le menu de navigation
- Entrez vos identifiants
- Cliquez sur "Login"
- Vous serez redirigé et devriez voir un avatar et la barre de recherche en haut de l'écran

### Rejoindre une salle

- (Il faut au préalable qu'un admin (enseignant) est lancé le quizz) Lancez une session avec un administrateur
- Chercher le nom de la session dans la barre de recherche ou copiez le lien de la session dans l'url
- Vous devriez voir le message "Waiting for the quiz to start"
- si la salle est protégé par un mot de passe, vous devriez saisir le mot de passe pour rejoindre la salle

### Réponse au quiz

- Lorsque le quiz commence, vous devriez voir les questions apparaître
- Sélectionnez une réponse et cliquez sur "Submit"
- À la fin du compteur, les réponses seront verrouillées et vous ne pourrez plus répondre
- Au même moment, les réponses seront affichées et vous pourrez voir les réponses des autres utilisateurs ainsi que la validité de vos réponses
- Dans la menu d'information sur le côté, le score de chaque utilisateur sera affiché

### Envoyer un message chat

- Ouvrez le menu de chat en cliquant sur "Conversation"
- Entrez votre message dans le champ de texte
- Cliquez sur "Send" pour envoyer le message

### Score finaux

- Quand le quiz est terminé, vous devriez voir un message "The session is over"
- Vous pourrez voir le score final de chaque utilisateur au milieu de l'écran avec le classement
