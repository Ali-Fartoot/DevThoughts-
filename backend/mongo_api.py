from pymongo import MongoClient as PyMongoClient
import os
import logging

logger = logging.getLogger(__name__)

try:
    from django.conf import settings
    MONGODB_SETTINGS = getattr(settings, 'MONGODB_SETTINGS', {
        'host': os.getenv('MONGO_HOST', 'localhost'),
        'port': int(os.getenv('MONGO_PORT', 27017)),
        'db': os.getenv('MONGO_DB', 'devthoughts_db'),
        'username': os.getenv('MONGO_INITDB_ROOT_USERNAME'),
        'password': os.getenv('MONGO_INITDB_ROOT_PASSWORD')
    })
except ImportError:
    MONGODB_SETTINGS = {
        'host': os.getenv('MONGO_HOST', 'localhost'),
        'port': int(os.getenv('MONGO_PORT', 27017)),
        'db': os.getenv('MONGO_DB', 'devthoughts_db'),
        'username': os.getenv('MONGO_INITDB_ROOT_USERNAME'),
        'password': os.getenv('MONGO_INITDB_ROOT_PASSWORD')
    }
except Exception:
    MONGODB_SETTINGS = {
        'host': os.getenv('MONGO_HOST', 'localhost'),
        'port': int(os.getenv('MONGO_PORT', 27017)),
        'db': os.getenv('MONGO_DB', 'devthoughts_db'),
        'username': os.getenv('MONGO_INITDB_ROOT_USERNAME'),
        'password': os.getenv('MONGO_INITDB_ROOT_PASSWORD')
    }

class MongoDB:
    _instance = None
    _client = None
    _db = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(MongoDB, cls).__new__(cls)
        return cls._instance
    
    def __init__(self):
        if not self._client:
            try:
                if MONGODB_SETTINGS['username'] and MONGODB_SETTINGS['password']:
                    uri = f"mongodb://{MONGODB_SETTINGS['username']}:{MONGODB_SETTINGS['password']}@{MONGODB_SETTINGS['host']}:{MONGODB_SETTINGS['port']}/"
                else:
                    uri = f"mongodb://{MONGODB_SETTINGS['host']}:{MONGODB_SETTINGS['port']}/"
                
                self._client = PyMongoClient(uri)
                self._db = self._client[MONGODB_SETTINGS['db']]
                logger.info("MongoDB connection established")
            except Exception as e:
                logger.error(f"MongoDB connection failed: {e}")
                raise
        
    @property
    def db(self):
        return self._db
    
    @property
    def client(self):
        return self._client
    
    def close(self):
        if self._client:
            self._client.close()


def get_mongo_client():
    return MongoDB()