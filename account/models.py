from django.db import models
from django.contrib.auth.models import AbstractUser
# Create your models here.
class User(AbstractUser):
    # username
    # password
    # email
    # first_name
    # last_name

    email_verified = models.BooleanField(default=False, null=False)
    date_updated = models.DateTimeField(auto_now=True)