from django.urls import path
from .views import EmailsList, EmailSummaryList, EmailSummarySave, EmailsTrash

urlpatterns = [
    path('emails/', EmailsList.as_view(), name='emails-list'),
    path('emails/trash/', EmailsTrash.as_view(), name='emails-trash'),
    path('emails/summaries/', EmailSummaryList.as_view(), name='email-summaries'),
    path('emails/summaries/saved/', EmailSummarySave.as_view(), name='email-summaries-saved'),
]