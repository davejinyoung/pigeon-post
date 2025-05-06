import os
import base64
import subprocess
import datetime
import functools
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
            creds = flow.run_local_server(port=8080, access_type='offline') # add prompt='consent' arg for refresh token and delete existing token.json file

        # Save the credentials for the next run
        with open('api/token.json', 'w') as token:
            token.write(creds.to_json())

    service = build('gmail', 'v1', credentials=creds)

    return service


@functools.cache
def get_emails(max_results, label_ids, query=""):
    label_ids = list(label_ids)
    try:
        service = get_gmail_service()
        results = service.users().messages().list(userId='me', maxResults=max_results, labelIds=label_ids, q=query).execute()
        messages = results.get('messages', [])
        email_ids = [message['id'] for message in messages]

        return extract_emails_from_id(service, email_ids)
    except HttpError as error:
        print(f"An error occurred: {error}")
        return None


def extract_emails_from_id(service, email_ids):
    emails = []
    for email_id in email_ids:
        msg = service.users().messages().get(userId='me', id=email_id).execute()
        header_data = extract_header_data(msg)
        body = extract_email_body(msg)
        emails.append({
            'id': msg['id'],
            'sender': header_data['sender'],
            'internal_date': convert_internal_date(msg['internalDate']),
            'subject': header_data['subject'],
            'snippet': msg['snippet'],
            'body': body,
            'thread_id': msg['threadId']
        })

    return emails


def get_emails_summaries(emails):
    try:
        prompt_text = (
            "You are an AI assistant that summarizes emails. For this email, create a concise summary using the following format:\n\n"
            "<An explanation of the main purpose of the email - long enough to capture all information concisely.>\n"
            "Do not provide any preambles like ""Here is the summary"". Just output only the summary and nothing else.\n"
            "Here is the email to summarize:\n\n\n"
        )

        for email in emails:
            clean_body = remove_hyperlinks(email['body'])
            email_content = f"Sender: {email['sender']}\n"
            email_content += f"Subject: {email['subject']}\n"
            email_content += f"Email content: '{clean_body}'\n\n"
            email['summary'] = summarize_with_ollama(prompt_text + email_content)

        return {'emails_with_summaries': emails}
    except HttpError as error:
        print(f"An error occurred: {error}")
        return None


def remove_hyperlinks(text):
    return re.sub(r'https?://\S+|www\.\S+', '', text)


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
                case 'FROM':
                    header_data['sender'] = header['value']
                case _:
                    continue

    return header_data


def extract_email_body(msg):
    payload = msg.get("payload", {})

    def process_parts(parts):
        for part in parts:
            mime_type = part.get("mimeType", "")

            # Handle multipart types recursively
            if mime_type.startswith("multipart/"):
                sub_parts = part.get("parts", [])
                result = process_parts(sub_parts)
                if result:
                    return result

            if mime_type == "text/plain" or mime_type == "text/html":
                content = base64.urlsafe_b64decode(part["body"]["data"]).decode("utf-8")
                return clean_email_body(content, is_html=(mime_type == "text/html"))

            if "attachmentId" in part.get("body", {}):
                attachment_id = part["body"]["attachmentId"]
                filename = part.get("filename", "unknown")
                print(f"Attachment found: {filename} (ID: {attachment_id})")

        return None

    if "parts" in payload:
        return process_parts(payload["parts"])

    if "body" in payload and "data" in payload["body"]:
        body_data = payload["body"].get("data", "")
        if body_data:
            raw_content = base64.urlsafe_b64decode(body_data).decode("utf-8")
            return clean_email_body(raw_content)

    return None


@functools.cache
def summarize_with_ollama(content):
    result = subprocess.run(
        ["ollama", "run", "llama3.2", content],
        capture_output=True, text=True
    )

    return result.stdout.strip()


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


def convert_internal_date(internal_date_ms):
    if internal_date_ms:
        timestamp = int(internal_date_ms) / 1000
        email_datetime = datetime.datetime.fromtimestamp(timestamp)
        readable_date = email_datetime.strftime('%Y-%m-%d %H:%M:%S')
        return readable_date

    return None