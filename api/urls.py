from django.urls import path
from .views import EmailSummaryList, UnreadEmailsList

urlpatterns = [
    path('summaries/', EmailSummaryList.as_view(), name='email-summary-list'),
    path('unread-emails/', UnreadEmailsList.as_view(), name='unread-emails-list'),
]