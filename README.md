# Transcendence

### Install
```zsh
git clone git@github.com:0x21x/ft_transcendence.git
```

### Run

### # Development
```zsh
docker-compose --file docker-compose-dev.yml up --build --watch
```
### # Production
```zsh
docker-compose up --build
```

### Stop
```zsh
docker-compose down
```

## Pong - How to play

Player 1 (left):
- [W] -> GO UP
- [S] -> GO DOWN

Player 2 (right):
- [ARROW UP] -> GO UP
- [ARROW DOWN] -> GO DOWN


## Project Structure

```zsh
├── README.md
├── .env
├── docker-compose.yml
├── docker-compose-dev.yml
├── backend
│   ├── postgres.Dockerfile
│   └── app
│       ├── app
│       │   ├── __init__.py
│       │   ├── asgi.py
│       │   ├── routing.py
│       │   ├── settings.py
│       │   ├── urls.py
│       │   └── wsgi.py
│       ├── entrypoint.sh
│       ├── game
│       │   ├── __init__.py
│       │   ├── admin.py
│       │   ├── apps.py
│       │   ├── models.py
│       │   ├── tests.py
│       │   └── views.py
│       ├── manage.py
│       ├── requirements.txt
│       ├── static
│       └── users
│           ├── __init__.py
│           ├── admin.py
│           ├── apps.py
│           ├── models.py
│           ├── serlializers.py
│           ├── tests.py
│           ├── urls.py
│           └── views.py
└── frontend
    ├── postgres.Dockerfile
    ├── app
    │   ├── components
    │   │   ├── body
    │   │   │   ├── history.mjs
    │   │   │   ├── game.mjs
    │   │   │   ├── touramentComponents
    │   │   │   │   ├── createTournament.mjs
    │   │   │   │   └── setPlayersNames.mjs
    │   │   │   └── tournament.mjs
    │   │   └── header
    │   ├── index.html
    │   ├── languages
    │   │   ├── en
    │   │   │   ├── history.json
    │   │   │   ├── game.json
    │   │   │   ├── navbar.json
    │   │   │   └── tournament.json
    │   │   └── fr
    │   │       ├── history.json
    │   │       ├── game.json
    │   │       ├── navbar.json
    │   │       └── tournament.json
    │   ├── server.js
    │   └── static
    │       └── js
    │           ├── bot.js
    │           ├── game.js
    │           ├── language.mjs
    │           ├── render.mjs
    │           ├── router.js
    │           ├── routes.mjs
    │           ├── theme.mjs
    │           └── tournament.js
    └── package.json

```

## **Auth API (CRUD)**
###  # Rooting
- [POST] -> 0.0.0.0:{API_PORT}/api/auth/ `(CREATE)`
- [GET] ->  0.0.0.0:{API_PORT}/api/auth/{id} `(READ)`
- [PUT] -> 0.0.0.0:{API_PORT}/api/auth/{id} `(UPDATE)`
- [DELETE] -> 0.0.0.0:{API_PORT}/api/auth/{id} `(DELETE)`

###  # Tasks

### - CREATE
To create a new user, you need to send a POST request to the API with the following JSON format:
```json
{
    "username": "username",
    "email": "email",
    "password": "password"
}
```

### - READ
To get a user, you need to send a GET request to the API with the {id} of the user you want to get.


### - UPDATE
To update a user, you need to send a PUT request to the API with the  JSON format: (all fields are optional)
```json
{
    "username": "new_username",
    "email": "new_email",
    "password": "new_password"
}
```

### - DELETE
To delete a user, you need to send a DELETE request to the API with the {id} of the user you want to delete.