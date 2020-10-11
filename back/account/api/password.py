import json
from django.core.mail import send_mail
from django.template import loader
from django.http import JsonResponse, HttpResponseRedirect
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from rest_framework.views import APIView
from rest_framework import permissions
from rest_framework.status import (
    HTTP_400_BAD_REQUEST, HTTP_401_UNAUTHORIZED, HTTP_403_FORBIDDEN,
    HTTP_404_NOT_FOUND, HTTP_409_CONFLICT
)
from utils import id_generator, redis
from account.models import User
from utils.serialize import serialize
from FreeChart.settings import HOST_NAME, EMAIL_HOST_SENDER

reset_url = f'http://{HOST_NAME}/api/accounts/password'

class IsAuthenticatedExceptPost(permissions.BasePermission):
    def has_permission(self, request, view):
        # allow all POST requests
        if request.method == 'POST':
            return True

        # Otherwise, only allow authenticated requests
        # Post Django 1.10, 'is_authenticated' is a read-only attribute
        return request.user and request.user.is_authenticated

@method_decorator(csrf_exempt, name='dispatch')
class PasswordController(APIView):
    permission_classes = (IsAuthenticatedExceptPost,)
    def post(self, request):
        data = request.data
        # if request.POST:
        #     data = request.POST
        # else:
        #     data = json.loads(request.body.decode("utf-8"))

        if 'email' not in data:
            return JsonResponse({
                'error': 'no email'
            }, status=HTTP_400_BAD_REQUEST)

        email = data.get('email')

        if not User.objects.filter(email=email).exists():
            return JsonResponse({
                'error': 'no user'
            }, status=HTTP_404_NOT_FOUND)

        key = f'RESET:{email}'
        tmp_key = f'TMP:{email}'

        if 'token' in data:
            token = redis.get(key)
            tmp_password = redis.get(tmp_key)

            if not token:
                return JsonResponse({
                    'error': 'no token'
                }, status=HTTP_404_NOT_FOUND)
            
            if token != data.get('token'):
                return JsonResponse({
                    'error': 'incorrect'
                }, status=HTTP_400_BAD_REQUEST)

            user = User.objects.filter(email=email).first()
            user.set_password(tmp_password)
            user.save()

            del redis[key]
            del redis[tmp_key]

            return HttpResponseRedirect(
                redirect_to=f'http://{HOST_NAME}/')

        else:
            token = id_generator(size=128)
            tmp_password = id_generator(size=12)

            redis.set(key, token, 180) # 3분
            redis.set(tmp_key, tmp_password, 180)

            payload = '{"email": %s, "token": %s}'%(email, token)
            html = loader.render_to_string(
                'tmp_password_template.html',
                {
                    'reset_url': reset_url,
                    'password': tmp_password,
                    'email': email,
                    'token': token
                }
            )
            send_mail(
                '[FreeChart] 비밀번호 재설정 링크',
                '',
                from_email=EMAIL_HOST_SENDER,
                recipient_list=[email],
                html_message=html
            )

        return JsonResponse({})

    def put(self, request):
        data = json.loads(request.body.decode("utf-8"))

        user = request.user

        if 'id' not in data or 'password' not in data:
            return JsonResponse({}, status=HTTP_400_BAD_REQUEST)

        if int(data['id']) != user.id:
            return JsonResponse({}, status=HTTP_400_BAD_REQUEST)
        
        if not user.check_password(data['password']):
            return JsonResponse({
                'error': 'password'
            }, status=HTTP_400_BAD_REQUEST)
        
        return JsonResponse({})

