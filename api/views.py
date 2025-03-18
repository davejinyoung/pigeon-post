from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import EmailSummary
from .services import get_emails, get_emails_summaries
from .serializers import EmailSummariesSerializer, EmailSerializer
from datetime import datetime, timedelta


class EmailsList(APIView):
    max_results = 10
    label_ids = ['INBOX', 'IMPORTANT', 'UNREAD']
    query = ""

    def get(self, request):
        dt = datetime.today() - timedelta(days=7)
        test_query = f"before:{int(dt.timestamp())}"
        emails = get_emails(max_results=self.max_results, label_ids=self.label_ids, query=self.query)
        serializer = EmailSerializer(emails, many=True)
        return Response(serializer.data)

    def post(self, request):
        data = request.data.get("filters")
        dt = datetime.today() - timedelta(days=data['dateRange'])
        self.query = f"after:{int(dt.timestamp())}"
        self.label_ids = data['labels']
        emails = get_emails(max_results=self.max_results, label_ids=self.label_ids, query=self.query)
        serializer = EmailSerializer(emails, many=True)
        return Response(serializer.data)

class EmailSummaryList(APIView):
    email_ids = []

    def summarize(self):
        serializer = EmailSummariesSerializer(get_emails_summaries(self.email_ids))
        return Response(serializer.data)

    def get(self, request):
        return self.summarize()

    def post(self, request):
        email_ids = request.data.get("email_ids", [])

        if not email_ids:
            return Response({"error": "No email IDs provided"}, status=status.HTTP_400_BAD_REQUEST)

        self.email_ids = email_ids

        return self.summarize()
