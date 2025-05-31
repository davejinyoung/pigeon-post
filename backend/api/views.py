from django.http import JsonResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import EmailSummary
from .services import get_emails, get_emails_summaries, trash_emails
from .serializers import EmailSummariesSerializer, EmailSerializer, EmailSummarySaveSerializer
from datetime import datetime, timedelta


class EmailsList(APIView):
    max_results = 30
    label_ids = []
    query = ""

    def get(self, request):
        dt = datetime.today() - timedelta(days=1)
        self.query = f"after:{int(dt.timestamp())}"
        emails = get_emails(max_results=self.max_results, label_ids=tuple(self.label_ids), query=self.query)
        serializer = EmailSerializer(emails, many=True)
        return Response(serializer.data)

    def post(self, request):
        data = request.data.get("filters")
        dt = datetime.today() - timedelta(days=data['dateRange'])

        # When it is not a 24-hour period
        if data['dateRange'] != 1:
            dt = dt.replace(hour=0, minute=0, second=0, microsecond=0)

        self.query = f"after:{int(dt.timestamp())}"
        self.label_ids = data['labels']
        self.max_results = data['maxResults']
        emails = get_emails(max_results=self.max_results, label_ids=tuple(self.label_ids), query=self.query)
        serializer = EmailSerializer(emails, many=True)
        return Response(serializer.data)


class EmailsTrash(APIView):
    def post(self, request):
        try:
            email_ids = request.data.get("email_ids", [])
            if not email_ids:
                return JsonResponse({"error": "No email IDs provided"}, status=400)

            trash_emails(email_ids)
            return JsonResponse(
                {"message": "Emails trashed successfully", "emails": email_ids},
                status=200
            )
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)


class EmailSummaryList(APIView):
    emails = []
    is_cache = True
    summary_input = ""

    def summarize(self):
        serializer = EmailSummariesSerializer(get_emails_summaries(self.emails, self.is_cache, self.summary_input))
        return Response(serializer.data)

    def get(self, request):
        return self.summarize()

    def post(self, request):
        emails = request.data.get("emails", [])
        self.is_cache = request.data.get("cache", True)
        self.summary_input = request.data.get("summary_input", "")

        if not emails:
            return Response({"error": "No email IDs provided"}, status=status.HTTP_400_BAD_REQUEST)

        self.emails = emails

        return self.summarize()

class EmailSummarySave(APIView):

    def get(self, request):
        summaries = EmailSummary.objects.all()
        serializer = EmailSummarySaveSerializer(summaries, many=True)
        return JsonResponse(
            {
                "message": "Summaries retrieved successfully",
                "summaries": serializer.data
            },
            status=200,
        )

    def post(self, request):
        summary = request.data.get("summary", [])
        save = request.data.get("save", True)
        serializer = EmailSummarySaveSerializer(summary.get("summary"))
        email_serialized = EmailSummary(
            id=serializer.data["id"],
            sender=serializer.data["sender"],
            subject=serializer.data["subject"],
            snippet=serializer.data["snippet"],
            summary=serializer.data["summary"],
            body=serializer.data["body"],
            internal_date=serializer.data["internal_date"],
            thread_id=serializer.data["thread_id"],
        )
        if save:
            email_serialized.save()
        else:
            email_serialized.delete()
        
        return JsonResponse(
            {
                "message": "Summary saved successfully",
                "email_id": serializer.data["id"]
            },
            status=200,
        )