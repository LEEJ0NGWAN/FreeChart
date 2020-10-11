import json
from datetime import datetime
from django.contrib.auth import (
    login, logout, update_session_auth_hash
)
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.views.generic import View
from rest_framework import permissions
from rest_framework.views import APIView
from rest_framework.status import (
    HTTP_400_BAD_REQUEST, HTTP_401_UNAUTHORIZED, HTTP_403_FORBIDDEN,
    HTTP_404_NOT_FOUND, HTTP_409_CONFLICT
)
from rest_framework_simplejwt.tokens import RefreshToken
from account.models import User
from utils import SetDefaultData
from utils.serialize import serialize

now = datetime.now

class IsAuthenticatedExceptPost(permissions.BasePermission):
    def has_permission(self, request, view):
        # allow all POST requests
        if request.method == 'POST':
            return True

        # Otherwise, only allow authenticated requests
        # Post Django 1.10, 'is_authenticated' is a read-only attribute
        return request.user and request.user.is_authenticated

@method_decorator(csrf_exempt, name='dispatch')
class UserController(APIView):
    permission_classes = (IsAuthenticatedExceptPost,)
    def get(self, request):
        if not request.user.is_authenticated:
            return JsonResponse({}, status=HTTP_401_UNAUTHORIZED)
        data = request.GET

        if 'id' in data:
            user = User.objects.filter(id=data['id']).first()
            
            if not user:
                return JsonResponse({},status=HTTP_404_NOT_FOUND)
            return JsonResponse(serialize({
                'user': user
            }))
        return JsonResponse(serialize({
            'user': request.user
        }))

    def post(self, request):
        data = json.loads(request.body.decode("utf-8"))

        if 'password' not in data:
            return JsonResponse({}, status=HTTP_400_BAD_REQUEST)

        if 'email' in data:
            email = data.get('email')
            username = data.get('username', email)
            password = data.get('password', '')

            if User.objects.filter(email=email).exists():
                return JsonResponse({}, status=HTTP_409_CONFLICT)

            new_user = User.objects.create_user(
                username=username,
                email_verified=False,
                email=email,
                password=password,
            )
            
            SetDefaultData(new_user.id)

            refresh = RefreshToken.for_user(new_user)

        else:
            return JsonResponse({}, status=HTTP_400_BAD_REQUEST)
        
        return JsonResponse(serialize({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': serialize(new_user)
        }))

    def put(self, request):
        if not request.user.is_authenticated:
            return JsonResponse({}, status=HTTP_401_UNAUTHORIZED)

        user = request.user
        data = json.loads(request.body.decode("utf-8"))

        if 'username' in data:
            user.username = data['username']
        
        if 'password' in data:
            user.set_password(data['password'])
            # update_session_auth_hash(request, request.user)
            
        user.save()

        return JsonResponse(serialize({
            'user': user
        }))

    def delete(self, request):
        if not request.user.is_authenticated:
            return JsonResponse({}, status=HTTP_401_UNAUTHORIZED)

        user = request.user

        RefreshToken.for_user(user)
        user.is_active = False
        user.set_unusable_password()
        user.email = f'{user.email}@leave'+str(now())
        user.username = f'{user.username}@leave'+str(now())
        user.save()

        return JsonResponse({})

