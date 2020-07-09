from random import choice as random_choice
from string import ascii_uppercase, digits
from django.db import models
from django.contrib.auth.models import AbstractBaseUser
from django.contrib.auth.models import PermissionsMixin
from django.contrib.auth.base_user import BaseUserManager
from django.contrib.auth.validators import UnicodeUsernameValidator

def id_generator(size=32, chars=ascii_uppercase + digits):
    return ''.join(random_choice(chars) for _ in range(size))

class UserManager(BaseUserManager):
    use_in_migrations = True

    def _create_user(self, email, password, **extra_fields):
        if not email:
            raise ValueError('The given email must be set')

        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_user(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_superuser', False)
        return self._create_user(email, password, **extra_fields)

    def create_superuser(self, email, password, **extra_fields):
        extra_fields.setdefault('is_superuser', True)

        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self._create_user(email, password, **extra_fields)

class User(AbstractBaseUser, PermissionsMixin):

    email = models.EmailField(blank=False, unique=True, max_length=254, verbose_name='email address')
    password = models.CharField(max_length=128, verbose_name='password')
    username = models.CharField(max_length=150, unique=True, validators=[UnicodeUsernameValidator()], verbose_name='username')
    is_active = models.BooleanField(default=True,verbose_name='active')
    email_verified = models.BooleanField(default=False, null=False)
    date_updated = models.DateTimeField(auto_now=True)
    
    objects = UserManager()

    REQUIRED_FIELDS = []
    USERNAME_FIELD = 'email'

