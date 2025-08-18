from pymongo import MongoClient
import os
import logging

logger = logging.getLogger(__name__)

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
                # Build connection string
                if MONGODB_SETTINGS['username'] and MONGODB_SETTINGS['password']:
                    uri = f"mongodb://{MONGODB_SETTINGS['username']}:{MONGODB_SETTINGS['password']}@{MONGODB_SETTINGS['host']}:{MONGODB_SETTINGS['port']}/"
                else:
                    uri = f"mongodb://{MONGODB_SETTINGS['host']}:{MONGODB_SETTINGS['port']}/"
                
                self._client = MongoClient(uri)
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


# Create a singleton instance
def MongoClient():
    return MongoDB()