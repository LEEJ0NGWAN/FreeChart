import json

from django.contrib.auth import (
    login, logout
)
from django.http import JsonResponse
from django.views.generic import View
from rest_framework.status import (
    HTTP_400_BAD_REQUEST, HTTP_401_UNAUTHORIZED, HTTP_403_FORBIDDEN,
    HTTP_404_NOT_FOUND, HTTP_409_CONFLICT
)
from account.models import User
# from FreeList.account.models import User
from utils import serialize
# from FreeList.utils import serialize

# TODO: USER CRUD
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
        pass
    def put(self, request):
        pass
    def delete(self, request):
        pass

