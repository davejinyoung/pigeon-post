import os
from google.auth.transport.requests import Request
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from google.oauth2.credentials import Credentials


SCOPES = ['https://www.googleapis.com/auth/gmail.readonly']

def get_gmail_service():
    creds = None
    if os.path.exists('api/token.json'):
        creds = Credentials.from_authorized_user_file("api/token.json", SCOPES)

    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(
                'api/credentials.json', SCOPES)
            creds = flow.run_local_server(port=8080, access_type='offline')

        # Save the credentials for the next run
        with open('api/token.json', 'w') as token:
            token.write(creds.to_json())

    service = build('gmail', 'v1', credentials=creds)
    return service


def get_unread_emails():
    try:
        service = get_gmail_service()
        results = service.users().messages().list(userId='me', labelIds=['INBOX'], q="is:unread").execute()
        messages = results.get('messages', [])

        email_summaries = []
        for message in messages[:10]:  # Limit to 10 emails for example
            msg = service.users().messages().get(userId='me', id=message['id']).execute()
            header_data = extract_header_data(msg)
            email_summaries.append({
                'id': msg['id'],
                'sender': header_data['sender'],
                'subject': header_data['subject'],
                'snippet': msg['snippet'],
                'threadId': msg['threadId']
            })

        return email_summaries
    except HttpError as error:
        print(f"An error occurred: {error}")
        return None


def extract_header_data(msg):
    header_data = {}
    payload = msg.get("payload", {})

    if 'headers' in payload:
        for header in payload['headers']:
            match header['name']:
                case 'Subject':
                    header_data['subject'] = header['value']
                case 'From':
                    header_data['sender'] = header['value']
                case _:
                    continue

    return header_data

