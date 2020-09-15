"""
Django settings for FreeChart project.

Generated by 'django-admin startproject' using Django 3.0.6.

For more information on this file, see
https://docs.djangoproject.com/en/3.0/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/3.0/ref/settings/
"""

import os

if os.environ.get("MODE") == "PROD":
    MODE = "PROD"
else:
    MODE = "LOCAL"

# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/3.0/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
# SECURITY WARNING: don't run with debug turned on in production!

if MODE == 'PROD':
    SECRET_KEY = os.environ['SECRET_KEY']
    DEBUG = False
else:
    from .secret_key import SECRET_KEY as _SECRET_KEY
    SECRET_KEY = _SECRET_KEY
    DEBUG = True

ALLOWED_HOSTS = ['*']

# Application definition

DJANGO_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.humanize',
]

EXTERNAL_APPS = [
    'rest_framework',
    'rest_framework.authtoken',
    'corsheaders',
]

PROJECT_APPS = [
    'account',
    'board',
    'common',
]

INSTALLED_APPS = DJANGO_APPS + EXTERNAL_APPS + PROJECT_APPS

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'corsheaders.middleware.CorsMiddleware',
]

# 세션 엔진을 디폴트 벡엔드 디비에서 클라이언트 브라우저 쿠키로 변경
# SESSION_ENGINE = 'django.contrib.sessions.backends.signed_cookies'
# SESSION_COOKIE_SECURE = False

ROOT_URLCONF = 'FreeChart.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'FreeChart.wsgi.application'


# Database
# https://docs.djangoproject.com/en/3.0/ref/settings/#databases

HOST_NAME = os.environ.get('HOST_NAME', 'freechart.local')

if MODE == 'PROD':
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql_psycopg2',
            'NAME': os.environ['DB_NAME'],
            'USER': os.environ['DB_USER'],
            'PASSWORD': os.environ['DB_PASSWORD'],
            'HOST': os.environ['DB_HOST'],
            'PORT': 5432,
        }
    }
elif 'DEV_DB_HOST' in os.environ:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql_psycopg2',
            'NAME': 'freechart',
            'USER': 'freechart',
            'PASSWORD': 'freechart',
            'HOST': os.environ['DEV_DB_HOST'],
            'PORT': 5432,
        }
    }
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql_psycopg2',
            'NAME': 'freechart',
            'USER': 'freechart',
            'PASSWORD': 'freechart',
            'HOST': 'localhost',  # noqa
            'PORT': 5432,
        }
    }

# 디폴트 로그인 요구 리디렉션 페이지
LOGIN_URL = '/account/login/'

# Password validation
# https://docs.djangoproject.com/en/3.0/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/3.0/topics/i18n/

LANGUAGE_CODE = 'ko-kr'

TIME_ZONE = 'Asia/Seoul'

USE_I18N = True

USE_L10N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/3.0/howto/static-files/

STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'static')

# django rest framework
REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    # 'DEFAULT_AUTHENTICATION_CLASSES': [
    #     'rest_framework.authentication.SessionAuthentication',
    # ],
    'DEFAULT_PAGINATION_CLASS': 'common.pagination.CommonPagination',
    'PAGE_SIZE': 10,
}

# SESSION_COOKIE_AGE = 52560000

AUTH_USER_MODEL = 'account.User'


# SMTP setting
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_USE_SSL = True
EMAIL_PORT = 465

if MODE == 'PROD':
    EMAIL_HOST = 'smtp.daum.net'
    EMAIL_HOST_USER = os.environ['EMAIL_HOST_USER']
    EMAIL_HOST_PASSWORD = os.environ['EMAIL_HOST_PASSWORD']
    EMAIL_HOST_SENDER = f'no-reply@{HOST_NAME}'
else:
    # USER & PASSWORD는 email_setting.py 파일 안에 설정 후 사용합니다
    from . import email_setting
    EMAIL_HOST = 'smtp.naver.com'
    EMAIL_HOST_USER = email_setting.EMAIL_HOST_USER
    EMAIL_HOST_PASSWORD = email_setting.EMAIL_HOST_PASSWORD
    EMAIL_HOST_SENDER = email_setting.EMAIL_HOST_USER

# REDIS setting
if MODE == 'PROD':
    REDIS_HOST = 'redis'
else:
    REDIS_HOST = 'localhost'
REDIS_PORT = 6379

# CORS
CORS_ORIGIN_ALLOW_ALL = False
CORS_ALLOW_CREDENTIALS = True
CORS_ORIGIN_WHITELIST = [
    'http://localhost:3000',
    'http://localhost:5000',
    'http://freechart',
    'http://freechart.local',
]

# JWT
from datetime import timedelta
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=30),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=14),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': False,
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    'VERIFYING_KEY': None,
    'AUTH_HEADER_TYPES': ('JWT',),
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
    'AUTH_TOKEN_CLASSES': ('rest_framework_simplejwt.tokens.AccessToken',),
    'TOKEN_TYPE_CLAIM': 'token_type',
}

