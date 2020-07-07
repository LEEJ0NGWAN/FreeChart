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
# from account.models import User
from FreeList.account.models import User
# from utils import serialize
from FreeList.utils import serialize

# TODO: USER CRUD
class UserController(View):
    def get(self, request):
        pass
