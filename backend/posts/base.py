from typing import Dict, List
from bson import ObjectId
from mongo import get_mongo_client

class BaseDocument:
    def __init__(self, collection_name: str):
        self.collection = get_mongo_client().db[collection_name]
    
    def to_dict(self, doc: Dict) -> Dict:
        """Convert MongoDB document to dictionary with string IDs"""
        if doc and '_id' in doc:
            doc['_id'] = str(doc['_id'])
        return doc
    
    def to_dict_list(self, docs: List) -> List:
        """Convert list of MongoDB documents to list of dictionaries"""
        return [self.to_dict(doc) for doc in docs]