from bson import ObjectId
from datetime import datetime
from typing import Optional, Dict, Any, List
import json
from posts.base import BaseDocument

class PostDocument(BaseDocument):
    def __init__(self):
        super().__init__('posts')
    
    def create(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new post document"""
        data['created_at'] = datetime.utcnow()
        data['deleted'] = False
        data['like_count'] = len(data.get('likes', []))
        
        result = self.collection.insert_one(data)
        created_doc = self.collection.find_one({'_id': result.inserted_id})
        return self.to_dict(created_doc)
    
    def get_by_id(self, post_id: str) -> Optional[Dict[str, Any]]:
        try:
            doc = self.collection.find_one({'_id': ObjectId(post_id)})
            return self.to_dict(doc) if doc else None
        except Exception:
            return None
        
    def get_all(self, skip: int = 0, limit: int = 100) -> list:
        docs = self.collection.find({'deleted': False}).skip(skip).limit(limit)
        return self.to_dict_list(list(docs))

    def delete(self, post_id: str) -> bool:
        try:
            result = self.collection.update_one(
                {'_id': ObjectId(post_id)}, 
                {'$set': {'deleted': True}}
            )
            return result.modified_count > 0
        except Exception:
            return False
    
    def add_comment(self, post_id: str, comment_id: str) -> bool:
        try:
            result = self.collection.update_one(
                {'_id': ObjectId(post_id)}, 
                {'$push': {'comments': ObjectId(comment_id)}}
            )
            return result.modified_count > 0
        except Exception:
            return False
    
    
    def add_like(self, post_id: str, user_id: int) -> bool:
        try:
            result = self.collection.update_one(
                {'_id': ObjectId(post_id)}, 
                {'$addToSet': {'likes': user_id}}
            )
            if result.modified_count > 0:
                self.collection.update_one(
                    {'_id': ObjectId(post_id)}, 
                    {'$set': {'like_count': len(self.get_by_id(post_id)['likes'])}}
                )
            return result.modified_count > 0
        except Exception:
            return False
    
    def remove_like(self, post_id: str, user_id: int) -> bool:
        try:
            result = self.collection.update_one(
                {'_id': ObjectId(post_id)}, 
                {'$pull': {'likes': user_id}}
            )
            if result.modified_count > 0:
                self.collection.update_one(
                    {'_id': ObjectId(post_id)}, 
                    {'$set': {'like_count': len(self.get_by_id(post_id)['likes'])}}
                )
            return result.modified_count > 0
        except Exception:
            return False
    
    def get_posts_by_user(self, user_id: int, skip: int = 0, limit: int = 100) -> list:
        docs = self.collection.find({'user_id': user_id, 'deleted': False}).skip(skip).limit(limit)
        return self.to_dict_list(list(docs))
    
    def search_posts(self, query: str, skip: int = 0, limit: int = 20) -> list:
        search_filter = {
            'deleted': False,
            '$or': [
                {'content.text': {'$regex': query, '$options': 'i'}}
            ]
        }
        docs = self.collection.find(search_filter).skip(skip).limit(limit)
        return self.to_dict_list(list(docs))