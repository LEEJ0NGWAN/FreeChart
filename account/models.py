from random import choice as random_choice
from string import ascii_uppercase, digits
from django.db import models
from django.contrib.auth.models import AbstractUser


def id_generator(size=32, chars=ascii_uppercase + digits):
    return ''.join(random_choice(chars) for _ in range(size))

class User(AbstractUser):
    # username
    # password
    # email
    # first_name
    # last_name

    email_verified = models.BooleanField(default=False, null=False)
    date_updated = models.DateTimeField(auto_now=True)