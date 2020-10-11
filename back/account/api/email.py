import json
from datetime import datetime
from django.core.mail import send_mail
from django.contrib.auth import (
    login, logout, update_session_auth_hash
)
from django.template import loader
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.views.generic import View
from rest_framework.views import APIView
from rest_framework.status import (
    HTTP_400_BAD_REQUEST, HTTP_401_UNAUTHORIZED, HTTP_403_FORBIDDEN,
    HTTP_404_NOT_FOUND, HTTP_409_CONFLICT
)
from rest_framework_simplejwt.tokens import RefreshToken
from utils import id_generator, redis
from account.models import User
from utils import SetDefaultData
from utils.serialize import serialize
from FreeChart.settings import HOST_NAME, EMAIL_HOST_SENDER

verify_url = f'http://{HOST_NAME}/api/accounts/email'

@method_decorator(csrf_exempt, name='dispatch')
class EmailController(View):
    # email 인증
    def post(self, request):
        data = request.data

        if data:
            if 'token' not in data:
                return JsonResponse({
                    'error': 'no token'
                }, status=HTTP_400_BAD_REQUEST)
            
            if 'email' not in data:
                return JsonResponse({
                    'error': 'no email'
                }, status=HTTP_400_BAD_REQUEST)
            
            email = data['email']

            user = User.objects.filter(email=email).first()

            if not user:
                return JsonResponse({
                    'error': 'no user'
                }, status=HTTP_404_NOT_FOUND)

            key = f'VERIFY:{email}'
            token = redis.get(key)

            if not token:
                return JsonResponse({
                    'error': 'no token'
                }, status=HTTP_404_NOT_FOUND)
            
            if token != data.get('token'):
                return JsonResponse({
                    'error': 'incorrect'
                }, status=HTTP_400_BAD_REQUEST)
            
            user.email_verified = True
            user.save()

            del redis[key]

        else:
            if not request.user.is_authenticated:
                return JsonResponse({}, status=HTTP_401_UNAUTHORIZED)

            key = f'VERIFY:{request.user.email}'
            token = id_generator(size=128)
            redis.set(key, token, 180) # 3분

            html = loader.render_to_string(
                'email_verify_template.html',
                {
                    'token': token, 
                    'email': request.user.email,
                    'verify_url': verify_url
                }
            )

            send_mail(
                '[FreeChart] 이메일 인증 링크',
                '',
                from_email=EMAIL_HOST_SENDER,
                recipient_list=[request.user.email],
                html_message=html
            )

        return JsonResponse({})

