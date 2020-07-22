import json
import datetime
from django.contrib.auth import (
    login, logout
)
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.views.generic import View
from rest_framework.status import (
    HTTP_400_BAD_REQUEST, HTTP_401_UNAUTHORIZED, HTTP_403_FORBIDDEN,
    HTTP_404_NOT_FOUND, HTTP_409_CONFLICT
)
from account.models import User
from utils.serialize import serialize

now = datetime.datetime.now

@method_decorator(csrf_exempt, name='dispatch')
class UserController(View):
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
        if request.user.is_authenticated:
            return JsonResponse({}, status=HTTP_400_BAD_REQUEST)
            
        data = json.loads(request.body.decode("utf-8"))

        if 'password' not in data:
            return JsonResponse({}, status=HTTP_400_BAD_REQUEST)

        if 'email' in data:
            email = data.get('email')
            username = data.get('username', email)
            password = data.get('password', '')

            if User.objects.filter(email=email).exists():
                return JsonResponse({}, status=HTTP_409_CONFLICT)
            
            if User.objects.filter(username=username).exists():
                return JsonResponse({}, status=HTTP_409_CONFLICT)

            new_user = User.objects.create_user(
                username=username,
                email_verified=False,
                email=email,
                password=password,
            )
        else:
            return JsonResponse({}, status=HTTP_400_BAD_REQUEST)

        login(request, new_user)
        
        return JsonResponse(serialize({
            'user': new_user,
        }))

    def put(self, request):
        if not request.user.is_authenticated:
            return JsonResponse({}, status=HTTP_401_UNAUTHORIZED)

        user = request.user
        data = json.loads(request.body.decode("utf-8"))

        if 'usesrname' in data:
            user.username = data['username']
        
        if 'password' in data:
            user.password = data['password']
        
        user.save()

        return JsonResponse(serialize({
            'user': user
        }))

    def delete(self, request):
        if not request.user.is_authenticated:
            return JsonResponse({}, status=HTTP_401_UNAUTHORIZED)

        data = request.GET
        user = request.user

        if 'id' not in data:
            return JsonResponse({}, status=HTTP_400_BAD_REQUEST)

        if int(data['id']) != user.id:
            return JsonResponse({}, status=HTTP_403_FORBIDDEN)

        user.is_active = False
        user.set_unusable_password()
        user.email = f'{user.email}@leave'+str(now())
        user.username = f'{user.username}@leave'+str(now())
        user.save()
        logout(request)
        
        return JsonResponse(serialize({
            'user': user
        }))

