from django.urls import path
from .views import EmailsList, EmailSummaryList, EmailSummarySave

urlpatterns = [
    path('emails/', EmailsList.as_view(), name='emails-list'),
    path('emails/summaries/', EmailSummaryList.as_view(), name='email-summaries'),
    path('emails/summaries/saved/', EmailSummarySave.as_view(), name='email-summaries-saved'),
]