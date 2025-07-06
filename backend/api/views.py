from django.shortcuts import redirect
from django.http import JsonResponse
from google_auth_oauthlib.flow import Flow
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import EmailSummary
from .services import get_emails, get_emails_summaries, trash_emails
from .serializers import EmailSummariesSerializer, EmailSerializer, EmailSummarySaveSerializer
from datetime import datetime, timedelta
from .decorators import token_required

SCOPES = ['https://mail.google.com/']

class AuthStatus(APIView):
    @token_required
    def get(self, request):
        return Response({'authenticated': True})


def logout(request):
    request.session.flush()
    return redirect('http://localhost:4200/login')


def google_auth_init(request):
    flow = Flow.from_client_secrets_file(
        'api/credentials.json',
        scopes=SCOPES,
        redirect_uri='http://localhost:8000/api/auth/gmail/callback/'
    )
    auth_url, _ = flow.authorization_url(
        access_type='offline',
        prompt='consent'
    )
    request.session['oauth_state'] = flow.oauth2session._state
    return redirect(auth_url)


def gmail_auth_callback(request):
    try:
        state = request.session.get('oauth_state')
        code = request.GET.get('code')

        if not code:
            return JsonResponse({'error': 'Authorization code not provided'}, status=400)

        flow = Flow.from_client_secrets_file(
            'api/credentials.json',
            scopes=SCOPES,
            redirect_uri='http://localhost:8000/api/auth/gmail/callback/',
            state=state
        )
        flow.fetch_token(code=code)

        creds = flow.credentials

        # Save credentials in the session
        request.session['gmail_credentials'] = {
            'token': creds.token,
            'refresh_token': creds.refresh_token,
            'token_uri': creds.token_uri,
            'client_id': creds.client_id,
            'client_secret': creds.client_secret,
            'scopes': creds.scopes
        }

        return redirect('http://localhost:4200/emails')
    except Exception as e:
        return JsonResponse({'error': f'Failed to handle Gmail OAuth callback: {str(e)}'}, status=500)


class EmailsList(APIView):
    max_results = 30
    label_ids = []
    query = ""

    def get(self, request):
        if 'emails' in request.session:
            serializer = EmailSerializer(request.session['emails'], many=True)
            return Response(serializer.data)
        else:
            dt = datetime.today() - timedelta(days=1)
            self.query = f"after:{int(dt.timestamp())}"
            request.session['emails'] = get_emails(request, max_results=self.max_results, label_ids=tuple(self.label_ids), query=self.query)
            serializer = EmailSerializer(request.session['emails'], many=True)
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
        request.session['emails'] = get_emails(request, max_results=self.max_results, label_ids=tuple(self.label_ids), query=self.query)
        serializer = EmailSerializer(request.session['emails'], many=True)
        return Response(serializer.data)


class EmailsTrash(APIView):
    def post(self, request):
        try:
            email_ids = request.data.get("email_ids", [])
            if not email_ids:
                return JsonResponse({"error": "No email IDs provided"}, status=400)

            trash_emails(request, email_ids)
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