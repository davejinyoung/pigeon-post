from django.urls import path
from .views import EmailsList, EmailSummaryList, EmailSummarySave, EmailsTrash, google_auth_init, gmail_auth_callback

urlpatterns = [
    path('emails/', EmailsList.as_view(), name='emails-list'),
    path('emails/trash/', EmailsTrash.as_view(), name='emails-trash'),
    path('emails/summaries/', EmailSummaryList.as_view(), name='email-summaries'),
    path('emails/summaries/saved/', EmailSummarySave.as_view(), name='email-summaries-saved'),
    path('auth/gmail/init/', google_auth_init),
    path('auth/gmail/callback/', gmail_auth_callback)
]