from rest_framework import serializers
from .models import EmailSummary

class EmailSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = EmailSummary
        fields = '__all__'

class EmailSerializer(serializers.Serializer):
    id = serializers.CharField()
    sender = serializers.CharField()
    subject = serializers.CharField()
    snippet = serializers.CharField()
    threadId = serializers.CharField()