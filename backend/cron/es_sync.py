#!/usr/bin/env python3
"""
Elasticsearch Sync Cron Job
Syncs MongoDB changes to Elasticsearch periodically
"""
import os
import sys
import json
import logging
from datetime import datetime, timedelta
from elasticsearch import Elasticsearch
from elasticsearch.helpers import bulk
from elasticsearch.helpers import BulkIndexError
from bson import ObjectId

sys.path.append('/app')

from mongo_api import get_mongo_client

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler('/var/log/es_sync.log')
    ]
)
logger = logging.getLogger(__name__)

STATE_FILE = '/app/cron/es_sync_state.json'

def json_serializer(obj):
    if isinstance(obj, ObjectId):
        return str(obj)
    if isinstance(obj, datetime):
        return obj.isoformat()
    raise TypeError(f"Object of type {type(obj)} is not JSON serializable")

def get_last_sync_time():
    try:
        with open(STATE_FILE, 'r') as f:
            state = json.load(f)
            return datetime.fromisoformat(state['last_sync'])
    except Exception as e:
        logger.warning(f"Could not read state file: {e}. Using default (1 min ago)")
        return datetime.utcnow() - timedelta(minutes=1)

def save_last_sync_time(timestamp):
    try:
        with open(STATE_FILE, 'w') as f:
            json.dump({'last_sync': timestamp.isoformat()}, f)
    except Exception as e:
        logger.error(f"Could not save state file: {e}")

def sync_mongo_to_elasticsearch():
    try:
        es_host = os.getenv('ELASTIC_URL', 'elasticsearch')
        es_port = os.getenv('ELASTIC_PORT', '9200')
        es_url = f"http://{es_host}:{es_port}"
        
        es_client = Elasticsearch(
            [es_url],
            retry_on_timeout=True,
            max_retries=3
        )
        
        try:
            es_count = es_client.count(index="posts")['count']
        except Exception as e:
            logger.warning(f"Could not get document count from Elasticsearch: {e}. Assuming zero documents.")
            es_count = 0
        
        mongo_client = get_mongo_client()
        db = mongo_client.db
        collection = db['posts']
        
        if es_count == 0:
            logger.info("Elasticsearch index is empty. Fetching all documents from MongoDB.")
            query = {'deleted': {'$ne': True}}
        else:
            last_sync = get_last_sync_time()
            logger.info(f"Syncing documents newer than {last_sync}")
            query = {
                'created_at': {'$gte': last_sync},
                'deleted': {'$ne': True}  
            }
        
        documents = list(collection.find(query))
        logger.info(f"Found {len(documents)} documents to sync")
        
        if documents:
            actions = []
            for doc in documents:
                doc_source = doc.copy()
                doc_id = str(doc_source.pop('_id', None))
                doc_source.pop('like_count', None)
                actions.append({
                    "_index": "posts",
                    "_id": doc_id,
                    "_source": json.loads(json.dumps(doc_source, default=json_serializer))
                })
            
            try:
                success_count, failed_count = bulk(es_client, actions, max_retries=3)
                logger.info(f"Successfully synced {success_count} documents, {failed_count} failed")
            except BulkIndexError as e:
                logger.error(f"Bulk indexing failed with {len(e.errors)} errors:")
                for error in e.errors:
                    logger.error(f"  {error}")
                raise
            
        current_time = datetime.utcnow()
        save_last_sync_time(current_time)
        logger.info("Sync completed successfully")
            
    except Exception as e:
        logger.error(f"Error syncing to Elasticsearch: {e}", exc_info=True)
        sys.exit(1)

if __name__ == "__main__":
    sync_mongo_to_elasticsearch()