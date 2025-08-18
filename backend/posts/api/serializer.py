from rest_framework import serializers
from datetime import datetime

class PostContentSerializer(serializers.Serializer):
    text = serializers.CharField(max_length=280, required=True, allow_blank=False)
    media = serializers.ListField(
        child=serializers.URLField(), 
        required=False,
        default=[]
    )

class PostSerializer(serializers.Serializer):
    _id = serializers.CharField(read_only=True)
    user_id = serializers.IntegerField()
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
    like_count = serializers.IntegerField(read_only=True)
    created_at = serializers.DateTimeField(read_only=True)
    deleted = serializers.BooleanField(read_only=True)

class PostCreateSerializer(serializers.Serializer):
    user_id = serializers.IntegerField()
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
