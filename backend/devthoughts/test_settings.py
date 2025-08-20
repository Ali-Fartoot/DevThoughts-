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