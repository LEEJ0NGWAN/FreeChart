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
from board.models import Sheet
from utils.serialize import serialize

@method_decorator(csrf_exempt, name='dispatch')
class SheetController(APIView):
    def get(self, request):
        if not request.user.is_authenticated:
            return JsonResponse({}, status=HTTP_401_UNAUTHORIZED)
        data = request.GET

        if 'id' in data:
            sheet = Sheet.objects\
                .filter(
                    id=data['id'],
                    owner_id=request.user.id,
                    deleted=False).first()
            
            if not sheet:
                return JsonResponse({}, status=HTTP_404_NOT_FOUND)
            
            return JsonResponse(serialize({
                'sheet': sheet
            }))

        order = data.get('order', '-modify_date')
        if order not in [
            '-modify_date', '-create_date','-title',
            'modify_date','create_date','title']:
            order = '-modify_date'
        
        if 'board_id' in data:
            sheets = Sheet.objects\
                .filter(
                    board_id=data['board_id'],
                    owner_id=request.user.id,
                    deleted=False)\
                .order_by(order).all()
        
        else:
            sheets = Sheet.objects\
                .filter(
                    owner_id=request.user.id,
                    deleted=False)\
                .order_by(order).all()
        
        if not sheets:
            return JsonResponse({}, status=HTTP_404_NOT_FOUND)
        
        return JsonResponse(serialize({
            'sheets': sheets
        }))
        
    def post(self, request):
        if not request.user.is_authenticated:
            return JsonResponse({}, status=HTTP_401_UNAUTHORIZED)
        
        data = json.loads(request.body.decode("utf-8"))
        
        new_sheet = Sheet.objects.create(
            title=data.get('title'),
            board_id=data.get('board_id'),
            owner_id=request.user.id
        )

        return JsonResponse(serialize({
            'sheet': new_sheet
        }))

    def put(self, request):
        if not request.user.is_authenticated:
            return JsonResponse({}, status=HTTP_401_UNAUTHORIZED)
        
        data = json.loads(request.body.decode("utf-8"))

        if 'id' not in data:
            return JsonResponse({}, status=HTTP_400_BAD_REQUEST)
        
        sheet = Sheet.objects\
            .filter(
                id=data.get('id'),
                owner_id=request.user.id,
                deleted=False).first()
        
        if not sheet:
            return JsonResponse({}, status=HTTP_404_NOT_FOUND)

        if 'title' in data:
            sheet.title = data.get('title')
        
        if 'board_id' in data:
            sheet.board_id = data.get('board_id')
        
        sheet.save()

        return JsonResponse(serialize({
            'sheet': sheet
        }))

    def delete(self, request):
        if not request.user.is_authenticated:
            return JsonResponse({}, status=HTTP_401_UNAUTHORIZED)
        
        data = request.GET

        if 'id' not in data:
            return JsonResponse({}, status=HTTP_400_BAD_REQUEST)
        
        sheet = Sheet.objects\
            .filter(
                id=data['id'],
                owner_id=request.user.id,
                deleted=False).first()
        
        if not sheet:
            return JsonResponse({}, status=HTTP_404_NOT_FOUND)
        
        sheet.deleted = True
        sheet.save()

        return JsonResponse(serialize({
            'sheet': sheet
        }))

