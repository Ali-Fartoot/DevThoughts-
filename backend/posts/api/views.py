from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django.http import Http404
import logging
from posts.models import PostDocument
from .serializer import PostCreateSerializer, PostSerializer
from rest_framework.permissions import IsAuthenticated


logger = logging.getLogger(__name__)

class CustomPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def post_list_create(request):
    """
    List all posts or create a new post
    """
    if request.method == 'POST':
        return create_post(request)
    elif request.method == 'GET':
        return get_all_posts(request)

def create_post(request):
    post_doc = PostDocument()
    
    try:
        serializer = PostCreateSerializer(data=request.data)
        
        if serializer.is_valid():
            post_data = serializer.validated_data
            post_data.setdefault('comments', [])
            post_data.setdefault('likes', [])
            post_data['user_id'] = request.user.id

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

def get_all_posts(request):
    post_doc = PostDocument()
    
    try:
        # Get all posts (you might want to add pagination here)
        all_posts = post_doc.get_all(0, 100)  # Get first 100 posts
        
        # Serialize each post and add computed fields
        serialized_posts = []
        for post in all_posts:
            serializer = PostSerializer(post)
            post_data = serializer.data
            # Add computed fields
            post_data['username'] = request.user.username
            post_data['is_liked'] = request.user.id in post_data.get('likes', [])
            serialized_posts.append(post_data)
            
        return Response(serialized_posts, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Error fetching all posts: {e}")
        return Response(
            {'error': 'Failed to fetch posts'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_posts_by_user(request):
    post_doc = PostDocument()
    
    try:
        # Get posts for the authenticated user
        user_posts = post_doc.get_posts_by_user(request.user.id, 0, 10)
        
        # Serialize each post and add computed fields
        serialized_posts = []
        for post in user_posts:
            serializer = PostSerializer(post)
            post_data = serializer.data
            # Add computed fields
            post_data['username'] = request.user.username
            post_data['is_liked'] = request.user.id in post_data.get('likes', [])
            serialized_posts.append(post_data)
            
        return Response(serialized_posts, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Error fetching user posts: {e}")
        return Response(
            {'error': 'Failed to fetch user posts'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_comment(request, post_id):
    """
    Add Comment to a post
    """
    post_doc = PostDocument()

    try:
        serializer = PostCreateSerializer(data=request.data)

        if serializer.is_valid():
            post_data = serializer.validated_data
            created_post = post_doc.create(post_data)
            post_data_id = created_post.get('_id')
            result = post_doc.add_comment(post_id, post_data_id)

            if result:
                response_serializer = PostSerializer(created_post)
                return Response(
                    response_serializer.data, 
                    status=status.HTTP_201_CREATED
                )
        
            else:
        
                return Response( {'error': 'Failed to link comment to the post'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR )
            
    except Exception as e:
        return Response(
            {'error': 'Failed to adding comment'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
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
            post_detail = serializer.data
            post_detail['username'] = request.user.username
            post_detail['is_liked'] = request.user.id in post_detail.get('likes', [])
        

            return Response(post_detail)
        
        except Exception as e:
            logger.error(f"Error fetching post {post_id}: {e}")
            return Response(
                {'error': 'Failed to fetch post'}, 
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
@permission_classes([IsAuthenticated])
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
    
    user_id = request.user.id
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
@permission_classes([IsAuthenticated])
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
    
    user_id = request.user.id
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