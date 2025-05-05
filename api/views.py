import functools
import json
from django.views.decorators.csrf import ensure_csrf_cookie
from django.utils.decorators import method_decorator
from django.http import JsonResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import EmailSummary
from .services import get_emails, get_emails_summaries
from .serializers import EmailSummariesSerializer, EmailSerializer, EmailSummarySaveSerializer
from datetime import datetime, timedelta


class EmailsList(APIView):
    max_results = 30
    label_ids = ['INBOX', 'IMPORTANT', 'UNREAD']
    query = ""

    def get(self, request):
        dt = datetime.today() - timedelta(days=7)
        emails = get_emails(max_results=self.max_results, label_ids=tuple(self.label_ids), query=self.query)
        serializer = EmailSerializer(emails, many=True)
        return Response(serializer.data)

    def post(self, request):
        data = request.data.get("filters")
        dt = datetime.today() - timedelta(days=data['dateRange'])
        dt = dt.replace(hour=23, minute=59, second=59, microsecond=999999)
        self.query = f"after:{int(dt.timestamp())}"
        self.label_ids = data['labels']
        self.max_results = data['maxResults']
        emails = get_emails(max_results=self.max_results, label_ids=tuple(self.label_ids), query=self.query)
        serializer = EmailSerializer(emails, many=True)
        return Response(serializer.data)

class EmailSummaryList(APIView):
    emails = []

    def summarize(self):
        serializer = EmailSummariesSerializer(get_emails_summaries(self.emails))
        return Response(serializer.data)

    def get(self, request):
        return self.summarize()

    def post(self, request):
        emails = request.data.get("emails", [])

        if not emails:
            return Response({"error": "No email IDs provided"}, status=status.HTTP_400_BAD_REQUEST)

        self.emails = emails

        return self.summarize()

class EmailSummarySave(APIView):

    def post(self, request):
        summary = request.data.get("summary", [])
        serializer = EmailSummarySaveSerializer(summary.get("summary"))
        EmailSummary(
            id=serializer.data["id"],
            sender=serializer.data["sender"],
            subject=serializer.data["subject"],
            snippet=serializer.data["snippet"],
            summary=serializer.data["summary"],
            body=serializer.data["body"],
            internal_date=serializer.data["internalDate"],
            thread_id=serializer.data["threadId"],
        ).save()
        
        return JsonResponse(
        {
            "message": "Summary saved successfully",
            "email_id": serializer.data["id"]
        },
        status=200,
    )