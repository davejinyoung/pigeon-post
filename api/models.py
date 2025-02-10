from django.db import models

class EmailSummary(models.Model):
    subject = models.CharField(max_length=255)
    body = models.TextField()
    date_received = models.DateTimeField()
    priority = models.IntegerField()

    def __str__(self):
        return self.subject
