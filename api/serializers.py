from rest_framework import serializers
from .models import EmailSummary

class EmailSerializer(serializers.Serializer):
    id = serializers.CharField()
    sender = serializers.CharField()
    internalDate = serializers.CharField()
    subject = serializers.CharField()
    snippet = serializers.CharField()
    body = serializers.CharField()
    threadId = serializers.CharField()

class EmailSummariesSerializer(serializers.Serializer):
    summaries = serializers.ListField()