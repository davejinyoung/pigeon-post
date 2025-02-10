from rest_framework.views import APIView
from rest_framework.response import Response
from .models import EmailSummary
from .services import get_unread_emails
from .serializers import EmailSummarySerializer, EmailSerializer

class EmailSummaryList(APIView):
    def get(self, request):
        summaries = EmailSummary.objects.all()
        serializer = EmailSummarySerializer(summaries, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = EmailSummarySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

class UnreadEmailsList(APIView):
    def get(self, request):
        emails = get_unread_emails()
        serializer = EmailSerializer(emails, many=True)
        return Response(serializer.data)
