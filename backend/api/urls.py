from django.urls import path
from . import views

urlpatterns = [
    path('emails/', views.EmailsList.as_view(), name='emails-list'),
    path('emails/trash/', views.EmailsTrash.as_view(), name='emails-trash'),
    path('emails/summaries/', views.EmailSummaryList.as_view(), name='email-summaries'),
    path('emails/summaries/saved/', views.EmailSummarySave.as_view(), name='email-summaries-saved'),
    path('auth/logout/', views.logout),
    path('auth/gmail/init/', views.google_auth_init),
    path('auth/gmail/callback/', views.gmail_auth_callback),
    path('auth/status/', views.AuthStatus.as_view(), name='auth-status'),
]