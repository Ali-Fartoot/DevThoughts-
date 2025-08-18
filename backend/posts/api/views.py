from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django.http import Http404
import logging
from posts.models import PostDocument
from .serializer import PostCreateSerializer, PostSerializer

logger = logging.getLogger(__name__)

class CustomPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

@api_view(['GET', 'POST'])
def post_list_create(request):
    """
    List all posts or create a new post
    """
    post_doc = PostDocument()
    
    if request.method == 'GET':
        try:
            page = int(request.GET.get('page', 1))
            page_size = int(request.GET.get('page_size', 10))
            search_query = request.GET.get('search', '')
            
            skip = (page - 1) * page_size
            
            if search_query:
                posts = post_doc.search_posts(search_query, skip=skip, limit=page_size)
            else:
                posts = post_doc.get_all(skip=skip, limit=page_size)
            
            serializer = PostSerializer(posts, many=True)
            
            return Response({
                'results': serializer.data,
                'page': page,
                'page_size': page_size,
                'count': len(serializer.data)
            })
        
        except Exception as e:
            logger.error(f"Error fetching posts: {e}")
            return Response(
                {'error': 'Failed to fetch posts'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    elif request.method == 'POST':
        try:
            serializer = PostCreateSerializer(data=request.data)
            
            if serializer.is_valid():
                post_data = serializer.validated_data
                # Ensure default values
                post_data.setdefault('comments', [])
                post_data.setdefault('likes', [])
                
                created_post = post_doc.create(post_data)
                
                response_serializer = PostSerializer(created_post)
                return Response(
                    response_serializer.data, 
                    status=status.HTTP_201_CREATED
                )
            
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        except Exception as e:
            logger.error(f"Error creating post: {e}")
            return Response(
                {'error': 'Failed to create post'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

@api_view(['GET', 'PUT', 'DELETE'])
def post_detail(request, post_id):
    """
    Retrieve, update or delete a post
    """
    post_doc = PostDocument()
    
    post = post_doc.get_by_id(post_id)
    if not post:
        return Response(
            {'error': 'Post not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    
    if request.method == 'GET':
        try:
            serializer = PostSerializer(post)
            return Response(serializer.data)
        
        except Exception as e:
            logger.error(f"Error fetching post {post_id}: {e}")
            return Response(
                {'error': 'Failed to fetch post'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    elif request.method == 'PUT':
        try:
            serializer = PostUpdateSerializer(data=request.data)
            
            if serializer.is_valid():
                update_data = serializer.validated_data
                
                if post_doc.update(post_id, update_data):
                    updated_post = post_doc.get_by_id(post_id)
                    response_serializer = PostSerializer(updated_post)
                    return Response(response_serializer.data)
                else:
                    return Response(
                        {'error': 'Failed to update post'}, 
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR
                    )
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        except Exception as e:
            logger.error(f"Error updating post {post_id}: {e}")
            return Response(
                {'error': 'Failed to update post'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    elif request.method == 'DELETE':
        try:
            if post_doc.delete(post_id):
                return Response(status=status.HTTP_204_NO_CONTENT)
            else:
                return Response(
                    {'error': 'Failed to delete post'}, 
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        
        except Exception as e:
            logger.error(f"Error deleting post {post_id}: {e}")
            return Response(
                {'error': 'Failed to delete post'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

@api_view(['POST'])
def post_like(request, post_id):
    """
    Add a like to a post
    """
    post_doc = PostDocument()
    
    post = post_doc.get_by_id(post_id)
    if not post:
        return Response(
            {'error': 'Post not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    
    user_id = request.data.get('user_id')
    if not user_id:
        return Response(
            {'error': 'user_id is required'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        if post_doc.add_like(post_id, user_id):
            updated_post = post_doc.get_by_id(post_id)
            response_serializer = PostSerializer(updated_post)
            return Response(response_serializer.data)
        else:
            return Response(
                {'error': 'Failed to like post'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    except Exception as e:
        logger.error(f"Error liking post {post_id}: {e}")
        return Response(
            {'error': 'Failed to like post'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
def post_unlike(request, post_id):
    """
    Remove a like from a post
    """
    post_doc = PostDocument()
    
    post = post_doc.get_by_id(post_id)
    if not post:
        return Response(
            {'error': 'Post not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    
    user_id = request.data.get('user_id')
    if not user_id:
        return Response(
            {'error': 'user_id is required'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        if post_doc.remove_like(post_id, user_id):
            updated_post = post_doc.get_by_id(post_id)
            response_serializer = PostSerializer(updated_post)
            return Response(response_serializer.data)
        else:
            return Response(
                {'error': 'Failed to unlike post'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    except Exception as e:
        logger.error(f"Error unliking post {post_id}: {e}")
        return Response(
            {'error': 'Failed to unlike post'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )