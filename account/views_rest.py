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

    return JsonResponse({
        'session_key': request.session.session_key
    })

@method_decorator(csrf_exempt, name='dispatch')
class Logout(View):
    def post(self, request):
        if not request.user.is_authenticated:
            return JsonResponse({}, status=HTTP_401_UNAUTHORIZED)

        logout(request)
        return JsonResponse({})

# TODO: SMTP + REDIS
@method_decorator(csrf_exempt, name='dispatch')
class EmailVerify(View):
    def get(self, request):
        if not request.user.is_authenticated:
            return JsonResponse({}, status=HTTP_401_UNAUTHORIZED)
        
        return

    def post(self, request):
        if not request.user.is_authenticated:
            return JsonResponse({}, status=HTTP_401_UNAUTHORIZED)
        
        key = f'VERIFY:{request.user.email}'
        token = id_generator(size=128)
        redis.set(key, token, 180) # 3분

        link = 'http://localhost:8000/account/email/verify/?token='+token
        html = loader.render_to_string(
            'email_verify_template.html',
            {'link': link}
        )

        send_mail(
            '[FreeList] 이메일 인증 링크',
            '',
            'no-reply@freelist.tk',
            [request.user.email],
            html_message=html
        )

        return JsonResponse({})

# TODO: SMTP + REDIS
class PasswordReset(View):
    def get(self, request):
        return
    def post(self, request):
        return
    def put(self, request):
        return
    def delete(self, request):
        return

