import os
import sys
import logging
import requests
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from elasticsearch import Elasticsearch
from elasticsearch.exceptions import ConnectionError, RequestError
from bson import ObjectId
from django.contrib.auth.models import User

sys.path.append('/app')

from mongo_api import get_mongo_client
from posts.models import PostDocument
from .serializer import PostSerializer

logger = logging.getLogger(__name__)

class SearchPostsView(APIView):
    def get(self, request):
        query = request.GET.get('q', '')
        page = int(request.GET.get('page', 1))
        page_size = 10
        from_index = (page - 1) * page_size
        
        if not query:
            return Response({'error': 'Query parameter "q" is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            es_host = os.getenv('ELASTIC_URL', 'elasticsearch')
            es_port = os.getenv('ELASTIC_PORT', '9200')
            es_url = f"http://{es_host}:{es_port}"
            
            es_client = Elasticsearch(
                hosts=[es_url],
                headers={
                    'Content-Type': 'application/vnd.elasticsearch+json; compatible-with=8',
                    'Accept': 'application/vnd.elasticsearch+json; compatible-with=8'
                },
                max_retries=3,
                retry_on_timeout=True
            )
            
            logger.info("Testing Elasticsearch connection...")
            try:
                health_response = requests.get(f"{es_url}/_cluster/health", timeout=10)
                if health_response.status_code != 200:
                    logger.error(f"Cannot connect to Elasticsearch, status code: {health_response.status_code}")
                    return Response({'error': 'Search service is temporarily unavailable. Please try again later.'}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
                logger.info("Elasticsearch connection successful")
            except Exception as e:
                logger.error(f"Cannot connect to Elasticsearch: {str(e)}")
                return Response({'error': 'Search service is temporarily unavailable. Please try again later.'}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
            
            search_body = {
                "from": from_index,
                "size": page_size,
                "query": {
                    "bool": {
                        "should": [
                            {
                                "match_phrase": {
                                    "content.text": {
                                        "query": query,
                                        "boost": 3.0
                                    }
                                }
                            },
                            {
                                "wildcard": {
                                    "content.text": {
                                        "value": f"*{query.lower()}*",
                                        "boost": 2.0,
                                        "case_insensitive": True
                                    }
                                }
                            },
                            {
                                "match": {
                                    "content.text": {
                                        "query": query,
                                        "fuzziness": "AUTO",
                                        "boost": 1.5
                                    }
                                }
                            },
                            {
                                "match": {
                                    "content.text.ngram": {
                                        "query": query,
                                        "boost": 1.0
                                    }
                                }
                            }
                        ],
                        "minimum_should_match": 1
                    }
                },
                "sort": [
                    {"_score": {"order": "desc"}},
                    {"created_at": {"order": "desc"}}
                ],
                "highlight": {
                    "fields": {
                        "content.text": {
                            "pre_tags": ["<mark>"],
                            "post_tags": ["</mark>"],
                            "fragment_size": 150,
                            "number_of_fragments": 3
                        }
                    }
                }
            }
            
            logger.info(f"Performing search for query: {query}")
            result = es_client.search(index="posts", body=search_body)
            logger.info(f"Search completed, found {result['hits']['total']['value']} results")
            
            post_ids = [hit['_id'] for hit in result['hits']['hits']]
            highlights = {hit['_id']: hit.get('highlight', {}) for hit in result['hits']['hits']}
            logger.info(f"Extracted {len(post_ids)} post IDs from search results")
            
            post_doc = PostDocument()
            posts = []
            
            if post_ids:
                object_ids = [ObjectId(post_id) for post_id in post_ids]
                posts_cursor = post_doc.collection.find({'_id': {'$in': object_ids}})
                posts_dict = {str(post['_id']): post for post in posts_cursor}
                
                for post_id in post_ids:
                    if post_id in posts_dict:
                        post_data = posts_dict[post_id]
                        post_data['id'] = str(post_data.pop('_id', post_id))
                        post_data['highlight'] = highlights.get(post_id, {})
                        posts.append(post_data)
                
                logger.info(f"Found {len(posts)} posts in MongoDB")
            
            processed_posts = []
            for post in posts:
                user_id = post.get('user_id')
                username = None
                if user_id:
                    try:
                        user = User.objects.filter(id=user_id).values_list('username', flat=True).first()
                        username = user if user else f"User {user_id}"
                    except Exception as e:
                        logger.error(f"Error fetching username for user_id {user_id}: {str(e)}")
                        username = f"User {user_id}"
                
                likes = post.get('likes', [])
                is_liked = request.user.id in likes if hasattr(request.user, 'id') else False
                like_count = len(likes)
                
                processed_post = {
                    'id': post.get('id', ''),
                    'user_id': user_id,
                    'username': username,
                    'content': post.get('content', {}),
                    'comments': post.get('comments', []),
                    'likes': likes,
                    'like_count': like_count,
                    'is_liked': is_liked,
                    'created_at': post.get('created_at', ''),
                    'deleted': post.get('deleted', False),
                    'medias': post.get('content', {}).get('medias', []),
                    'highlight': post.get('highlight', {})
                }
                
                processed_posts.append(processed_post)
            
            serializer = PostSerializer(processed_posts, many=True)
            
            response_data = {
                'results': serializer.data,
                'total': result['hits']['total']['value'],
                'page': page,
                'page_size': page_size,
                'has_next': page * page_size < result['hits']['total']['value'],
                'query': query  
            }
            
            return Response(response_data, status=status.HTTP_200_OK)
            
        except ConnectionError as e:
            logger.error(f"Elasticsearch connection error: {str(e)}")
            return Response({'error': 'Search service is temporarily unavailable. Please try again later.'}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        except RequestError as e:
            logger.error(f"Elasticsearch request error: {str(e)}")
            return Response({'error': 'Invalid search query. Please try a different query.'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Search error: {str(e)}", exc_info=True)
            return Response({'error': 'An unexpected error occurred. Please try again later.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)