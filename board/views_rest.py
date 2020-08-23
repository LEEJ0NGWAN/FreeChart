import json
import datetime
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.views.generic import View
from rest_framework.status import (
    HTTP_400_BAD_REQUEST, HTTP_401_UNAUTHORIZED, HTTP_403_FORBIDDEN,
    HTTP_404_NOT_FOUND, HTTP_409_CONFLICT
)
from board.models import ( Board, Sheet )
from utils.serialize import serialize

@method_decorator(csrf_exempt, name='dispatch')
class ChildController(View):
    def get(self, request):
        if not request.user.is_authenticated:
            return JsonResponse({}, status=HTTP_401_UNAUTHORIZED)
        data = request.GET

        parent = None
        if 'id' in data:
            board = Board.objects\
                .filter(
                    id=data['id'],
                    owner_id=request.user.id,
                    deleted=False).first()
            
            if not board:
                return JsonResponse({}, status=HTTP_404_NOT_FOUND)
            
            parent = board

        order = data.get('order', '-modify_date')
        if order not in [
            '-modify_date', '-create_date','-title',
            'modify_date','create_date','title']:
            order = '-modify_date'
        
        boards = Board.objects\
            .filter(
                owner_id=request.user.id,
                parent_id=data.get('id'),
                deleted=False)\
            .order_by(order).all()
        
        sheets = Sheet.objects\
            .filter(
                owner_id=request.user.id,
                board_id=data.get('id'),
                deleted=False)\
            .order_by(order).all()

        return JsonResponse(serialize({
            'parent': parent,
            'boards': boards,
            'sheets': sheets
        }))

@method_decorator(csrf_exempt, name='dispatch')
class SheetCopy(View):
    def post(self, request):
        if not request.user.is_authenticated:
            return JsonResponse({}, status=HTTP_401_UNAUTHORIZED)
        data = json.loads(request.body.decode("utf-8"))

        if 'sheet_id' not in data:
            return JsonResponse({}, status=HTTP_400_BAD_REQUEST)
        
        sheet = Sheet.objects\
            .filter(
                id=data['sheet_id'],
                owner_id=request.user.id,
                deleted=False).first()
        
        if not sheet:
            return JsonResponse({}, status=HTTP_404_NOT_FOUND)
        
        title_ = sheet.title + '(복사본) ' + str(datetime.datetime.now())

        copied = Sheet.objects.create(
            title=title_,
            board_id=sheet.board_id,
            owner_id=request.user.id
        )

        return JsonResponse(serialize({
            'sheet': copied
        }))

