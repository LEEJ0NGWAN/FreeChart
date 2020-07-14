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
from board.models import Board
from utils.serialize import serialize

now = datetime.datetime.now

@method_decorator(csrf_exempt, name='dispatch')
class BoardController(View):
    def get(self, request):
        if not request.user.is_authenticated:
            return JsonResponse({}, status=HTTP_401_UNAUTHORIZED)
        data = request.GET

        if 'id' in data:
            board = Board.objects\
                .filter(
                    id=data['id'],
                    deleted=False).first()

            if not board:
                return JsonResponse({}, status=HTTP_404_NOT_FOUND)
            
            return JsonResponse({
                'board': board
            })
        
        if 'owner_id' in data:
            boards = Board.objects\
                .filter(
                    owner_id=data['owner_id'],
                    deleted=False)\
                .order_by('modify_date')
        
        else:
            boards = Board.objects\
                .filter(
                    owner_id=request.user.id,
                    deleted=False)\
                .order_by('modify_date')

        return JsonResponse({
            'boards': boards
        })

    def post(self, request):
        if not request.user.is_authenticated:
            return JsonResponse({}, status=HTTP_401_UNAUTHORIZED)
        
        data = json.loads(request.body.decode("utf-8"))

        title = data.get('title')
        
        new_board = Board.objects.create(
            title=title,
            owner=request.user
        )

        return JsonResponse({
            'board': new_board
        })

    def put(self, request):
        if not request.user.is_authenticated:
            return JsonResponse({}, status=HTTP_401_UNAUTHORIZED)
        
        data = json.loads(request.body.decode("utf-8"))

        if 'id' not in data:
            return JsonResponse({}, status=HTTP_400_BAD_REQUEST)
        
        board = Board.objects\
            .filter(
                id=data.get('id'),
                deleted=False).first()
        
        if not board:
            return JsonResponse({}, status=HTTP_404_NOT_FOUND)
        
        board.title = data.get('title')
        board.save()

        return JsonResponse({
            'board': board
        })

    def delete(self, request):
        if not request.user.is_authenticated:
            return JsonResponse({}, status=HTTP_401_UNAUTHORIZED)
        
        data = json.loads(request.body.decode("utf-8"))
        
        if 'id' not in data:
            return JsonResponse({}, status=HTTP_400_BAD_REQUEST)
        
        board = Board.objects\
            .filter(
                id=data.get('id'),
                deleted=False).first()
        
        if not board:
            return JsonResponse({}, status=HTTP_404_NOT_FOUND)
        
        board.deleted = True
        board.save()

        return JsonResponse({
            'board': board
        })

