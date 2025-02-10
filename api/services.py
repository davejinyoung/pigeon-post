import os
import base64
import re
from bs4 import BeautifulSoup
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
        results = service.users().messages().list(userId='me', labelIds=['INBOX', 'IMPORTANT'], q="is:unread").execute()
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
                'body': extract_email_body(msg),
                'labelIds': msg['labelIds'],
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


def extract_email_body(msg):
    payload = msg.get("payload", {})

    # Check if the email is multipart
    if "parts" in payload:
        for part in payload["parts"]:
            mime_type = part.get("mimeType", "")

            # If it's a multipart/alternative, we need to check for plain text or HTML
            if mime_type == "multipart/alternative":
                # Loop through the alternative parts and pick the first text/plain or text/html
                for sub_part in part.get("parts", []):
                    sub_mime_type = sub_part.get("mimeType", "")
                    if sub_mime_type == "text/plain" or sub_mime_type == "text/html":
                        content = base64.urlsafe_b64decode(sub_part["body"]["data"]).decode("utf-8")
                        return clean_email_body(content, is_html=(sub_mime_type == "text/html"))

            # If it's a simple part and mime type is plain text or html
            if mime_type == "text/plain" or mime_type == "text/html":
                content = base64.urlsafe_b64decode(part["body"]["data"]).decode("utf-8")
                return clean_email_body(content, is_html=(mime_type == "text/html"))

    # If it's not multipart, check the main body (in case it's not multipart but still has data)
    if "body" in payload and "data" in payload["body"]:
        body_data = payload["body"].get("data", "")
        if body_data:  # Make sure there is data to decode
            raw_content = base64.urlsafe_b64decode(body_data).decode("utf-8")
            return clean_email_body(raw_content)

    return None


def clean_email_body(content, is_html=True):
    if is_html:
        soup = BeautifulSoup(content, "html.parser")
        text = soup.get_text()
    else:
        text = content

    # Clean the text: remove multiple newlines, carriage returns, and excessive spaces
    text = re.sub(r'[\r\n]+', ' ', text)
    text = re.sub(r'\s+', ' ', text)
    text = text.strip()

    return text