import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.views.generic import View
from rest_framework.status import (
    HTTP_400_BAD_REQUEST, HTTP_401_UNAUTHORIZED, HTTP_403_FORBIDDEN,
    HTTP_404_NOT_FOUND, HTTP_409_CONFLICT
)
from rest_framework.views import APIView

from board.models import Board, Sheet
from utils.serialize import serialize

@method_decorator(csrf_exempt, name='dispatch')
class BoardController(APIView):
    def get(self, request):
        if not request.user.is_authenticated:
            return JsonResponse({}, status=HTTP_401_UNAUTHORIZED)
        data = request.GET

        if 'id' in data:
            board = Board.objects\
                .filter(
                    id=data['id'],
                    owner_id=request.user.id,
                    deleted=False).first()

            if not board:
                return JsonResponse({}, status=HTTP_404_NOT_FOUND)
            
            return JsonResponse(serialize({
                'board': board
            }))
        
        order = data.get('order', '-modify_date')
        if order not in [
            '-modify_date', '-create_date','-title',
            'modify_date','create_date','title']:
            order = '-modify_date'

        if 'parent_id' in data:
            boards = Board.objects\
                .filter(
                    owner_id=request.user.id,
                    parent_id=data['parent_id'],
                    deleted=False)\
                .order_by(order).all()
        
        else:
            boards = Board.objects\
                .filter(
                    owner_id=request.user.id,
                    deleted=False)\
                .order_by(order).all()

        return JsonResponse(serialize({
            'boards': boards
        }))

    def post(self, request):
        if not request.user.is_authenticated:
            return JsonResponse({}, status=HTTP_401_UNAUTHORIZED)
        
        data = json.loads(request.body.decode("utf-8"))

        if 'title' not in data:
            return JsonResponse({}, status=HTTP_400_BAD_REQUEST)
        
        new_board = Board.objects.create(
            title=data.get('title'),
            owner_id=request.user.id,
            parent_id=data.get('parent_id')
        )

        return JsonResponse(serialize({
            'board': new_board
        }))

    def put(self, request):
        if not request.user.is_authenticated:
            return JsonResponse({}, status=HTTP_401_UNAUTHORIZED)
        
        data = json.loads(request.body.decode("utf-8"))

        if 'id' not in data:
            return JsonResponse({}, status=HTTP_400_BAD_REQUEST)
        
        board = Board.objects\
            .filter(
                id=data.get('id'),
                owner_id=request.user.id,
                deleted=False).first()
        
        if not board:
            return JsonResponse({}, status=HTTP_404_NOT_FOUND)
        
        if 'title' in data:
            board.title = data['title']
        
        if 'parent_id' in data:
            board.parent_id = data['parent_id']

        board.save()

        return JsonResponse(serialize({
            'board': board
        }))
    
    def delete(self, request):
        if not request.user.is_authenticated:
            return JsonResponse({}, status=HTTP_401_UNAUTHORIZED)
        data = request.GET

        if 'id' not in data:
            return JsonResponse({}, status=HTTP_400_BAD_REQUEST)
        
        board = Board.objects\
            .filter(
                id=data['id'],
                owner_id=request.user.id,
                deleted=False).first()
        
        if not board:
            return JsonResponse({}, status=HTTP_404_NOT_FOUND)

        board.deleted = True
        board.save()

        if data.get('save_child'):
            boards = Board.objects\
                .filter(
                    parent=board,
                    deleted=False).all()

            sheets = Sheet.objects\
                .filter(
                    board=board,
                    deleted=False).all()
            
            response = serialize({
                'parent': board,
                'boards': boards,
                'sheets': sheets
            }, 
            change_parent=True,
            new_parent_id=board.parent_id)

            boards.update(parent_id=board.parent_id)
            sheets.update(board_id=board.parent_id)

            return JsonResponse(response)

        return JsonResponse(serialize({
            'board': board
        }))

# deprecated
# @method_decorator(csrf_exempt, name='dispatch')
# class BoardDelete(APIView):
#     def post(self, request):
#         if not request.user.is_authenticated:
#             return JsonResponse({}, status=HTTP_401_UNAUTHORIZED)
        
#         data = json.loads(request.body.decode("utf-8"))

#         if 'id' not in data:
#             return JsonResponse({}, status=HTTP_400_BAD_REQUEST)
        
#         board = Board.objects\
#             .filter(
#                 id=data['id'],
#                 owner_id=request.user.id,
#                 deleted=False).first()
        
#         if not board:
#             return JsonResponse({}, status=HTTP_404_NOT_FOUND)

#         board.deleted = True
#         board.save()

#         if data.get('save_child'):
#             boards = Board.objects\
#                 .filter(
#                     parent=board,
#                     deleted=False).all()

#             sheets = Sheet.objects\
#                 .filter(
#                     board=board,
#                     deleted=False).all()
            
#             response = serialize({
#                 'parent': board,
#                 'boards': boards,
#                 'sheets': sheets
#             }, 
#             change_parent=True,
#             new_parent_id=board.parent_id)

#             boards.update(parent_id=board.parent_id)
#             sheets.update(board_id=board.parent_id)

#             return JsonResponse(response)

#         return JsonResponse(serialize({
#             'board': board
#         }))    

