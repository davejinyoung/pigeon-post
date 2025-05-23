from django.db import models
from datetime import datetime

class EmailSummary(models.Model):
    id = models.CharField(max_length=255, primary_key=True)
    sender = models.CharField(max_length=255, blank=True)
    internal_date = models.CharField(max_length=255, blank=False, default=datetime.now())
    subject = models.CharField(null=True, blank=True)
    snippet = models.CharField(null=True, blank=True)
    body = models.CharField(null=True, blank=True)
    summary = models.CharField(null=True, blank=True)
    thread_id = models.CharField(max_length=255)

    def __str__(self):
        return self.subject
