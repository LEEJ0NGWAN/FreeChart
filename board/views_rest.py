import json
import datetime
from uuid import UUID
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.views.generic import View
from rest_framework.status import (
    HTTP_400_BAD_REQUEST, HTTP_401_UNAUTHORIZED, HTTP_403_FORBIDDEN,
    HTTP_404_NOT_FOUND, HTTP_409_CONFLICT
)
from rest_framework.views import APIView
from board.models import ( Board, Sheet, Node, Edge )
from utils.serialize import serialize

@method_decorator(csrf_exempt, name='dispatch')
class ChildController(APIView):
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
class SheetCopy(APIView):
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
        
        title_ = \
            sheet.title +'(복사본) '+ str(datetime.datetime.now())[:19]

        copied_sheet = Sheet.objects.create(
            title=title_,
            board_id=sheet.board_id,
            owner_id=request.user.id
        )

        node_values = Node.objects\
            .filter(
                sheet_id=sheet.id,
                deleted=False)\
            .values('id','label','x','y')

        edge_values = Edge.objects\
            .filter(
                sheet_id=sheet.id,
                deleted=False)\
            .values('label','node_from','node_to')
        
        node_parse = {}

        new_nodes, new_edges = [], []
        new_nodes_app = new_nodes.append
        new_edges_app = new_edges.append
        
        for val in node_values:
            node = Node(
                sheet_id=copied_sheet.id, 
                label=val['label'],
                x=val['x'],
                y=val['y'])
            
            new_nodes_app(node)
            node_parse[str(val['id'])] = node.id
        
        for val in edge_values:
            from_id = str(val['node_from'])
            to_id = str(val['node_to'])

            if from_id not in node_parse\
            or to_id not in node_parse:
                continue

            edge = Edge(
                sheet_id=copied_sheet.id,
                label=val['label'],
                node_from_id=node_parse[from_id],
                node_to_id=node_parse[to_id])
            new_edges_app(edge)

        Node.objects.bulk_create(new_nodes)
        Edge.objects.bulk_create(new_edges)

        return JsonResponse({})

