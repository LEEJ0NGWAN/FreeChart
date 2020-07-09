from random import choice as random_choice
from string import ascii_uppercase, digits
from django.db import models
from django.contrib.auth.models import AbstractBaseUser
# from django.contrib.auth.models import AbstractUser
from django.contrib.auth.validators import UnicodeUsernameValidator

def id_generator(size=32, chars=ascii_uppercase + digits):
    return ''.join(random_choice(chars) for _ in range(size))

# TODO: User Model 새로 만들기
class User(AbstractBaseUser):
    # username(email)
    # password
    # email
    # first_name
    # last_name

    email = models.EmailField(blank=False, unique=True, max_length=254, verbose_name='email address')
    password = models.CharField(max_length=128, verbose_name='password')
    username = models.CharField(max_length=150, unique=True, validators=[UnicodeUsernameValidator()], verbose_name='username')
    is_active = models.BooleanField(default=True,verbose_name='active')
    email_verified = models.BooleanField(default=False, null=False)
    date_updated = models.DateTimeField(auto_now=True)
    
    REQUIRED_FIELDS = []
    USERNAME_FIELD = 'username'
