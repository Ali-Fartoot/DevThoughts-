from rest_framework import serializers
from datetime import datetime

class PostContentSerializer(serializers.Serializer):
    text = serializers.CharField(max_length=280, required=True, allow_blank=False)
    medias = serializers.ListField(
        child=serializers.CharField(),
        max_length=4, 
        required=False,
        default=[],
        read_only=True
    )
    user_id = serializers.IntegerField(read_only=True)


class PostSerializer(serializers.Serializer):
    _id = serializers.CharField(read_only=True)
    user_id = serializers.IntegerField(read_only=True)
    content = PostContentSerializer()
    comments = serializers.ListField(
        child=serializers.CharField(), 
        required=False,
        default=[]
    )
    likes = serializers.ListField(
        child=serializers.IntegerField(), 
        required=False,
        default=[]
    )

    medias = serializers.ListField(
        child=serializers.CharField(),
        read_only=True
    )

    like_count = serializers.IntegerField(read_only=True)
    created_at = serializers.DateTimeField(read_only=True)
    deleted = serializers.BooleanField(read_only=True)
    user_id = serializers.IntegerField(read_only=True)
    username = serializers.CharField(read_only=True)
    is_liked = serializers.BooleanField(read_only=True)

class PostCreateSerializer(serializers.Serializer):
    content = PostContentSerializer()
    comments = serializers.ListField( 
        child=serializers.CharField(), 
        required=False,
        default=[]
    )
    likes = serializers.ListField(
        child=serializers.IntegerField(), 
        required=False,
        default=[]
    )
    is_comment = serializers.BooleanField(default=False)
    attachments = serializers.ListField(
        child=serializers.FileField(max_length=4, allow_empty_file=False),
        required=False,
        write_only=True

    )