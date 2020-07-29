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
from board.models import ( Board, Sheet, Node, Edge )
from utils.serialize import serialize

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
            
            return JsonResponse(serialize({
                'board': board
            }))
        
        if 'owner_id' in data:
            boards = Board.objects\
                .filter(
                    owner_id=data['owner_id'],
                    deleted=False)\
                .order_by('modify_date').all()

            return JsonResponse(serialize({
                'boards': boards
            }))
        
        else:
            boards = Board.objects\
                .filter(
                    owner_id=request.user.id,
                    deleted=False)\
                .order_by('modify_date').all()
            
            sheets = Sheet.objects\
                .filter(
                    owner_id=request.user.id,
                    board=None,
                    deleted=False)\
                .order_by('modify_date').all()

            return JsonResponse(serialize({
                'boards': boards,
                'sheets': sheets
            }))

    def post(self, request):
        if not request.user.is_authenticated:
            return JsonResponse({}, status=HTTP_401_UNAUTHORIZED)
        
        data = json.loads(request.body.decode("utf-8"))

        title = data.get('title')
        
        new_board = Board.objects.create(
            title=title,
            owner_id=request.user.id
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
                deleted=False).first()
        
        if not board:
            return JsonResponse({}, status=HTTP_404_NOT_FOUND)
        
        board.title = data.get('title')
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
                deleted=False).first()
        
        if not board:
            return JsonResponse({}, status=HTTP_404_NOT_FOUND)
        
        board.deleted = True
        board.save()

        if data.get('save_sheets', False):
            Sheet.objects\
                .filter(
                    board=board,
                    deleted=False).all()\
                .update(board=None)

        return JsonResponse(serialize({
            'board': board
        }))

@method_decorator(csrf_exempt, name='dispatch')
class SheetController(View):
    def get(self, request):
        if not request.user.is_authenticated:
            return JsonResponse({}, status=HTTP_401_UNAUTHORIZED)
        data = request.GET

        if 'id' in data:
            sheet = Sheet.objects\
                .filter(
                    id=data['id'],
                    deleted=False).first()
            
            if not sheet:
                return JsonResponse({}, status=HTTP_404_NOT_FOUND)
            
            return JsonResponse(serialize({
                'sheet': sheet
            }))
        
        if 'board_id' in data:
            sheets = Sheet.objects\
                .filter(
                    board_id=data['board_id'],
                    deleted=False)\
                .order_by('modify_date').all()
        
        else:
            sheets = Sheet.objects\
                .filter(
                    owner_id=request.user.id,
                    deleted=False)\
                .order_by('modify_date').all()
        
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
                deleted=False).fisrt()
        
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
                deleted=False).first()
        
        if not sheet:
            return JsonResponse({}, status=HTTP_404_NOT_FOUND)
        
        sheet.deleted = True
        sheet.save()

        return JsonResponse(serialize({
            'sheet': sheet
        }))

@method_decorator(csrf_exempt, name='dispatch')
class ElementController(View):
    def get(self, request):
        if not request.user.is_authenticated:
            return JsonResponse({}, status=HTTP_401_UNAUTHORIZED)
        data = request.GET

        if 'sheet_id' not in data:
            return JsonResponse({}, status=HTTP_400_BAD_REQUEST)
        
        nodes = Node.objects\
            .filter(
                sheet_id=data['sheet_id'],
                deleted=False)\
            .order_by('id').all()
        
        edges = Edge.objects\
            .filter(
                sheet_id=data['sheet_id'],
                deleted=False)\
            .order_by('id').all()
        
        return JsonResponse(serialize({
            'nodes': nodes,
            'edges': edges
        }))

    def post(self, request):
        if not request.user.is_authenticated:
            return JsonResponse({}, status=HTTP_401_UNAUTHORIZED)
        
        data = json.loads(request.body.decode("utf-8"))

        if 'sheet_id' not in data \
            or 'nodes' not in data or 'edges' not in data:
            return JsonResponse({}, status=HTTP_400_BAD_REQUEST)

        nodes = list()
        edges = list()

        nodes_app = nodes.append
        edges_app = edges.append

        for raw in data['nodes']:
            if 'id' not in raw:
                continue

            nodes_app(Node(
                id=raw['id'],
                sheet_id=data['sheet_id'],
                label=raw.get('label')
            ))
        
        nodes = Node.objects.bulk_create(nodes)
        
        for raw in data['edges']:
            if 'id' not in raw\
            or 'from' not in raw\
            or 'to' not in raw:
                continue

            edges_app(Edge(
                id=raw['id'],
                node_from_id=raw['from'],
                node_to_id=raw['to'],
                sheet_id=data['sheet_id']
            ))
        
        edges = Edge.objects.bulk_create(edges)

        return JsonResponse(serialize({
            'nodes': nodes,
            'edges': edges
        }))

    def put(self, request):
        if not request.user.is_authenticated:
            return JsonResponse({}, status=HTTP_401_UNAUTHORIZED)
        
        data = json.loads(request.body.decode("utf-8"))

        nodes = None
        edges = None

        if 'nodes' in data:
            nodes = data['nodes']
            raws = dict((node['id'], node) for node in nodes)
            
            nodes = Node.objects.in_bulk(nodes)

            for pk in nodes:
                if 'label' in raws[pk]:
                    nodes[pk].label = raws[pk]['label']
                if 'deleted' in raws[pk]:
                    nodes[pk].deleted = raws[pk]['deleted']

            nodes = list(nodes.values())
            Node.objects.bulk_update(nodes,['label','deleted'])

        if 'edges' in data:
            edges = data['edges']
            raws = dict((edge['id'], edge) for edge in edges)
            
            edges = Edge.objects.in_bulk(edges)

            for pk in edges:
                if 'label' in raws[pk]:
                    edges[pk].label = raws[pk]['label']
                if 'from' in raws[pk]:
                    edges[pk].node_from_id = raws[pk]['from']
                if 'to' in raws[pk]:
                    edges[pk].node_to_id = raws[pk]['to']
                if 'deleted' in raws[pk]:
                    edges[pk].deleted = raws[pk]['deleted']
            
            edges = list(edges.values())
            Edge.objects.bulk_update(
                edges,
                ['label','node_from_id','node_to_id','deleted'])

        return JsonResponse(serialize({
            'nodes': nodes,
            'edges': edges
        }))
    
    # TODO: controller 테스트 및 폴리싱
    # TODO: DELETE 메소드 구현?

