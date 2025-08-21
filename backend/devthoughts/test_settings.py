from .settings import *

# Use an in-memory SQLite database for tests
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': ':memory:',
    }
}

# Make sure MongoDB settings are set for tests
MONGODB_SETTINGS = {
    'host': 'localhost',
    'port': 27017,
    'db': 'devthoughts_test_db',
    'username': None,
    'password': None
}

# Explicitly set the database name to avoid NoneType errors
import os
os.environ.setdefault('POSTGRES_DB', 'test_db')
os.environ.setdefault('POSTGRES_USER', 'test_user')
os.environ.setdefault('POSTGRES_PASSWORD', 'test_password')
os.environ.setdefault('POSTGRES_HOST', 'localhost')
os.environ.setdefault('POSTGRES_PORT', '5432')