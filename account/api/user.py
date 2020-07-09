import json

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
from account.models import id_generator as random_id
# from FreeList.account.models import User
from utils import serialize
# from FreeList.utils import serialize

# TODO: USER CRUD
# TODO: 시리얼라이징 오류 픽스 (User 모델 수정 요구?)
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
        data = json.loads(request.body.decode("utf-8"))

        if 'password' not in data:
            return JsonResponse({}, status=HTTP_400_BAD_REQUEST)

        if 'email' in data:
            email = str(data.get('email'))
            username = str(data.get('username', random_id(size=10)))
            password = str(data.get('password', ''))

            if User.objects.filter(email=email).exists():
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
        pass
    def delete(self, request):
        pass

