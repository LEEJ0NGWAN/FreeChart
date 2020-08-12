import json

from django.contrib.auth import (
    authenticate, login, logout, update_session_auth_hash
)

from rest_framework.decorators import api_view
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.views.generic import View
from django.http import JsonResponse
from django.template import loader

from rest_framework.status import (
    HTTP_200_OK,
    HTTP_400_BAD_REQUEST, HTTP_401_UNAUTHORIZED, HTTP_403_FORBIDDEN,
    HTTP_404_NOT_FOUND, HTTP_406_NOT_ACCEPTABLE, HTTP_409_CONFLICT
)

from account.models import User
from utils.serialize import serialize
from django.core.mail import send_mail
from utils import id_generator, redis

@api_view(["POST"])
@csrf_exempt
def login(request):
    """
    {string} email
    {string} password
    """

    data = json.loads(request.body.decode("utf-8"))
    email = data.get('email')
    password = data.get('password')

    if (email is None or password is None)\
    or (email == '' or password == ''):
        return JsonResponse({
            'error': 'email or password error'
        }, status=HTTP_400_BAD_REQUEST)

    try:
        user = User.objects.get(email=email)
    except:
        user = None

    if not user:
        return JsonResponse({
            'error': 'no user'
        }, status=HTTP_404_NOT_FOUND)

    if not user.check_password(password):
        return JsonResponse({
            'error': 'incorrect password'
        }, status=HTTP_400_BAD_REQUEST)
    
    user = authenticate(username=email, password=password)

    SESSION_KEY = '_auth_user_id'
    BACKEND_SESSION_KEY = '_auth_user_backend'
    HASH_SESSION_KEY = '_auth_user_hash'

    key = user._meta.pk.value_to_string(user)

    session_auth_hash = user.get_session_auth_hash()
    
    request.session[SESSION_KEY] = key
    request.session[BACKEND_SESSION_KEY] = user.backend
    request.session[HASH_SESSION_KEY] = session_auth_hash
    request.session.save()

    request.user = user

    return JsonResponse(serialize({
        'user': user
    }))

@method_decorator(csrf_exempt, name='dispatch')
class Logout(View):
    def post(self, request):
        if not request.user.is_authenticated:
            return JsonResponse({}, status=HTTP_401_UNAUTHORIZED)

        logout(request)
        return JsonResponse({})

@method_decorator(csrf_exempt, name='dispatch')
class EmailVerify(View):
    def post(self, request):
        data = request.POST

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
                {'token': token, 'email': request.user.email}
            )

            send_mail(
                '[FreeList] 이메일 인증 링크',
                '',
                'no-reply@freelist.tk',
                [request.user.email],
                html_message=html
            )

        return JsonResponse({})

@method_decorator(csrf_exempt, name='dispatch')
class PasswordReset(View):
    def post(self, request):
        if request.user.is_authenticated:
            return JsonResponse({}, status=HTTP_400_BAD_REQUEST)

        if request.POST:
            data = request.POST
        else:
            data = json.loads(request.body.decode("utf-8"))

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

        else:
            token = id_generator(size=128)
            tmp_password = id_generator(size=12)

            redis.set(key, token, 180) # 3분
            redis.set(tmp_key, tmp_password, 180)

            payload = '{"email": %s, "token": %s}'%(email, token)
            html = loader.render_to_string(
                'tmp_password_template.html',
                {
                    'password': tmp_password,
                    'email': email,
                    'token': token
                }
            )

            send_mail(
                '[FreeList] 비밀번호 재설정 링크',
                '',
                'no-reply@freelist.tk',
                [email],
                html_message=html
            )

        return JsonResponse({})

@method_decorator(csrf_exempt, name='dispatch')
class Check(View):
    def post(self, request):
        data = json.loads(request.body.decode('utf-8'))

        if not data or 'email' not in data:
            return JsonResponse({}, status=HTTP_400_BAD_REQUEST)

        res = {}

        if 'email' in data:
            res['email'] = True
            if User.objects.filter(email=data['email']).exists():
                res['email'] = False
        
        return JsonResponse(serialize(res))

