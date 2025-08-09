#!/bin/bash

echo "Waiting for database..."
while ! nc -z pgdb 5432; do
  sleep 0.1
done
echo "Database started"

echo "Running migrations..."
python manage.py makemigrations
python manage.py migrate
echo "Creating superuser..."
python manage.py shell << EOF
from django.contrib.auth import get_user_model
User = get_user_model()
try:
    user = User.objects.get(username='admin')
    user.set_password('admin')
    user.is_staff = True
    user.is_superuser = True
    user.save()
    print('Superuser password updated and permissions ensured.')
except User.DoesNotExist:
    User.objects.create_superuser('admin', 'admin@example.com', 'admin')
    print('Superuser created')
EOF
echo "Starting server..."
python manage.py runserver 0.0.0.0:8000
