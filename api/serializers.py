from rest_framework import serializers

class EmailSerializer(serializers.Serializer):
    id = serializers.CharField()
    sender = serializers.CharField()
    internalDate = serializers.CharField()
    subject = serializers.CharField()
    snippet = serializers.CharField()
    body = serializers.CharField()
    threadId = serializers.CharField()

class EmailSummariesSerializer(serializers.Serializer):
    emails_with_summaries = serializers.ListField()

class EmailSummarySaveSerializer(serializers.Serializer):
    id = serializers.CharField()
    sender = serializers.CharField()
    internalDate = serializers.CharField()
    subject = serializers.CharField()
    snippet = serializers.CharField()
    body = serializers.CharField()
    summary = serializers.CharField()
    threadId = serializers.CharField()