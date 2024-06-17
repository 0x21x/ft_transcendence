#!/bin/sh

PORT=${PORT}

python manage.py makemigrations

python manage.py migrate

echo 'Run Django server on port '$PORT''

exec python manage.py runserver 0.0.0.0:$PORT